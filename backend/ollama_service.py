import time
import json
import requests
from typing import Generator, Dict, Any, Optional

MODEL = "gemma3n"
OLLAMA_BASE_URL = "http://localhost:11434"

def check_ollama_connection() -> bool:
    """Check if Ollama service is running"""
    try:
        response = requests.get(f"{OLLAMA_BASE_URL}/api/tags")
        return response.status_code == 200
    except requests.exceptions.RequestException:
        return False

def pull_model(model: str = MODEL) -> bool:
    """Pull a model if it doesn't exist"""
    try:
        response = requests.post(
            f"{OLLAMA_BASE_URL}/api/pull",
            json={"name": model}
        )
        return response.status_code == 200
    except requests.exceptions.RequestException as e:
        print(f"Error pulling model: {e}")
        return False

def ask_gemma_tutor(prompt: str, conversation_history: list = None) -> Generator[str, None, None]:
    """
    Specialized function for AI tutor with streaming responses
    """
    system_prompt = {
        "role": "system",
        "content": (
            "You are an expert STEM tutor specializing in Mathematics, Physics, Chemistry, Biology, Computer Science, and Engineering. "
            "Your teaching style is concise, clear, and encouraging.\n\n"
            
            "**CORE PRINCIPLES:**\n"
            "- Be concise but thorough - aim for 2-4 sentences per response unless more detail is requested\n"
            "- Use clear, simple language appropriate for the student's level\n"
            "- Break down complex concepts into digestible steps\n"
            "- Provide practical examples and real-world applications\n"
            "- Encourage critical thinking with follow-up questions\n"
            "- Be patient, supportive, and encouraging\n\n"
            
            "**FORMATTING RULES:**\n"
            "1. Use proper markdown formatting for better readability\n"
            "2. Use **bold** for emphasis and important points\n"
            "3. Use `code` for code snippets, variables, and technical terms\n"
            "4. Use ```code blocks``` for multi-line code examples\n"
            "5. Use bullet points (• or -) for lists\n"
            "6. Use numbered lists for step-by-step instructions\n"
            "7. Add proper spacing between sections\n"
            "8. Use headers (##) to organize content when appropriate\n\n"
            
            "**RESPONSE RULES:**\n"
            "1. Start with a brief, direct answer\n"
            "2. Follow with a concise explanation\n"
            "3. End with a relevant example or follow-up question when appropriate\n"
            "4. Use bullet points or numbered lists for multi-step processes\n"
            "5. Include relevant formulas or code snippets when needed\n"
            "6. Keep responses focused and actionable\n"
            "7. If a topic requires extensive explanation, break it into smaller parts\n\n"
            
            "**SUBJECTS EXPERTISE:**\n"
            "- Mathematics: Algebra, Calculus, Statistics, Geometry, Discrete Math\n"
            "- Physics: Mechanics, Thermodynamics, Electromagnetism, Quantum Physics\n"
            "- Chemistry: Organic, Inorganic, Physical Chemistry, Biochemistry\n"
            "- Biology: Cell Biology, Genetics, Ecology, Human Biology\n"
            "- Computer Science: Programming, Algorithms, Data Structures, Software Engineering\n"
            "- Engineering: Mechanical, Electrical, Civil, Chemical Engineering\n\n"
            
            "Keep responses educational, encouraging, and appropriately detailed for the context."
        )
    }
    
    # Build message history
    messages = [system_prompt]
    
    # Add conversation history if provided
    if conversation_history:
        messages.extend(conversation_history)
    
    # Add current user message
    messages.append({"role": "user", "content": prompt})
    
    try:
        response = requests.post(
            f"{OLLAMA_BASE_URL}/api/chat",
            json={
                "model": MODEL,
                "messages": messages,
                "stream": True,
                "options": {
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "top_k": 40,
                    "repeat_penalty": 1.1,
                    "num_predict": 512,  # Limit for conciseness
                }
            },
            stream=True
        )
        
        if response.status_code != 200:
            yield f"Error: Ollama API returned status {response.status_code}"
            return
            
        for line in response.iter_lines():
            if line:
                try:
                    data = json.loads(line.decode('utf-8'))
                    if 'message' in data and 'content' in data['message']:
                        content = data['message']['content']
                        if content:
                            yield content
                    
                    if data.get('done', False):
                        break
                        
                except json.JSONDecodeError:
                    continue
                    
    except requests.exceptions.RequestException as e:
        yield f"Error connecting to Ollama: {str(e)}"
    except Exception as e:
        yield f"Unexpected error: {str(e)}"

def ask_gemma_simple(prompt: str, conversation_history: list = None) -> str:
    """
    Non-streaming version for simple responses
    """
    full_response = ""
    try:
        for chunk in ask_gemma_tutor(prompt, conversation_history):
            full_response += chunk
        return full_response
    except Exception as e:
        return f"Error: {str(e)}"

def generate_flashcard_explanation(question: str, answer: str, subject: str) -> str:
    """
    Generate a detailed explanation for a flashcard
    """
    prompt = f"""
    As a STEM tutor, provide a clear, educational explanation for this flashcard:
    
    **Subject:** {subject}
    **Question:** {question}
    **Answer:** {answer}
    
    Please explain:
    1. Why this answer is correct
    2. Key concepts involved
    3. A practical example or application
    4. Common mistakes students make with this topic
    
    Keep it concise but educational (2-3 paragraphs maximum).
    """
    
    return ask_gemma_simple(prompt)

def generate_study_hints(flashcards: list, subject: str) -> str:
    """
    Generate study hints based on a collection of flashcards
    """
    questions = [card.get('question', '') for card in flashcards[:5]]  # Limit to 5 for context
    
    prompt = f"""
    As a STEM tutor, provide study tips for these {subject} topics:
    
    {chr(10).join([f"• {q}" for q in questions if q])}
    
    Give 3-4 practical study tips that would help students master these concepts.
    Focus on effective learning strategies, common connections between topics, and memory techniques.
    """
    
    return ask_gemma_simple(prompt)

def explain_concept_simply(concept: str, subject: str, difficulty: str = "beginner") -> str:
    """
    Explain a concept in simple terms
    """
    prompt = f"""
    Explain the concept of "{concept}" in {subject} for a {difficulty} level student.
    
    Requirements:
    - Use simple, clear language
    - Provide a real-world analogy if possible
    - Give a practical example
    - Keep it under 150 words
    """
    
    return ask_gemma_simple(prompt)

def generate_practice_problems(topic: str, subject: str, count: int = 3) -> str:
    """
    Generate practice problems for a given topic
    """
    prompt = f"""
    Create {count} practice problems for the topic "{topic}" in {subject}.
    
    For each problem:
    1. State the problem clearly
    2. Provide the solution
    3. Explain the key steps
    
    Make problems progressively more challenging.
    Format with clear numbering and spacing.
    """
    
    return ask_gemma_simple(prompt)

def generate_course_structure(topic: str, subject: str = "General", difficulty: str = "beginner", lessons_count: int = 4) -> dict:
    """
    Generate a complete course structure with lessons
    """
    prompt = f"""
    Create a structured {difficulty}-level course on "{topic}" in {subject} with {lessons_count} lessons.
    
    Return a JSON structure with:
    {{
        "title": "Course Title",
        "description": "Brief course description",
        "lessons": [
            {{
                "id": 1,
                "title": "Lesson Title",
                "description": "Lesson description",
                "duration": "estimated minutes",
                "objectives": ["objective1", "objective2"]
            }}
        ]
    }}
    
    Make lessons progressive, building on each other.
    Focus on practical, hands-on learning.
    """
    
    response = ask_gemma_simple(prompt)
    
    # Try to extract JSON from response
    try:
        import re
        json_match = re.search(r'\{.*\}', response, re.DOTALL)
        if json_match:
            import json
            return json.loads(json_match.group())
    except:
        pass
    
    # Fallback: return structured data
    return {
        "title": f"{topic} Course",
        "description": f"A comprehensive {difficulty}-level course on {topic}",
        "lessons": [
            {
                "id": i+1,
                "title": f"Lesson {i+1}: Introduction to {topic}" if i == 0 else f"Lesson {i+1}: Advanced {topic}",
                "description": f"Learn the fundamentals of {topic}",
                "duration": "30-45 minutes",
                "objectives": [f"Understand {topic} basics", f"Apply {topic} concepts"]
            }
            for i in range(lessons_count)
        ]
    }

def generate_lesson_content(lesson_title: str, course_topic: str, subject: str = "General", difficulty: str = "beginner", lesson_number: int = 1) -> str:
    """
    Generate detailed content for a specific lesson
    """
    prompt = f"""
    Create comprehensive lesson content for:
    
    **Course:** {course_topic} ({subject})
    **Lesson {lesson_number}:** {lesson_title}
    **Level:** {difficulty}
    
    Structure the lesson with these sections:
    
    ## Learning Objectives
    - Clear, measurable objectives
    
    ## Introduction
    - Hook to engage students
    - Connection to previous lessons
    
    ## Core Content
    ### Part 1: Fundamentals (25%)
    - Basic concepts and definitions
    - Simple examples
    
    ### Part 2: Building Understanding (50%)
    - Detailed explanations
    - Step-by-step examples
    - Common misconceptions
    
    ### Part 3: Application (75%)
    - Practice problems
    - Real-world applications
    
    ### Part 4: Mastery (100%)
    - Advanced concepts
    - Challenge problems
    - Synthesis with other topics
    
    ## Summary
    - Key takeaways
    - Preview of next lesson
    
    ## Practice Exercises
    - 3-5 problems with solutions
    
    Use proper markdown formatting, include examples, and make it engaging for {difficulty} level students.
    Keep each part focused and build progressively.
    """
    
    return ask_gemma_simple(prompt)

def check_model_availability(model: str = MODEL) -> bool:
    """
    Check if a specific model is available locally
    """
    try:
        response = requests.get(f"{OLLAMA_BASE_URL}/api/tags")
        if response.status_code == 200:
            models = response.json().get('models', [])
            return any(model in m.get('name', '') for m in models)
        return False
    except requests.exceptions.RequestException:
        return False

def get_available_models() -> list:
    """
    Get list of available models
    """
    try:
        response = requests.get(f"{OLLAMA_BASE_URL}/api/tags")
        if response.status_code == 200:
            models = response.json().get('models', [])
            return [m.get('name', '') for m in models]
        return []
    except requests.exceptions.RequestException:
        return []

# Test function
def test_ollama_connection():
    """
    Test the Ollama connection and model availability
    """
    print("Testing Ollama connection...")
    
    if not check_ollama_connection():
        print("❌ Ollama service is not running")
        return False
    
    print("✅ Ollama service is running")
    
    if not check_model_availability():
        print(f"❌ Model {MODEL} is not available")
        print("Available models:", get_available_models())
        return False
    
    print(f"✅ Model {MODEL} is available")
    
    # Test a simple query
    try:
        print("Testing simple query...")
        response = ask_gemma_simple("What is 2+2?")
        if response and not response.startswith("Error"):
            print("✅ Query test successful")
            print(f"Response: {response[:100]}...")
            return True
        else:
            print("❌ Query test failed")
            return False
    except Exception as e:
        print(f"❌ Query test error: {e}")
        return False

if __name__ == "__main__":
    test_ollama_connection()