from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import json
import uuid
from datetime import datetime
import ollama_service
import chat_manager

app = FastAPI(title="STEM Forge Python Backend", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response validation
class ChatRequest(BaseModel):
    prompt: str
    chat_id: Optional[str] = "default"
    history: Optional[List[Dict[str, Any]]] = []

class ChatResponse(BaseModel):
    response: str
    timestamp: str

class FlashcardExplainRequest(BaseModel):
    question: str
    answer: str
    subject: Optional[str] = "General"

class StudyHintsRequest(BaseModel):
    flashcards: List[Dict[str, Any]]
    subject: Optional[str] = "General"

class ConceptExplainRequest(BaseModel):
    concept: str
    subject: Optional[str] = "General"
    difficulty: Optional[str] = "beginner"

class PracticeGenerateRequest(BaseModel):
    topic: str
    subject: Optional[str] = "General"
    count: Optional[int] = 3

class CourseGenerateRequest(BaseModel):
    topic: str
    subject: Optional[str] = "General"
    difficulty: Optional[str] = "beginner"
    lessons_count: Optional[int] = 4

class LessonGenerateRequest(BaseModel):
    lesson_title: str
    course_topic: str
    subject: Optional[str] = "General"
    difficulty: Optional[str] = "beginner"
    lesson_number: Optional[int] = 1

class HealthResponse(BaseModel):
    status: str
    message: str
    ollama_connected: bool
    model_available: bool

class OllamaStatusResponse(BaseModel):
    connected: bool
    model_available: bool
    available_models: List[str]
    current_model: str

@app.get("/api/python/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="OK",
        message="Python FastAPI backend is running",
        ollama_connected=ollama_service.check_ollama_connection(),
        model_available=ollama_service.check_model_availability()
    )

@app.post("/api/python/chat/stream")
async def chat_stream(request: ChatRequest):
    """Stream chat responses from Ollama"""
    if not request.prompt:
        raise HTTPException(status_code=400, detail="Prompt is required")
    
    async def generate():
        try:
            full_response = ""
            for chunk in ollama_service.ask_gemma_tutor(request.prompt, request.history):
                full_response += chunk
                # Send each chunk as Server-Sent Events
                yield f"data: {json.dumps({'chunk': chunk, 'done': False})}\n\n"
            
            # Send completion signal
            yield f"data: {json.dumps({'chunk': '', 'done': True, 'full_response': full_response})}\n\n"
            
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e), 'done': True})}\n\n"
    
    return StreamingResponse(generate(), media_type="text/plain")

@app.post("/api/python/chat/simple", response_model=ChatResponse)
async def chat_simple(request: ChatRequest):
    """Simple non-streaming chat endpoint"""
    if not request.prompt:
        raise HTTPException(status_code=400, detail="Prompt is required")
    
    try:
        response = ollama_service.ask_gemma_simple(request.prompt, request.history)
        return ChatResponse(
            response=response,
            timestamp=datetime.now().isoformat()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/python/flashcard/explain")
async def explain_flashcard(request: FlashcardExplainRequest):
    """Generate explanation for a flashcard"""
    try:
        explanation = ollama_service.generate_flashcard_explanation(
            request.question, request.answer, request.subject
        )
        return {
            "explanation": explanation,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/python/study/hints")
async def generate_study_hints(request: StudyHintsRequest):
    """Generate study hints for flashcards"""
    if not request.flashcards:
        raise HTTPException(status_code=400, detail="Flashcards are required")
    
    try:
        hints = ollama_service.generate_study_hints(request.flashcards, request.subject)
        return {
            "hints": hints,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/python/concept/explain")
async def explain_concept(request: ConceptExplainRequest):
    """Explain a concept simply"""
    try:
        explanation = ollama_service.explain_concept_simply(
            request.concept, request.subject, request.difficulty
        )
        return {
            "explanation": explanation,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/python/practice/generate")
async def generate_practice(request: PracticeGenerateRequest):
    """Generate practice problems"""
    try:
        problems = ollama_service.generate_practice_problems(
            request.topic, request.subject, request.count
        )
        return {
            "problems": problems,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/python/ollama/status", response_model=OllamaStatusResponse)
async def ollama_status():
    """Get Ollama service status"""
    try:
        return OllamaStatusResponse(
            connected=ollama_service.check_ollama_connection(),
            model_available=ollama_service.check_model_availability(),
            available_models=ollama_service.get_available_models(),
            current_model=ollama_service.MODEL
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/python/course/generate")
async def generate_course(request: CourseGenerateRequest):
    """Generate a complete course structure"""
    try:
        course_data = ollama_service.generate_course_structure(
            request.topic, request.subject, request.difficulty, request.lessons_count
        )
        return {
            "course": course_data,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/python/lesson/generate")
async def generate_lesson_content(request: LessonGenerateRequest):
    """Generate detailed content for a specific lesson"""
    try:
        lesson_content = ollama_service.generate_lesson_content(
            request.lesson_title, request.course_topic, request.subject, 
            request.difficulty, request.lesson_number
        )
        return {
            "content": lesson_content,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/python/test")
async def test_endpoint():
    """Test endpoint for debugging"""
    try:
        test_result = ollama_service.test_ollama_connection()
        return {
            "test_passed": test_result,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    
    print("Starting Python FastAPI backend server...")
    print("Testing Ollama connection...")
    
    if ollama_service.check_ollama_connection():
        print("✅ Ollama is connected")
        if ollama_service.check_model_availability():
            print(f"✅ Model {ollama_service.MODEL} is available")
        else:
            print(f"⚠️  Model {ollama_service.MODEL} is not available")
            print("Available models:", ollama_service.get_available_models())
    else:
        print("❌ Ollama is not connected")
        print("Please make sure Ollama is running: ollama serve")
    
    print(f"\nStarting FastAPI server on http://localhost:8000")
    print(f"API Documentation: http://localhost:8000/docs")
    print(f"Using model: {ollama_service.MODEL}")
    
    uvicorn.run(app, host="0.0.0.0", port=8000)