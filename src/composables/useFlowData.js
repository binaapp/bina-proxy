import burnoutFlow from "@/data/flows/Burnout.json";
import generalFlow from "@/data/flows/General.json";
import quickCoachingFlow from "@/data/flows/QuickCoaching.json";
import geniusZoneFlow from "@/data/flows/GeniousZone.json";
import qCoachMaiaFlow from "@/data/flows/QCoachMaia.json";
import maiaProgram from "@/data/flows/Maia Flow/MaiaProgram.json";
// We can add more flows here if needed in the future
// import generalFlow from '@/data/flows/General.json'

// Define the default flow name as a constant
export const DEFAULT_FLOW = "qcoachmaia";

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
    case "qcoachmaia":
      return qCoachMaiaFlow;
    default:
      return qCoachMaiaFlow;
  }
}

// Helper to dynamically import the first session of a program
export async function loadFirstSessionOfProgram(programName) {
  console.log("loadFirstSessionOfProgram called with:", programName);

  switch (programName.toLowerCase()) {
    case "maia": {
      console.log("Loading Maia program");
      const firstSessionFile = maiaProgram.sessions[0].file;
      console.log("First session file:", firstSessionFile);

      const sessionFileMap = {
        "Maia Flow/FirstSession.json": () =>
          import("@/data/flows/Maia Flow/FirstSession.json"),
      };

      console.log("Session file map:", sessionFileMap);
      console.log("Looking for file in map:", firstSessionFile);

      if (sessionFileMap[firstSessionFile]) {
        console.log("Found file in map, importing...");
        const module = await sessionFileMap[firstSessionFile]();
        console.log("Module imported:", module);
        return module.default;
      } else {
        console.error("File not found in map:", firstSessionFile);
        throw new Error(
          "Session file not found in mapping: " + firstSessionFile
        );
      }
    }
    // Add more programs as needed
    default:
      console.error("Unknown program:", programName);
      throw new Error("Unknown program: " + programName);
  }
}
