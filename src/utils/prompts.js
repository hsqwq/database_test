const GENERATION_SYSTEM = `你是一位大学数据库系统课程的教师，正在为学生出练习题。
你必须只返回合法的 JSON，不要包含任何 markdown 格式或解释文字。
所有题目使用中文描述，但 SQL 关键字和关系代数符号保持英文/标准符号。`;

export function buildGenerationPrompt(types, count) {
  const typeDescriptions = {
    DDL: 'DDL 题目：要求学生编写 CREATE TABLE、ALTER TABLE、CREATE INDEX 等数据定义语句',
    DML: 'DML 题目：要求学生编写 SELECT、INSERT、UPDATE、DELETE 等数据操作语句',
    relational_algebra:
      '关系代数题目：要求学生使用关系代数符号（σ、π、⋈、ρ、∪、∩、−、×）表达查询',
  };

  const selectedDescriptions = types.map((t) => typeDescriptions[t]).join('\n');

  const user = `请生成恰好 ${count} 道数据库练习题。

题目类型要求（均匀分布）：
${selectedDescriptions}

每道题需要包含以下字段：
- "id": 从 1 开始的整数序号
- "type": 题目类型，值为 "DDL"、"DML" 或 "relational_algebra"
- "question": 题目描述，清晰具体
- "schema_context": 如果题目需要用到表结构，在此提供相关的表名和字段描述；否则为 null

难度要求：混合不同难度级别。至少包含一道需要多表连接的题目。

请严格按照以下 JSON 结构返回：
{"exercises": [{"id": 1, "type": "...", "question": "...", "schema_context": "..."}]}`;

  return [
    { role: 'system', content: GENERATION_SYSTEM },
    { role: 'user', content: user },
  ];
}

const CHECKING_SYSTEM = `你是一位严格但富有帮助性的数据库系统教师，正在批改学生的作业答案。
你必须只返回合法的 JSON，不要包含任何 markdown 格式或解释文字。
批改时请使用中文给出反馈意见。`;

export function buildCheckingPrompt(exercisesWithAnswers) {
  const user = `请批改以下学生的答案。对每道题，请从以下维度逐一检查：

1. 正确性（CORRECTNESS）：答案是否正确解决了题目要求的问题？
2. 语法（SYNTAX）：SQL 或关系代数的语法是否正确？
3. 逻辑（LOGIC）：逻辑结构是否合理？
4. 标点符号（PUNCTUATION）：SQL 语句中列名之间应使用逗号而非句号；语句末尾需要分号。关系代数表达式中运算符使用是否正确？
5. 拼写（SPELLING）：根据题目提供的 schema_context，表名、列名、关键字是否拼写正确？

题目和学生答案如下：
${JSON.stringify(exercisesWithAnswers, null, 2)}

对每道题，请返回：
- "id": 对应题目的 id
- "correct": 答案是否正确（boolean）
- "score": 0-100 的整数分数
- "feedback": 详细的批改意见，指出哪些地方正确、哪些地方错误以及原因
- "corrected_answer": 如果答案有误，给出完全修正后的答案；如果答案正确则为 null

请严格按照以下 JSON 结构返回：
{"results": [{"id": 1, "correct": true, "score": 85, "feedback": "...", "corrected_answer": null}]}`;

  return [
    { role: 'system', content: CHECKING_SYSTEM },
    { role: 'user', content: user },
  ];
}
