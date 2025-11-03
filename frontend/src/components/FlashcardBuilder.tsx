import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Tag, BookOpen, Filter, Play } from 'lucide-react';
import { FlashcardStudy } from './FlashcardStudy';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  lastReviewed?: string;
  created: string;
  timesReviewed: number;
  correctCount: number;
}

interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  flashcardCount: number;
}

export const FlashcardBuilder: React.FC = () => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [loading, setLoading] = useState(false);
  const [showStudyMode, setShowStudyMode] = useState(false);
  const [studyStartIndex, setStudyStartIndex] = useState(0);

  // Form state for creating/editing flashcards
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    subject: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    tags: ''
  });

  const difficulties = ['easy', 'medium', 'hard'];

  // Load data on component mount
  useEffect(() => {
    fetchFlashcards();
    fetchSubjects();
  }, []);

  const fetchFlashcards = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/flashcards');
      if (response.ok) {
        const data = await response.json();
        setFlashcards(data);
      }
    } catch (error) {
      console.error('Failed to fetch flashcards:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/subjects');
      if (response.ok) {
        const data = await response.json();
        setSubjects(data);
        if (data.length > 0 && !formData.subject) {
          setFormData(prev => ({ ...prev, subject: data[0].name.toLowerCase() }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
    }
  };

  const filteredFlashcards = flashcards.filter(card => {
    const matchesSubject = filterSubject === 'all' || card.subject === filterSubject;
    const matchesDifficulty = filterDifficulty === 'all' || card.difficulty === filterDifficulty;
    const matchesSearch = searchTerm === '' || 
      card.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSubject && matchesDifficulty && matchesSearch;
  });

  const handleCreateCard = async () => {
    if (!formData.question.trim() || !formData.answer.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/flashcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: formData.question,
          answer: formData.answer,
          subject: formData.subject,
          difficulty: formData.difficulty,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        }),
      });

      if (response.ok) {
        const newCard = await response.json();
        setFlashcards(prev => [...prev, newCard]);
        setFormData({ question: '', answer: '', subject: formData.subject, difficulty: 'medium', tags: '' });
        setShowCreateDialog(false);
      }
    } catch (error) {
      console.error('Failed to create flashcard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCard = async () => {
    if (!editingCard || !formData.question.trim() || !formData.answer.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/flashcards/${editingCard.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: formData.question,
          answer: formData.answer,
          subject: formData.subject,
          difficulty: formData.difficulty,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        }),
      });

      if (response.ok) {
        const updatedCard = await response.json();
        setFlashcards(prev => prev.map(card => 
          card.id === editingCard.id ? updatedCard : card
        ));
        setEditingCard(null);
        setFormData({ question: '', answer: '', subject: formData.subject, difficulty: 'medium', tags: '' });
      }
    } catch (error) {
      console.error('Failed to update flashcard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCard = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/flashcards/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFlashcards(prev => prev.filter(card => card.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete flashcard:', error);
    }
  };

  const startEdit = (card: Flashcard) => {
    setEditingCard(card);
    setFormData({
      question: card.question,
      answer: card.answer,
      subject: card.subject,
      difficulty: card.difficulty,
      tags: card.tags.join(', ')
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-success text-success-foreground';
      case 'medium': return 'bg-warning text-warning-foreground';
      case 'hard': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getSubjectColor = (subject: string) => {
    const colors = {
      math: 'bg-blue-100 text-blue-800',
      physics: 'bg-yellow-100 text-yellow-800',
      chemistry: 'bg-green-100 text-green-800', 
      biology: 'bg-emerald-100 text-emerald-800',
      coding: 'bg-purple-100 text-purple-800',
      engineering: 'bg-orange-100 text-orange-800'
    };
    return colors[subject as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
      Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      'day'
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Flashcard Builder</h1>
        <p className="text-muted-foreground">
          Create, organize, and review your STEM flashcards. Build custom study sets for any topic.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search flashcards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="focus-ring"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={filterSubject} onValueChange={setFilterSubject}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map(subject => (
                <SelectItem key={subject.id} value={subject.name.toLowerCase()}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {difficulties.map(difficulty => (
                <SelectItem key={difficulty} value={difficulty}>
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            className="focus-ring" 
            onClick={() => setShowStudyMode(true)}
            disabled={filteredFlashcards.length === 0}
          >
            <Play className="h-4 w-4 mr-2" />
            Study Cards
          </Button>
          
          <Button className="focus-ring" onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Card
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">{flashcards.length}</div>
                <div className="text-sm text-muted-foreground">Total Cards</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-success" />
              <div>
                <div className="text-2xl font-bold">
                  {flashcards.filter(c => c.lastReviewed).length}
                </div>
                <div className="text-sm text-muted-foreground">Reviewed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-warning" />
              <div>
                <div className="text-2xl font-bold">{filteredFlashcards.length}</div>
                <div className="text-sm text-muted-foreground">Filtered</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-accent" />
              <div>
                <div className="text-2xl font-bold">
                  {new Set(flashcards.flatMap(c => c.tags)).size}
                </div>
                <div className="text-sm text-muted-foreground">Unique Tags</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Flashcard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFlashcards.map(card => (
          <Card 
            key={card.id} 
            className="hover:shadow-cosmic transition-all duration-300 cursor-pointer"
            onClick={() => {
              const cardIndex = filteredFlashcards.findIndex(c => c.id === card.id);
              setStudyStartIndex(cardIndex);
              setShowStudyMode(true);
            }}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex flex-wrap gap-1 mb-2">
                  <Badge className={getSubjectColor(card.subject)}>
                    {card.subject}
                  </Badge>
                  <Badge className={getDifficultyColor(card.difficulty)}>
                    {card.difficulty}
                  </Badge>
                </div>
                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={(e) => {
                      e.stopPropagation();
                      const cardIndex = filteredFlashcards.findIndex(c => c.id === card.id);
                      setStudyStartIndex(cardIndex);
                      setShowStudyMode(true);
                    }}
                    className="h-8 w-8 focus-ring text-primary hover:text-primary"
                    aria-label="Study this flashcard"
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={(e) => {
                      e.stopPropagation();
                      startEdit(card);
                    }}
                    className="h-8 w-8 focus-ring"
                    aria-label="Edit flashcard"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCard(card.id);
                    }}
                    className="h-8 w-8 focus-ring text-destructive hover:text-destructive"
                    aria-label="Delete flashcard"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <CardTitle className="text-lg leading-tight">{card.question}</CardTitle>
            </CardHeader>

            <CardContent>
              <CardDescription className="mb-4 text-sm line-clamp-3">
                {card.answer}
              </CardDescription>

              {card.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {card.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <Separator className="my-3" />

              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <div>
                  {card.lastReviewed ? (
                    <span>Reviewed {formatDate(card.lastReviewed)}</span>
                  ) : (
                    <span>Never reviewed</span>
                  )}
                </div>
                <div>
                  {card.timesReviewed > 0 && (
                    <span>
                      {Math.round((card.correctCount / card.timesReviewed) * 100)}% correct
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog
        open={showCreateDialog || !!editingCard}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateDialog(false);
            setEditingCard(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCard ? 'Edit Flashcard' : 'Create New Flashcard'}
            </DialogTitle>
            <DialogDescription>
              {editingCard 
                ? 'Update your flashcard details below.'
                : 'Fill in the details to create a new flashcard.'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="question">Question</Label>
              <Textarea
                id="question"
                placeholder="Enter your question..."
                value={formData.question}
                onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                className="focus-ring"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="answer">Answer</Label>
              <Textarea
                id="answer"
                placeholder="Enter the answer..."
                value={formData.answer}
                onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
                className="focus-ring"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Select 
                  value={formData.subject} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map(subject => (
                      <SelectItem key={subject.id} value={subject.name.toLowerCase()}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select 
                  value={formData.difficulty} 
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, difficulty: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {difficulties.map(difficulty => (
                      <SelectItem key={difficulty} value={difficulty}>
                        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                placeholder="algebra, equations, math"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                className="focus-ring"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowCreateDialog(false);
                  setEditingCard(null);
                  setFormData({ question: '', answer: '', subject: formData.subject, difficulty: 'medium', tags: '' });
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={editingCard ? handleEditCard : handleCreateCard}
                disabled={!formData.question.trim() || !formData.answer.trim() || !formData.subject || loading}
                className="focus-ring"
              >
                {loading ? 'Saving...' : (editingCard ? 'Update Card' : 'Create Card')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Study Mode */}
      {showStudyMode && (
        <div className="fixed inset-0 bg-background z-50 overflow-auto">
          <FlashcardStudy 
            flashcards={filteredFlashcards}
            startIndex={studyStartIndex}
            onClose={() => {
              setShowStudyMode(false);
              setStudyStartIndex(0);
            }}
          />
        </div>
      )}
    </div>
  );
};