import React from 'react';
import { Trophy, Flame, Star, Clock, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface ProgressPanelProps {
  className?: string;
}

export const ProgressPanel: React.FC<ProgressPanelProps> = ({ className }) => {
  // Mock data - in real app this would come from user state
  const userProgress = {
    level: 12,
    xp: 2430,
    xpToNext: 3000,
    streak: 7,
    todayXp: 150,
    weeklyGoal: 1000,
    weeklyProgress: 650,
  };

  const recentBadges = [
    { id: 1, name: 'Quick Learner', icon: '⚡', color: 'bg-yellow-500' },
    { id: 2, name: 'Problem Solver', icon: '🧩', color: 'bg-purple-500' },
    { id: 3, name: 'Code Master', icon: '💻', color: 'bg-green-500' },
  ];

  const xpPercentage = (userProgress.xp / userProgress.xpToNext) * 100;
  const weeklyPercentage = (userProgress.weeklyProgress / userProgress.weeklyGoal) * 100;

  return (
    <div className={`p-4 ${className}`}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Level & XP */}
          <div className="flex items-center gap-3">
            <div className="level-badge">
              <Star className="h-4 w-4 mr-1" />
              Level {userProgress.level}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">XP Progress</span>
                <span className="font-medium">{userProgress.xp}/{userProgress.xpToNext}</span>
              </div>
              <Progress 
                value={xpPercentage} 
                className="h-2"
                aria-label={`Experience progress: ${Math.round(xpPercentage)}%`}
              />
            </div>
          </div>

          {/* Streak */}
          <div className="flex items-center gap-3">
            <div className="streak-indicator">
              <Flame className="h-4 w-4" />
              <span className="font-semibold">{userProgress.streak}</span>
              <span className="text-sm">day streak</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              +{userProgress.todayXp} XP today
            </Badge>
          </div>

          {/* Weekly Goal */}
          <div className="flex items-center gap-3">
            <Target className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">Weekly Goal</span>
                <span className="font-medium">{userProgress.weeklyProgress}/{userProgress.weeklyGoal}</span>
              </div>
              <Progress 
                value={weeklyPercentage} 
                className="h-2"
                aria-label={`Weekly goal progress: ${Math.round(weeklyPercentage)}%`}
              />
            </div>
          </div>

          {/* Recent Badges */}
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-muted-foreground" />
            <div className="flex gap-1">
              {recentBadges.map((badge) => (
                <div
                  key={badge.id}
                  className={`w-8 h-8 rounded-full ${badge.color} flex items-center justify-center text-sm`}
                  title={badge.name}
                  aria-label={`Badge: ${badge.name}`}
                >
                  {badge.icon}
                </div>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">+2 this week</span>
          </div>
        </div>
      </div>
    </div>
  );
};