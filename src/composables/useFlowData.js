import burnoutFlow from "@/data/flows/Burnout.json";
import generalFlow from "@/data/flows/General.json";
import quickCoachingFlow from "@/data/flows/QuickCoaching.json";
// We can add more flows here if needed in the future
// import generalFlow from '@/data/flows/General.json'

// Define the default flow name as a constant
export const DEFAULT_FLOW = "QuickCoaching";

// Export the current active flow
export const flowData = quickCoachingFlow;

// If we need to switch flows in the future, we can add that functionality here

// Returns the flow data based on the flowName parameter
export function getFlowData(flowName = DEFAULT_FLOW) {
  switch (flowName.toLowerCase()) {
    case "general":
      return generalFlow;
    case "burnout":
      return burnoutFlow;
    default:
      return quickCoachingFlow;
  }
}
