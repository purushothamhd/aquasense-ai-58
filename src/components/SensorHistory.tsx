
import { useState } from "react";
import { SensorData } from "@/services/sensorApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, ChevronDown, ChevronUp, CalendarClock } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

interface SensorHistoryProps {
  readings: SensorData[];
}

export const SensorHistory = ({ readings }: SensorHistoryProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (readings.length === 0) {
    return null;
  }

  const formatTimestamp = (timestamp: number) => {
    return format(new Date(timestamp), "MMM d, yyyy 'at' h:mm a");
  };

  const getValueClass = (value: number, type: 'pH' | 'tds' | 'turbidity' | 'temperature') => {
    switch (type) {
      case 'pH':
        return (value >= 6.5 && value <= 8.5) 
          ? 'text-green-600 dark:text-green-400' 
          : 'text-red-600 dark:text-red-400';
      case 'tds':
        return value < 500 
          ? 'text-green-600 dark:text-green-400' 
          : 'text-red-600 dark:text-red-400';
      case 'turbidity':
        return value < 5 
          ? 'text-green-600 dark:text-green-400' 
          : 'text-red-600 dark:text-red-400';
      case 'temperature':
        return (value >= 20 && value <= 30) 
          ? 'text-green-600 dark:text-green-400' 
          : 'text-red-600 dark:text-red-400';
      default:
        return '';
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader className="p-4 flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <History className="h-5 w-5" /> Sensor Reading History
        </CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? "Collapse history" : "Expand history"}
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CardHeader>

      {isExpanded && (
        <CardContent className="p-4 pt-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>pH</TableHead>
                  <TableHead>TDS (ppm)</TableHead>
                  <TableHead>Turbidity (NTU)</TableHead>
                  <TableHead>Temp (°C)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {readings.map((reading, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium flex items-center">
                      <CalendarClock className="h-3 w-3 mr-1 text-muted-foreground" />
                      <span className="text-xs">{formatTimestamp(reading.timestamp)}</span>
                    </TableCell>
                    <TableCell className={getValueClass(reading.pH, 'pH')}>
                      {reading.pH.toFixed(2)}
                    </TableCell>
                    <TableCell className={getValueClass(reading.tds, 'tds')}>
                      {reading.tds.toFixed(0)}
                    </TableCell>
                    <TableCell className={getValueClass(reading.turbidity, 'turbidity')}>
                      {reading.turbidity.toFixed(1)}
                    </TableCell>
                    <TableCell className={getValueClass(reading.temperature, 'temperature')}>
                      {reading.temperature.toFixed(1)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
