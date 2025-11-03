import React, { useState, useEffect } from 'react';
import { Building2, Zap, RotateCcw, Play, Clock, Target } from 'lucide-react';
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

interface TowerBlock {
  id: string;
  height: number;
  color: string;
  subject: string;
  cracked: boolean;
}

export const STEMTower: React.FC = () => {
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'finished'>('setup');
  const [currentCard, setCurrentCard] = useState<Flashcard | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [tower, setTower] = useState<TowerBlock[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [targetHeight, setTargetHeight] = useState(10);
  const [isPlaying, setIsPlaying] = useState(false);

  const flashcards: Flashcard[] = [
    {
      id: '1',
      question: 'What is the integral of 2x?',
      answer: 'x² + C',
      subject: 'math'
    },
    {
      id: '2',
      question: 'What gas do plants absorb during photosynthesis?',
      answer: 'CO2',
      subject: 'biology'
    },
    {
      id: '3',
      question: 'What is the unit of electric current?',
      answer: 'Ampere',
      subject: 'physics'
    },
    {
      id: '4',
      question: 'What is the molecular formula for water?',
      answer: 'H2O',
      subject: 'chemistry'
    }
  ];

  const subjectColors = {
    math: 'bg-blue-500',
    physics: 'bg-yellow-500',
    chemistry: 'bg-green-500',
    biology: 'bg-emerald-500',
    coding: 'bg-purple-500',
    engineering: 'bg-orange-500'
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && timeLeft > 0 && gameState === 'playing') {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isPlaying, timeLeft, gameState]);

  const startGame = () => {
    setGameState('playing');
    setIsPlaying(true);
    setTimeLeft(120);
    setScore(0);
    setStreak(0);
    setTower([]);
    nextQuestion();
  };

  const nextQuestion = () => {
    const randomCard = flashcards[Math.floor(Math.random() * flashcards.length)];
    setCurrentCard(randomCard);
    setUserAnswer('');
    setShowAnswer(false);
  };

  const addBlock = (subject: string, isCorrect: boolean) => {
    const newBlock: TowerBlock = {
      id: Date.now().toString(),
      height: isCorrect ? 40 + (streak * 5) : 40,
      color: subjectColors[subject as keyof typeof subjectColors] || 'bg-gray-500',
      subject,
      cracked: !isCorrect
    };

    setTower(prev => [...prev, newBlock]);

    if (isCorrect) {
      const points = 100 + (streak * 20);
      setScore(prev => prev + points);
      setStreak(prev => prev + 1);
    } else {
      // Wrong answer cracks the tower - remove some blocks
      setTower(prev => {
        const crackedTower = [...prev];
        const cracksToAdd = Math.min(3, crackedTower.length);
        
        for (let i = 0; i < cracksToAdd; i++) {
          const randomIndex = Math.floor(Math.random() * crackedTower.length);
          if (crackedTower[randomIndex]) {
            crackedTower[randomIndex] = {
              ...crackedTower[randomIndex],
              cracked: true
            };
          }
        }
        
        // Remove cracked blocks from the bottom
        return crackedTower.filter((block, index) => {
          if (block.cracked && index < crackedTower.length - 2) {
            return false;
          }
          return true;
        });
      });
      setStreak(0);
    }

    if (tower.length >= targetHeight) {
      endGame();
    } else {
      setTimeout(nextQuestion, 1500);
    }
  };

  const endGame = () => {
    setGameState('finished');
    setIsPlaying(false);
  };

  const resetGame = () => {
    setGameState('setup');
    setCurrentCard(null);
    setUserAnswer('');
    setShowAnswer(false);
    setTower([]);
    setScore(0);
    setStreak(0);
    setTimeLeft(120);
    setIsPlaying(false);
  };

  const handleAnswer = (isCorrect: boolean) => {
    if (currentCard) {
      addBlock(currentCard.subject, isCorrect);
    }
  };

  if (gameState === 'setup') {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-cosmic bg-clip-text text-transparent">
            🏗️ STEM Tower
          </h1>
          <p className="text-muted-foreground text-lg">
            Build the tallest STEM tower by answering flashcards correctly!<br />
            Wrong answers will crack your tower and cause blocks to fall.
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Game Rules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <Building2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Build Up:</strong> Each correct answer adds a glowing block to your tower
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Zap className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Streak Bonus:</strong> Consecutive answers create taller, more valuable blocks
                </div>
              </div>
              <div className="flex items-start gap-2">
                <RotateCcw className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Crack & Fall:</strong> Wrong answers crack blocks and cause structural damage
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Target className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Goal:</strong> Build a tower of {targetHeight} blocks before time runs out
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
                Start Building!
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gameState === 'finished') {
    const success = tower.length >= targetHeight;
    
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            {success ? '🏆 Tower Complete!' : '⏰ Time\'s Up!'}
          </h1>
          <div className="text-6xl mb-4">
            {success ? '🏗️' : '💥'}
          </div>
          <h2 className="text-2xl font-semibold mb-2">
            {success 
              ? `Congratulations! You built a ${tower.length}-block tower!` 
              : `Your tower reached ${tower.length} blocks high!`
            }
          </h2>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Construction Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{score}</div>
                <div className="text-sm text-muted-foreground">Final Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-success">{tower.length}</div>
                <div className="text-sm text-muted-foreground">Blocks Built</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-warning">{streak}</div>
                <div className="text-sm text-muted-foreground">Best Streak</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">
                  {Math.round((tower.length / targetHeight) * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">Goal Progress</div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={startGame} 
                className="flex-1 focus-ring"
                variant="default"
              >
                <Play className="h-4 w-4 mr-2" />
                Build Again
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
          <h1 className="text-2xl font-bold">STEM Tower Builder</h1>
          <Badge variant="outline" className="text-lg px-3 py-1">
            {tower.length}/{targetHeight} blocks
          </Badge>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-warning" />
            <span className="font-medium">Streak: {streak}</span>
          </div>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {score} pts
          </Badge>
          <Badge variant={timeLeft < 30 ? "destructive" : "outline"} className="text-lg px-3 py-1">
            <Clock className="h-4 w-4 mr-1" />
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tower Display */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Your STEM Tower
            </CardTitle>
            <Progress value={(tower.length / targetHeight) * 100} className="h-3" />
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* Tower Visualization */}
              <div className="flex flex-col-reverse items-center min-h-[300px] p-4 bg-muted/30 rounded-lg">
                {tower.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-muted-foreground">
                    <div className="text-center">
                      <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Start answering to build your tower!</p>
                    </div>
                  </div>
                ) : (
                  tower.map((block, index) => (
                    <div
                      key={block.id}
                      className={`w-24 mb-1 rounded flex items-center justify-center text-white text-xs font-bold transition-all duration-500 ${
                        block.color
                      } ${block.cracked ? 'opacity-50 animate-pulse' : 'animate-bounce'}`}
                      style={{ 
                        height: `${Math.max(20, block.height)}px`,
                        animationDelay: `${index * 0.1}s`,
                        animationDuration: block.cracked ? '0.5s' : '0.3s',
                        animationFillMode: 'both'
                      }}
                    >
                      {block.subject.substring(0, 4).toUpperCase()}
                      {block.cracked && (
                        <span className="ml-1 text-red-300">💥</span>
                      )}
                    </div>
                  ))
                )}
                
                {/* Foundation */}
                <div className="w-32 h-4 bg-gray-600 rounded-b-lg flex items-center justify-center text-white text-xs font-bold">
                  FOUNDATION
                </div>
              </div>

              {/* Tower Stats */}
              <div className="mt-4 text-center text-sm text-muted-foreground">
                <p>Height: {tower.length} blocks</p>
                <p>Stability: {Math.round((tower.filter(b => !b.cracked).length / Math.max(tower.length, 1)) * 100)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Question */}
        <Card>
          <CardHeader>
            <CardTitle>Build Your Tower!</CardTitle>
            {currentCard && (
              <Badge className="capitalize w-fit">{currentCard.subject}</Badge>
            )}
          </CardHeader>
          <CardContent>
            {currentCard && (
              <div className="space-y-6">
                <div className="text-xl font-medium p-4 bg-muted rounded-lg">
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
                      Add Block to Tower
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
                        ✓ Correct - Strong Block!
                      </Button>
                      <Button 
                        onClick={() => handleAnswer(false)}
                        className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-ring"
                      >
                        ✗ Wrong - Cracked Block!
                      </Button>
                    </div>

                    {streak >= 3 && (
                      <div className="text-center text-sm text-primary font-medium animate-pulse">
                        🔥 {streak} streak! Building mega-blocks!
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Game Controls */}
      <div className="text-center mt-6">
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