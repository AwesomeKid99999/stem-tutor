const API_BASE_URL = 'http://localhost:3001/api';

export interface Flashcard {
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

export interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  flashcardCount: number;
  created: string;
}

export interface Progress {
  totalXP: number;
  level: number;
  streak: number;
  lastActivity: string | null;
  completedSkills: string[];
  achievements: string[];
}

// Flashcard API
export const flashcardAPI = {
  getAll: async (): Promise<Flashcard[]> => {
    const response = await fetch(`${API_BASE_URL}/flashcards`);
    if (!response.ok) throw new Error('Failed to fetch flashcards');
    return response.json();
  },

  create: async (flashcard: Omit<Flashcard, 'id' | 'created' | 'timesReviewed' | 'correctCount' | 'lastReviewed'>): Promise<Flashcard> => {
    const response = await fetch(`${API_BASE_URL}/flashcards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(flashcard),
    });
    if (!response.ok) throw new Error('Failed to create flashcard');
    return response.json();
  },

  update: async (id: string, flashcard: Partial<Flashcard>): Promise<Flashcard> => {
    const response = await fetch(`${API_BASE_URL}/flashcards/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(flashcard),
    });
    if (!response.ok) throw new Error('Failed to update flashcard');
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/flashcards/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete flashcard');
  },

  review: async (id: string, correct: boolean): Promise<Flashcard> => {
    const response = await fetch(`${API_BASE_URL}/flashcards/${id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correct }),
    });
    if (!response.ok) throw new Error('Failed to update review stats');
    return response.json();
  },
};

// Subject API
export const subjectAPI = {
  getAll: async (): Promise<Subject[]> => {
    const response = await fetch(`${API_BASE_URL}/subjects`);
    if (!response.ok) throw new Error('Failed to fetch subjects');
    return response.json();
  },

  create: async (subject: Omit<Subject, 'id' | 'created' | 'flashcardCount'>): Promise<Subject> => {
    const response = await fetch(`${API_BASE_URL}/subjects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subject),
    });
    if (!response.ok) throw new Error('Failed to create subject');
    return response.json();
  },
};

// Progress API
export const progressAPI = {
  get: async (): Promise<Progress> => {
    const response = await fetch(`${API_BASE_URL}/progress`);
    if (!response.ok) throw new Error('Failed to fetch progress');
    return response.json();
  },

  update: async (progress: Partial<Progress>): Promise<Progress> => {
    const response = await fetch(`${API_BASE_URL}/progress`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(progress),
    });
    if (!response.ok) throw new Error('Failed to update progress');
    return response.json();
  },
};