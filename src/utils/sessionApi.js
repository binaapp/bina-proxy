const getDeviceInfo = () => {
  return {
    browser: navigator.userAgent,
    os: "Web",
    screenSize: `${window.innerWidth}x${window.innerHeight}`,
  };
};

console.log("👀 Hostname at runtime:", window.location.hostname);

const hostname = window.location.hostname;

export const API_URL = hostname.includes("staging.binaapp.com")
  ? "https://api-staging.binaapp.com/api/session"
  : hostname.includes("binaapp.com")
  ? "https://api.binaapp.com/api/session"
  : "http://localhost:3001/api/session";

/**
 * Submits session data to the backend, with retry logic on network/server errors
 * @param {Object} params Custom parameters to override defaults
 * @param {number} maxRetries Number of times to retry on failure
 * @param {number} retryDelay Delay between retries (ms)
 * @returns {Promise} Response from the server
 */
export async function submitSession(
  params = {},
  maxRetries = 3,
  retryDelay = 2000
) {
  console.log("Starting session submission with params:", params);

  const sessionData = {
    startTimestamp: params.startedAt || new Date().toISOString(),
    endTimestamp: params.endedAt || new Date().toISOString(),
    completed: params.completed || false,
    referralSource: params.referralSource || "direct",
    feedback: params.feedback || null,
    deviceInfo: getDeviceInfo(),
    flowSteps: params.flowSteps || [],
    sessionName: params.sessionName || null,
    uid: params.uid || null,
  };

  // Only include sessionId if it's provided and not null
  if (params.sessionId && params.sessionId !== null) {
    sessionData.sessionId = params.sessionId;
  }

  // Always use POST
  const url = API_URL;
  const method = "POST";

  console.log(`Sending ${method} request to:`, url);
  console.log("Session data being sent:", sessionData);

  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sessionData),
      });

      console.log("Response status:", response.status);
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        // Only retry on server errors or timeout (504)
        if (response.status === 504 || response.status >= 500) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        // For other errors, don't retry
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const data = await response.json();
      console.log("Session submission successful:", data);
      return data;
    } catch (error) {
      attempt++;
      if (attempt >= maxRetries) {
        // After max retries, rethrow error so UI can show message
        throw error;
      }
      // Wait before retrying
      await new Promise((res) => setTimeout(res, retryDelay));
    }
  }
}

export function getApiBase() {
  if (hostname.includes("staging.binaapp.com"))
    return "https://api-staging.binaapp.com";
  if (hostname.includes("binaapp.com")) return "https://api.binaapp.com";
  return "http://localhost:3001";
}

// Usage example in a Vue component:
/*
import { submitSession } from '@/utils/sessionApi';

// In your component methods:
async submitUserSession() {
  try {
    const result = await submitSession({
      feedback: "Custom feedback",
      flowSteps: [
        {
          stepId: "custom-step",
          startedAt: new Date().toISOString(),
          endedAt: new Date().toISOString(),
          userText: "Custom text",
          systemText: "Custom response"
        }
      ]
    });
    console.log('Session submitted successfully:', result);
  } catch (error) {
    console.error('Failed to submit session:', error);
    // Handle error appropriately
  }
}
*/

export async function handleAction(actionName, data) {
  console.log("[sessionApi] handleAction called with:", {
    actionName,
    sessionId: data.sessionId,
    hasFlowData: !!data.flowData,
    hasConversationHistory: !!data.conversationHistory,
    hasCurrentStep: !!data.currentStep,
    userEmail: data.userEmail,
  });

  const apiBase = getApiBase();
  // Convert camelCase to kebab-case
  const kebabCaseAction = actionName
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase();
  const url = `${apiBase}/api/${kebabCaseAction}`;
  console.log("[sessionApi] Making request to:", url);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  console.log("[sessionApi] Response status:", response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[sessionApi] Error response:", errorText);
    throw new Error(`Failed to execute action: ${actionName}`);
  }

  const responseData = await response.json();
  console.log("[sessionApi] Success response:", responseData);
  return responseData;
}
