const PYTHON_API_BASE_URL = 'http://localhost:3002/api/python';

export interface PythonAPIResponse<T = any> {
  data?: T;
  error?: string;
  timestamp?: string;
}

export interface OllamaStatus {
  connected: boolean;
  model_available: boolean;
  available_models: string[];
  current_model: string;
}

export const pythonAPI = {
  // Health check
  health: async (): Promise<PythonAPIResponse> => {
    try {
      const response = await fetch(`${PYTHON_API_BASE_URL}/health`);
      return await response.json();
    } catch (error) {
      return { error: `Failed to connect to Python backend: ${error}` };
    }
  },

  // Stream chat responses
  streamChat: async function* (
    prompt: string, 
    chatId: string = 'default', 
    history: any[] = []
  ): AsyncGenerator<string, void, unknown> {
    try {
      const response = await fetch(`${PYTHON_API_BASE_URL}/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, chat_id: chatId, history }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body reader');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.error) {
                  throw new Error(data.error);
                }
                if (data.chunk) {
                  yield data.chunk;
                }
                if (data.done) {
                  return;
                }
              } catch (parseError) {
                console.warn('Failed to parse streaming data:', parseError);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      yield `Error: ${error}`;
    }
  },

  // Simple chat (non-streaming)
  chatSimple: async (
    prompt: string, 
    history: any[] = []
  ): Promise<PythonAPIResponse<{ response: string }>> => {
    try {
      const response = await fetch(`${PYTHON_API_BASE_URL}/chat/simple`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, history }),
      });
      return await response.json();
    } catch (error) {
      return { error: `Chat request failed: ${error}` };
    }
  },

  // Explain flashcard
  explainFlashcard: async (
    question: string, 
    answer: string, 
    subject: string
  ): Promise<PythonAPIResponse<{ explanation: string }>> => {
    try {
      const response = await fetch(`${PYTHON_API_BASE_URL}/flashcard/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, answer, subject }),
      });
      return await response.json();
    } catch (error) {
      return { error: `Explanation request failed: ${error}` };
    }
  },

  // Generate study hints
  generateStudyHints: async (
    flashcards: any[], 
    subject: string
  ): Promise<PythonAPIResponse<{ hints: string }>> => {
    try {
      const response = await fetch(`${PYTHON_API_BASE_URL}/study/hints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flashcards, subject }),
      });
      return await response.json();
    } catch (error) {
      return { error: `Study hints request failed: ${error}` };
    }
  },

  // Explain concept
  explainConcept: async (
    concept: string, 
    subject: string, 
    difficulty: string = 'beginner'
  ): Promise<PythonAPIResponse<{ explanation: string }>> => {
    try {
      const response = await fetch(`${PYTHON_API_BASE_URL}/concept/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concept, subject, difficulty }),
      });
      return await response.json();
    } catch (error) {
      return { error: `Concept explanation request failed: ${error}` };
    }
  },

  // Generate practice problems
  generatePractice: async (
    topic: string, 
    subject: string, 
    count: number = 3
  ): Promise<PythonAPIResponse<{ problems: string }>> => {
    try {
      const response = await fetch(`${PYTHON_API_BASE_URL}/practice/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, subject, count }),
      });
      return await response.json();
    } catch (error) {
      return { error: `Practice generation request failed: ${error}` };
    }
  },

  // Get Ollama status
  getOllamaStatus: async (): Promise<PythonAPIResponse<OllamaStatus>> => {
    try {
      const response = await fetch(`${PYTHON_API_BASE_URL}/ollama/status`);
      return await response.json();
    } catch (error) {
      return { error: `Status request failed: ${error}` };
    }
  },

  // Test connection
  test: async (): Promise<PythonAPIResponse<{ test_passed: boolean }>> => {
    try {
      const response = await fetch(`${PYTHON_API_BASE_URL}/test`);
      return await response.json();
    } catch (error) {
      return { error: `Test request failed: ${error}` };
    }
  },
};