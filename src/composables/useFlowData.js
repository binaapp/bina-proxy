import burnoutFlow from "@/data/flows/Burnout.json";
import generalFlow from "@/data/flows/General.json";
import quickCoachingFlow from "@/data/flows/QuickCoaching.json";
import geniusZoneFlow from "@/data/flows/GeniousZone.json";
// We can add more flows here if needed in the future
// import generalFlow from '@/data/flows/General.json'

// Define the default flow name as a constant
export const DEFAULT_FLOW = "GeniusZone";

// Returns the flow data based on the flowName parameter
export function getFlowData(flowName = DEFAULT_FLOW) {
  switch (flowName.toLowerCase()) {
    case "general":
      return generalFlow;
    case "burnout":
      return burnoutFlow;
    case "geniuszone":
      return geniusZoneFlow;
    case "quickcoaching":
      return quickCoachingFlow;
    default:
      return geniusZoneFlow;
  }
}
