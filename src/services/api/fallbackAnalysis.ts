import { SensorData } from "@/services/sensorApi";
import { GeminiAnalysisResponse } from "./types";

// Fallback analysis function if the Gemini API fails
export const fallbackAnalysis = (data: SensorData, customPrompt?: string): GeminiAnalysisResponse => {
  // If this was a chat request, provide a simple fallback response
  if (customPrompt) {
    return {
      qualityScore: 0,
      status: 'moderate',
      pros: [],
      cons: [],
      recommendations: [],
      isHealthy: false,
      healthImplications: [],
      answer: "I'm sorry, I couldn't access my knowledge base right now. Please try again later."
    };
  }
  
  // Otherwise, fall back to the original analysis logic
  const pros: string[] = [];
  const cons: string[] = [];
  const recommendations: string[] = [];
  let qualityScore = 0;
  let isHealthy = false;
  const healthImplications: string[] = [];
  
  // pH analysis
  if (data.pH >= 6.5 && data.pH <= 8.5) {
    pros.push("pH level is in the optimal range");
    qualityScore += 25;
  } else if (data.pH < 6.5) {
    cons.push("Water is too acidic");
    recommendations.push("Consider adding pH increaser");
    healthImplications.push("Acidic water can cause digestive issues and may contain harmful metals");
    qualityScore += 10;
  } else {
    cons.push("Water is too alkaline");
    recommendations.push("Consider adding pH reducer");
    healthImplications.push("Alkaline water can taste bitter and may cause skin irritation");
    qualityScore += 10;
  }
  
  // TDS analysis
  if (data.tds < 300) {
    pros.push("TDS levels are within safe range");
    qualityScore += 25;
  } else if (data.tds < 600) {
    cons.push("TDS levels are slightly elevated");
    recommendations.push("Consider partial water change");
    healthImplications.push("Slightly elevated TDS may affect taste but is generally safe");
    qualityScore += 15;
  } else {
    cons.push("TDS levels are too high");
    recommendations.push("Immediate water change recommended");
    healthImplications.push("High TDS can indicate contamination and may cause gastrointestinal issues");
    qualityScore += 5;
  }
  
  // Turbidity analysis
  if (data.turbidity < 5) {
    pros.push("Water clarity is excellent");
    qualityScore += 25;
  } else if (data.turbidity < 10) {
    cons.push("Water clarity is reduced");
    recommendations.push("Check filtration system");
    healthImplications.push("Reduced clarity may indicate presence of pathogens");
    qualityScore += 15;
  } else {
    cons.push("Water is too cloudy");
    recommendations.push("Clean or replace filter, consider water change");
    healthImplications.push("Cloudy water may contain harmful microorganisms and should not be consumed");
    qualityScore += 5;
  }
  
  // Temperature analysis
  if (data.temperature >= 20 && data.temperature <= 25) {
    pros.push("Temperature is in optimal range");
    qualityScore += 25;
  } else if (data.temperature >= 15 && data.temperature < 20) {
    cons.push("Water temperature is slightly low");
    recommendations.push("Consider heating the water");
    qualityScore += 15;
  } else if (data.temperature > 25 && data.temperature <= 30) {
    cons.push("Water temperature is slightly high");
    recommendations.push("Consider cooling the water");
    qualityScore += 15;
  } else {
    cons.push("Water temperature is outside of safe range");
    recommendations.push("Urgent action needed to adjust temperature");
    healthImplications.push("Extreme temperatures can support harmful bacterial growth");
    qualityScore += 5;
  }
  
  // Determine overall health status
  isHealthy = qualityScore >= 70;
  
  // Add overall health implication if needed
  if (!isHealthy && healthImplications.length === 0) {
    healthImplications.push("Water quality parameters indicate potential health risks");
  }
  
  // Determine overall status
  let status: 'good' | 'moderate' | 'poor';
  if (qualityScore >= 80) {
    status = 'good';
  } else if (qualityScore >= 50) {
    status = 'moderate';
  } else {
    status = 'poor';
  }
  
  return {
    qualityScore,
    status,
    pros,
    cons,
    recommendations,
    isHealthy,
    healthImplications
  };
};
