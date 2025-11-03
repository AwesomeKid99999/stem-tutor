import React, { useState, useEffect } from 'react';
import { BookOpen, Target, Zap, Trophy, Play, Plus, TrendingUp, Calendar, Star, ChevronRight, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { flashcardAPI, progressAPI, type Flashcard, type Progress as ProgressType } from '@/services/api';

interface DashboardProps {
  onNavigate: (view: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [progress, setProgress] = useState<ProgressType>({
    totalXP: 0,
    level: 1,
    streak: 0,
    lastActivity: null,
    completedSkills: [],
    achievements: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [flashcardsData, progressData] = await Promise.all([
        flashcardAPI.getAll(),
        progressAPI.get()
      ]);
      setFlashcards(flashcardsData);
      setProgress(progressData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const reviewedCards = flashcards.filter(card => card.lastReviewed);
  const todayReviewed = flashcards.filter(card => {
    if (!card.lastReviewed) return false;
    const today = new Date().toDateString();
    const reviewDate = new Date(card.lastReviewed).toDateString();
    return today === reviewDate;
  });

  const subjects = [...new Set(flashcards.map(card => card.subject))];
  const averageAccuracy = reviewedCards.length > 0 
    ? Math.round(reviewedCards.reduce((acc, card) => 
        acc + (card.timesReviewed > 0 ? (card.correctCount / card.timesReviewed) * 100 : 0), 0
      ) / reviewedCards.length)
    : 0;

  const nextLevelXP = progress.level * 100;
  const currentLevelProgress = (progress.totalXP % 100);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <BookOpen className="h-12 w-12 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          {getGreeting()}, STEM Explorer! 👋
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Ready to level up your learning? Let's continue your STEM journey!
        </p>
        <Button 
          onClick={() => onNavigate('flashcards')} 
          className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
        >
          Start Learning
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Level {progress.level}</p>
                <p className="text-2xl font-bold text-blue-900">{progress.totalXP} XP</p>
                <Progress value={(currentLevelProgress / 100) * 100} className="mt-2 h-2" />
              </div>
              <Star className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">{progress.streak} Day Streak</p>
                <p className="text-2xl font-bold text-green-900">Keep it up!</p>
              </div>
              <Zap className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">{averageAccuracy}% Accuracy</p>
                <p className="text-2xl font-bold text-purple-900">Great work!</p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">{progress.achievements.length} Achievements</p>
                <p className="text-2xl font-bold text-orange-900">Unlocked</p>
              </div>
              <Trophy className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access */}
      <div>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" />
          Quick Access
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group" onClick={() => onNavigate('flashcards')}>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Flashcards</h3>
              <p className="text-muted-foreground mb-4">Review and create flashcards</p>
              <div className="text-sm text-muted-foreground">
                {flashcards.length} cards available
              </div>
              <Button variant="outline" className="mt-4 group-hover:bg-primary group-hover:text-primary-foreground">
                Get Started
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group" onClick={() => onNavigate('skill-tree')}>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                <Target className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Skill Tree</h3>
              <p className="text-muted-foreground mb-4">Track your learning progress</p>
              <div className="text-sm text-muted-foreground">
                {progress.completedSkills.length} skills completed
              </div>
              <Button variant="outline" className="mt-4 group-hover:bg-primary group-hover:text-primary-foreground">
                Get Started
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group" onClick={() => onNavigate('chat')}>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                <Zap className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Tutor</h3>
              <p className="text-muted-foreground mb-4">Get personalized help</p>
              <div className="text-sm text-muted-foreground">
                Ask your first question!
              </div>
              <Button variant="outline" className="mt-4 group-hover:bg-primary group-hover:text-primary-foreground">
                Get Started
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group" onClick={() => onNavigate('pomodoro')}>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-red-200 transition-colors">
                <Clock className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Pomodoro Timer</h3>
              <p className="text-muted-foreground mb-4">Focus with timed sessions</p>
              <div className="text-sm text-muted-foreground">
                Boost your productivity
              </div>
              <Button variant="outline" className="mt-4 group-hover:bg-primary group-hover:text-primary-foreground">
                Start Timer
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          Recent Activity
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Today's Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Cards Reviewed</span>
                  <Badge variant="secondary">{todayReviewed.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Subjects Studied</span>
                  <Badge variant="secondary">{subjects.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Current Streak</span>
                  <Badge variant="secondary">{progress.streak} days</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Learning Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Flashcards</span>
                  <Badge variant="secondary">{flashcards.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Cards Reviewed</span>
                  <Badge variant="secondary">{reviewedCards.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Average Accuracy</span>
                  <Badge variant="secondary">{averageAccuracy}%</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Flashcards */}
      {flashcards.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              Recent Flashcards
            </h2>
            <Button variant="outline" onClick={() => onNavigate('flashcards')}>
              View All
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {flashcards.slice(0, 6).map(card => (
              <Card key={card.id} className="hover:shadow-md transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      {card.subject}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        card.difficulty === 'easy' ? 'border-green-200 text-green-700' :
                        card.difficulty === 'medium' ? 'border-yellow-200 text-yellow-700' :
                        'border-red-200 text-red-700'
                      }`}
                    >
                      {card.difficulty}
                    </Badge>
                  </div>
                  <h4 className="font-medium text-sm mb-2 line-clamp-2">{card.question}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{card.answer}</p>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>
                      {card.timesReviewed > 0 
                        ? `${Math.round((card.correctCount / card.timesReviewed) * 100)}% correct`
                        : 'Not reviewed'
                      }
                    </span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => onNavigate('flashcards')}
                      className="h-6 px-2"
                    >
                      <Play className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};