# Development Guide

## Quick Start

1. **Install all dependencies:**
   ```bash
   ./install.sh
   # or manually: npm run install:all
   ```

2. **Test the setup:**
   ```bash
   ./test.sh
   ```

3. **Start the application:**
   ```bash
   ./start.sh
   # or manually: npm start
   ```

4. **Access the app:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## Troubleshooting

If you encounter issues:

1. **Run diagnostics:**
   ```bash
   ./troubleshoot.sh
   ```

2. **Common fixes:**
   ```bash
   # Clean installation
   npm run clean
   ./install.sh
   
   # Kill processes on ports
   lsof -ti:3001,5173 | xargs kill
   
   # Check Node.js version (need v18+)
   node --version
   ```

## Project Architecture

### Backend (`/backend`)
- **Express.js** server providing REST API
- **JSON file storage** for offline functionality
- **CORS enabled** for frontend communication
- **Auto-restart** in development mode

### Frontend (`/frontend`)
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Radix UI** components for accessibility
- **React Router** for navigation

## Key Features Implemented

### ✅ Completed
- [x] Separated frontend/backend architecture
- [x] Removed all premade subjects and content
- [x] Moved Learning Hub to top of sidebar
- [x] Backend API for flashcards with JSON storage
- [x] Dynamic subject creation
- [x] Offline-first design
- [x] Clean project structure

### 🚧 In Progress
- [ ] Skill tree backend integration
- [ ] Course builder backend integration
- [ ] Progress tracking system
- [ ] AI tutor integration

## API Documentation

### Flashcards API

#### GET /api/flashcards
Returns all flashcards.

#### POST /api/flashcards
Create a new flashcard.
```json
{
  "question": "What is 2+2?",
  "answer": "4",
  "subject": "math",
  "difficulty": "easy",
  "tags": ["arithmetic", "basic"]
}
```

#### PUT /api/flashcards/:id
Update an existing flashcard.

#### DELETE /api/flashcards/:id
Delete a flashcard.

#### POST /api/flashcards/:id/review
Update review statistics.
```json
{
  "correct": true
}
```

### Subjects API

#### GET /api/subjects
Returns all user-created subjects.

#### POST /api/subjects
Create a new subject.
```json
{
  "name": "Advanced Mathematics",
  "icon": "Calculator",
  "color": "bg-blue-500"
}
```

### Progress API

#### GET /api/progress
Returns user progress data.

#### PUT /api/progress
Update user progress.
```json
{
  "totalXP": 1500,
  "level": 5,
  "streak": 7
}
```

## Data Storage

All data is stored in JSON files in `backend/data/`:

- `flashcards.json` - User flashcards with review stats
- `subjects.json` - User-defined subjects
- `progress.json` - Learning progress and achievements

## Development Commands

### Backend
```bash
cd backend
npm start          # Start server
npm run dev        # Start with auto-restart
```

### Frontend
```bash
cd frontend
npm run dev        # Start dev server
npm run build      # Build for production
npm run preview    # Preview production build
```

### Root
```bash
npm run install:all    # Install all dependencies
npm run dev:backend    # Start backend only
npm run dev:frontend   # Start frontend only
npm run build          # Build frontend
npm run clean          # Remove all node_modules
npm run troubleshoot   # Run diagnostics
npm run test:backend   # Test backend health
npm run test:frontend  # Test frontend health
```

### Helper Scripts
```bash
./install.sh          # Automated installation
./start.sh            # Start both servers
./test.sh             # Test setup
./troubleshoot.sh     # Diagnose issues
```

## File Structure

```
stem-tutor/
├── backend/
│   ├── data/
│   │   ├── flashcards.json
│   │   ├── subjects.json
│   │   └── progress.json
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.tsx          # Updated with dynamic subjects
│   │   │   ├── FlashcardBuilder.tsx # Backend integration
│   │   │   ├── SkillTree.tsx        # Cleaned of premade content
│   │   │   └── CourseBuilder.tsx    # Cleaned of premade content
│   │   ├── services/
│   │   │   └── api.ts               # API service layer
│   │   └── ...
│   ├── package.json
│   └── ...
├── package.json
├── start.sh
├── README.md
└── DEVELOPMENT.md
```

## Next Steps

1. **Integrate remaining components** with backend storage
2. **Add user authentication** (optional for offline use)
3. **Implement AI tutor** functionality
4. **Add data export/import** features
5. **Create mobile-responsive** design improvements
6. **Add offline service worker** for PWA capabilities

## Troubleshooting

### Backend won't start
- Check if port 3001 is available
- Ensure Node.js version is 18+
- Check backend/data directory exists

### Frontend won't connect to backend
- Verify backend is running on port 3001
- Check CORS configuration
- Ensure API_BASE_URL is correct in frontend/src/services/api.ts

### Data not persisting
- Check backend/data directory permissions
- Verify JSON files are valid
- Check server logs for write errors