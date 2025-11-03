import React, { useState, useEffect } from 'react';
import { Plus, BookOpen, Edit, Trash2, Share2, Play, Users, Clock, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

interface CourseModule {
  id: string;
  title: string;
  description: string;
  type: 'lesson' | 'flashcards' | 'practice' | 'game';
  completed: boolean;
  estimatedTime: number; // in minutes
}

interface Course {
  id: string;
  title: string;
  description: string;
  subject: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  modules: CourseModule[];
  tags: string[];
  created: Date;
  lastAccessed?: Date;
  progress: number; // 0-100
  isShared: boolean;
  author: string;
  totalTime: number; // in minutes
}

export const CourseBuilder: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);

  // Load courses from backend on component mount
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    console.log('🔍 Starting fetchCourses...');
    try {
      console.log('📡 Making API call to http://localhost:3001/api/courses');
      const response = await fetch('http://localhost:3001/api/courses');
      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      
      if (response.ok) {
        const coursesData = await response.json();
        console.log('✅ Fetched courses from backend:', coursesData);
        console.log('📊 Number of courses:', coursesData.length);
        
        if (coursesData.length > 0) {
          console.log('📚 First course:', coursesData[0]);
          console.log('📚 First course modules:', coursesData[0].modules);
          console.log('📚 Modules count:', coursesData[0].modules?.length);
        }
        
        // Convert date strings to Date objects
        const processedCourses = coursesData.map((course: any) => ({
          ...course,
          created: new Date(course.created),
          lastAccessed: course.lastAccessed ? new Date(course.lastAccessed) : undefined
        }));
        
        console.log('🔄 Processed courses:', processedCourses);
        console.log('🔄 Setting courses state...');
        setCourses(processedCourses);
        console.log('✅ Courses state set successfully');
        
        // Sample courses are now premade in backend, no need to auto-load
      } else {
        console.error('❌ Failed to fetch courses:', response.status);
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        // Fallback to sample courses if backend fails
        loadSampleCourses();
      }
    } catch (error) {
      console.error('💥 Error fetching courses:', error);
      // Fallback to sample courses if backend fails
      loadSampleCourses();
    }
  };

  const loadSampleCourses = async () => {
    try {
      console.log('Fetching sample courses...');
      const response = await fetch('/sample-courses.json');
      console.log('Response status:', response.status);
      if (response.ok) {
        const sampleCourses = await response.json();
        console.log('Raw sample courses:', sampleCourses);
        console.log('First course modules:', sampleCourses[0]?.modules);
        console.log('Modules length:', sampleCourses[0]?.modules?.length);
        
        // Save each sample course to backend
        for (const course of sampleCourses) {
          await saveCourseToBackend(course);
        }
        
        // Refresh courses from backend
        await fetchCourses();
        console.log('Sample courses loaded successfully');
      } else {
        console.error('Failed to fetch sample courses, status:', response.status);
      }
    } catch (error) {
      console.error('Failed to load sample courses:', error);
    }
  };

  const saveCourseToBackend = async (courseData: any) => {
    try {
      const response = await fetch('http://localhost:3001/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData),
      });
      
      if (!response.ok) {
        console.error('Failed to save course to backend:', response.status);
      }
    } catch (error) {
      console.error('Error saving course to backend:', error);
    }
  };

  // No longer need to save to localStorage - using backend API

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [viewingModule, setViewingModule] = useState<CourseModule | null>(null);

  // Form state for creating/editing courses
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: 'math',
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    tags: ''
  });

  const subjects = ['math', 'physics', 'chemistry', 'biology', 'coding', 'engineering', 'religion'];
  const difficulties = ['beginner', 'intermediate', 'advanced'];
  const moduleTypes = [
    { value: 'lesson', label: 'Lesson', icon: BookOpen },
    { value: 'flashcards', label: 'Flashcards', icon: Star },
    { value: 'practice', label: 'Practice', icon: Edit },
    { value: 'game', label: 'Game', icon: Play }
  ];

  const handleCreateCourse = async () => {
    const newCourseData = {
      title: formData.title,
      description: formData.description,
      subject: formData.subject,
      difficulty: formData.difficulty,
      modules: [],
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      progress: 0,
      isShared: false,
      author: 'You',
      totalTime: 0
    };

    try {
      const response = await fetch('http://localhost:3001/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCourseData),
      });

      if (response.ok) {
        const newCourse = await response.json();
        setCourses(prev => [...prev, { ...newCourse, created: new Date(newCourse.created) }]);
        setFormData({ title: '', description: '', subject: 'math', difficulty: 'beginner', tags: '' });
        setShowCreateDialog(false);
      } else {
        console.error('Failed to create course:', response.status);
      }
    } catch (error) {
      console.error('Error creating course:', error);
    }
  };

  const handleEditCourse = async () => {
    if (!editingCourse) return;

    const updateData = {
      title: formData.title,
      description: formData.description,
      subject: formData.subject,
      difficulty: formData.difficulty,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    };

    try {
      const response = await fetch(`http://localhost:3001/api/courses/${editingCourse.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const updatedCourse = await response.json();
        setCourses(prev => prev.map(course => 
          course.id === editingCourse.id 
            ? { ...updatedCourse, created: new Date(updatedCourse.created) }
            : course
        ));
        setEditingCourse(null);
        setFormData({ title: '', description: '', subject: 'math', difficulty: 'beginner', tags: '' });
      } else {
        console.error('Failed to update course:', response.status);
      }
    } catch (error) {
      console.error('Error updating course:', error);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/courses/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCourses(prev => prev.filter(course => course.id !== id));
        if (selectedCourse?.id === id) {
          setSelectedCourse(null);
        }
      } else {
        console.error('Failed to delete course:', response.status);
      }
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  };

  const startEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      subject: course.subject,
      difficulty: course.difficulty,
      tags: course.tags.join(', ')
    });
  };

  const toggleShareCourse = async (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    try {
      const response = await fetch(`http://localhost:3001/api/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isShared: !course.isShared }),
      });

      if (response.ok) {
        const updatedCourse = await response.json();
        setCourses(prev => prev.map(c => 
          c.id === courseId 
            ? { ...updatedCourse, created: new Date(updatedCourse.created) }
            : c
        ));
      } else {
        console.error('Failed to toggle course sharing:', response.status);
      }
    } catch (error) {
      console.error('Error toggling course sharing:', error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-success text-success-foreground';
      case 'intermediate': return 'bg-warning text-warning-foreground';
      case 'advanced': return 'bg-destructive text-destructive-foreground';
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
      engineering: 'bg-orange-100 text-orange-800',
      religion: 'bg-indigo-100 text-indigo-800'
    };
    return colors[subject as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getModuleTypeIcon = (type: string) => {
    const moduleType = moduleTypes.find(t => t.value === type);
    return moduleType?.icon || BookOpen;
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Module Content Viewer
  if (viewingModule && (viewingModule as any).content) {
    const content = (viewingModule as any).content;
    
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setViewingModule(null)}
            className="mb-4 focus-ring"
          >
            ← Back to Course
          </Button>
          
          <h1 className="text-3xl font-bold mb-2">{viewingModule.title}</h1>
          <p className="text-muted-foreground mb-4">{viewingModule.description}</p>
          
          <div className="flex gap-2 mb-6">
            <Badge variant="outline" className="capitalize">{viewingModule.type}</Badge>
            <Badge variant="outline">{formatTime(viewingModule.estimatedTime)}</Badge>
          </div>
        </div>

        {/* Learning Objectives */}
        {content.objectives && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Learning Objectives</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-1">
                {content.objectives.map((objective: string, index: number) => (
                  <li key={index} className="text-sm">{objective}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Introduction */}
        {content.introduction && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Introduction</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{content.introduction}</p>
            </CardContent>
          </Card>
        )}

        {/* Content Sections */}
        {content.sections && content.sections.map((section: any, index: number) => (
          <Card key={index} className="mb-6">
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: section.content.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/### (.*?)(\n|$)/g, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>').replace(/#### (.*?)(\n|$)/g, '<h4 class="text-base font-medium mt-3 mb-1">$1</h4>').replace(/- (.*?)(\n|$)/g, '<li class="ml-4">$1</li>') 
                }}
              />
            </CardContent>
          </Card>
        ))}

        {/* Summary */}
        {content.summary && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{content.summary}</p>
            </CardContent>
          </Card>
        )}

        {/* Practice Exercises */}
        {content.exercises && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Practice Exercises</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {content.exercises.map((exercise: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Question {index + 1}:</h4>
                    <p className="text-sm mb-2">{exercise.question}</p>
                    <details className="text-sm">
                      <summary className="cursor-pointer text-primary hover:underline">Show Answer</summary>
                      <div className="mt-2 p-2 bg-muted rounded">
                        <p className="font-medium">Answer: {exercise.answer}</p>
                        <p className="text-muted-foreground mt-1">{exercise.explanation}</p>
                      </div>
                    </details>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Preview */}
        {content.nextPreview && (
          <Card>
            <CardHeader>
              <CardTitle>Coming Next</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{content.nextPreview}</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  if (selectedCourse) {
    console.log('Rendering selected course:', selectedCourse);
    console.log('Selected course modules:', selectedCourse.modules);
    console.log('Modules count:', selectedCourse.modules?.length);
    
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setSelectedCourse(null)}
            className="mb-4 focus-ring"
          >
            ← Back to Courses
          </Button>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{selectedCourse.title}</h1>
              <p className="text-muted-foreground mb-4">{selectedCourse.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className={getSubjectColor(selectedCourse.subject)}>
                  {selectedCourse.subject}
                </Badge>
                <Badge className={getDifficultyColor(selectedCourse.difficulty)}>
                  {selectedCourse.difficulty}
                </Badge>
                {selectedCourse.isShared && (
                  <Badge variant="outline" className="text-primary border-primary">
                    <Share2 className="h-3 w-3 mr-1" />
                    Shared
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-1">Progress</div>
              <div className="text-2xl font-bold mb-2">{selectedCourse.progress}%</div>
              <Progress value={selectedCourse.progress} className="w-32" />
            </div>
          </div>
        </div>

        {/* Course Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-2xl font-bold">
                    {selectedCourse.modules ? selectedCourse.modules.length : 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Modules {selectedCourse.modules ? '' : '(undefined)'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-accent" />
                <div>
                  <div className="text-2xl font-bold">
                    {selectedCourse.totalTime ? formatTime(selectedCourse.totalTime) : 
                     selectedCourse.modules ? formatTime(selectedCourse.modules.reduce((acc, m) => acc + (m.estimatedTime || 0), 0)) : '0m'}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Time</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-success" />
                <div>
                  <div className="text-2xl font-bold">
                    {selectedCourse.modules ? selectedCourse.modules.filter(m => m.completed).length : 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-warning" />
                <div>
                  <div className="text-2xl font-bold">{selectedCourse.isShared ? '∞' : '1'}</div>
                  <div className="text-sm text-muted-foreground">Access</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modules List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Course Modules</h2>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={async () => {
                  // Clear all courses from backend first
                  const currentCourses = await fetch('http://localhost:3001/api/courses').then(r => r.json()).catch(() => []);
                  for (const course of currentCourses) {
                    await fetch(`http://localhost:3001/api/courses/${course.id}`, { method: 'DELETE' });
                  }
                  setCourses([]);
                  await loadSampleCourses();
                }} 
                className="focus-ring"
              >
                Load Sample Courses
              </Button>
              <Button className="focus-ring">
                <Plus className="h-4 w-4 mr-2" />
                Add Module
              </Button>
            </div>
          </div>

          {selectedCourse.modules && selectedCourse.modules.length > 0 ? selectedCourse.modules.map((module, index) => {
            const Icon = getModuleTypeIcon(module.type);
            
            return (
              <Card key={module.id} className={`hover:shadow-cosmic transition-all duration-300 ${
                module.completed ? 'ring-1 ring-success' : ''
              }`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        module.completed ? 'bg-success text-success-foreground' : 'bg-muted'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-muted-foreground">
                            Module {index + 1}
                          </span>
                          <Badge variant="outline" className="text-xs capitalize">
                            {module.type}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg">{module.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {module.description}
                        </CardDescription>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {formatTime(module.estimatedTime)}
                      </span>
                      <div className="flex gap-2">
                        {(module as any).content && (
                          <Button 
                            variant="outline"
                            size="sm"
                            className="focus-ring"
                            onClick={() => setViewingModule(module)}
                          >
                            View Content
                          </Button>
                        )}
                        <Button 
                          variant={module.completed ? "secondary" : "default"}
                          size="sm"
                          className="focus-ring"
                        >
                          {module.completed ? 'Review' : 'Start'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          }) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No modules found in this course.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Modules: {selectedCourse.modules ? selectedCourse.modules.length : 'undefined'}
              </p>
              <Button 
                variant="outline" 
                onClick={async () => {
                  console.log('Debug - Selected course:', selectedCourse);
                  // Clear all courses from backend first
                  const currentCourses = await fetch('http://localhost:3001/api/courses').then(r => r.json()).catch(() => []);
                  for (const course of currentCourses) {
                    await fetch(`http://localhost:3001/api/courses/${course.id}`, { method: 'DELETE' });
                  }
                  setCourses([]);
                  await loadSampleCourses();
                }} 
                className="mt-4"
              >
                Debug: Reload Sample Courses
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Courses</h1>
        <p className="text-muted-foreground">
          Create custom learning paths with lessons, flashcards, practice problems, and games.
        </p>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {courses.length} course{courses.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={async () => {
              // Clear all courses from backend first
              const currentCourses = await fetch('http://localhost:3001/api/courses').then(r => r.json()).catch(() => []);
              for (const course of currentCourses) {
                await fetch(`http://localhost:3001/api/courses/${course.id}`, { method: 'DELETE' });
              }
              setCourses([]);
              await loadSampleCourses();
            }} 
            className="focus-ring"
          >
            Load Sample Courses
          </Button>
          <Button className="focus-ring" onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Course
          </Button>
        </div>
      </div>

      {/* Course Grid */}
      {courses.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-xl font-semibold mb-2">No Courses Yet</h3>
          <p className="text-muted-foreground mb-6">
            Create your first course to start building structured learning paths.
          </p>
          <Button onClick={() => setShowCreateDialog(true)} className="focus-ring">
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Course
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
          <Card key={course.id} className="hover:shadow-cosmic transition-all duration-300 cursor-pointer">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between mb-2">
                <div className="flex flex-wrap gap-1">
                  <Badge className={getSubjectColor(course.subject)}>
                    {course.subject}
                  </Badge>
                  <Badge className={getDifficultyColor(course.difficulty)}>
                    {course.difficulty}
                  </Badge>
                  {course.isShared && (
                    <Badge variant="outline" className="text-primary border-primary">
                      <Share2 className="h-3 w-3 mr-1" />
                      Shared
                    </Badge>
                  )}
                </div>
                
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleShareCourse(course.id);
                    }}
                    className="h-8 w-8 focus-ring"
                    aria-label={course.isShared ? "Unshare course" : "Share course"}
                  >
                    <Share2 className={`h-4 w-4 ${course.isShared ? 'text-primary' : 'text-muted-foreground'}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      startEdit(course);
                    }}
                    className="h-8 w-8 focus-ring"
                    aria-label="Edit course"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCourse(course.id);
                    }}
                    className="h-8 w-8 focus-ring text-destructive hover:text-destructive"
                    aria-label="Delete course"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <CardTitle 
                className="text-lg leading-tight cursor-pointer hover:text-primary transition-colors"
                onClick={() => setSelectedCourse(course)}
              >
                {course.title}
              </CardTitle>
            </CardHeader>

            <CardContent>
              <CardDescription className="mb-4 text-sm line-clamp-2">
                {course.description}
              </CardDescription>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{course.progress}%</span>
                </div>
                <Progress value={course.progress} className="h-2" />

                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span>{course.modules.length} modules</span>
                    <span>{formatTime(course.totalTime)}</span>
                  </div>
                  <span>{course.modules.filter(m => m.completed).length} completed</span>
                </div>

                {course.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {course.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {course.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{course.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              <Separator className="my-3" />

              <Button 
                className="w-full focus-ring"
                onClick={() => setSelectedCourse(course)}
              >
                {course.progress > 0 ? 'Continue' : 'Start Course'}
              </Button>
            </CardContent>
          </Card>
        ))}
        </div>
      )}

      {/* Create/Edit Course Dialog */}
      <Dialog
        open={showCreateDialog || !!editingCourse}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateDialog(false);
            setEditingCourse(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCourse ? 'Edit Course' : 'Create New Course'}
            </DialogTitle>
            <DialogDescription>
              {editingCourse 
                ? 'Update your course details below.'
                : 'Fill in the details to create a new learning course.'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="course-title">Course Title</Label>
              <Input
                id="course-title"
                placeholder="Enter course title..."
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="focus-ring"
              />
            </div>

            <div>
              <Label htmlFor="course-description">Description</Label>
              <Textarea
                id="course-description"
                placeholder="Describe what students will learn..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="focus-ring"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="course-subject">Subject</Label>
                <Select 
                  value={formData.subject} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map(subject => (
                      <SelectItem key={subject} value={subject}>
                        {subject.charAt(0).toUpperCase() + subject.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="course-difficulty">Difficulty</Label>
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
              <Label htmlFor="course-tags">Tags (comma-separated)</Label>
              <Input
                id="course-tags"
                placeholder="algebra, linear-algebra, vectors"
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
                  setEditingCourse(null);
                  setFormData({ title: '', description: '', subject: 'math', difficulty: 'beginner', tags: '' });
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={editingCourse ? handleEditCourse : handleCreateCourse}
                disabled={!formData.title.trim() || !formData.description.trim()}
                className="focus-ring"
              >
                {editingCourse ? 'Update Course' : 'Create Course'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};