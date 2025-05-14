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
 * Submits session data to the backend
 * @param {Object} params Custom parameters to override defaults
 * @returns {Promise} Response from the server
 */
export async function submitSession(params = {}) {
  console.log("Starting session submission with params:", params);

  const sessionData = {
    startTimestamp: params.startedAt || new Date().toISOString(),
    endTimestamp: params.endedAt || new Date().toISOString(),
    completed: params.completed || false,
    referralSource: params.referralSource || "direct",
    feedback: params.feedback || null,
    deviceInfo: getDeviceInfo(),
    flowSteps: params.flowSteps || [],
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
      const errorText = await response.text();
      console.error("Server error response:", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Session submission successful:", data);
    return data;
  } catch (error) {
    console.error("Error submitting session:", error);
    throw error;
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
