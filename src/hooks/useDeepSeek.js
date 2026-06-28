import { useState, useCallback, useRef } from 'react';
import { callDeepSeek } from '../utils/api';
import { parseAIResponse } from '../utils/parseResponse';
import { validateExerciseBatch, buildRepairPrompt } from '../utils/exerciseValidator';

export function useDeepSeek(apiKey) {
  const [generateLoading, setGenerateLoading] = useState(false);
  const [generateError, setGenerateError] = useState(null);
  const [checkLoading, setCheckLoading] = useState(false);
  const [checkError, setCheckError] = useState(null);

  const abortRef = useRef(null);

  const abort = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  }, []);

  /**
   * 生成练习题，含结构校验 + 最多一次修复重试
   * @returns {{ exercises, sessionSchemaContext } | null}
   */
  const generateExercises = useCallback(
    async (plan) => {
      abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setGenerateLoading(true);
      setGenerateError(null);

      const MAX_RETRIES = 1;

      async function attempt(messages, attemptNum) {
        const raw = await callDeepSeek(apiKey, messages, {
          temperature: 0.75,
          jsonMode: true,
          signal: controller.signal,
        });
        const parsed = parseAIResponse(raw);

        // 结构校验
        const validation = validateExerciseBatch(
          parsed,
          plan.questionCount,
          plan.selectedSchemaSets
        );

        if (validation.valid) {
          return {
            exercises: parsed.exercises,
            sessionSchemaContext: parsed.session_schema_context || null,
          };
        }

        // 如果结构有问题且还有重试次数
        if (attemptNum < MAX_RETRIES) {
          const repairMsgs = buildRepairPrompt(raw, validation.issues);
          return attempt(repairMsgs, attemptNum + 1);
        }

        // 最后机会：结构校验失败但尝试提取可用的 exercises
        if (parsed.exercises && Array.isArray(parsed.exercises)) {
          const usable = parsed.exercises.filter((ex) => ex.id && ex.type && ex.question);
          if (usable.length > 0) {
            return {
              exercises: usable,
              sessionSchemaContext: parsed.session_schema_context || null,
              validationWarnings: validation.issues,
            };
          }
        }

        throw new Error(`AI 返回数据格式校验失败: ${validation.issues.map((i) => i.message).join('; ')}`);
      }

      try {
        const result = await attempt(plan.messages, 0);

        setGenerateLoading(false);
        abortRef.current = null;
        return result;
      } catch (err) {
        if (err.name === 'AbortError') {
          setGenerateLoading(false);
          return null;
        }
        setGenerateError(err.message);
        setGenerateLoading(false);
        abortRef.current = null;
        throw err;
      }
    },
    [apiKey, abort]
  );

  /**
   * 批改答案
   * @returns {Array | null} results 数组
   */
  const checkAnswers = useCallback(
    async (messages) => {
      abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setCheckLoading(true);
      setCheckError(null);

      try {
        const raw = await callDeepSeek(apiKey, messages, {
          temperature: 0.25,
          jsonMode: true,
          signal: controller.signal,
        });
        const parsed = parseAIResponse(raw);

        if (!parsed.results || !Array.isArray(parsed.results)) {
          throw new Error('AI 返回的批改数据中缺少 results 数组');
        }

        setCheckLoading(false);
        abortRef.current = null;
        return parsed.results;
      } catch (err) {
        if (err.name === 'AbortError') {
          setCheckLoading(false);
          return null;
        }
        setCheckError(err.message);
        setCheckLoading(false);
        abortRef.current = null;
        throw err;
      }
    },
    [apiKey, abort]
  );

  const clearErrors = useCallback(() => {
    setGenerateError(null);
    setCheckError(null);
  }, []);

  return {
    generateExercises,
    checkAnswers,
    generateLoading,
    generateError,
    checkLoading,
    checkError,
    clearErrors,
  };
}
