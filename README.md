# STEM Tutor - Offline Learning Platform

A fully offline STEM learning platform with AI tutoring, flashcards, skill trees, and course building capabilities. All data is stored locally in JSON files.

## Project Structure

```
├── backend/                 # Node.js backend server
│   ├── data/               # JSON data storage
│   │   ├── flashcards.json # User flashcards
│   │   ├── subjects.json   # User-created subjects
│   │   └── progress.json   # Learning progress
│   ├── package.json
│   └── server.js           # Express server
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API service layer
│   │   └── ...
│   ├── package.json
│   └── ...
└── README.md
```

## Features

- **Fully Offline**: All data stored locally in JSON files
- **Dynamic Content**: No premade subjects - everything is user-generated
- **Flashcard System**: Create, edit, and review flashcards with backend storage
- **Skill Tree**: Build custom learning paths
- **Course Builder**: Create structured learning courses
- **Progress Tracking**: Track XP, levels, and achievements
- **AI Tutor Chat**: Interactive learning assistance
- **Learning Games**: Gamified learning experiences

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (comes with Node.js)

### Quick Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stem-tutor
   ```

2. **Run the installation script**
   ```bash
   ./install.sh
   ```

3. **Start the application**
   ```bash
   ./start.sh
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

### Quick Fix for Common Errors

If you're getting **EACCES** (permission) or **ERESOLVE** (dependency) errors:

```bash
./quick-fix.sh    # Fixes npm permissions and dependency conflicts
./start.sh        # Start the application
```

### Manual Installation (if scripts don't work)

1. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

3. **Start Backend Server**
   ```bash
   cd backend
   npm start
   ```

4. **Start Frontend Server (in new terminal)**
   ```bash
   cd frontend
   npm run dev
   ```

### Troubleshooting

If you encounter issues, we have comprehensive troubleshooting tools:

1. **Quick diagnostics:**
   ```bash
   ./troubleshoot.sh
   ```

2. **Fix package installation issues:**
   ```bash
   ./fix-packages.sh
   ```

3. **Test your setup:**
   ```bash
   ./test.sh
   ```

4. **Common issues and fixes:**
   - **npm permission errors (EACCES)**: Run `./fix-permissions.sh`
   - **React dependency conflicts (ERESOLVE)**: Run `./quick-fix.sh`
   - **Package installation fails**: Run `./fix-packages.sh`
   - **Port already in use**: Kill processes with `lsof -ti:3001,5173 | xargs kill`
   - **Node.js version too old**: Install Node.js v18+ from https://nodejs.org/
   - **Permission denied on scripts**: Run `chmod +x *.sh`
   - **Network/firewall issues**: See [SETUP.md](SETUP.md) for detailed solutions

5. **Complete setup guide:**
   See [SETUP.md](SETUP.md) for comprehensive installation and troubleshooting instructions.

6. **Clean installation:**
   ```bash
   npm run clean
   ./install.sh
   ```

## API Endpoints

### Flashcards
- `GET /api/flashcards` - Get all flashcards
- `POST /api/flashcards` - Create a new flashcard
- `PUT /api/flashcards/:id` - Update a flashcard
- `DELETE /api/flashcards/:id` - Delete a flashcard
- `POST /api/flashcards/:id/review` - Update review statistics

### Subjects
- `GET /api/subjects` - Get all subjects
- `POST /api/subjects` - Create a new subject

### Progress
- `GET /api/progress` - Get user progress
- `PUT /api/progress` - Update user progress

## Data Storage

All data is stored in JSON files in the `backend/data/` directory:

- **flashcards.json**: User-created flashcards with review statistics
- **subjects.json**: User-defined subjects for organizing content
- **progress.json**: User progress including XP, level, and achievements

## Key Changes Made

1. **Removed Premade Content**: All hardcoded subjects and content removed
2. **Learning Hub Repositioned**: Moved to top of sidebar for better UX
3. **Backend Integration**: Added Express server with JSON file storage
4. **Dynamic Subject Creation**: Users can create their own subjects
5. **Offline-First Design**: Everything works without internet connection
6. **Organized Structure**: Separated frontend and backend into distinct folders

## Development

### Backend Development
```bash
cd backend
npm run dev  # Runs with --watch flag for auto-restart
```

### Frontend Development
```bash
cd frontend
npm run dev  # Vite dev server with hot reload
```

### Building for Production
```bash
cd frontend
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.