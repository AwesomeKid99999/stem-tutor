import React, { useState, useEffect } from 'react';
import { Target, Clock, Trophy, Zap, Star, CheckCircle, RotateCcw, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface DailyQuest {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  xpReward: number;
  timeEstimate: number; // minutes
  progress: number; // 0-100
  completed: boolean;
  category: 'math' | 'physics' | 'chemistry' | 'biology' | 'coding' | 'engineering';
  streakProtection?: boolean;
}

interface DailyStreak {
  current: number;
  longest: number;
  lastCompleted: string;
}

const getDailyQuests = (): DailyQuest[] => {
  const today = new Date().toDateString();
  const savedQuests = localStorage.getItem(`daily-quests-${today}`);
  
  if (savedQuests) {
    return JSON.parse(savedQuests);
  }
  
  // Generate new daily quests
  const questPool = [
    { title: "Algebra Explorer", description: "Solve 5 linear equations", category: 'math', difficulty: 'easy', xp: 50, time: 10 },
    { title: "Physics Pioneer", description: "Complete a kinematics problem set", category: 'physics', difficulty: 'medium', xp: 100, time: 15 },
    { title: "Code Crusader", description: "Write 3 functions in Python", category: 'coding', difficulty: 'medium', xp: 80, time: 20 },
    { title: "Chemistry Champion", description: "Balance 10 chemical equations", category: 'chemistry', difficulty: 'hard', xp: 150, time: 25 },
    { title: "Bio Buff", description: "Study cell organelles for 10 minutes", category: 'biology', difficulty: 'easy', xp: 60, time: 10 },
    { title: "Engineering Ace", description: "Design a simple circuit", category: 'engineering', difficulty: 'hard', xp: 120, time: 30 }
  ];
  
  // Select 3 random quests
  const selectedQuests = questPool
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map((quest, index) => ({
      id: `quest-${index}`,
      title: quest.title,
      description: quest.description,
      difficulty: quest.difficulty as 'easy' | 'medium' | 'hard',
      xpReward: quest.xp,
      timeEstimate: quest.time,
      progress: 0,
      completed: false,
      category: quest.category as any,
      streakProtection: Math.random() > 0.7 // 30% chance for streak protection
    }));
  
  localStorage.setItem(`daily-quests-${today}`, JSON.stringify(selectedQuests));
  return selectedQuests;
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'easy': return 'text-green-500';
    case 'medium': return 'text-yellow-500';
    case 'hard': return 'text-red-500';
    default: return 'text-gray-500';
  }
};

const getDifficultyBadge = (difficulty: string) => {
  switch (difficulty) {
    case 'easy': return 'bg-green-100 text-green-800 border-green-300';
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'hard': return 'bg-red-100 text-red-800 border-red-300';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const DailyQuest: React.FC = () => {
  const [quests, setQuests] = useState<DailyQuest[]>([]);
  const [streak, setStreak] = useState<DailyStreak>({ current: 0, longest: 0, lastCompleted: '' });
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    setQuests(getDailyQuests());
    
    // Load streak data
    const savedStreak = localStorage.getItem('daily-streak');
    if (savedStreak) {
      setStreak(JSON.parse(savedStreak));
    }
    
    // Calculate time until reset (midnight)
    const updateTimeRemaining = () => {
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeRemaining(`${hours}h ${minutes}m`);
    };
    
    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const completeQuest = (questId: string) => {
    const updatedQuests = quests.map(quest => 
      quest.id === questId 
        ? { ...quest, completed: true, progress: 100 }
        : quest
    );
    
    setQuests(updatedQuests);
    
    const today = new Date().toDateString();
    localStorage.setItem(`daily-quests-${today}`, JSON.stringify(updatedQuests));
    
    // Update streak if all quests are completed
    const allCompleted = updatedQuests.every(q => q.completed);
    if (allCompleted) {
      const newStreak = {
        current: streak.current + 1,
        longest: Math.max(streak.longest, streak.current + 1),
        lastCompleted: today
      };
      setStreak(newStreak);
      localStorage.setItem('daily-streak', JSON.stringify(newStreak));
    }
  };

  const updateProgress = (questId: string, progress: number) => {
    const updatedQuests = quests.map(quest => 
      quest.id === questId 
        ? { ...quest, progress: Math.min(100, progress) }
        : quest
    );
    
    setQuests(updatedQuests);
    
    const today = new Date().toDateString();
    localStorage.setItem(`daily-quests-${today}`, JSON.stringify(updatedQuests));
  };

  const totalXP = quests.filter(q => q.completed).reduce((sum, q) => sum + q.xpReward, 0);
  const completedQuests = quests.filter(q => q.completed).length;
  const totalQuests = quests.length;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-cosmic bg-clip-text text-transparent">
          Daily Quest Hub
        </h1>
        <p className="text-muted-foreground">
          Complete daily challenges to earn XP and maintain your streak!
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-800 dark:text-blue-300">Streak</span>
            </div>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{streak.current}</div>
            <div className="text-xs text-blue-600 dark:text-blue-400">Best: {streak.longest}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-800 dark:text-green-300">Completed</span>
            </div>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">{completedQuests}/{totalQuests}</div>
            <Progress value={(completedQuests / totalQuests) * 100} className="h-1 mt-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              <span className="font-semibold text-yellow-800 dark:text-yellow-300">XP Earned</span>
            </div>
            <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{totalXP}</div>
            <div className="text-xs text-yellow-600 dark:text-yellow-400">Today</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-purple-600" />
              <span className="font-semibold text-purple-800 dark:text-purple-300">Reset In</span>
            </div>
            <div className="text-lg font-bold text-purple-900 dark:text-purple-100">{timeRemaining}</div>
            <div className="text-xs text-purple-600 dark:text-purple-400">Until new quests</div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Quests */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Calendar className="h-6 w-6" />
          Today's Quests
        </h2>
        
        <div className="grid gap-4">
          {quests.map((quest) => (
            <Card 
              key={quest.id} 
              className={`transition-all duration-300 ${
                quest.completed 
                  ? 'ring-2 ring-success bg-success/5' 
                  : quest.progress > 0 
                  ? 'ring-2 ring-primary bg-primary/5'
                  : 'hover:shadow-md'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${
                      quest.category === 'math' ? 'from-blue-400 to-blue-600' :
                      quest.category === 'physics' ? 'from-purple-400 to-purple-600' :
                      quest.category === 'coding' ? 'from-green-400 to-green-600' :
                      quest.category === 'chemistry' ? 'from-orange-400 to-orange-600' :
                      quest.category === 'biology' ? 'from-emerald-400 to-emerald-600' :
                      'from-red-400 to-red-600'
                    }`}>
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {quest.title}
                        {quest.streakProtection && (
                          <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                            <Star className="h-3 w-3 mr-1" />
                            Streak Shield
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{quest.description}</CardDescription>
                    </div>
                  </div>
                  
                  <div className="text-right space-y-1">
                    <Badge className={getDifficultyBadge(quest.difficulty)}>
                      {quest.difficulty}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      +{quest.xpReward} XP
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-medium">{quest.progress}%</span>
                    </div>
                    <Progress value={quest.progress} className="h-2" />
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>~{quest.timeEstimate} min</span>
                    </div>
                    
                    <div className="flex gap-2">
                      {!quest.completed && quest.progress < 100 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateProgress(quest.id, quest.progress + 25)}
                        >
                          Add Progress
                        </Button>
                      )}
                      
                      {quest.progress >= 100 && !quest.completed && (
                        <Button
                          size="sm"
                          onClick={() => completeQuest(quest.id)}
                          className="bg-gradient-cosmic text-white"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Complete
                        </Button>
                      )}
                      
                      {quest.completed && (
                        <Badge variant="outline" className="text-success border-success">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {/* All Complete Celebration */}
      {completedQuests === totalQuests && totalQuests > 0 && (
        <Card className="bg-gradient-to-r from-green-400 to-blue-500 text-white">
          <CardContent className="p-6 text-center">
            <Trophy className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">🎉 All Quests Complete! 🎉</h3>
            <p className="text-lg">
              Amazing work! You've earned <strong>{totalXP} XP</strong> and maintained your <strong>{streak.current}-day streak</strong>!
            </p>
            <p className="mt-2 opacity-90">
              Come back tomorrow for new challenges and keep your streak alive!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};