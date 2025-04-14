
import { SensorData } from "@/services/sensorApi";

export interface GeminiAnalysisResponse {
  qualityScore: number;
  status: 'good' | 'moderate' | 'poor';
  pros: string[];
  cons: string[];
  recommendations: string[];
  isHealthy: boolean;
  healthImplications: string[];
  answer?: string;
}

export interface GeminiApiOptions {
  customPrompt?: string;
}
