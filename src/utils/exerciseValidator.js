/**
 * AI 生成结果结构校验器 —— 只检查 JSON 结构，不做语义判题
 *
 * 职责：
 * 1. exercises 是否为数组
 * 2. 题目数量是否匹配
 * 3. id 是否唯一
 * 4. type 是否合法
 * 5. difficulty 是否合法
 * 6. question 是否非空
 * 7. expected_answer 是否非空
 * 8. grading_rubric 是否存在
 * 9. used_tables 是否存在于 schemaPool
 * 10. knowledge_point_ids 是否存在于 syllabus
 * 11. schema_context 是否可展示
 * 12. JSON 是否合法
 */

import { POINTS_BY_ID } from '../data/syllabus';
import { SCHEMA_SETS_BY_ID } from '../data/schemaPool';

const VALID_TYPES = ['DDL', 'DML', 'relational_algebra'];
const VALID_DIFFICULTIES = ['easy', 'medium', 'hard'];

export function validateExerciseBatch(parsed, expectedCount, usedSchemaSetIds) {
  const issues = [];

  // 1. exercises 是否为数组
  if (!parsed.exercises || !Array.isArray(parsed.exercises)) {
    issues.push({ field: 'exercises', message: 'exercises 不是数组' });
    return { valid: false, issues };
  }

  const exercises = parsed.exercises;
  const seenIds = new Set();

  // 2. 题目数量
  if (exercises.length !== expectedCount) {
    issues.push({ field: 'exercises', message: `期望 ${expectedCount} 题，得到 ${exercises.length} 题` });
  }

  for (let i = 0; i < exercises.length; i++) {
    const ex = exercises[i];
    const prefix = `exercises[${i}]`;

    // 3. id 唯一
    if (!ex.id || typeof ex.id !== 'number') {
      issues.push({ field: `${prefix}.id`, message: `id 缺失或非数字: ${ex.id}` });
    } else if (seenIds.has(ex.id)) {
      issues.push({ field: `${prefix}.id`, message: `id 重复: ${ex.id}` });
    } else {
      seenIds.add(ex.id);
    }

    // 4. type 合法
    if (!VALID_TYPES.includes(ex.type)) {
      issues.push({ field: `${prefix}.type`, message: `type 非法: ${ex.type}` });
    }

    // 5. difficulty 合法
    if (ex.difficulty && !VALID_DIFFICULTIES.includes(ex.difficulty)) {
      issues.push({ field: `${prefix}.difficulty`, message: `difficulty 非法: ${ex.difficulty}` });
    }

    // 6. question 非空
    if (!ex.question || typeof ex.question !== 'string' || ex.question.trim() === '') {
      issues.push({ field: `${prefix}.question`, message: 'question 为空' });
    }

    // 7. expected_answer 非空
    if (!ex.expected_answer || typeof ex.expected_answer !== 'string' || ex.expected_answer.trim() === '') {
      issues.push({ field: `${prefix}.expected_answer`, message: 'expected_answer 为空' });
    }

    // 8. grading_rubric 存在
    if (!ex.grading_rubric || typeof ex.grading_rubric !== 'object') {
      issues.push({ field: `${prefix}.grading_rubric`, message: 'grading_rubric 缺失' });
    }

    // 9. used_tables 检查
    if (ex.used_tables && Array.isArray(ex.used_tables)) {
      for (const tableName of ex.used_tables) {
        let found = false;
        if (usedSchemaSetIds) {
          for (const sid of usedSchemaSetIds) {
            const schema = SCHEMA_SETS_BY_ID[sid];
            if (schema && schema.tables.some((t) => t.name === tableName)) {
              found = true;
              break;
            }
          }
        } else {
          found = true; // 没有指定 schemaId 时跳过
        }
        if (!found) {
          issues.push({ field: `${prefix}.used_tables`, message: `表 "${tableName}" 不在任何已选表集中` });
        }
      }
    }

    // 10. knowledge_point_ids 检查
    if (ex.knowledge_point_ids && Array.isArray(ex.knowledge_point_ids)) {
      for (const kpid of ex.knowledge_point_ids) {
        if (!POINTS_BY_ID[kpid]) {
          issues.push({ field: `${prefix}.knowledge_point_ids`, message: `考点 id "${kpid}" 不存在` });
        }
      }
    }
  }

  // 11. session_schema_context 检查
  if (parsed.session_schema_context) {
    const ssc = parsed.session_schema_context;
    if (!ssc.tables || !Array.isArray(ssc.tables)) {
      issues.push({ field: 'session_schema_context.tables', message: 'tables 缺失或非数组' });
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

/**
 * 构建 repair prompt —— 只修复结构问题，不打分
 */
export function buildRepairPrompt(originalResponse, issues) {
  const system = `你是一个 JSON 格式修复助手。你只负责修复 JSON 结构问题，不修改题目内容或答案。
你必须只返回修复后的合法 JSON，不包含任何解释或 markdown。`;

  const user = `以下 JSON 存在结构问题，请修复：

问题列表：
${issues.map((iss, i) => `${i + 1}. ${iss.field}: ${iss.message}`).join('\n')}

原始响应：
${typeof originalResponse === 'string' ? originalResponse : JSON.stringify(originalResponse, null, 2)}

请修复后返回合法 JSON。`;

  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];
}
