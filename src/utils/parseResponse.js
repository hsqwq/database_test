/**
 * 安全解析 AI 返回的 JSON，支持三种回退策略：
 * 1. 直接 JSON.parse
 * 2. 从 markdown 代码块中提取 (```json ... ```)
 * 3. 从文本中匹配首尾大括号
 */
export function parseAIResponse(rawContent) {
  // 策略 1: 直接解析
  try {
    return JSON.parse(rawContent);
  } catch {
    /* 继续尝试 */
  }

  // 策略 2: 从 markdown 代码块中提取
  const fenceMatch = rawContent.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1]);
    } catch {
      /* 继续尝试 */
    }
  }

  // 策略 3: 找到第一个 { 和最后一个 } 尝试解析
  const firstBrace = rawContent.indexOf('{');
  const lastBrace = rawContent.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(rawContent.substring(firstBrace, lastBrace + 1));
    } catch {
      /* 继续尝试 */
    }
  }

  throw new Error(
    '无法解析 AI 返回的内容格式，请重试。\n原始响应:\n' + rawContent.slice(0, 500)
  );
}
