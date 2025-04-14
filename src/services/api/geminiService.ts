
import { SensorData } from "@/services/sensorApi";
import { GeminiAnalysisResponse, GeminiApiOptions } from "./types";
import { extractJsonFromString } from "./utils";
import { fallbackAnalysis } from "./fallbackAnalysis";

export const callGeminiApi = async (
  sensorData: SensorData, 
  options: GeminiApiOptions = {}
): Promise<GeminiAnalysisResponse> => {
  try {
    const API_KEY = "AIzaSyAhMFjgcLwrpwN2TbQpVG873zughJTAw8k"; // Hackathon demo API key
    const API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent";
    
    // If we have a custom prompt (for chat), use that instead of the analysis prompt
    const prompt = options.customPrompt || `
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
    
    // Extract the text from the Gemini response
    const responseText = data.candidates[0].content.parts[0].text;
    
    // If this was a chat request, return the response directly
    if (options.customPrompt) {
      return {
        qualityScore: 0,
        status: 'moderate',
        pros: [],
        cons: [],
        recommendations: [],
        isHealthy: false,
        healthImplications: [],
        answer: responseText
      };
    }
    
    // Otherwise parse the JSON response for water analysis
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
    return fallbackAnalysis(sensorData, options.customPrompt);
  }
};
