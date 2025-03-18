
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { analyzeSensorDataWithGemini } from "@/services/geminiApi";
import { SensorData } from "@/services/sensorApi";
import { toast } from "@/hooks/use-toast";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatInterfaceProps {
  sensorData: SensorData | null;
}

export const ChatInterface = ({ sensorData }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: 'Hello! I can help you with water quality questions. What would you like to know?' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    // Add user message to chat
    const userMessage = { role: 'user' as const, content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      let response = '';
      
      if (!sensorData) {
        response = "I don't have any sensor data to analyze at the moment. Please take a reading first.";
      } else {
        // Send message to Gemini API
        const prompt = `
          Water sensor data:
          - pH: ${sensorData.pH}
          - Total Dissolved Solids (TDS): ${sensorData.tds} ppm
          - Turbidity: ${sensorData.turbidity} NTU
          - Temperature: ${sensorData.temperature}°C
          
          User question: ${input.trim()}
          
          Provide a helpful and informative response about water quality. Make it conversational and easy to understand.
        `;
        
        try {
          const geminiResponse = await analyzeSensorDataWithGemini(sensorData, prompt);
          response = geminiResponse.answer || "I'm having trouble analyzing the water data right now.";
        } catch (error) {
          console.error("Error getting Gemini response:", error);
          response = "I couldn't connect to my knowledge base. Here's what I know from your sensor readings: " +
            `Your pH is ${sensorData.pH} (${sensorData.pH >= 6.5 && sensorData.pH <= 8.5 ? 'normal' : 'abnormal'}), ` +
            `TDS is ${sensorData.tds} ppm (${sensorData.tds < 300 ? 'good' : 'elevated'}), ` +
            `Turbidity is ${sensorData.turbidity} NTU (${sensorData.turbidity < 5 ? 'clear' : 'cloudy'}), ` +
            `and Temperature is ${sensorData.temperature}°C.`;
        }
      }
      
      // Add assistant response to chat
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Chat Error",
        description: "There was a problem processing your message.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">Water Quality Assistant</h3>
        <p className="text-muted-foreground mb-4">Ask questions about your water quality</p>
      </div>
      
      <div className="h-[300px] overflow-y-auto p-4 border-y bg-slate-50 dark:bg-slate-900">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`mb-4 ${message.role === 'user' ? 'text-right' : ''}`}
          >
            <div 
              className={`inline-block p-3 rounded-lg max-w-[80%] ${
                message.role === 'user' 
                  ? 'bg-blue-500 text-white rounded-tr-none' 
                  : 'bg-gray-200 dark:bg-slate-800 text-foreground rounded-tl-none'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="mb-4">
            <div className="inline-block p-3 rounded-lg max-w-[80%] bg-gray-200 dark:bg-slate-800 text-foreground rounded-tl-none">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your water quality..."
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          disabled={isLoading}
          className="flex-1"
        />
        <Button 
          onClick={handleSendMessage} 
          disabled={isLoading || !input.trim()}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};
