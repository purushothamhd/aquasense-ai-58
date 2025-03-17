
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SensorData } from "@/services/sensorApi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Beaker, ThumbsUp, ThumbsDown, Lightbulb, Heart, AlertTriangle, Info, History } from "lucide-react";
import { analyzeSensorDataWithGemini, GeminiAnalysisResponse } from "@/services/geminiApi";
import { toast } from "@/hooks/use-toast";

interface WaterAnalysisProps {
  sensorData: SensorData;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

export const WaterAnalysis = ({ sensorData, onAnalyze, isAnalyzing }: WaterAnalysisProps) => {
  const [analysis, setAnalysis] = useState<GeminiAnalysisResponse | null>(null);
  
  const handleAnalyze = async () => {
    onAnalyze();
    setAnalysis(null);
    
    try {
      // Call the Gemini API for analysis
      const geminiAnalysis = await analyzeSensorDataWithGemini(sensorData);
      setAnalysis(geminiAnalysis);
    } catch (error) {
      console.error("Failed to analyze water:", error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze water quality. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    if (score >= 40) return "bg-orange-500";
    return "bg-red-500";
  };
  
  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Poor";
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
              Press the button below to analyze your water quality using Gemini AI and receive recommendations.
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
              <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Quality Score</span>
                  <div className="flex items-center">
                    <span className={`text-sm font-bold px-2 py-1 rounded-full ${
                      analysis.qualityScore >= 80 ? 'bg-green-100 text-green-800' : 
                      analysis.qualityScore >= 60 ? 'bg-yellow-100 text-yellow-800' : 
                      analysis.qualityScore >= 40 ? 'bg-orange-100 text-orange-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {analysis.qualityScore}/100 - {getScoreLabel(analysis.qualityScore)}
                    </span>
                  </div>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${getScoreColor(analysis.qualityScore)}`}
                    style={{ width: `${analysis.qualityScore}%` }}
                  />
                </div>
                
                <div className="mt-4 flex items-center gap-2 text-sm font-medium">
                  <Heart className={`h-4 w-4 ${analysis.isHealthy ? 'text-green-500' : 'text-red-500'}`} />
                  <span className={analysis.isHealthy ? 'text-green-600' : 'text-red-600'}>
                    {analysis.isHealthy ? 'Healthy for consumption' : 'Not recommended for consumption'}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 mb-4">
                <h3 className="text-sm font-semibold flex items-center mb-2">
                  <Info className="h-4 w-4 mr-2" /> Summary Assessment
                </h3>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  This water sample has a {analysis.status} quality rating with a score of {analysis.qualityScore}/100.
                  {analysis.isHealthy 
                    ? " It is considered safe for consumption based on the analyzed parameters."
                    : " It is not recommended for consumption without further treatment."}
                </p>

                {analysis.healthImplications.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Key health implications:</h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {analysis.healthImplications[0]}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <Tabs defaultValue="pros" className="mt-2">
              <TabsList className="w-full grid grid-cols-4">
                <TabsTrigger value="pros" className="flex items-center justify-center">
                  <ThumbsUp className="h-4 w-4 mr-1" /> Pros
                </TabsTrigger>
                <TabsTrigger value="cons" className="flex items-center justify-center">
                  <ThumbsDown className="h-4 w-4 mr-1" /> Cons
                </TabsTrigger>
                <TabsTrigger value="recommendations" className="flex items-center justify-center">
                  <Lightbulb className="h-4 w-4 mr-1" /> Tips
                </TabsTrigger>
                <TabsTrigger value="health" className="flex items-center justify-center">
                  <Heart className="h-4 w-4 mr-1" /> Health
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="pros" className="mt-4 max-h-60 overflow-auto pr-1">
                <ul className="space-y-2">
                  {analysis.pros.length > 0 ? (
                    analysis.pros.map((pro, index) => (
                      <li key={index} className="flex items-start bg-green-50 dark:bg-green-950/30 p-2 rounded">
                        <span className="text-green-500 mr-2 mt-0.5">✓</span>
                        <span className="text-green-700 dark:text-green-300">{pro}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-muted-foreground flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500" />
                      No positive aspects found in this sample.
                    </li>
                  )}
                </ul>
              </TabsContent>
              
              <TabsContent value="cons" className="mt-4 max-h-60 overflow-auto pr-1">
                <ul className="space-y-2">
                  {analysis.cons.length > 0 ? (
                    analysis.cons.map((con, index) => (
                      <li key={index} className="flex items-start bg-red-50 dark:bg-red-950/30 p-2 rounded">
                        <span className="text-red-500 mr-2 mt-0.5">✗</span>
                        <span className="text-red-700 dark:text-red-300">{con}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-muted-foreground flex items-center">
                      <ThumbsUp className="h-4 w-4 mr-2 text-green-500" />
                      No issues found in this sample!
                    </li>
                  )}
                </ul>
              </TabsContent>
              
              <TabsContent value="recommendations" className="mt-4 max-h-60 overflow-auto pr-1">
                <ul className="space-y-2">
                  {analysis.recommendations.length > 0 ? (
                    analysis.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start bg-blue-50 dark:bg-blue-950/30 p-2 rounded">
                        <span className="text-blue-500 mr-2 mt-0.5">→</span>
                        <span className="text-blue-700 dark:text-blue-300">{recommendation}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-muted-foreground flex items-center">
                      <ThumbsUp className="h-4 w-4 mr-2 text-green-500" />
                      No recommendations needed for this sample!
                    </li>
                  )}
                </ul>
              </TabsContent>
              
              <TabsContent value="health" className="mt-4 max-h-60 overflow-auto pr-1">
                <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg mb-3">
                  <div className="flex items-center">
                    <div className={`h-3 w-3 rounded-full mr-2 ${analysis.isHealthy ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="font-medium">
                      Health Status: {analysis.isHealthy ? 'Safe for Consumption' : 'Not Recommended'}
                    </span>
                  </div>
                </div>
                <ul className="space-y-2">
                  {analysis.healthImplications.length > 0 ? (
                    analysis.healthImplications.map((implication, index) => (
                      <li key={index} className={`flex items-start p-2 rounded ${
                        analysis.isHealthy 
                          ? 'bg-green-50 dark:bg-green-950/30' 
                          : 'bg-red-50 dark:bg-red-950/30'
                      }`}>
                        <span className={`${analysis.isHealthy ? 'text-green-500' : 'text-red-500'} mr-2 mt-0.5`}>•</span>
                        <span className={`${
                          analysis.isHealthy 
                            ? 'text-green-700 dark:text-green-300' 
                            : 'text-red-700 dark:text-red-300'
                        }`}>
                          {implication}
                        </span>
                      </li>
                    ))
                  ) : (
                    <li className="text-muted-foreground flex items-center">
                      <Info className="h-4 w-4 mr-2" />
                      No specific health implications noted.
                    </li>
                  )}
                </ul>
              </TabsContent>
            </Tabs>
            
            <div className="flex gap-3 mt-4">
              <Button 
                variant="outline" 
                onClick={handleAnalyze} 
                disabled={isAnalyzing} 
                className="flex-1"
              >
                {isAnalyzing ? "Analyzing..." : "Re-analyze Water"}
              </Button>
              
              <Button 
                variant="secondary"
                className="flex items-center"
                onClick={() => setAnalysis(null)}
              >
                <History className="h-4 w-4 mr-1" /> New Test
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
