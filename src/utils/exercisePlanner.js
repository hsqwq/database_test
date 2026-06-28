/**
 * 出题规划器 —— 在生成题目前，在前端本地生成一个 plan
 *
 * plan 包含：
 * - selectedTypes: 题型列表
 * - questionCount: 题目总数
 * - difficultyMode: 'easy' | 'mixed' | 'hard'
 * - selectedSchemaSets: 选取的表集 id 列表
 * - questionPlans: 每道题的规划
 *
 * 策略：
 * 1. 按题型均匀分配数量
 * 2. 每批不重复同一考点
 * 3. >=3 题时至少 1 题中或难
 * 4. DML/RA 至少 1 题多表
 * 5. RA 尽量覆盖连接/集合/除法
 * 6. DDL 至少覆盖一个约束或视图/权限类考点
 * 7. 表池与考点匹配
 */

import { KNOWLEDGE_POINTS, POINTS_BY_TYPE, DIFFICULTY_LEVELS } from '../data/syllabus';
import { SCHEMA_SETS, SCHEMA_SETS_BY_ID } from '../data/schemaPool';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickWeighted(items, n, keyFn) {
  const shuffled = shuffle(items);
  return shuffled.slice(0, n);
}

/** 根据难度模式过滤考点 */
function filterPointsByDifficulty(points, mode) {
  return points.filter((p) => {
    if (mode === 'easy') return p.difficultyBase <= 2;
    if (mode === 'hard') return p.difficultyBase >= 3;
    return true; // mixed: 全部可用
  });
}

/** 给题型分配数量 */
function distributeCount(types, totalCount) {
  const perType = Math.floor(totalCount / types.length);
  const remainder = totalCount % types.length;
  const dist = {};
  for (const t of types) dist[t] = perType;
  // 余数优先分给靠前的类型
  for (let i = 0; i < remainder; i++) dist[types[i]]++;
  return dist;
}

/** 为关系代数题型匹配表集 */
function matchSchemaForRA(points) {
  const pointIds = points.map((p) => p.id);
  // 除法优先选课系统或供应商-零件
  if (pointIds.includes('ra-12')) {
    const candidates = SCHEMA_SETS.filter(
      (s) => s.id === 'university_enrollment' || s.id === 'supplier_parts'
    );
    if (candidates.length > 0) return candidates[Math.floor(Math.random() * candidates.length)].id;
  }
  // 外连接优先 DreamHome
  if (pointIds.some((id) => ['ra-10', 'ra-11'].includes(id))) {
    return 'dreamhome';
  }
  // 笛卡尔积/θ连接优先 W3Schools
  if (pointIds.some((id) => ['ra-06', 'ra-07'].includes(id))) {
    return 'w3schools_shop';
  }
  // 默认从适合的表集中随机选
  const suitable = SCHEMA_SETS.filter((s) =>
    pointIds.some((pid) => s.suitableFor.includes(pid))
  );
  if (suitable.length > 0) return suitable[Math.floor(Math.random() * suitable.length)].id;
  return SCHEMA_SETS[Math.floor(Math.random() * SCHEMA_SETS.length)].id;
}

/** 为 DML 题型匹配表集 */
function matchSchemaForDML(points) {
  const pointIds = points.map((p) => p.id);
  // 多表连接/子查询优先 W3Schools
  if (pointIds.some((id) => ['dml-11', 'dml-12', 'dml-16', 'dml-17'].includes(id))) {
    return 'w3schools_shop';
  }
  // EXISTS/NOT EXISTS 优先选课系统
  if (pointIds.some((id) => ['dml-10', 'dml-18'].includes(id))) {
    return 'university_enrollment';
  }
  // 集合操作优先供应商-零件
  if (pointIds.some((id) => ['dml-14'].includes(id))) {
    return 'supplier_parts';
  }
  // 聚合分组优先 W3Schools
  if (pointIds.some((id) => ['dml-05', 'dml-06'].includes(id))) {
    return 'w3schools_shop';
  }
  // 默认
  const suitable = SCHEMA_SETS.filter((s) =>
    pointIds.some((pid) => s.suitableFor.includes(pid))
  );
  if (suitable.length > 0) return suitable[Math.floor(Math.random() * suitable.length)].id;
  return 'w3schools_shop';
}

/** 为 DDL 题型匹配表集 */
function matchSchemaForDDL(points) {
  const pointIds = points.map((p) => p.id);
  // 外键/级联优先图书馆或选课系统
  if (pointIds.some((id) => ['ddl-05', 'ddl-18'].includes(id))) {
    const candidates = SCHEMA_SETS.filter(
      (s) => s.id === 'library' || s.id === 'university_enrollment'
    );
    if (candidates.length > 0) return candidates[Math.floor(Math.random() * candidates.length)].id;
  }
  // 视图优先选课系统
  if (pointIds.some((id) => ['ddl-09', 'ddl-10', 'ddl-11'].includes(id))) {
    return 'university_enrollment';
  }
  // 权限优先图书馆
  if (pointIds.some((id) => ['ddl-15'].includes(id))) {
    return 'library';
  }
  // 基础建表不需要特定表集
  if (pointIds.every((id) => ['ddl-01', 'ddl-02', 'ddl-03', 'ddl-13', 'ddl-14', 'ddl-17'].includes(id))) {
    return null; // 不需要表结构
  }
  // 默认
  const suitable = SCHEMA_SETS.filter((s) =>
    pointIds.some((pid) => s.suitableFor.includes(pid))
  );
  if (suitable.length > 0) return suitable[Math.floor(Math.random() * suitable.length)].id;
  return 'library';
}

/** 生成单个 questionPlan */
function createQuestionPlan(id, type, difficultyMode, allocatedPoints, usedPointIds, usedSchemaSetIds) {
  const typePoints = POINTS_BY_TYPE[type] || [];
  const filtered = filterPointsByDifficulty(typePoints, difficultyMode);

  // 排除已用考点
  const available = filtered.filter((p) => !usedPointIds.has(p.id));
  if (available.length === 0) {
    // 回退到 filtered，允许重复
    const fallback = filtered.filter((p) => !usedPointIds.has(p.id));
    if (fallback.length === 0) {
      // 全部情况下都重复了，从头选
      const pick = filtered[Math.floor(Math.random() * filtered.length)];
      if (!pick) {
        return { id, type, difficulty: 'medium', knowledgePointIds: [], schemaSetId: null, usedTables: [] };
      }
      usedPointIds.add(pick.id);
      const schemaId = matchSchemaByType(type, [pick]);
      if (schemaId) usedSchemaSetIds.add(schemaId);
      return {
        id, type,
        difficulty: difficultyMode === 'easy' ? 'easy' : difficultyMode === 'hard' ? 'hard' : 'medium',
        knowledgePointIds: [pick.id],
        schemaSetId: schemaId,
        usedTables: schemaId ? getTablesFromSchema(schemaId) : [],
        questionForm: pick.suitableQuestionForms?.[0] || '',
        mustUseConcepts: [pick.label],
        forbiddenRepetitionHints: [pick.label],
        requiresSchemaPanel: !!schemaId,
      };
    }
  }

  // 困难模式：至少融合 2 个考点
  let selectedPoints;
  if (difficultyMode === 'hard' && available.length >= 2) {
    const hardPoints = available.filter((p) => p.difficultyBase >= 3);
    if (hardPoints.length >= 2) {
      selectedPoints = hardPoints.slice(0, 2);
    } else if (hardPoints.length === 1) {
      const other = available.find((p) => p.id !== hardPoints[0].id);
      selectedPoints = other ? [hardPoints[0], other] : [hardPoints[0]];
    } else {
      selectedPoints = available.slice(0, 2);
    }
  } else if (difficultyMode === 'mixed' && available.length >= 1) {
    // mixed: 1-2 个考点
    const count = Math.random() > 0.5 && available.length >= 2 ? 2 : 1;
    const midPoints = available.filter((p) => p.difficultyBase >= 2);
    if (midPoints.length >= count) {
      selectedPoints = midPoints.slice(0, count);
    } else {
      selectedPoints = available.slice(0, count);
    }
  } else {
    selectedPoints = available.slice(0, 1);
  }

  for (const p of selectedPoints) usedPointIds.add(p.id);

  const schemaId = matchSchemaByType(type, selectedPoints);
  if (schemaId) usedSchemaSetIds.add(schemaId);

  const allPointsDifficulties = selectedPoints.map((p) => p.difficultyBase);
  const avgDiff = allPointsDifficulties.reduce((s, d) => s + d, 0) / selectedPoints.length;
  let difficulty;
  if (avgDiff <= 2) difficulty = 'easy';
  else if (avgDiff >= 4) difficulty = 'hard';
  else difficulty = 'medium';

  return {
    id,
    type,
    difficulty,
    knowledgePointIds: selectedPoints.map((p) => p.id),
    schemaSetId: schemaId,
    usedTables: schemaId ? getTablesFromSchema(schemaId) : [],
    questionForm: selectedPoints[0]?.suitableQuestionForms?.[0] || '',
    mustUseConcepts: selectedPoints.map((p) => p.label),
    forbiddenRepetitionHints: selectedPoints.map((p) => p.label),
    requiresSchemaPanel: !!schemaId,
  };
}

function matchSchemaByType(type, points) {
  if (type === 'relational_algebra') return matchSchemaForRA(points);
  if (type === 'DML') return matchSchemaForDML(points);
  if (type === 'DDL') return matchSchemaForDDL(points);
  return null;
}

function getTablesFromSchema(schemaId) {
  const schema = SCHEMA_SETS_BY_ID[schemaId];
  if (!schema) return [];
  return schema.tables.map((t) => t.name);
}

/**
 * 生成练习计划
 * @param {string[]} types - 选题型
 * @param {number} count - 题目数量
 * @param {string} difficultyMode - 'easy' | 'mixed' | 'hard'
 * @param {string} userPrompt - 用户补充要求（可选）
 */
export function createExercisePlan(types, count, difficultyMode = 'mixed', userPrompt = '') {
  const dist = distributeCount(types, count);
  const usedPointIds = new Set();
  const usedSchemaSetIds = new Set();
  const questionPlans = [];

  let id = 1;
  // 优先出困难/有表结构的题，再出简单的
  for (const type of types) {
    const n = dist[type];
    for (let i = 0; i < n; i++) {
      const plan = createQuestionPlan(id, type, difficultyMode, null, usedPointIds, usedSchemaSetIds);
      questionPlans.push(plan);
      id++;
    }
  }

  // 收集使用的 schema sets
  const selectedSchemaSets = [...usedSchemaSetIds];

  // 检查约束：
  // >=3 题至少 1 题 medium+
  if (count >= 3 && !questionPlans.some((qp) => qp.difficulty !== 'easy')) {
    // 升级最后一题
    const last = questionPlans[questionPlans.length - 1];
    if (last) last.difficulty = 'medium';
  }

  // 检查 RA 覆盖
  const raPlans = questionPlans.filter((qp) => qp.type === 'relational_algebra');
  if (raPlans.length > 0) {
    const raCats = raPlans.map((qp) => qp.knowledgePointIds).flat();
    const hasJoin = raCats.some((kid) => ['ra-06', 'ra-07', 'ra-08', 'ra-09', 'ra-10'].includes(kid));
    const hasSet = raCats.some((kid) => ['ra-03', 'ra-04', 'ra-05'].includes(kid));
    const hasDivision = raCats.some((kid) => kid === 'ra-12');
    // 如果都没有，尝试调整
    if (!hasJoin && !hasSet && !hasDivision && raPlans.length >= 1) {
      const newPlan = createQuestionPlan(raPlans[0].id, 'relational_algebra', 'medium', null, usedPointIds, usedSchemaSetIds);
      Object.assign(raPlans[0], newPlan);
    }
  }

  // 检查 DDL 覆盖
  const ddlPlans = questionPlans.filter((qp) => qp.type === 'DDL');
  if (ddlPlans.length > 0) {
    const ddlCats = ddlPlans.map((qp) => qp.knowledgePointIds).flat();
    const hasConstraint = ddlCats.some((kid) =>
      ['ddl-04', 'ddl-05', 'ddl-06', 'ddl-07', 'ddl-18'].includes(kid)
    );
    const hasView = ddlCats.some((kid) =>
      ['ddl-09', 'ddl-10', 'ddl-11'].includes(kid)
    );
    if (!hasConstraint && !hasView && ddlPlans.length >= 1) {
      const newPlan = createQuestionPlan(ddlPlans[0].id, 'DDL', 'mixed', null, usedPointIds, usedSchemaSetIds);
      Object.assign(ddlPlans[0], newPlan);
    }
  }

  // 检查 DML 覆盖（不少于全是 SELECT）
  const dmlPlans = questionPlans.filter((qp) => qp.type === 'DML');
  if (dmlPlans.length >= 2) {
    const allSelect = dmlPlans.every((qp) =>
      qp.knowledgePointIds.every((kid) => kid.startsWith('dml-0') && !['dml-15'].includes(kid))
    );
    if (allSelect) {
      // 把一道改成 INSERT/UPDATE/DELETE
      const target = dmlPlans[dmlPlans.length - 1];
      target.knowledgePointIds = ['dml-15'];
      target.mustUseConcepts = ['INSERT/UPDATE/DELETE'];
      target.difficulty = target.difficulty === 'easy' ? 'medium' : target.difficulty;
    }
  }

  return {
    selectedTypes: types,
    questionCount: count,
    difficultyMode,
    userPrompt,
    selectedSchemaSets,
    questionPlans,
  };
}
