
import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { SensorReadings } from "@/components/SensorReadings";
import { AchievementBadges } from "@/components/AchievementBadges";
import { WaterAnalysis } from "@/components/WaterAnalysis";
import { SensorData, useSensorStore, setupWebSocketConnection } from "@/services/sensorApi";
import { toast } from "@/hooks/use-toast";
import { Droplet } from "lucide-react";

const Index = () => {
  const { data, fetchData, updateData, status } = useSensorStore();
  const [testCount, setTestCount] = useState(() => {
    const saved = localStorage.getItem('waterTestCount');
    return saved ? parseInt(saved, 0) : 0;
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Initial fetch of sensor data
  useEffect(() => {
    fetchData().catch(error => {
      console.error("Failed to fetch initial sensor data:", error);
      toast({
        title: "Connection Error",
        description: "Could not connect to sensor hub. Using demo data.",
        variant: "destructive",
      });
    });
  }, [fetchData]);
  
  // WebSocket connection to continuously receive sensor data
  useEffect(() => {
    const cleanupWebSocket = setupWebSocketConnection((newData: SensorData) => {
      updateData(newData);
    });
    
    return () => {
      cleanupWebSocket();
    };
  }, [updateData]);
  
  // Handle analyze button click
  const handleAnalyze = () => {
    setIsAnalyzing(true);
    // Update test count
    const newCount = testCount + 1;
    setTestCount(newCount);
    localStorage.setItem('waterTestCount', newCount.toString());
    
    // Simulating analysis completion
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 1500);
  };
  
  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-6xl">
      <div className="flex items-center space-x-2">
        <Droplet className="h-8 w-8 text-blue-500" />
        <h1 className="text-2xl font-bold">AquaGuardian</h1>
      </div>
      
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Sensor Readings</h2>
        <p className="text-muted-foreground">
          Real-time data from your water quality sensors
        </p>
      </div>
      
      <SensorReadings 
        data={status === 'success' ? data : null} 
        isLoading={status === 'loading'} 
      />
      
      <Separator className="my-6" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Your Achievements</h2>
            <p className="text-muted-foreground">
              Badges earned through regular water testing
            </p>
          </div>
          
          <AchievementBadges testCount={testCount} />
        </div>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Water Analysis</h2>
            <p className="text-muted-foreground">
              Get insights and recommendations for your water quality
            </p>
          </div>
          
          {status === 'success' && (
            <WaterAnalysis 
              sensorData={data} 
              onAnalyze={handleAnalyze}
              isAnalyzing={isAnalyzing}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
