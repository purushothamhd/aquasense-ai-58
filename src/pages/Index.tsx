
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SensorReadings } from "@/components/SensorReadings";
import { VirtualAquarium } from "@/components/VirtualAquarium";
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
            <h2 className="text-xl font-semibold">Virtual Aquarium</h2>
            <p className="text-muted-foreground">
              See how your water quality affects aquatic life
            </p>
          </div>
          
          {status === 'success' && <VirtualAquarium sensorData={data} />}
          
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
          
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-xl">Raspberry Pi Integration</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-sm text-muted-foreground mb-4">
                This app is connected to your Raspberry Pi through a WebSocket connection.
                Sensor data is automatically updated every 5 seconds.
              </p>
              <div className="text-xs bg-muted p-3 rounded-md">
                <p className="font-semibold mb-1">Python Code for Raspberry Pi:</p>
                <pre className="overflow-x-auto">
                  {`
import time
import requests
import json
from gpiozero import MCP3008

# Configure ADC channels for sensors
pH_channel = MCP3008(0)
tds_channel = MCP3008(1)
turbidity_channel = MCP3008(2)

# Function to read temperature from DS18B20
def read_temp():
    # In a real implementation, read from /sys/bus/w1/devices/...
    return 25.0 + (time.time() % 5)  # Mock temperature reading

# Main loop to read sensors and send data
while True:
    try:
        # Read sensors (convert raw values to actual measurements)
        pH = 7.0 + (pH_channel.value - 0.5) * 2
        tds = tds_channel.value * 1000
        turbidity = turbidity_channel.value * 20
        temp = read_temp()
        
        # Create data payload
        payload = {
            "pH": pH,
            "tds": tds,
            "turbidity": turbidity,
            "temperature": temp,
            "timestamp": time.time() * 1000
        }
        
        # Send data to app API endpoint
        response = requests.post(
            "https://your-app-url.com/api/sensor-data",
            json=payload
        )
        
        print(f"Data sent: {json.dumps(payload)}")
        
        # Wait before next reading
        time.sleep(5)
        
    except Exception as e:
        print(f"Error: {e}")
        time.sleep(10)  # Wait longer on error
                  `}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
