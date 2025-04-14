
// Gemini API service
import { SensorData } from "./sensorApi";

interface GeminiResponse {
  content: string;
  error?: string;
}

export async function generateGeminiResponse(userMessage: string, sensorData: SensorData): Promise<GeminiResponse> {
  try {
    const API_KEY = "AIzaSyBuhyXFLBsX98UQwzpTM7jPPplAQ0Mw4to";
    const API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent";
    
    // Create context with sensor data
    const contextMessage = `
    You are AquaSense AI, a helpful assistant specialized in analyzing water quality data.
    
    Current water quality readings:
    - pH: ${sensorData.pH.toFixed(2)}
    - TDS (Total Dissolved Solids): ${sensorData.tds.toFixed(0)} ppm
    - Turbidity: ${sensorData.turbidity.toFixed(1)} NTU
    - Temperature: ${sensorData.temperature.toFixed(1)}°C
    
    Based on this data, please respond to the user's question. Be helpful, accurate, and concise.
    If the user asks about general water quality, explain the meaning of the readings.
    Always format your responses with proper markdown when appropriate.
    `;
    
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: contextMessage },
              { text: `User question: ${userMessage}` }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 800,
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API error:", errorData);
      return { 
        content: "I'm having trouble connecting to my analysis system right now. Please try again in a moment.",
        error: errorData.error?.message || "API request failed" 
      };
    }

    const data = await response.json();
    
    // Extract the text response from Gemini's response format
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || 
      "I couldn't generate a proper response. Please try rephrasing your question.";
    
    return { content };
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return { 
      content: "I'm having trouble analyzing your request. Please try again later.",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
