/**
 * 构建完整批改上下文
 * 将所有练习信息合并成一个统一的 gradingContext
 */

import { SCHEMA_SETS_BY_ID, buildSchemaDisplayText } from '../data/schemaPool';
import { POINTS_BY_ID } from '../data/syllabus';

/**
 * @param {Array} exercises - 包含 expected_answer/alternative_answers/grading_rubric 等完整信息
 * @param {Object} studentAnswers - { [exerciseId]: "学生答案字符串" }
 * @param {Object|string|null} sessionSchemaContext - session_schema_context 或 schemaSetId
 */
export function buildGradingContext(exercises, studentAnswers, sessionSchemaContext) {
  // 解析 session schema context
  let schemaContext;
  if (typeof sessionSchemaContext === 'string' && SCHEMA_SETS_BY_ID[sessionSchemaContext]) {
    schemaContext = {
      schema_set_id: sessionSchemaContext,
      display_text: buildSchemaDisplayText(SCHEMA_SETS_BY_ID[sessionSchemaContext]),
      tables: SCHEMA_SETS_BY_ID[sessionSchemaContext].tables.map((t) => ({
        name: t.name,
        columns: t.columns.map((c) => ({ name: c.name, type: c.type })),
        primaryKey: t.primaryKey,
      })),
      relationships: SCHEMA_SETS_BY_ID[sessionSchemaContext].relationships,
      sample_rows: SCHEMA_SETS_BY_ID[sessionSchemaContext].sampleRows,
    };
  } else if (sessionSchemaContext && typeof sessionSchemaContext === 'object') {
    schemaContext = sessionSchemaContext;
  } else {
    schemaContext = null;
  }

  const submissions = exercises.map((ex) => {
    // 解析考点详情
    const knowledgePointDetails = (ex.knowledge_point_ids || []).map((kpid) => {
      const kp = POINTS_BY_ID[kpid];
      return kp ? { id: kp.id, label: kp.label, gradingNotes: kp.gradingNotes } : { id: kpid };
    });

    return {
      id: ex.id,
      type: ex.type,
      difficulty: ex.difficulty || 'medium',
      knowledge_point_ids: ex.knowledge_point_ids || [],
      knowledge_point_details: knowledgePointDetails,
      used_tables: ex.used_tables || [],
      question: ex.question,
      schema_context: ex.schema_context || null,
      expected_answer: ex.expected_answer || '',
      alternative_answers: ex.alternative_answers || [],
      grading_rubric: ex.grading_rubric || {
        core_requirements: [],
        acceptable_variants: [],
        minor_errors: [],
        fatal_errors: [],
      },
      checker_hints: ex.checker_hints || '',
      student_answer: studentAnswers[ex.id] || '（未作答）',
    };
  });

  return {
    session_schema_context: schemaContext,
    submissions,
  };
}
