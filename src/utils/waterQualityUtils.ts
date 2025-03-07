
import { SensorData } from "@/services/sensorApi";

export interface WaterAnalysis {
  qualityScore: number;
  status: 'good' | 'moderate' | 'poor';
  pros: string[];
  cons: string[];
  recommendations: string[];
}

export const analyzeWaterQuality = (data: SensorData): WaterAnalysis => {
  const pros: string[] = [];
  const cons: string[] = [];
  const recommendations: string[] = [];
  let qualityScore = 0;
  
  // pH analysis
  if (data.pH >= 6.5 && data.pH <= 8.5) {
    pros.push("pH level is in the optimal range");
    qualityScore += 25;
  } else if (data.pH < 6.5) {
    cons.push("Water is too acidic");
    recommendations.push("Consider adding pH increaser");
    qualityScore += 10;
  } else {
    cons.push("Water is too alkaline");
    recommendations.push("Consider adding pH reducer");
    qualityScore += 10;
  }
  
  // TDS analysis
  if (data.tds < 300) {
    pros.push("TDS levels are within safe range");
    qualityScore += 25;
  } else if (data.tds < 600) {
    cons.push("TDS levels are slightly elevated");
    recommendations.push("Consider partial water change");
    qualityScore += 15;
  } else {
    cons.push("TDS levels are too high");
    recommendations.push("Immediate water change recommended");
    qualityScore += 5;
  }
  
  // Turbidity analysis
  if (data.turbidity < 5) {
    pros.push("Water clarity is excellent");
    qualityScore += 25;
  } else if (data.turbidity < 10) {
    cons.push("Water clarity is reduced");
    recommendations.push("Check filtration system");
    qualityScore += 15;
  } else {
    cons.push("Water is too cloudy");
    recommendations.push("Clean or replace filter, consider water change");
    qualityScore += 5;
  }
  
  // Temperature analysis
  if (data.temperature >= 20 && data.temperature <= 25) {
    pros.push("Temperature is in optimal range");
    qualityScore += 25;
  } else if (data.temperature >= 15 && data.temperature < 20) {
    cons.push("Water temperature is slightly low");
    recommendations.push("Consider heating the water");
    qualityScore += 15;
  } else if (data.temperature > 25 && data.temperature <= 30) {
    cons.push("Water temperature is slightly high");
    recommendations.push("Consider cooling the water");
    qualityScore += 15;
  } else {
    cons.push("Water temperature is outside of safe range");
    recommendations.push("Urgent action needed to adjust temperature");
    qualityScore += 5;
  }
  
  // Determine overall status
  let status: 'good' | 'moderate' | 'poor';
  if (qualityScore >= 80) {
    status = 'good';
  } else if (qualityScore >= 50) {
    status = 'moderate';
  } else {
    status = 'poor';
  }
  
  return {
    qualityScore,
    status,
    pros,
    cons,
    recommendations
  };
};

export const getAchievementBadges = (testCount: number): string[] => {
  const badges: string[] = [];
  
  if (testCount >= 1) badges.push("First Test");
  if (testCount >= 5) badges.push("Regular Tester");
  if (testCount >= 10) badges.push("Water Guardian");
  if (testCount >= 25) badges.push("Aqua Expert");
  if (testCount >= 50) badges.push("Water Master");
  if (testCount >= 100) badges.push("Hydro Legend");
  
  return badges;
};

export const getBadgeIcon = (badge: string): string => {
  // In a real app, this would return paths to actual badge icons
  switch (badge) {
    case "First Test": return "🏅";
    case "Regular Tester": return "🥈";
    case "Water Guardian": return "🥉";
    case "Aqua Expert": return "🏆";
    case "Water Master": return "💎";
    case "Hydro Legend": return "👑";
    default: return "🔵";
  }
};
