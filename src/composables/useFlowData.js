import burnoutFlow from "@/data/flows/Burnout.json";
import generalFlow from "@/data/flows/General.json";
// We can add more flows here if needed in the future
// import generalFlow from '@/data/flows/General.json'

// Export the current active flow
export const flowData = burnoutFlow;

// If we need to switch flows in the future, we can add that functionality here

// Returns the flow data based on the flowName parameter
export function getFlowData(flowName = "Burnout") {
  switch (flowName.toLowerCase()) {
    case "general":
      return generalFlow;
    case "burnout":
    default:
      return burnoutFlow;
  }
}
