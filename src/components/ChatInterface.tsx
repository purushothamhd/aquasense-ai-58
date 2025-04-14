
import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SensorData } from "@/services/sensorApi";
import { analyzeSensorDataWithGemini, GeminiAnalysisResponse } from "@/services/geminiApi";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatInterfaceProps {
  sensorData: SensorData;
}

export const ChatInterface = ({ sensorData }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [initialAnalysisLoaded, setInitialAnalysisLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Load initial analysis when component mounts
  useEffect(() => {
    if (!initialAnalysisLoaded && sensorData) {
      loadInitialAnalysis();
    }
  }, [sensorData, initialAnalysisLoaded]);
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const loadInitialAnalysis = async () => {
    setIsLoading(true);
    try {
      const analysis = await analyzeSensorDataWithGemini(sensorData);
      
      // Format the analysis into a readable message
      const initialMessage = formatAnalysisToMessage(analysis);
      
      setMessages([
        {
          role: "assistant",
          content: initialMessage
        }
      ]);
      setInitialAnalysisLoaded(true);
    } catch (error) {
      console.error("Failed to load initial analysis:", error);
      toast({
        title: "Analysis Error",
        description: "Could not generate water quality analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatAnalysisToMessage = (analysis: GeminiAnalysisResponse): string => {
    const qualityStatus = analysis.status.charAt(0).toUpperCase() + analysis.status.slice(1);
    
    return `
## AI Water Quality Analysis

### Water Status: ${qualityStatus} (Quality Score: ${analysis.qualityScore}/100)

${analysis.pros.map(pro => `- ✅ ${pro}`).join('\\n')}
${analysis.cons.map(con => `- ❌ ${con}`).join('\\n')}

### Health Implications:
${analysis.healthImplications.map(health => `- ⚠️ ${health}`).join('\\n')}

### Recommendations:
${analysis.recommendations.map(rec => `- 📋 ${rec}`).join('\\n')}

You can ask me follow-up questions about your water quality.
    `;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    setInput("");
    
    // Add user message to chat
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    
    // Show loading state
    setIsLoading(true);
    
    try {
      // Create a custom prompt that includes the current sensor data and the user's question
      const customPrompt = `
You are AquaSense AI, an intelligent water quality analysis assistant.

Current water quality parameters:
- pH: ${sensorData.pH}
- Total Dissolved Solids (TDS): ${sensorData.tds} ppm
- Turbidity: ${sensorData.turbidity} NTU
- Temperature: ${sensorData.temperature}°C

User question: ${userMessage}

Provide a helpful, accurate, and concise response about the water quality based on these parameters.
Include specific insights related to the user's question, potential health implications, and actionable recommendations.
      `;
      
      const response = await analyzeSensorDataWithGemini(sensorData, customPrompt);
      
      // Add AI response to chat
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: response.answer || "I'm sorry, I couldn't analyze your request. Please try again." 
      }]);
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Chat Error",
        description: "Could not process your message. Please try again.",
        variant: "destructive",
      });
      
      // Add error message to chat
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "I'm sorry, I encountered an error while processing your question. Please try again." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetChat = () => {
    setMessages([]);
    setInitialAnalysisLoaded(false);
    loadInitialAnalysis();
  };
  
  // Function to render message with Markdown formatting
  const renderMessageContent = (content: string) => {
    // Simple markdown parsing for basic formatting
    const formattedContent = content
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mt-2 mb-1">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-3 mb-2">$1</h2>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/\n/gim, '<br />');
    
    return <div dangerouslySetInnerHTML={{ __html: formattedContent }} />;
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center">
          <Bot className="mr-2 h-5 w-5 text-blue-500" />
          AquaSense AI Chat
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-auto" 
            onClick={resetChat}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4" />
            <span className="sr-only">Reset chat</span>
          </Button>
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4">
        <div className="h-[400px] overflow-y-auto mb-4 pr-2">
          {isLoading && messages.length === 0 ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[300px]" />
              <Skeleton className="h-4 w-[280px]" />
            </div>
          ) : (
            messages.map((message, index) => (
              <div 
                key={index} 
                className={`mb-4 ${
                  message.role === "assistant" 
                    ? "bg-muted/50 rounded-lg p-3"
                    : ""
                }`}
              >
                <div className="flex items-start">
                  <div className={`mt-0.5 mr-2 rounded-full p-1 ${
                    message.role === "assistant" 
                      ? "bg-blue-100 text-blue-500" 
                      : "bg-green-100 text-green-500"
                  }`}>
                    {message.role === "assistant" ? (
                      <Bot className="h-4 w-4" />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 prose prose-sm max-w-none">
                    {renderMessageContent(message.content)}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            placeholder="Ask me about your water quality..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
