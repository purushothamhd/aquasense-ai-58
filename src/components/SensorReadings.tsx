import { SensorData } from "@/services/sensorApi";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Thermometer, Droplet, Waves, Beaker } from "lucide-react";

interface SensorReadingsProps {
  data: SensorData | null;
  isLoading: boolean;
}

export const SensorReadings = ({ data, isLoading }: SensorReadingsProps) => {
  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array(4).fill(0).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="p-4">
              <Skeleton className="h-5 w-1/2" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Skeleton className="h-12 w-full mb-4" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getProgressColor = (value: number, type: keyof SensorData): string => {
    switch (type) {
      case 'pH':
        if (value >= 6.5 && value <= 8.5) return "bg-green-500";
        if ((value >= 6.0 && value < 6.5) || (value > 8.5 && value <= 9.0)) return "bg-yellow-500";
        return "bg-red-500";
      case 'tds':
        if (value < 300) return "bg-green-500";
        if (value < 600) return "bg-yellow-500";
        return "bg-red-500";
      case 'turbidity':
        if (value < 5) return "bg-green-500";
        if (value < 10) return "bg-yellow-500";
        return "bg-red-500";
      case 'temperature':
        if (value >= 20 && value <= 25) return "bg-green-500";
        if ((value >= 15 && value < 20) || (value > 25 && value <= 30)) return "bg-yellow-500";
        return "bg-red-500";
      default:
        return "bg-blue-500";
    }
  };

  const formatValue = (value: number, type: keyof SensorData): string => {
    switch (type) {
      case 'pH':
        return value.toFixed(1);
      case 'tds':
        return `${Math.round(value)} ppm`;
      case 'turbidity':
        return `${value.toFixed(1)} NTU`;
      case 'temperature':
        return `${value.toFixed(1)}°C`;
      default:
        return value.toString();
    }
  };

  const getProgressValue = (value: number, type: keyof SensorData): number => {
    switch (type) {
      case 'pH':
        return Math.min(Math.max((value / 14) * 100, 0), 100);
      case 'tds':
        return Math.min(Math.max((value / 1000) * 100, 0), 100);
      case 'turbidity':
        return Math.min(Math.max((value / 20) * 100, 0), 100);
      case 'temperature':
        return Math.min(Math.max((value / 40) * 100, 0), 100);
      default:
        return 0;
    }
  };

  const sensorConfig = [
    { key: 'pH' as keyof SensorData, label: 'pH Level', icon: <Beaker className="h-5 w-5" /> },
    { key: 'tds' as keyof SensorData, label: 'Total Dissolved Solids', icon: <Droplet className="h-5 w-5" /> },
    { key: 'turbidity' as keyof SensorData, label: 'Turbidity', icon: <Waves className="h-5 w-5" /> },
    { key: 'temperature' as keyof SensorData, label: 'Temperature', icon: <Thermometer className="h-5 w-5" /> },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {sensorConfig.map(({ key, label, icon }) => (
        <Card key={key} className="overflow-hidden">
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {icon} {label}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold mb-2">{formatValue(data[key], key)}</div>
            <Progress 
              value={getProgressValue(data[key], key)} 
              className="h-2"
              indicatorClassName={getProgressColor(data[key], key)}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
