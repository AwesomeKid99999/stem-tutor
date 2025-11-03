import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Data file paths
const DATA_DIR = path.join(__dirname, 'data');
const FLASHCARDS_FILE = path.join(DATA_DIR, 'flashcards.json');
const SUBJECTS_FILE = path.join(DATA_DIR, 'subjects.json');
const PROGRESS_FILE = path.join(DATA_DIR, 'progress.json');
const COURSES_FILE = path.join(DATA_DIR, 'courses.json');
const BOSS_CHALLENGES_FILE = path.join(DATA_DIR, 'boss-challenges.json');

// Helper functions
const readJSONFile = async (filePath) => {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return null;
  }
};

const writeJSONFile = async (filePath, data) => {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    return false;
  }
};

// Flashcards endpoints
app.get('/api/flashcards', async (req, res) => {
  const flashcards = await readJSONFile(FLASHCARDS_FILE);
  if (flashcards === null) {
    return res.status(500).json({ error: 'Failed to read flashcards' });
  }
  res.json(flashcards);
});

app.post('/api/flashcards', async (req, res) => {
  const { question, answer, subject, difficulty, tags } = req.body;

  if (!question || !answer || !subject) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const flashcards = await readJSONFile(FLASHCARDS_FILE) || [];

  const newFlashcard = {
    id: uuidv4(),
    question,
    answer,
    subject,
    difficulty: difficulty || 'medium',
    tags: tags || [],
    created: new Date().toISOString(),
    timesReviewed: 0,
    correctCount: 0,
    lastReviewed: null
  };

  flashcards.push(newFlashcard);

  const success = await writeJSONFile(FLASHCARDS_FILE, flashcards);
  if (!success) {
    return res.status(500).json({ error: 'Failed to save flashcard' });
  }

  res.status(201).json(newFlashcard);
});

app.put('/api/flashcards/:id', async (req, res) => {
  const { id } = req.params;
  const { question, answer, subject, difficulty, tags } = req.body;

  const flashcards = await readJSONFile(FLASHCARDS_FILE) || [];
  const cardIndex = flashcards.findIndex(card => card.id === id);

  if (cardIndex === -1) {
    return res.status(404).json({ error: 'Flashcard not found' });
  }

  flashcards[cardIndex] = {
    ...flashcards[cardIndex],
    question,
    answer,
    subject,
    difficulty,
    tags,
    updated: new Date().toISOString()
  };

  const success = await writeJSONFile(FLASHCARDS_FILE, flashcards);
  if (!success) {
    return res.status(500).json({ error: 'Failed to update flashcard' });
  }

  res.json(flashcards[cardIndex]);
});

app.delete('/api/flashcards/:id', async (req, res) => {
  const { id } = req.params;

  const flashcards = await readJSONFile(FLASHCARDS_FILE) || [];
  const filteredFlashcards = flashcards.filter(card => card.id !== id);

  if (filteredFlashcards.length === flashcards.length) {
    return res.status(404).json({ error: 'Flashcard not found' });
  }

  const success = await writeJSONFile(FLASHCARDS_FILE, filteredFlashcards);
  if (!success) {
    return res.status(500).json({ error: 'Failed to delete flashcard' });
  }

  res.json({ message: 'Flashcard deleted successfully' });
});

// Update flashcard review stats
app.post('/api/flashcards/:id/review', async (req, res) => {
  const { id } = req.params;
  const { correct } = req.body;

  const flashcards = await readJSONFile(FLASHCARDS_FILE) || [];
  const cardIndex = flashcards.findIndex(card => card.id === id);

  if (cardIndex === -1) {
    return res.status(404).json({ error: 'Flashcard not found' });
  }

  flashcards[cardIndex].timesReviewed += 1;
  if (correct) {
    flashcards[cardIndex].correctCount += 1;
  }
  flashcards[cardIndex].lastReviewed = new Date().toISOString();

  const success = await writeJSONFile(FLASHCARDS_FILE, flashcards);
  if (!success) {
    return res.status(500).json({ error: 'Failed to update review stats' });
  }

  res.json(flashcards[cardIndex]);
});

// Subjects endpoints
app.get('/api/subjects', async (req, res) => {
  const subjects = await readJSONFile(SUBJECTS_FILE);
  if (subjects === null) {
    return res.status(500).json({ error: 'Failed to read subjects' });
  }
  res.json(subjects);
});

app.post('/api/subjects', async (req, res) => {
  const { name, icon, color } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Subject name is required' });
  }

  const subjects = await readJSONFile(SUBJECTS_FILE) || [];

  const newSubject = {
    id: uuidv4(),
    name,
    icon: icon || 'BookOpen',
    color: color || 'bg-blue-500',
    created: new Date().toISOString(),
    flashcardCount: 0
  };

  subjects.push(newSubject);

  const success = await writeJSONFile(SUBJECTS_FILE, subjects);
  if (!success) {
    return res.status(500).json({ error: 'Failed to save subject' });
  }

  res.status(201).json(newSubject);
});

// Courses endpoints
app.get('/api/courses', async (req, res) => {
  const courses = await readJSONFile(COURSES_FILE);
  if (courses === null) {
    return res.status(500).json({ error: 'Failed to read courses' });
  }
  res.json(courses);
});

app.post('/api/courses', async (req, res) => {
  const { title, description, subject, difficulty, modules, tags, progress, isShared, author, totalTime } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required' });
  }

  const courses = await readJSONFile(COURSES_FILE) || [];

  const newCourse = {
    id: uuidv4(),
    title,
    description,
    subject: subject || 'general',
    difficulty: difficulty || 'beginner',
    modules: modules || [],
    tags: tags || [],
    created: new Date().toISOString(),
    lastAccessed: new Date().toISOString(),
    progress: progress || 0,
    isShared: isShared || false,
    author: author || 'User',
    totalTime: totalTime || 0
  };

  courses.push(newCourse);

  const success = await writeJSONFile(COURSES_FILE, courses);
  if (!success) {
    return res.status(500).json({ error: 'Failed to save course' });
  }

  res.status(201).json(newCourse);
});

app.put('/api/courses/:id', async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const courses = await readJSONFile(COURSES_FILE) || [];
  const courseIndex = courses.findIndex(course => course.id === id);

  if (courseIndex === -1) {
    return res.status(404).json({ error: 'Course not found' });
  }

  courses[courseIndex] = {
    ...courses[courseIndex],
    ...updateData,
    lastAccessed: new Date().toISOString()
  };

  const success = await writeJSONFile(COURSES_FILE, courses);
  if (!success) {
    return res.status(500).json({ error: 'Failed to update course' });
  }

  res.json(courses[courseIndex]);
});

app.delete('/api/courses/:id', async (req, res) => {
  const { id } = req.params;

  const courses = await readJSONFile(COURSES_FILE) || [];
  const initialLength = courses.length;
  const filteredCourses = courses.filter(course => course.id !== id);

  if (filteredCourses.length === initialLength) {
    return res.status(404).json({ error: 'Course not found' });
  }

  const success = await writeJSONFile(COURSES_FILE, filteredCourses);
  if (!success) {
    return res.status(500).json({ error: 'Failed to delete course' });
  }

  res.json({ message: 'Course deleted successfully' });
});

// Boss Challenges endpoints
app.get('/api/boss-challenges', async (req, res) => {
  const challenges = await readJSONFile(BOSS_CHALLENGES_FILE);
  if (challenges === null) {
    return res.status(500).json({ error: 'Failed to read boss challenges' });
  }
  res.json(challenges);
});

app.put('/api/boss-challenges/:id', async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const challenges = await readJSONFile(BOSS_CHALLENGES_FILE) || [];
  const challengeIndex = challenges.findIndex(challenge => challenge.id === id);

  if (challengeIndex === -1) {
    return res.status(404).json({ error: 'Boss challenge not found' });
  }

  challenges[challengeIndex] = {
    ...challenges[challengeIndex],
    ...updateData
  };

  const success = await writeJSONFile(BOSS_CHALLENGES_FILE, challenges);
  if (!success) {
    return res.status(500).json({ error: 'Failed to update boss challenge' });
  }

  res.json(challenges[challengeIndex]);
});

// Progress endpoints
app.get('/api/progress', async (req, res) => {
  const progress = await readJSONFile(PROGRESS_FILE);
  if (progress === null) {
    return res.status(500).json({ error: 'Failed to read progress' });
  }
  res.json(progress);
});

app.put('/api/progress', async (req, res) => {
  const updates = req.body;

  const currentProgress = await readJSONFile(PROGRESS_FILE) || {
    totalXP: 0,
    level: 1,
    streak: 0,
    lastActivity: null,
    completedSkills: [],
    achievements: []
  };

  const updatedProgress = { ...currentProgress, ...updates };

  const success = await writeJSONFile(PROGRESS_FILE, updatedProgress);
  if (!success) {
    return res.status(500).json({ error: 'Failed to update progress' });
  }

  res.json(updatedProgress);
});

// Chat endpoints
const CHATS_FILE = path.join(DATA_DIR, 'chats.json');

// Helper function to read chats
const readChats = async () => {
  try {
    const data = await fs.readFile(CHATS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return empty array
    return [];
  }
};

// Helper function to write chats
const writeChats = async (chats) => {
  try {
    await fs.writeFile(CHATS_FILE, JSON.stringify(chats, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing chats:', error);
    return false;
  }
};

// Get all chats
app.get('/api/chats', async (req, res) => {
  const chats = await readChats();
  res.json(chats);
});

// Get specific chat by ID
app.get('/api/chats/:id', async (req, res) => {
  const { id } = req.params;
  const chats = await readChats();
  const chat = chats.find(c => c.id === id);

  if (!chat) {
    return res.status(404).json({ error: 'Chat not found' });
  }

  res.json(chat);
});

// Create new chat
app.post('/api/chats', async (req, res) => {
  const { id, name, messages } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Chat ID is required' });
  }

  const chats = await readChats();

  const newChat = {
    id,
    name: name || 'New Chat',
    messages: messages || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  chats.push(newChat);

  const success = await writeChats(chats);
  if (!success) {
    return res.status(500).json({ error: 'Failed to save chat' });
  }

  res.status(201).json(newChat);
});

// Update chat
app.put('/api/chats/:id', async (req, res) => {
  const { id } = req.params;
  const { name, messages } = req.body;

  const chats = await readChats();
  const chatIndex = chats.findIndex(c => c.id === id);

  if (chatIndex === -1) {
    return res.status(404).json({ error: 'Chat not found' });
  }

  chats[chatIndex] = {
    ...chats[chatIndex],
    name: name || chats[chatIndex].name,
    messages: messages || chats[chatIndex].messages,
    updatedAt: new Date().toISOString()
  };

  const success = await writeChats(chats);
  if (!success) {
    return res.status(500).json({ error: 'Failed to update chat' });
  }

  res.json(chats[chatIndex]);
});

// Delete chat
app.delete('/api/chats/:id', async (req, res) => {
  const { id } = req.params;

  const chats = await readChats();
  const filteredChats = chats.filter(c => c.id !== id);

  if (filteredChats.length === chats.length) {
    return res.status(404).json({ error: 'Chat not found' });
  }

  const success = await writeChats(filteredChats);
  if (!success) {
    return res.status(500).json({ error: 'Failed to delete chat' });
  }

  res.json({ message: 'Chat deleted successfully' });
});

// Add message to chat
app.post('/api/chats/:id/messages', async (req, res) => {
  const { id } = req.params;
  const message = req.body;

  if (!message.content || !message.type) {
    return res.status(400).json({ error: 'Message content and type are required' });
  }

  const chats = await readChats();
  const chatIndex = chats.findIndex(c => c.id === id);

  if (chatIndex === -1) {
    return res.status(404).json({ error: 'Chat not found' });
  }

  const newMessage = {
    id: message.id || uuidv4(),
    type: message.type,
    content: message.content,
    timestamp: new Date().toISOString(),
    ...message
  };

  chats[chatIndex].messages.push(newMessage);
  chats[chatIndex].updatedAt = new Date().toISOString();

  const success = await writeChats(chats);
  if (!success) {
    return res.status(500).json({ error: 'Failed to add message' });
  }

  res.status(201).json(newMessage);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'STEM Forge Backend is running' });
});

app.listen(PORT, () => {
  console.log(`STEM Forge Backend running on http://localhost:${PORT}`);
});