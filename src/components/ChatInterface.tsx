
import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SensorData } from "@/services/sensorApi";
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Load initial analysis when component mounts
  useEffect(() => {
    loadInitialAnalysis();
  }, [sensorData]);
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const loadInitialAnalysis = () => {
    setIsLoading(true);
    
    // Short timeout to simulate loading
    setTimeout(() => {
      const initialMessage = generateWaterQualityAnalysis(sensorData);
      
      setMessages([
        {
          role: "assistant",
          content: initialMessage
        }
      ]);
      
      setIsLoading(false);
    }, 800);
  };
  
  const generateWaterQualityAnalysis = (data: SensorData): string => {
    // Determine water quality score based on parameters
    let qualityScore = 0;
    const pros = [];
    const cons = [];
    const recommendations = [];
    
    // pH analysis (should be between 6.5 and 8.5)
    if (data.pH >= 6.5 && data.pH <= 8.5) {
      qualityScore += 25;
      pros.push("pH level is in the optimal range (6.5-8.5)");
    } else if (data.pH < 6.5) {
      qualityScore += 10;
      cons.push("Water is too acidic (pH below 6.5)");
      recommendations.push("Consider adding a pH increaser or alkalinity booster");
    } else {
      qualityScore += 10;
      cons.push("Water is too alkaline (pH above 8.5)");
      recommendations.push("Consider adding a pH reducer");
    }
    
    // TDS analysis (should be below 500 ppm)
    if (data.tds < 300) {
      qualityScore += 25;
      pros.push("Total Dissolved Solids (TDS) are at excellent levels");
    } else if (data.tds < 500) {
      qualityScore += 15;
      pros.push("Total Dissolved Solids (TDS) are within acceptable range");
    } else {
      qualityScore += 5;
      cons.push("Total Dissolved Solids (TDS) are elevated");
      recommendations.push("Consider using a water filter or reverse osmosis system");
    }
    
    // Turbidity analysis (should be below 5 NTU)
    if (data.turbidity < 1) {
      qualityScore += 25;
      pros.push("Water clarity is excellent (very low turbidity)");
    } else if (data.turbidity < 5) {
      qualityScore += 20;
      pros.push("Water clarity is good");
    } else {
      qualityScore += 5;
      cons.push("Water appears cloudy due to high turbidity");
      recommendations.push("Use a sediment filter or let water settle before use");
    }
    
    // Temperature analysis (optimal: 20-25°C)
    if (data.temperature >= 20 && data.temperature <= 25) {
      qualityScore += 25;
      pros.push("Water temperature is in the optimal range");
    } else if (data.temperature >= 15 && data.temperature < 20 || data.temperature > 25 && data.temperature <= 30) {
      qualityScore += 15;
      cons.push(`Water temperature is ${data.temperature < 20 ? "slightly cool" : "slightly warm"}`);
    } else {
      qualityScore += 5;
      cons.push(`Water temperature is ${data.temperature < 15 ? "too cold" : "too warm"}`);
      recommendations.push(`${data.temperature < 15 ? "Increase" : "Decrease"} water temperature if possible`);
    }
    
    // Determine status
    const status = qualityScore >= 80 ? "Excellent" : (qualityScore >= 60 ? "Good" : (qualityScore >= 40 ? "Fair" : "Poor"));
    const isHealthy = qualityScore >= 70;
    
    // Add health implications
    const healthImplications = [];
    if (!isHealthy) {
      if (data.pH < 6.5) {
        healthImplications.push("Acidic water may cause digestive discomfort and could contain dissolved metals");
      } else if (data.pH > 8.5) {
        healthImplications.push("Highly alkaline water can cause skin irritation and a bitter taste");
      }
      
      if (data.tds > 500) {
        healthImplications.push("High TDS may indicate contamination and can cause gastrointestinal issues");
      }
      
      if (data.turbidity > 5) {
        healthImplications.push("High turbidity may indicate presence of harmful microorganisms");
      }
    }
    
    if (healthImplications.length === 0) {
      healthImplications.push(isHealthy ? 
        "This water appears safe for most uses based on the measured parameters" :
        "This water may have potential health concerns and should be treated before use"
      );
    }
    
    // Format the response
    return `
## AI Water Quality Analysis

### Water Status: ${status} (Quality Score: ${qualityScore}/100)

${pros.map(pro => `- ✅ ${pro}`).join('\n')}
${cons.map(con => `- ❌ ${con}`).join('\n')}

### Health Implications:
${healthImplications.map(health => `- ⚠️ ${health}`).join('\n')}

### Recommendations:
${recommendations.length > 0 ? 
  recommendations.map(rec => `- 📋 ${rec}`).join('\n') : 
  '- 📋 Continue regular water quality monitoring'}

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
    
    // Short timeout to simulate thinking
    setTimeout(() => {
      // Generate response based on user's question and sensor data
      const response = generateResponse(userMessage, sensorData);
      
      // Add AI response to chat
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
      setIsLoading(false);
    }, 800);
  };
  
  const generateResponse = (question: string, data: SensorData): string => {
    // Convert question to lowercase for easier matching
    const q = question.toLowerCase();
    
    // Basic responses based on water quality data and common questions
    if (q.includes("ph") || q.includes("acidity") || q.includes("alkaline")) {
      const phStatus = data.pH >= 6.5 && data.pH <= 8.5 ? "optimal" : (data.pH < 6.5 ? "acidic" : "alkaline");
      return `The pH of your water is ${data.pH.toFixed(2)}, which is ${phStatus}. ${
        phStatus === "optimal" ? 
        "This is within the recommended range of 6.5-8.5 for drinking water." : 
        phStatus === "acidic" ? 
        "This is more acidic than the recommended range of 6.5-8.5. Acidic water can corrode pipes and may contain dissolved metals." : 
        "This is more alkaline than the recommended range of 6.5-8.5. Highly alkaline water can taste bitter and may cause dry skin."
      }`;
    }
    
    if (q.includes("tds") || q.includes("dissolved") || q.includes("solids") || q.includes("minerals")) {
      return `Your water has ${data.tds.toFixed(0)} ppm of Total Dissolved Solids (TDS). ${
        data.tds < 300 ? 
        "This is excellent! Low TDS indicates minimal dissolved substances in the water." : 
        data.tds < 500 ? 
        "This is within the acceptable range. TDS includes minerals, salts, and metals dissolved in water." : 
        "This is higher than recommended levels. High TDS can affect taste and may indicate contamination."
      }`;
    }
    
    if (q.includes("turbid") || q.includes("cloudy") || q.includes("clear")) {
      return `The turbidity of your water is ${data.turbidity.toFixed(1)} NTU. ${
        data.turbidity < 1 ? 
        "This indicates very clear water with excellent clarity." : 
        data.turbidity < 5 ? 
        "This indicates good clarity. Some particles are present but not enough to make water appear visibly cloudy." : 
        "This indicates cloudiness in the water. Higher turbidity can interfere with disinfection and may indicate presence of pathogens."
      }`;
    }
    
    if (q.includes("temp") || q.includes("temperature") || q.includes("hot") || q.includes("cold") || q.includes("warm")) {
      return `Your water temperature is ${data.temperature.toFixed(1)}°C. ${
        data.temperature >= 20 && data.temperature <= 25 ? 
        "This is in the optimal range for drinking water." : 
        data.temperature < 20 ? 
        "This is cooler than the optimal range (20-25°C)." : 
        "This is warmer than the optimal range (20-25°C). Warmer water can promote microbial growth."
      }`;
    }
    
    if (q.includes("safe") || q.includes("drink") || q.includes("consumption") || q.includes("health")) {
      // Calculate basic safety score
      const phSafe = data.pH >= 6.5 && data.pH <= 8.5;
      const tdsSafe = data.tds < 500;
      const turbiditySafe = data.turbidity < 5;
      
      const safetyScore = (phSafe ? 1 : 0) + (tdsSafe ? 1 : 0) + (turbiditySafe ? 1 : 0);
      
      if (safetyScore >= 3) {
        return "Based on the parameters I can measure, this water appears to be safe for consumption. All key parameters (pH, TDS, turbidity) are within acceptable ranges.";
      } else if (safetyScore >= 2) {
        return "This water may be safe for consumption, but there are some parameters outside recommended ranges. Consider additional treatment or testing.";
      } else {
        return "This water doesn't meet all safety recommendations for drinking. I would recommend further treatment or testing before consumption.";
      }
    }
    
    if (q.includes("improve") || q.includes("better") || q.includes("fix") || q.includes("recommendations")) {
      const recommendations = [];
      
      if (data.pH < 6.5) {
        recommendations.push("Use alkalinity increasers to raise the pH.");
      } else if (data.pH > 8.5) {
        recommendations.push("Use pH decreasers to lower the pH level.");
      }
      
      if (data.tds > 500) {
        recommendations.push("Consider a reverse osmosis system or water softener to reduce dissolved solids.");
      }
      
      if (data.turbidity > 5) {
        recommendations.push("Install a sediment filter to improve clarity.");
      }
      
      if (data.temperature < 20 || data.temperature > 25) {
        recommendations.push(`Adjust water temperature to the 20-25°C range if possible.`);
      }
      
      if (recommendations.length === 0) {
        return "Your water quality is already good! Just continue regular monitoring to maintain quality.";
      }
      
      return "Here are my recommendations to improve your water quality:\n\n" + recommendations.map(rec => `- ${rec}`).join("\n");
    }
    
    // Default response for questions we don't have specific patterns for
    return `Thank you for your question about "${question}". Based on your water quality readings (pH: ${data.pH.toFixed(2)}, TDS: ${data.tds.toFixed(0)} ppm, Turbidity: ${data.turbidity.toFixed(1)} NTU, Temp: ${data.temperature.toFixed(1)}°C), your water is generally ${
      data.pH >= 6.5 && data.pH <= 8.5 && data.tds < 500 && data.turbidity < 5 ?
      "good quality" : "in need of some improvement"
    }. You can ask specific questions about pH levels, turbidity, TDS, or temperature for more detailed information.`;
  };
  
  const resetChat = () => {
    setMessages([]);
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
            <>
              {messages.map((message, index) => (
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
              ))}
            </>
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
