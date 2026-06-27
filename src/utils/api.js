const DEEPSEEK_ENDPOINT = 'https://api.deepseek.com/v1/chat/completions';

export async function callDeepSeek(apiKey, messages, options = {}) {
  const { temperature = 0.7, jsonMode = false, signal } = options;

  const body = {
    model: 'deepseek-chat',
    messages,
    temperature,
  };

  if (jsonMode) {
    body.response_format = { type: 'json_object' };
  }

  const response = await fetch(DEEPSEEK_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    const statusMessages = {
      401: 'API Key 无效，请检查后重试。',
      402: '账户余额不足，请充值后重试。',
      429: '请求过于频繁，请稍等片刻后重试。',
      500: 'DeepSeek 服务器错误，请稍后重试。',
      503: 'DeepSeek 服务暂时不可用，请稍后重试。',
    };
    const message =
      statusMessages[response.status] ||
      `API 错误 (${response.status}): ${response.statusText}`;
    throw new Error(message);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('DeepSeek API 返回了空响应');
  }

  return content;
}
