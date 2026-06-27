import { useState, useCallback, useRef } from 'react';
import { callDeepSeek } from '../utils/api';
import { parseAIResponse } from '../utils/parseResponse';

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

  const generateExercises = useCallback(
    async (messages) => {
      abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setGenerateLoading(true);
      setGenerateError(null);

      try {
        const raw = await callDeepSeek(apiKey, messages, {
          temperature: 0.8,
          jsonMode: true,
          signal: controller.signal,
        });
        const parsed = parseAIResponse(raw);

        if (!parsed.exercises || !Array.isArray(parsed.exercises)) {
          throw new Error('AI 返回的数据中缺少 exercises 数组');
        }

        const validExercises = parsed.exercises.filter(
          (ex) => ex.id && ex.type && ex.question
        );

        if (validExercises.length === 0) {
          throw new Error('AI 未生成有效题目，请重试');
        }

        setGenerateLoading(false);
        abortRef.current = null;
        return validExercises;
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

  const checkAnswers = useCallback(
    async (messages) => {
      abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setCheckLoading(true);
      setCheckError(null);

      try {
        const raw = await callDeepSeek(apiKey, messages, {
          temperature: 0.3,
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
