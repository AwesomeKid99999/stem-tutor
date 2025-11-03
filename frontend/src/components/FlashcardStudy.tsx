import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, CheckCircle, XCircle, Eye, EyeOff, Shuffle, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { flashcardAPI, type Flashcard } from '@/services/api';

interface FlashcardStudyProps {
  flashcards?: Flashcard[];
  startIndex?: number;
  onClose?: () => void;
}

export const FlashcardStudy: React.FC<FlashcardStudyProps> = ({ 
  flashcards: initialFlashcards,
  startIndex = 0,
  onClose 
}) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studyStats, setStudyStats] = useState({
    correct: 0,
    incorrect: 0,
    total: 0
  });
  const [isShuffled, setIsShuffled] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load flashcards on mount
  useEffect(() => {
    if (initialFlashcards) {
      setFlashcards(initialFlashcards);
      setCurrentIndex(startIndex);
      setStudyStats(prev => ({ ...prev, total: initialFlashcards.length }));
    } else {
      fetchFlashcards();
    }
  }, [initialFlashcards, startIndex]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' || event.key === 'a') {
        previousCard();
      } else if (event.key === 'ArrowRight' || event.key === 'd') {
        nextCard();
      } else if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        setShowAnswer(!showAnswer);
      } else if (event.key === '1' && showAnswer) {
        markAnswer(false);
      } else if (event.key === '2' && showAnswer) {
        markAnswer(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showAnswer, currentIndex, flashcards.length]);

  const fetchFlashcards = async () => {
    try {
      setLoading(true);
      const data = await flashcardAPI.getAll();
      setFlashcards(data);
      setStudyStats(prev => ({ ...prev, total: data.length }));
    } catch (error) {
      console.error('Failed to fetch flashcards:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentCard = flashcards[currentIndex];
  const progress = flashcards.length > 0 ? ((currentIndex + 1) / flashcards.length) * 100 : 0;

  const shuffleCards = () => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setFlashcards(shuffled);
    setCurrentIndex(0);
    setShowAnswer(false);
    setIsShuffled(true);
  };

  const resetStudy = () => {
    setCurrentIndex(0);
    setShowAnswer(false);
    setStudyStats({ correct: 0, incorrect: 0, total: flashcards.length });
    if (initialFlashcards) {
      setFlashcards(initialFlashcards);
    } else {
      fetchFlashcards();
    }
    setIsShuffled(false);
  };

  const nextCard = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    }
  };

  const previousCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
    }
  };

  const markAnswer = async (correct: boolean) => {
    if (!currentCard) return;

    try {
      await flashcardAPI.review(currentCard.id, correct);
      
      setStudyStats(prev => ({
        ...prev,
        correct: correct ? prev.correct + 1 : prev.correct,
        incorrect: correct ? prev.incorrect : prev.incorrect + 1
      }));

      // Auto-advance to next card after marking
      setTimeout(() => {
        nextCard();
      }, 1000);
    } catch (error) {
      console.error('Failed to update review stats:', error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSubjectColor = (subject: string) => {
    const colors = {
      mathematics: 'bg-blue-100 text-blue-800 border-blue-200',
      physics: 'bg-purple-100 text-purple-800 border-purple-200',
      chemistry: 'bg-green-100 text-green-800 border-green-200',
      biology: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      coding: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      engineering: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[subject.toLowerCase() as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <BookOpen className="h-12 w-12 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No flashcards available</h3>
          <p className="text-muted-foreground mb-4">Create some flashcards to start studying!</p>
          {onClose && (
            <Button onClick={onClose}>Go Back</Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Study Mode</h1>
          <p className="text-muted-foreground">
            Card {currentIndex + 1} of {flashcards.length}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={shuffleCards} disabled={isShuffled}>
            <Shuffle className="h-4 w-4 mr-2" />
            Shuffle
          </Button>
          <Button variant="outline" onClick={resetStudy}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Close Study
            </Button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Study Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{studyStats.correct}</div>
            <div className="text-sm text-muted-foreground">Correct</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{studyStats.incorrect}</div>
            <div className="text-sm text-muted-foreground">Incorrect</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {studyStats.correct + studyStats.incorrect > 0 
                ? Math.round((studyStats.correct / (studyStats.correct + studyStats.incorrect)) * 100)
                : 0}%
            </div>
            <div className="text-sm text-muted-foreground">Accuracy</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Flashcard */}
      {currentCard && (
        <Card className="mb-6 min-h-[400px] cursor-pointer" onClick={() => setShowAnswer(!showAnswer)}>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2">
                <Badge className={getSubjectColor(currentCard.subject)}>
                  {currentCard.subject}
                </Badge>
                <Badge className={getDifficultyColor(currentCard.difficulty)}>
                  {currentCard.difficulty}
                </Badge>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAnswer(!showAnswer);
                }}
              >
                {showAnswer ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Hide Answer
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Show Answer
                  </>
                )}
              </Button>
            </div>
            
            <CardTitle className="text-xl leading-relaxed">
              {currentCard.question}
            </CardTitle>
          </CardHeader>

          <CardContent>
            {showAnswer ? (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2 text-green-700">Answer:</h4>
                  <p className="text-lg leading-relaxed">{currentCard.answer}</p>
                </div>
                
                {currentCard.tags.length > 0 && (
                  <div>
                    <h5 className="font-medium mb-2">Tags:</h5>
                    <div className="flex flex-wrap gap-1">
                      {currentCard.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Answer Feedback Buttons */}
                <div className="flex justify-center gap-4 pt-4">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      markAnswer(false);
                    }}
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Incorrect
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      markAnswer(true);
                    }}
                    variant="outline"
                    className="text-green-600 border-green-200 hover:bg-green-50"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Correct
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center min-h-[200px]">
                <div className="text-center text-muted-foreground">
                  <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Click anywhere to reveal the answer</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          onClick={previousCard}
          disabled={currentIndex === 0}
          variant="outline"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
          <span className="ml-2 text-xs text-muted-foreground">(A)</span>
        </Button>

        <div className="text-center">
          <div className="text-sm text-muted-foreground">
            {currentIndex + 1} / {flashcards.length}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Space: Show/Hide • 1: Wrong • 2: Correct
          </div>
        </div>

        <Button
          onClick={nextCard}
          disabled={currentIndex === flashcards.length - 1}
          variant="outline"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
          <span className="ml-2 text-xs text-muted-foreground">(D)</span>
        </Button>
      </div>

      {/* Completion Message */}
      {currentIndex === flashcards.length - 1 && showAnswer && (
        <Card className="mt-6 border-green-200 bg-green-50">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Study Session Complete!
            </h3>
            <p className="text-green-700 mb-4">
              You've reviewed all {flashcards.length} flashcards. 
              Your accuracy: {studyStats.correct + studyStats.incorrect > 0 
                ? Math.round((studyStats.correct / (studyStats.correct + studyStats.incorrect)) * 100)
                : 0}%
            </p>
            <div className="flex justify-center gap-2">
              <Button onClick={resetStudy} variant="outline">
                Study Again
              </Button>
              {onClose && (
                <Button onClick={onClose}>
                  Finish Studying
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};