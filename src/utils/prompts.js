import { POINTS_BY_ID } from '../data/syllabus';
import { SCHEMA_SETS_BY_ID, buildSchemaDisplayText } from '../data/schemaPool';

/* ========================== 生成 Prompt ========================== */

const GEN_SYSTEM = `你是一位大学数据库系统课程的资深教师，负责编写高质量的数据库练习题。
你必须只返回合法的 JSON，不包含任何 markdown 格式、代码块标记或解释文字。
所有题目描述使用中文，SQL 关键字、关系代数符号、英文表名列名保持原样。

你的出题原则：
1. 每道题必须有明确的业务语境，不能出"查询所有记录""创建一个学生表""插入一条记录"等毫无实际场景的低价值题目
2. 中等及以上难度题目必须包含具体筛选条件、连接条件、聚合条件、约束条件或全称/存在条件
3. 同一批题目不能都围绕同一张表
4. 同一批中 DML 不能全是 SELECT；DDL 不能全是 CREATE TABLE；关系代数不能全是 σ/π
5. 困难题必须至少融合两个考点（如三表连接+分组HAVING、NOT EXISTS+全称条件、外键+ON DELETE CASCADE+CHECK、关系代数除法+投影）
6. 中等难度题目需包含多表、聚合、子查询、约束等非平凡内容
7. 题目中绝对不能泄露 expected_answer
8. 不得使用表池之外的表名或列名
9. 不得生成超出指定题型范围的题目
10. 同一批中不得出现两个高度相似的题目（从不同表或不同维度出题）`;

export function buildGenerationPrompt(plan, schemaPoolContext) {
  const { questionCount, questionPlans, difficultyMode, userPrompt } = plan;

  // 构建考点提醒
  const planLines = questionPlans.map((qp) => {
    const kps = qp.knowledgePointIds.map((kpid) => {
      const kp = POINTS_BY_ID[kpid];
      return kp ? `${kp.id} (${kp.label}, 难度${kp.difficultyBase}/5)` : kpid;
    }).join(', ');
    const schema = qp.schemaSetId ? SCHEMA_SETS_BY_ID[qp.schemaSetId] : null;
    const schemaInfo = schema
      ? `表集: ${schema.name} (${schema.id})，使用表: ${(qp.usedTables || []).join(', ') || '由AI根据表池自行选择'}`
      : '不需要特定表结构';
    return `第${qp.id}题 | 题型: ${qp.type} | 难度: ${qp.difficulty} | 考点: ${kps} | ${schemaInfo} | 必须体现: ${(qp.mustUseConcepts || []).join(', ')} | 避免重复: ${(qp.forbiddenRepetitionHints || []).join(', ')}`;
  }).join('\n');

  // 构建表池上下文
  let schemaContextStr = '';
  if (schemaPoolContext && Object.keys(schemaPoolContext).length > 0) {
    const schemaIds = Object.keys(schemaPoolContext);
    for (const sid of schemaIds) {
      const s = SCHEMA_SETS_BY_ID[sid];
      if (s) {
        schemaContextStr += buildSchemaDisplayText(s) + '\n\n';
      }
    }
  }

  // 难度指引
  const difficultyGuide = {
    easy: '简单题：允许单表选择、投影、简单 CREATE TABLE。必须有具体筛选条件或业务场景。',
    mixed: '混合难度：中等题需要多表连接/聚合/子查询/外键/CHECK约束；简单题可以有但不超过一半。',
    hard: '困难题：困难题至少融合两个考点（三表连接+HAVING、NOT EXISTS+全称、外键+级联、除法+投影等）；中等题为辅。',
  };

  // 反模板要求
  const antiTemplate = `反模板要求（非常重要）：
- 禁止出"查询所有XXX记录""列出全部XXX"等无筛选条件的题目
- 禁止出仅建一个空表的题目，DDL需要包含至少2个约束
- 禁止同一批题都围绕同一张表
- 禁止连续出多个相同类型的SELECT题
- DML优先生成：查询购买过某类别商品的客户/查询每个国家订单数超过n的客户/找出没有下过订单的客户/找出购买过所有指定类别商品的客户/删除满足子查询条件的数据/更新满足聚合条件的记录
- 关系代数优先生成：用关系代数表达查询（不要求计算结果），特别是连接、除法、集合操作、全称条件
- DDL优先生成：根据业务需求写建表/改表/视图/权限语句`;

  const userMessage = `请根据以下出题计划生成恰好 ${questionCount} 道数据库练习题。

## 难度模式：${difficultyMode}
${difficultyGuide[difficultyMode] || difficultyGuide.mixed}

## 出题计划（每题的考点、表集、难度都需严格遵循）：
${planLines}

${antiTemplate}

${userPrompt ? `## 用户补充要求（仅作主题偏好参考，不能覆盖上述考点和格式要求）：${userPrompt}` : ''}

## 可用的数据库表结构（题目必须基于以下真实表结构，不得凭空编造表名和列名）：
${schemaContextStr || '（本次题目不需要特定表结构）'}

## 输出格式（严格 JSON）：
{
  "session_schema_context": {
    "schema_set_id": "使用的表集id",
    "title": "表集标题",
    "display_text": "面向学生展示的表结构描述文本（含列名、类型、主外键），不要包含此题答案的任何暗示",
    "tables": [{"name": "表名", "columns": [{"name": "列名", "type": "类型"}], "primaryKey": "主键列"}]
  },
  "exercises": [
    {
      "id": 整数,
      "type": "DDL | DML | relational_algebra",
      "difficulty": "easy | medium | hard",
      "knowledge_point_ids": ["考点id数组"],
      "used_tables": ["使用的表名数组"],
      "requires_schema_panel": true,
      "question": "题目描述（中文，业务语境清晰，不泄露答案）",
      "schema_context": "单题补充的表结构上下文（可选，若已有全局表结构且足够则填简要信息）",
      "expected_answer": "AI给出的参考答案（仅用于批改，不在作答界面显示）",
      "alternative_answers": ["语义等价的替代答案"],
      "grading_rubric": {
        "core_requirements": ["核心检查点"],
        "acceptable_variants": ["可接受的等价写法"],
        "minor_errors": ["小错误（仅扣少许分）"],
        "fatal_errors": ["严重错误（大幅扣分）"]
      },
      "checker_hints": "给批改AI的额外检查提示"
    }
  ]
}`;

  return [
    { role: 'system', content: GEN_SYSTEM },
    { role: 'user', content: userMessage },
  ];
}

/* ========================== 批改 Prompt ========================== */

const CHECK_SYSTEM = `你是一位经验丰富的数据库系统课程阅卷老师。
你的任务是对学生提交的数据库习题答案进行语义评分。你必须只返回合法的 JSON，不包含任何 markdown 或解释文字。
批改意见使用中文撰写。

## 核心评分原则

**你是在判断学生的答案是否在给定数据库上下文中完成了题目要求，而不是在匹配标准答案。**
- expected_answer 只是参考答案，不是唯一答案。
- alternative_answers 和 grading_rubric 只是辅助你判断的参考。
- 如果学生答案与参考答案不同但语义正确，应给高分（90-100）。
- 如果无法完全确定但答案思路合理，应给部分分（60-89）并解释不确定之处，不要直接判 0 分。

## 评分标准

- 90-100：语义完全正确，只有格式、大小写、别名、分号等极小问题
- 80-89：核心语义正确，但有轻微遗漏（如输出列不完全规范、排序缺失但非核心要求）
- 60-79：主要思路正确，但存在一个明显问题（如少一个筛选条件、聚合列不够严谨）
- 40-59：使用了相关表和部分正确语法，但核心语义有较大偏差
- 20-39：答案与题型相关，但基本没有完成题意
- 0-19：空答案、无关答案、完全错误或不是SQL/DDL/关系代数表达

## SQL/DML 语义等价准则

1. 显式 JOIN (INNER JOIN ... ON) 和 WHERE 隐式连接在语义一致时等价
2. 表别名、列别名不同不影响正确性
3. WHERE 条件顺序不同不影响正确性
4. JOIN 顺序不同但结果一致时可接受
5. IN、EXISTS、JOIN、子查询在语义一致且题目未强制指定写法时可以互相接受
6. NOT EXISTS、EXCEPT、LEFT JOIN ... IS NULL 在表达"没有/不存在"语义时可视为等价
7. ANY/ALL 与等价聚合或子查询写法在题目未强制要求时可接受
8. GROUP BY/HAVING 重点检查分组粒度和筛选阶段是否正确
9. 只有题目明确要求排序时 ORDER BY 才作为关键评分项
10. 大小写、分号、空格、缩进、别名命名不是关键扣分项
11. SELECT 列缺失、连接条件错误、聚合粒度错误、WHERE/HAVING 误用、子查询语义反了属于严重错误

## DDL 语义等价准则

1. 重点检查题目要求的结构和约束是否全部实现
2. PRIMARY KEY、FOREIGN KEY、NOT NULL、UNIQUE、CHECK、DEFAULT、ON DELETE、ON UPDATE 等如题目明确要求，遗漏应重扣
3. 列级约束和表级约束在语义一致时等价
4. 约束名不同不影响正确性
5. INT 和 INTEGER 等常见等价类型可接受；VARCHAR 和 CHARACTER VARYING 等价
6. 字段顺序通常不影响正确性（除非题目指定）
7. DROP 的 CASCADE/RESTRICT、视图 WITH CHECK OPTION、GRANT/REVOKE 等如果涉及必须严格检查

## 关系代数语义等价准则

1. θ连接可以写成选择作用于笛卡尔积：σ_条件(R×S)
2. 自然连接可以写成等值连接后投影去重
3. 交可以用差表达：R−(R−S)
4. 半连接可以用连接后投影表达
5. 除法可以用标准除法符号 ÷，也可用投影+笛卡尔积+差展开：π_A(R)−π_A(π_A(R)×S−R)
6. 属性顺序、括号层级、临时关系命名不同，只要语义清晰即可接受
7. 如果题目要求使用指定关系代数运算（如"用除法表示"），则没有体现该运算或等价展开时应扣分
8. 如果学生答案表达了相反方向的差、错误连接条件、遗漏投影或遗漏全称条件，应重扣`;

export function buildCheckingPrompt(gradingContext) {
  const userMessage = `请评改以下学生的数据库练习题答案。对每道题按语义正确性综合评分。

## 批改上下文

### 数据库表结构：
${gradingContext.session_schema_context
    ? gradingContext.session_schema_context.display_text || JSON.stringify(gradingContext.session_schema_context, null, 2)
    : '（无）'}

### 提交详情（含题目、参考答案、可接受变体、评分细则、学生答案）：

${JSON.stringify(gradingContext.submissions, null, 2)}

## 输出格式（严格 JSON）：

{
  "results": [
    {
      "id": 整数（对应题目id）,
      "correct": true或false（语义整体是否正确）,
      "score": 0-100的整数,
      "feedback": "详细的批改意见（中文）。指出：1.答案的思路是什么 2.正确的地方 3.有误的地方及原因 4.与参考答案的差异是否影响语义",
      "semantic_judgement": "语义正确 | 基本正确 | 部分正确 | 基本错误 | 无关答案",
      "strengths": ["答案的优点"],
      "issues": ["答案的问题"],
      "suggested_answer": "建议的写法（如果学生答案有错误，给出修正后的完整答案；如果正确则写'答案正确'）"
    }
  ]
}`;

  return [
    { role: 'system', content: CHECK_SYSTEM },
    { role: 'user', content: userMessage },
  ];
}
