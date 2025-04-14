
import { SensorData } from "./sensorApi";
import { GeminiAnalysisResponse } from "./api/types";
import { callGeminiApi } from "./api/geminiService";

// Export the types
export type { GeminiAnalysisResponse };

// Main function to analyze sensor data that maintains the same interface
export const analyzeSensorDataWithGemini = async (
  sensorData: SensorData, 
  customPrompt?: string
): Promise<GeminiAnalysisResponse> => {
  return callGeminiApi(sensorData, { customPrompt });
};
