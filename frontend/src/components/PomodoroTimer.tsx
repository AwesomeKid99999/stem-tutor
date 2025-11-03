import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings, Volume2, VolumeX, Clock, Coffee, Target, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';

interface PomodoroSettings {
  workTime: number;
  shortBreak: number;
  longBreak: number;
  longBreakInterval: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  soundEnabled: boolean;
  soundVolume: number;
  notifications: boolean;
}

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

const defaultSettings: PomodoroSettings = {
  workTime: 25,
  shortBreak: 5,
  longBreak: 15,
  longBreakInterval: 4,
  autoStartBreaks: true,
  autoStartPomodoros: false,
  soundEnabled: true,
  soundVolume: 50,
  notifications: true,
};

export const PomodoroTimer: React.FC = () => {
  // Load settings from localStorage
  const [settings, setSettings] = useState<PomodoroSettings>(() => {
    try {
      const saved = localStorage.getItem('pomodoroSettings');
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });
  
  const [currentMode, setCurrentMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(settings.workTime * 60);
  const [isRunning, setIsRunning] = useState(false);
  
  // Load today's completed pomodoros from localStorage
  const [completedPomodoros, setCompletedPomodoros] = useState(() => {
    try {
      const today = new Date().toDateString();
      const saved = localStorage.getItem(`pomodoroProgress_${today}`);
      return saved ? JSON.parse(saved).completedPomodoros : 0;
    } catch {
      return 0;
    }
  });
  
  const [showSettings, setShowSettings] = useState(false);
  const [currentTask, setCurrentTask] = useState('');
  const [tasks, setTasks] = useState<string[]>([]);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Create beep sound function
  const createBeepSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(settings.soundVolume / 100 * 0.3, audioContext.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.error('Failed to create beep sound:', error);
    }
  };

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  // Update timer when mode changes
  useEffect(() => {
    const getTimeForMode = (mode: TimerMode) => {
      switch (mode) {
        case 'work': return settings.workTime * 60;
        case 'shortBreak': return settings.shortBreak * 60;
        case 'longBreak': return settings.longBreak * 60;
      }
    };
    
    if (!isRunning) {
      setTimeLeft(getTimeForMode(currentMode));
    }
  }, [currentMode, settings, isRunning]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    
    // Play notification sound
    if (settings.soundEnabled) {
      createBeepSound();
    }

    // Show browser notification
    if (settings.notifications && 'Notification' in window) {
      const message = currentMode === 'work' 
        ? 'Great work! Time for a break.' 
        : 'Break time is over. Ready to focus?';
      new Notification('STEM Forge - Pomodoro Timer', { body: message });
    }

    // Handle mode transitions
    if (currentMode === 'work') {
      const newCount = completedPomodoros + 1;
      setCompletedPomodoros(newCount);
      
      // Add completed task to history if there was one
      if (currentTask.trim()) {
        setTasks(prev => [...prev, currentTask.trim()]);
        setCurrentTask('');
      }
      
      // Determine next break type
      const nextMode = newCount % settings.longBreakInterval === 0 ? 'longBreak' : 'shortBreak';
      setCurrentMode(nextMode);
      
      // Auto-start break if enabled
      if (settings.autoStartBreaks) {
        setTimeout(() => setIsRunning(true), 1000);
      }
    } else {
      // Break completed, switch to work
      setCurrentMode('work');
      
      // Auto-start work if enabled
      if (settings.autoStartPomodoros) {
        setTimeout(() => setIsRunning(true), 1000);
      }
    }
  };

  const startTimer = () => {
    setIsRunning(true);
    
    // Request notification permission
    if (settings.notifications && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    const getTimeForMode = (mode: TimerMode) => {
      switch (mode) {
        case 'work': return settings.workTime * 60;
        case 'shortBreak': return settings.shortBreak * 60;
        case 'longBreak': return settings.longBreak * 60;
      }
    };
    setTimeLeft(getTimeForMode(currentMode));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const totalTime = currentMode === 'work' 
      ? settings.workTime * 60 
      : currentMode === 'shortBreak' 
      ? settings.shortBreak * 60 
      : settings.longBreak * 60;
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  const getModeInfo = () => {
    switch (currentMode) {
      case 'work':
        return { 
          title: 'Focus Time', 
          icon: <Target className="h-5 w-5" />, 
          color: 'from-red-500 to-orange-500',
          bgColor: 'bg-red-50'
        };
      case 'shortBreak':
        return { 
          title: 'Short Break', 
          icon: <Coffee className="h-5 w-5" />, 
          color: 'from-green-500 to-emerald-500',
          bgColor: 'bg-green-50'
        };
      case 'longBreak':
        return { 
          title: 'Long Break', 
          icon: <Coffee className="h-5 w-5" />, 
          color: 'from-blue-500 to-cyan-500',
          bgColor: 'bg-blue-50'
        };
    }
  };

  const updateSettings = (newSettings: Partial<PomodoroSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    // Save to localStorage
    localStorage.setItem('pomodoroSettings', JSON.stringify(updatedSettings));
  };

  // Save progress to localStorage
  useEffect(() => {
    const today = new Date().toDateString();
    const progressData = {
      completedPomodoros,
      totalFocusTime: completedPomodoros * settings.workTime,
      date: today
    };
    localStorage.setItem(`pomodoroProgress_${today}`, JSON.stringify(progressData));
  }, [completedPomodoros, settings.workTime]); 
 // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Only trigger if not typing in an input
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case ' ':
          event.preventDefault();
          isRunning ? pauseTimer() : startTimer();
          break;
        case 'r':
          event.preventDefault();
          resetTimer();
          break;
        case 's':
          event.preventDefault();
          setShowSettings(true);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isRunning]);

  const modeInfo = getModeInfo();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-primary">Pomodoro Focus Timer</h1>
        <p className="text-muted-foreground">Boost your productivity with focused study sessions</p>
      </div>

      {/* Main Timer Card */}
      <Card className={`${modeInfo.bgColor} border-2 transition-all duration-500`}>
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            {modeInfo.icon}
            <CardTitle className="text-2xl">{modeInfo.title}</CardTitle>
          </div>
          <Badge className={`bg-gradient-to-r ${modeInfo.color} text-white px-4 py-1`}>
            Session {completedPomodoros + 1}
          </Badge>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Timer Display */}
          <div className="text-center space-y-4">
            <div className="text-6xl font-mono font-bold text-primary">
              {formatTime(timeLeft)}
            </div>
            
            {/* Progress Ring */}
            <div className="relative w-32 h-32 mx-auto">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-muted/20"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgress() / 100)}`}
                  className="text-primary transition-all duration-1000 ease-out"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-medium text-primary">
                  {Math.round(getProgress())}%
                </span>
              </div>
            </div>
          </div>          
{/* Control Buttons */}
          <div className="flex justify-center gap-4">
            <Button
              onClick={isRunning ? pauseTimer : startTimer}
              size="lg"
              className="btn-cosmic px-8"
            >
              {isRunning ? (
                <>
                  <Pause className="h-5 w-5 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 mr-2" />
                  Start
                </>
              )}
            </Button>
            
            <Button
              onClick={resetTimer}
              variant="outline"
              size="lg"
              className="px-6"
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Reset
            </Button>
            
            <Dialog open={showSettings} onOpenChange={setShowSettings}>
              <DialogTrigger asChild>
                <Button variant="outline" size="lg" className="px-6">
                  <Settings className="h-5 w-5 mr-2" />
                  Settings
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl flex items-center gap-2">
                    <Settings className="h-6 w-6" />
                    Pomodoro Settings
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6 py-4">
                  {/* Timer Settings */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Timer Duration (minutes)
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Focus Time</label>
                        <div className="flex items-center gap-2">
                          <Slider
                            value={[settings.workTime]}
                            onValueChange={([value]) => updateSettings({ workTime: value })}
                            min={1}
                            max={60}
                            step={1}
                            className="flex-1"
                          />
                          <span className="w-12 text-sm font-mono">{settings.workTime}m</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Short Break</label>
                        <div className="flex items-center gap-2">
                          <Slider
                            value={[settings.shortBreak]}
                            onValueChange={([value]) => updateSettings({ shortBreak: value })}
                            min={1}
                            max={30}
                            step={1}
                            className="flex-1"
                          />
                          <span className="w-12 text-sm font-mono">{settings.shortBreak}m</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Long Break</label>
                        <div className="flex items-center gap-2">
                          <Slider
                            value={[settings.longBreak]}
                            onValueChange={([value]) => updateSettings({ longBreak: value })}
                            min={5}
                            max={60}
                            step={1}
                            className="flex-1"
                          />
                          <span className="w-12 text-sm font-mono">{settings.longBreak}m</span>
                        </div>
                      </div>
                    </div>
                  </div>     
             {/* Automation Settings */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Automation</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="font-medium">Auto Start Breaks</label>
                          <p className="text-sm text-muted-foreground">Automatically start break timers</p>
                        </div>
                        <Switch
                          checked={settings.autoStartBreaks}
                          onCheckedChange={(checked) => updateSettings({ autoStartBreaks: checked })}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="font-medium">Auto Start Focus Sessions</label>
                          <p className="text-sm text-muted-foreground">Automatically start work timers after breaks</p>
                        </div>
                        <Switch
                          checked={settings.autoStartPomodoros}
                          onCheckedChange={(checked) => updateSettings({ autoStartPomodoros: checked })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="font-medium">Long Break Interval</label>
                        <p className="text-sm text-muted-foreground">Take a long break every N focus sessions</p>
                        <div className="flex items-center gap-2">
                          <Slider
                            value={[settings.longBreakInterval]}
                            onValueChange={([value]) => updateSettings({ longBreakInterval: value })}
                            min={2}
                            max={8}
                            step={1}
                            className="flex-1"
                          />
                          <span className="w-16 text-sm font-mono">{settings.longBreakInterval} sessions</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sound Settings */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      {settings.soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                      Sound & Notifications
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="font-medium">Sound Notifications</label>
                          <p className="text-sm text-muted-foreground">Play sound when timer completes</p>
                        </div>
                        <Switch
                          checked={settings.soundEnabled}
                          onCheckedChange={(checked) => updateSettings({ soundEnabled: checked })}
                        />
                      </div>
                      
                      {settings.soundEnabled && (
                        <div className="space-y-3">
                          <label className="font-medium">Volume</label>
                          <div className="flex items-center gap-2">
                            <VolumeX className="h-4 w-4" />
                            <Slider
                              value={[settings.soundVolume]}
                              onValueChange={([value]) => updateSettings({ soundVolume: value })}
                              min={0}
                              max={100}
                              step={5}
                              className="flex-1"
                            />
                            <Volume2 className="h-4 w-4" />
                            <span className="w-12 text-sm font-mono">{settings.soundVolume}%</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={createBeepSound}
                            className="w-full"
                          >
                            Test Sound
                          </Button>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="font-medium">Browser Notifications</label>
                          <p className="text-sm text-muted-foreground">Show desktop notifications</p>
                        </div>
                        <Switch
                          checked={settings.notifications}
                          onCheckedChange={(checked) => updateSettings({ notifications: checked })}
                        />
                      </div>
                    </div>
                  </div> 
                 {/* Data Management */}
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-lg font-semibold text-red-600">Data Management</h3>
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (confirm('Reset all settings to default? This cannot be undone.')) {
                            setSettings(defaultSettings);
                            localStorage.removeItem('pomodoroSettings');
                          }
                        }}
                        className="w-full"
                      >
                        Reset Settings to Default
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (confirm('Clear today\'s progress? This cannot be undone.')) {
                            setCompletedPomodoros(0);
                            setTasks([]);
                            const today = new Date().toDateString();
                            localStorage.removeItem(`pomodoroProgress_${today}`);
                          }
                        }}
                        className="w-full text-red-600 hover:text-red-700"
                      >
                        Clear Today's Progress
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Current Task */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Current Focus</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <input
              type="text"
              value={currentTask}
              onChange={(e) => setCurrentTask(e.target.value)}
              placeholder="What are you working on?"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={isRunning}
            />
            <div className="text-sm text-muted-foreground">
              💡 Tip: Set a specific task to stay focused during your session
            </div>
          </div>
        </CardContent>
      </Card>    
  {/* Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Mode Switch</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            <Button
              variant={currentMode === 'work' ? 'default' : 'outline'}
              onClick={() => !isRunning && setCurrentMode('work')}
              disabled={isRunning}
              className="flex flex-col items-center gap-2 h-auto py-4"
            >
              <Target className="h-5 w-5" />
              <div>
                <div className="font-medium">Focus</div>
                <div className="text-xs text-muted-foreground">{settings.workTime}m</div>
              </div>
            </Button>
            
            <Button
              variant={currentMode === 'shortBreak' ? 'default' : 'outline'}
              onClick={() => !isRunning && setCurrentMode('shortBreak')}
              disabled={isRunning}
              className="flex flex-col items-center gap-2 h-auto py-4"
            >
              <Coffee className="h-5 w-5" />
              <div>
                <div className="font-medium">Short Break</div>
                <div className="text-xs text-muted-foreground">{settings.shortBreak}m</div>
              </div>
            </Button>
            
            <Button
              variant={currentMode === 'longBreak' ? 'default' : 'outline'}
              onClick={() => !isRunning && setCurrentMode('longBreak')}
              disabled={isRunning}
              className="flex flex-col items-center gap-2 h-auto py-4"
            >
              <Coffee className="h-5 w-5" />
              <div>
                <div className="font-medium">Long Break</div>
                <div className="text-xs text-muted-foreground">{settings.longBreak}m</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{completedPomodoros}</div>
            <div className="text-sm text-muted-foreground">Completed Today</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-500">
              {Math.floor((completedPomodoros * settings.workTime) / 60)}h {(completedPomodoros * settings.workTime) % 60}m
            </div>
            <div className="text-sm text-muted-foreground">Focus Time Today</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-500">
              {completedPomodoros > 0 ? Math.ceil(completedPomodoros / settings.longBreakInterval) : 0}
            </div>
            <div className="text-sm text-muted-foreground">Long Breaks Earned</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-500">
              {completedPomodoros > 0 ? Math.round((completedPomodoros / 8) * 100) : 0}%
            </div>
            <div className="text-sm text-muted-foreground">Daily Goal (8 sessions)</div>
          </CardContent>
        </Card>
      </div> 
     {/* Today's Progress */}
      {completedPomodoros > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Today's Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Daily Goal Progress</span>
                  <span>{completedPomodoros}/8 sessions</span>
                </div>
                <Progress value={(completedPomodoros / 8) * 100} className="h-2" />
                
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {Array.from({ length: Math.max(8, completedPomodoros) }, (_, i) => (
                    <div
                      key={i}
                      className={`h-8 rounded flex items-center justify-center text-xs font-medium ${
                        i < completedPomodoros
                          ? 'bg-green-500 text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Completed Tasks */}
          {tasks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  Completed Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {tasks.map((task, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="truncate">{task}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Tips and Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Pomodoro Tips</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Focus on one task during each 25-minute session</li>
              <li>• Take your breaks seriously - step away from your desk</li>
              <li>• Use breaks for light physical activity or meditation</li>
              <li>• Track what you accomplish in each session</li>
              <li>• Adjust timer lengths to match your attention span</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-teal-50 border-green-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-green-900 mb-2">⌨️ Keyboard Shortcuts</h3>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• <kbd className="px-1 py-0.5 bg-white rounded text-xs">Space</kbd> - Start/Pause timer</li>
              <li>• <kbd className="px-1 py-0.5 bg-white rounded text-xs">R</kbd> - Reset current timer</li>
              <li>• <kbd className="px-1 py-0.5 bg-white rounded text-xs">S</kbd> - Open settings</li>
              <li>• Timer shows in browser tab when running</li>
              <li>• Settings auto-save to your browser</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};