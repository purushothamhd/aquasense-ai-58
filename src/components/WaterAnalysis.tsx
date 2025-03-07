
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SensorData } from "@/services/sensorApi";
import { analyzeWaterQuality, WaterAnalysis as WaterAnalysisType } from "@/utils/waterQualityUtils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Beaker, ThumbsUp, ThumbsDown, Lightbulb } from "lucide-react";

interface WaterAnalysisProps {
  sensorData: SensorData;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

export const WaterAnalysis = ({ sensorData, onAnalyze, isAnalyzing }: WaterAnalysisProps) => {
  const [analysis, setAnalysis] = useState<WaterAnalysisType | null>(null);
  
  const handleAnalyze = () => {
    onAnalyze();
    // Simulate AI processing time
    setTimeout(() => {
      setAnalysis(analyzeWaterQuality(sensorData));
    }, 1500);
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4">
        <CardTitle className="text-xl flex items-center gap-2">
          <Beaker className="h-5 w-5" /> Water Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {!analysis ? (
          <div className="flex flex-col items-center">
            <p className="text-center text-muted-foreground mb-4">
              Press the button below to analyze your water quality and receive recommendations.
            </p>
            <Button 
              onClick={handleAnalyze} 
              disabled={isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? "Analyzing..." : "Analyze Water"}
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Quality Score</span>
                <span className="text-sm font-bold">{analysis.qualityScore}/100</span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    analysis.status === 'good' 
                      ? 'bg-green-500' 
                      : analysis.status === 'moderate' 
                        ? 'bg-yellow-500' 
                        : 'bg-red-500'
                  }`}
                  style={{ width: `${analysis.qualityScore}%` }}
                />
              </div>
              <div className="mt-1 text-sm font-medium capitalize text-center">
                {analysis.status} Water Quality
              </div>
            </div>
            
            <Tabs defaultValue="pros">
              <TabsList className="w-full">
                <TabsTrigger value="pros" className="flex-1">
                  <ThumbsUp className="h-4 w-4 mr-1" /> Pros
                </TabsTrigger>
                <TabsTrigger value="cons" className="flex-1">
                  <ThumbsDown className="h-4 w-4 mr-1" /> Cons
                </TabsTrigger>
                <TabsTrigger value="recommendations" className="flex-1">
                  <Lightbulb className="h-4 w-4 mr-1" /> Tips
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="pros" className="mt-4">
                <ul className="space-y-2">
                  {analysis.pros.length > 0 ? (
                    analysis.pros.map((pro, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>{pro}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-muted-foreground">No positive aspects found.</li>
                  )}
                </ul>
              </TabsContent>
              
              <TabsContent value="cons" className="mt-4">
                <ul className="space-y-2">
                  {analysis.cons.length > 0 ? (
                    analysis.cons.map((con, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-red-500 mr-2">✗</span>
                        <span>{con}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-muted-foreground">No issues found!</li>
                  )}
                </ul>
              </TabsContent>
              
              <TabsContent value="recommendations" className="mt-4">
                <ul className="space-y-2">
                  {analysis.recommendations.length > 0 ? (
                    analysis.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-500 mr-2">→</span>
                        <span>{recommendation}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-muted-foreground">No recommendations needed!</li>
                  )}
                </ul>
              </TabsContent>
            </Tabs>
            
            <Button 
              variant="outline" 
              onClick={handleAnalyze} 
              disabled={isAnalyzing} 
              className="w-full mt-4"
            >
              {isAnalyzing ? "Analyzing..." : "Re-analyze Water"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};
