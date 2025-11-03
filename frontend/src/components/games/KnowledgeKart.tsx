import React, { useState, useEffect } from 'react';
import { Trophy, Zap, Heart, RotateCcw, Play, Pause } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  subject: string;
}

interface KartPlayer {
  id: string;
  name: string;
  position: number;
  speed: number;
  color: string;
}

export const KnowledgeKart: React.FC = () => {
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'finished'>('setup');
  const [currentCard, setCurrentCard] = useState<Flashcard | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [racePosition, setRacePosition] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);

  // Mock flashcards
  const flashcards: Flashcard[] = [
    {
      id: '1',
      question: 'What is 15 × 12?',
      answer: '180',
      subject: 'math'
    },
    {
      id: '2',
      question: 'What is the chemical symbol for gold?',
      answer: 'Au',
      subject: 'chemistry'
    },
    {
      id: '3',
      question: 'What is the speed of light in vacuum?',
      answer: '299,792,458 m/s',
      subject: 'physics'
    },
    {
      id: '4',
      question: 'What is the derivative of x²?',
      answer: '2x',
      subject: 'math'
    }
  ];

  // AI opponents with different colors and speeds
  const [opponents] = useState<KartPlayer[]>([
    { id: 'ai1', name: 'Algebra Bot', position: 0, speed: 2, color: 'bg-red-500' },
    { id: 'ai2', name: 'Physics Pro', position: 0, speed: 1.5, color: 'bg-blue-500' },
    { id: 'ai3', name: 'Chem Master', position: 0, speed: 1.8, color: 'bg-green-500' }
  ]);

  const [player] = useState<KartPlayer>({
    id: 'player',
    name: 'You',
    position: 0,
    speed: 0,
    color: 'bg-primary'
  });

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && timeLeft > 0 && gameState === 'playing') {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleGameEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isPlaying, timeLeft, gameState]);

  // AI movement effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (gameState === 'playing') {
      interval = setInterval(() => {
        // Move AI opponents forward gradually
        // In a real game, this would be more sophisticated
        // For now, just simulate steady progress
      }, 100);
    }

    return () => clearInterval(interval);
  }, [gameState]);

  const startGame = () => {
    setGameState('playing');
    setIsPlaying(true);
    setTimeLeft(180); // 3 minutes
    setLives(3);
    setScore(0);
    setStreak(0);
    setRacePosition(0);
    nextQuestion();
  };

  const nextQuestion = () => {
    const randomCard = flashcards[Math.floor(Math.random() * flashcards.length)];
    setCurrentCard(randomCard);
    setUserAnswer('');
    setShowAnswer(false);
  };

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      const points = 100 + (streak * 10);
      setScore(prev => prev + points);
      setStreak(prev => prev + 1);
      
      // Move player forward based on streak
      const boost = Math.min(streak + 1, 5);
      setRacePosition(prev => Math.min(prev + boost * 5, 100));
      
      // Turbo boost effect for long streaks
      if (streak >= 3) {
        setRacePosition(prev => Math.min(prev + 10, 100));
      }
    } else {
      setStreak(0);
      setLives(prev => prev - 1);
      
      if (lives <= 1) {
        handleGameEnd();
        return;
      }
    }

    if (racePosition >= 100) {
      handleGameEnd();
      return;
    }

    setTimeout(nextQuestion, 1000);
  };

  const handleGameEnd = () => {
    setGameState('finished');
    setIsPlaying(false);
  };

  const resetGame = () => {
    setGameState('setup');
    setCurrentCard(null);
    setUserAnswer('');
    setShowAnswer(false);
    setStreak(0);
    setLives(3);
    setScore(0);
    setRacePosition(0);
    setTimeLeft(30);
    setIsPlaying(false);
  };

  if (gameState === 'setup') {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-cosmic bg-clip-text text-transparent">
            🏎️ Knowledge Kart
          </h1>
          <p className="text-muted-foreground text-lg">
            Race against AI opponents by answering flashcards correctly!<br />
            Correct answers boost your speed, wrong answers slow you down.
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Game Rules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <Zap className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Speed Boost:</strong> Correct answers increase your speed and position
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Trophy className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Streak Bonus:</strong> Consecutive correct answers give turbo boosts
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Heart className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Lives:</strong> You have 3 lives - wrong answers cost a life
                </div>
              </div>
              <div className="flex items-start gap-2">
                <RotateCcw className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Time Limit:</strong> Complete the race before time runs out!
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button 
                onClick={startGame} 
                className="w-full btn-cosmic focus-ring"
                size="lg"
              >
                <Play className="h-5 w-5 mr-2" />
                Start Race!
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gameState === 'finished') {
    const finalPosition = racePosition >= 100 ? 1 : 
                         racePosition >= 75 ? 2 :
                         racePosition >= 50 ? 3 : 4;

    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">🏁 Race Finished!</h1>
          <div className="text-6xl mb-4">
            {finalPosition === 1 ? '🏆' : finalPosition === 2 ? '🥈' : finalPosition === 3 ? '🥉' : '🏁'}
          </div>
          <h2 className="text-2xl font-semibold mb-2">
            You finished in {finalPosition === 1 ? '1st' : finalPosition === 2 ? '2nd' : finalPosition === 3 ? '3rd' : '4th'} place!
          </h2>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Race Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{score}</div>
                <div className="text-sm text-muted-foreground">Final Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-success">{racePosition}%</div>
                <div className="text-sm text-muted-foreground">Track Completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-warning">{streak}</div>
                <div className="text-sm text-muted-foreground">Best Streak</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">{lives}</div>
                <div className="text-sm text-muted-foreground">Lives Left</div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={startGame} 
                className="flex-1 focus-ring"
                variant="default"
              >
                <Play className="h-4 w-4 mr-2" />
                Race Again
              </Button>
              <Button 
                onClick={resetGame} 
                className="flex-1 focus-ring"
                variant="outline"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Main Menu
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Game Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsPlaying(!isPlaying)}
            className="focus-ring"
            aria-label={isPlaying ? "Pause game" : "Resume game"}
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>
          <h1 className="text-2xl font-bold">Knowledge Kart Race</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-destructive" />
            <span className="font-medium">{lives}</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-warning" />
            <span className="font-medium">{streak}</span>
          </div>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {score} pts
          </Badge>
          <Badge variant={timeLeft < 30 ? "destructive" : "outline"} className="text-lg px-3 py-1">
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </Badge>
        </div>
      </div>

      {/* Race Track */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Race Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Track */}
            <div className="h-20 bg-muted rounded-lg border-2 border-dashed border-muted-foreground/20 relative overflow-hidden">
              {/* Finish Line */}
              <div className="absolute right-0 top-0 h-full w-2 bg-gradient-to-b from-white via-black to-white opacity-50" />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs font-bold">
                FINISH
              </div>
              
              {/* Player Kart */}
              <div 
                className={`absolute top-1/2 transform -translate-y-1/2 w-8 h-8 ${player.color} rounded transition-all duration-500 flex items-center justify-center text-white font-bold text-sm`}
                style={{ left: `${racePosition}%` }}
              >
                🏎️
              </div>
            </div>
            
            <div className="mt-2">
              <Progress value={racePosition} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Start</span>
                <span>{racePosition}% Complete</span>
                <span>Finish</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Question */}
      {currentCard && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Answer this question to boost your speed!</CardTitle>
              <Badge className="capitalize">{currentCard.subject}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-medium mb-6 p-4 bg-muted rounded-lg">
              {currentCard.question}
            </div>

            {!showAnswer ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                  disabled={!isPlaying}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && userAnswer.trim()) {
                      setShowAnswer(true);
                    }
                  }}
                />
                <Button 
                  onClick={() => setShowAnswer(true)}
                  disabled={!userAnswer.trim() || !isPlaying}
                  className="w-full focus-ring"
                >
                  Submit Answer
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-card border border-border rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Correct Answer:</div>
                  <div className="text-lg font-medium">{currentCard.answer}</div>
                </div>
                
                <div className="text-sm text-muted-foreground mb-4">
                  Your answer: <span className="font-medium">{userAnswer}</span>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleAnswer(true)}
                    className="flex-1 bg-success text-success-foreground hover:bg-success/90 focus-ring"
                  >
                    ✓ Correct - Speed Boost!
                  </Button>
                  <Button 
                    onClick={() => handleAnswer(false)}
                    className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-ring"
                  >
                    ✗ Wrong - Try Again
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Game Controls */}
      <div className="text-center">
        <Button 
          onClick={resetGame} 
          variant="outline" 
          className="focus-ring"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          End Game
        </Button>
      </div>
    </div>
  );
};