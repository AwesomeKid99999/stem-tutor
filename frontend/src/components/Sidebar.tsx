import React, { useState, useEffect } from 'react';
import { 
  Clock,
  Trophy,
  BookOpen,
  MessageSquare,
  TreePine,
  CreditCard,
  Gamepad2,
  Target,
  Zap,
  Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface SidebarProps {
  currentView: 'dashboard' | 'chat' | 'skill-tree' | 'flashcards' | 'courses' | 'games' | 'daily-quest' | 'boss-problems' | 'pomodoro';
  onViewChange: (view: 'dashboard' | 'chat' | 'skill-tree' | 'flashcards' | 'courses' | 'games' | 'daily-quest' | 'boss-problems' | 'pomodoro') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const [recentTopics, setRecentTopics] = useState<string[]>([]);

  // Load recent topics
  useEffect(() => {
    loadRecentTopics();
  }, []);

  const loadRecentTopics = () => {
    // Load from localStorage for now - could be moved to backend later
    const stored = localStorage.getItem('recentTopics');
    if (stored) {
      setRecentTopics(JSON.parse(stored));
    }
  };

  return (
    <div className="h-full flex flex-col p-4 space-y-6">
      {/* Learning Hub - Moved to top */}
      <section aria-labelledby="navigation-heading">
        <h2 id="navigation-heading" className="text-lg font-semibold mb-4 text-foreground">
          Learning Hub
        </h2>
        <div className="space-y-2">
          <Button
            variant={currentView === 'dashboard' ? "default" : "ghost"}
            className="w-full justify-start gap-3 h-12 focus-ring"
            onClick={() => onViewChange('dashboard')}
          >
            <Home className="h-4 w-4" />
            Dashboard
          </Button>
          
          <Button
            variant={currentView === 'chat' ? "default" : "ghost"}
            className="w-full justify-start gap-3 h-12 focus-ring"
            onClick={() => onViewChange('chat')}
          >
            <MessageSquare className="h-4 w-4" />
            AI Tutor Chat
          </Button>
          
          <Button
            variant={currentView === 'flashcards' ? "default" : "ghost"}
            className="w-full justify-start gap-3 h-12 focus-ring"
            onClick={() => onViewChange('flashcards')}
          >
            <CreditCard className="h-4 w-4" />
            Flashcards
          </Button>
          
          <Button
            variant={currentView === 'skill-tree' ? "default" : "ghost"}
            className="w-full justify-start gap-3 h-12 focus-ring"
            onClick={() => onViewChange('skill-tree')}
          >
            <TreePine className="h-4 w-4" />
            Skill Tree
          </Button>
          
          <Button
            variant={currentView === 'courses' ? "default" : "ghost"}
            className="w-full justify-start gap-3 h-12 focus-ring"
            onClick={() => onViewChange('courses')}
          >
            <BookOpen className="h-4 w-4" />
            Course Builder
          </Button>
          
          <Button
            variant={currentView === 'games' ? "default" : "ghost"}
            className="w-full justify-start gap-3 h-12 focus-ring"
            onClick={() => onViewChange('games')}
          >
            <Gamepad2 className="h-4 w-4" />
            Learning Games
          </Button>
          
          <Button
            variant={currentView === 'daily-quest' ? "default" : "ghost"}
            className="w-full justify-start gap-3 h-12 focus-ring"
            onClick={() => onViewChange('daily-quest')}
          >
            <Zap className="h-4 w-4" />
            Daily Quest
          </Button>
          
          <Button
            variant={currentView === 'boss-problems' ? "default" : "ghost"}
            className="w-full justify-start gap-3 h-12 focus-ring"
            onClick={() => onViewChange('boss-problems')}
          >
            <Target className="h-4 w-4" />
            Boss Problems
          </Button>
          
          <Button
            variant={currentView === 'pomodoro' ? "default" : "ghost"}
            className="w-full justify-start gap-3 h-12 focus-ring"
            onClick={() => onViewChange('pomodoro')}
          >
            <Clock className="h-4 w-4" />
            Pomodoro Timer
          </Button>
        </div>
      </section>



      {recentTopics.length > 0 && (
        <>
          <Separator />
          
          {/* Recent Topics */}
          <section aria-labelledby="recent-heading">
            <h3 id="recent-heading" className="text-sm font-medium mb-3 text-muted-foreground">
              Recent Topics
            </h3>
            <div className="space-y-1">
              {recentTopics.slice(0, 5).map((topic, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-sm text-muted-foreground hover:text-foreground focus-ring"
                >
                  <BookOpen className="h-3 w-3 mr-2" />
                  {topic}
                </Button>
              ))}
            </div>
          </section>
        </>
      )}


    </div>
  );
};