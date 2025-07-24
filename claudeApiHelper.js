const fetch = require("node-fetch");

async function callClaudeWithRetryAndFallback(requestBody, apiKey, preferredModel, fallbackModel, maxRetries = 3) {
  const url = "https://api.anthropic.com/v1/messages";
  const headers = {
    "Content-Type": "application/json",
    "x-api-key": apiKey,
    "anthropic-version": "2023-06-01",
  };

  async function tryModel(model) {
    let attempt = 0;
    let delay = 1000;
    requestBody.model = model;
    while (attempt < maxRetries) {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody),
      });
      if (response.status !== 529) return response;
      await new Promise(res => setTimeout(res, delay));
      delay *= 2;
      attempt++;
    }
    return null;
  }

  // Try preferred model
  let response = await tryModel(preferredModel);
  if (response) return response;

  // Try fallback model
  response = await tryModel(fallbackModel);
  if (response) return response;

  // All failed
  return null;
}

module.exports = { callClaudeWithRetryAndFallback }; 