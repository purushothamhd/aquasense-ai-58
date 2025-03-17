
import { SensorData } from "./sensorApi";

export interface GeminiAnalysisResponse {
  qualityScore: number;
  status: 'good' | 'moderate' | 'poor';
  pros: string[];
  cons: string[];
  recommendations: string[];
  isHealthy: boolean;
  healthImplications: string[];
}

export const analyzeSensorDataWithGemini = async (sensorData: SensorData): Promise<GeminiAnalysisResponse> => {
  try {
    const API_KEY = "YOUR_GEMINI_API_KEY"; // Replace with your actual API key or use environment variables
    const API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent";
    
    const prompt = `
      Analyze the following water quality parameters and provide a detailed assessment:
      - pH: ${sensorData.pH}
      - Total Dissolved Solids (TDS): ${sensorData.tds} ppm
      - Turbidity: ${sensorData.turbidity} NTU
      - Temperature: ${sensorData.temperature}°C
      
      Please provide:
      1. An overall water quality score from 0-100
      2. Water quality status (good, moderate, or poor)
      3. A list of positive aspects of the water quality
      4. A list of concerning aspects of the water quality
      5. Specific recommendations for improvement
      6. Is this water healthy for human consumption? (true/false)
      7. What are the health implications of consuming this water?
      
      Format your response as a JSON object with the following structure:
      {
        "qualityScore": number,
        "status": "good" | "moderate" | "poor",
        "pros": string[],
        "cons": string[],
        "recommendations": string[],
        "isHealthy": boolean,
        "healthImplications": string[]
      }
    `;
    
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });
    
    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Extract the JSON string from the Gemini response
    const responseText = data.candidates[0].content.parts[0].text;
    
    // Parse the JSON response
    const jsonResponse = extractJsonFromString(responseText);
    
    return {
      qualityScore: jsonResponse.qualityScore || 50,
      status: jsonResponse.status || 'moderate',
      pros: jsonResponse.pros || [],
      cons: jsonResponse.cons || [],
      recommendations: jsonResponse.recommendations || [],
      isHealthy: jsonResponse.isHealthy || false,
      healthImplications: jsonResponse.healthImplications || []
    };
  } catch (error) {
    console.error("Error analyzing data with Gemini:", error);
    // Fallback to local analysis if Gemini API fails
    return fallbackAnalysis(sensorData);
  }
};

// Helper function to extract JSON from a string that might have markdown or extra text
const extractJsonFromString = (text: string): any => {
  try {
    // Try to parse the whole text as JSON first
    return JSON.parse(text);
  } catch (e) {
    // If that fails, try to extract JSON from markdown or text
    const jsonPattern = /```(?:json)?\s*({[\s\S]*?})\s*```|({[\s\S]*})/;
    const matches = text.match(jsonPattern);
    
    if (matches && (matches[1] || matches[2])) {
      try {
        return JSON.parse(matches[1] || matches[2]);
      } catch (e) {
        throw new Error("Failed to parse JSON from response");
      }
    }
    throw new Error("No JSON found in response");
  }
};

// Fallback analysis function if the Gemini API fails
const fallbackAnalysis = (data: SensorData): GeminiAnalysisResponse => {
  // This is the same logic from the original analyzeWaterQuality function
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
