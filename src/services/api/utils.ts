
// Helper function to extract JSON from a string that might have markdown or extra text
export const extractJsonFromString = (text: string): any => {
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
