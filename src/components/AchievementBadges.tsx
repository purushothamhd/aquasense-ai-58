
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { getAchievementBadges, getBadgeIcon } from "@/utils/waterQualityUtils";

interface AchievementBadgesProps {
  testCount: number;
}

export const AchievementBadges = ({ testCount }: AchievementBadgesProps) => {
  const [previousTestCount, setPreviousTestCount] = useState(testCount);
  const badges = getAchievementBadges(testCount);
  
  useEffect(() => {
    // Check if we've earned a new badge
    if (testCount > previousTestCount) {
      const previousBadges = getAchievementBadges(previousTestCount);
      const newBadges = badges.filter(badge => !previousBadges.includes(badge));
      
      // Show toast for each new badge
      newBadges.forEach(badge => {
        toast({
          title: "New Achievement Unlocked!",
          description: `You've earned the "${badge}" badge!`,
          variant: "default",
        });
      });
      
      setPreviousTestCount(testCount);
    }
  }, [testCount, badges, previousTestCount]);
  
  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="text-xl">Achievements</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="text-sm text-muted-foreground mb-2">
          You've conducted {testCount} water tests
        </div>
        <div className="flex flex-wrap gap-2">
          {badges.map((badge) => (
            <div 
              key={badge}
              className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full border-2 border-blue-300 hover:scale-110 transition-transform"
              title={badge}
            >
              <span className="text-2xl">{getBadgeIcon(badge)}</span>
            </div>
          ))}
          
          {/* Locked badges (next 3 to unlock) */}
          {[...Array(3)].map((_, i) => {
            const nextBadgeIndex = badges.length + i;
            if (nextBadgeIndex < 6) { // Total of 6 possible badges
              const nextBadgeName = getAchievementBadges(100)[nextBadgeIndex];
              return (
                <div 
                  key={`locked-${i}`}
                  className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full border-2 border-gray-300 relative opacity-60"
                  title={`Locked: ${nextBadgeName}`}
                >
                  <span className="text-2xl opacity-30">{getBadgeIcon(nextBadgeName)}</span>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl">🔒</span>
                  </div>
                </div>
              );
            }
            return null;
          })}
        </div>
      </CardContent>
    </Card>
  );
};
