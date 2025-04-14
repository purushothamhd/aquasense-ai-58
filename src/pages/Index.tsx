
import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { SensorReadings } from "@/components/SensorReadings";
import { AchievementBadges } from "@/components/AchievementBadges";
import { WaterAnalysis } from "@/components/WaterAnalysis";
import { SensorData, useSensorStore } from "@/services/sensorApi";
import { toast } from "@/hooks/use-toast";
import { Droplet, TestTube } from "lucide-react";
import { SensorHistory } from "@/components/SensorHistory";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { data, history, fetchData, updateData, status } = useSensorStore();
  const [testCount, setTestCount] = useState(() => {
    const saved = localStorage.getItem('waterTestCount');
    return saved ? parseInt(saved, 0) : 0;
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isReading, setIsReading] = useState(false);
  
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
  
  const handleAnalyze = () => {
    setIsAnalyzing(true);
    const newCount = testCount + 1;
    setTestCount(newCount);
    localStorage.setItem('waterTestCount', newCount.toString());
    
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 1500);
  };
  
  const handleTakeReading = () => {
    setIsReading(true);
    toast({
      title: "Taking Reading",
      description: "Collecting data from sensors...",
    });
    
    setTimeout(() => {
      fetchData()
        .then(() => {
          toast({
            title: "Reading Complete",
            description: "New sensor data has been collected.",
          });
        })
        .catch(error => {
          console.error("Failed to fetch sensor data:", error);
          toast({
            title: "Reading Error",
            description: "Could not collect sensor data. Using simulated values.",
            variant: "destructive",
          });
        })
        .finally(() => {
          setIsReading(false);
        });
    }, 2000);
  };
  
  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Droplet className="h-8 w-8 text-blue-500" />
          <h1 className="text-2xl font-bold">AquaSense AI</h1>
        </div>
        <Button 
          onClick={handleTakeReading} 
          disabled={isReading || status === 'loading'}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <TestTube className="mr-2" />
          {isReading ? "Taking Reading..." : "Take Reading"}
        </Button>
      </div>
      
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Sensor Readings</h2>
        <p className="text-muted-foreground">
          Real-time data from your water quality sensors
        </p>
      </div>
      
      <SensorReadings 
        data={status === 'success' ? data : null} 
        isLoading={status === 'loading' || isReading} 
      />
      
      {status === 'success' && history.length > 0 && (
        <SensorHistory readings={history} />
      )}
      
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
