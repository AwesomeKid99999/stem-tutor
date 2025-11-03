import React, { useState } from 'react';
import { Menu, Settings, Zap, User, TreePine, BookOpen, Trophy, Target, Gamepad2, Lightbulb as Flash } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Sidebar } from '@/components/Sidebar';
import { ChatInterface } from '@/components/ChatInterface';
import { ProgressPanel } from '@/components/ProgressPanel';
import { ThemeSettings } from '@/components/ThemeSettings';
import { AvatarSelector } from '@/components/AvatarSelector';
import { SkillTree } from '@/components/SkillTree';
import { FlashcardBuilder } from '@/components/FlashcardBuilder';
import { CourseBuilder } from '@/components/CourseBuilder';
import { Dashboard } from '@/components/Dashboard';
import { KnowledgeKart } from '@/components/games/KnowledgeKart';
import { STEMTower } from '@/components/games/STEMTower';
import { DailyQuest } from '@/components/DailyQuest';
import { BossProblems } from '@/components/BossProblems';
import { PomodoroTimer } from '@/components/PomodoroTimer';

interface STEMTutorLayoutProps {
  children?: React.ReactNode;
}

export const STEMTutorLayout: React.FC<STEMTutorLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'chat' | 'skill-tree' | 'flashcards' | 'courses' | 'games' | 'daily-quest' | 'boss-problems' | 'pomodoro'>('dashboard');
  const { theme } = useTheme();

  return (
    <div className="min-h-screen w-full bg-gradient-nebula">
      {/* Skip to content links for accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <a href="#chat-input" className="skip-link">
        Skip to chat input
      </a>
      <a href="#sidebar" className="skip-link">
        Skip to sidebar
      </a>

      {/* Top Header */}
      <header 
        className="flex items-center justify-between h-16 px-4 bg-card/80 backdrop-blur-sm border-b border-border"
        role="banner"
      >
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            className="focus-ring"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-cosmic flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-xl font-semibold bg-gradient-cosmic bg-clip-text text-transparent">
              STEM Forge
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowAvatarSelector(true)}
            aria-label="Change avatar"
            className="focus-ring"
          >
            <User className="h-5 w-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettings(true)}
            aria-label="Open accessibility settings"
            className="focus-ring"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-4rem)] w-full">
        {/* Sidebar */}
        <aside
          id="sidebar"
          className={`transition-all duration-300 ease-in-out border-r border-border bg-card/50 backdrop-blur-sm ${
            sidebarOpen ? 'w-80' : 'w-0 overflow-hidden'
          }`}
          aria-hidden={!sidebarOpen}
        >
          <Sidebar currentView={currentView} onViewChange={setCurrentView} />
        </aside>

        {/* Main Content Area */}
        <main 
          id="main-content"
          className="flex-1 flex flex-col min-w-0"
          role="main"
        >
          {/* Dynamic Content */}
          <div className="flex-1 overflow-auto">
            {currentView === 'dashboard' && <Dashboard onNavigate={setCurrentView} />}
            {currentView === 'chat' && <ChatInterface />}
            {currentView === 'skill-tree' && <SkillTree />}
            {currentView === 'flashcards' && <FlashcardBuilder />}
            {currentView === 'courses' && <CourseBuilder />}
            {currentView === 'games' && <KnowledgeKart />}
            {currentView === 'daily-quest' && <DailyQuest />}
            {currentView === 'boss-problems' && <BossProblems />}
            {currentView === 'pomodoro' && <PomodoroTimer />}
          </div>
        </main>
      </div>

      {/* Modals */}
      {showSettings && (
        <ThemeSettings 
          open={showSettings} 
          onClose={() => setShowSettings(false)} 
        />
      )}
      
      {showAvatarSelector && (
        <AvatarSelector 
          open={showAvatarSelector} 
          onClose={() => setShowAvatarSelector(false)} 
        />
      )}
    </div>
  );
};