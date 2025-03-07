
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SensorData, getWaterQualityStatus } from "@/services/sensorApi";

interface VirtualAquariumProps {
  sensorData: SensorData;
}

export const VirtualAquarium = ({ sensorData }: VirtualAquariumProps) => {
  const [bubbles, setBubbles] = useState<Array<{id: number; size: number; left: number; duration: number}>>([]);
  const waterQuality = getWaterQualityStatus(sensorData);
  
  // Create water background color based on quality
  const getWaterColor = () => {
    switch (waterQuality) {
      case 'good': return 'bg-blue-400/80';
      case 'moderate': return 'bg-yellow-400/80';
      case 'poor': return 'bg-red-400/80';
      default: return 'bg-blue-400/80';
    }
  };

  // Fish animation behavior based on water quality
  const getFishBehavior = () => {
    switch (waterQuality) {
      case 'good': return 'animate-swim-happy';
      case 'moderate': return 'animate-swim-slow';
      case 'poor': return 'animate-swim-distressed';
      default: return 'animate-swim-happy';
    }
  };
  
  // Create bubbles effect
  useEffect(() => {
    const createBubble = () => {
      const newBubble = {
        id: Date.now(),
        size: 5 + Math.random() * 15,
        left: 10 + Math.random() * 80, // Percentage from left
        duration: 3 + Math.random() * 4
      };
      
      setBubbles(prev => [...prev, newBubble]);
      
      // Remove bubble after animation completes
      setTimeout(() => {
        setBubbles(prev => prev.filter(bubble => bubble.id !== newBubble.id));
      }, newBubble.duration * 1000);
    };
    
    // Create bubbles based on water quality (more bubbles = better quality)
    const interval = setInterval(() => {
      if (waterQuality === 'good') {
        createBubble();
        if (Math.random() > 0.5) createBubble();
      } else if (waterQuality === 'moderate') {
        if (Math.random() > 0.3) createBubble();
      } else {
        if (Math.random() > 0.7) createBubble();
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [waterQuality]);
  
  // Plants and decorations vary based on water quality
  const renderDecorations = () => {
    if (waterQuality === 'good') {
      return (
        <>
          <div className="absolute bottom-0 left-[10%] w-12 h-24 bg-green-600 rounded-t-full" />
          <div className="absolute bottom-0 left-[30%] w-10 h-28 bg-green-700 rounded-t-full" />
          <div className="absolute bottom-0 right-[20%] w-14 h-20 bg-green-500 rounded-t-full" />
          <div className="absolute bottom-2 right-[40%] w-16 h-8 bg-amber-700 rounded" />
        </>
      );
    } else if (waterQuality === 'moderate') {
      return (
        <>
          <div className="absolute bottom-0 left-[10%] w-12 h-16 bg-green-600/70 rounded-t-full" />
          <div className="absolute bottom-0 right-[20%] w-10 h-14 bg-green-500/70 rounded-t-full" />
          <div className="absolute bottom-2 right-[40%] w-16 h-8 bg-amber-700/70 rounded" />
        </>
      );
    } else {
      return (
        <>
          <div className="absolute bottom-0 left-[15%] w-8 h-10 bg-green-600/40 rounded-t-full" />
          <div className="absolute bottom-2 right-[40%] w-16 h-6 bg-amber-700/40 rounded" />
        </>
      );
    }
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4">
        <CardTitle className="text-xl">Virtual Aquarium</CardTitle>
      </CardHeader>
      <CardContent className="p-0 relative">
        <div className="w-full h-64 relative overflow-hidden rounded-b-lg">
          {/* Water */}
          <div className={`absolute inset-0 ${getWaterColor()} transition-colors duration-1000`} />
          
          {/* Bubbles */}
          {bubbles.map(bubble => (
            <div
              key={bubble.id}
              className="absolute bottom-0 rounded-full bg-white/40"
              style={{
                width: `${bubble.size}px`,
                height: `${bubble.size}px`,
                left: `${bubble.left}%`,
                animation: `rise ${bubble.duration}s linear`
              }}
            />
          ))}
          
          {/* Fish */}
          <div 
            className={`absolute w-14 h-8 ${getFishBehavior()}`}
            style={{
              top: '40%',
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='50' height='30' viewBox='0 0 50 30' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M40 15C40 20 30 30 15 30C5 30 0 20 0 15C0 10 5 0 15 0C30 0 40 10 40 15Z' fill='%23F59E0B'/%3E%3Ccircle cx='10' cy='12' r='3' fill='black'/%3E%3Cpath d='M40 15H50L45 5V25L50 15' fill='%23F59E0B'/%3E%3C/svg%3E")`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat'
            }}
          />
          
          {/* Second fish (only appears in good water) */}
          {waterQuality === 'good' && (
            <div 
              className="absolute w-10 h-6 animate-swim-reverse"
              style={{
                top: '60%',
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='50' height='30' viewBox='0 0 50 30' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 15C10 20 20 30 35 30C45 30 50 20 50 15C50 10 45 0 35 0C20 0 10 10 10 15Z' fill='%233B82F6'/%3E%3Ccircle cx='40' cy='12' r='3' fill='black'/%3E%3Cpath d='M10 15H0L5 5V25L0 15' fill='%233B82F6'/%3E%3C/svg%3E")`,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat'
              }}
            />
          )}
          
          {/* Decorations */}
          {renderDecorations()}
          
          {/* Sand at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-amber-200/70" />
        </div>
      </CardContent>
    </Card>
  );
};
