const OLLAMA_BASE_URL = 'http://localhost:11434';

export interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OllamaStreamResponse {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}

export class OllamaService {
  private static instance: OllamaService;
  private model = 'gemma3n';

  static getInstance(): OllamaService {
    if (!OllamaService.instance) {
      OllamaService.instance = new OllamaService();
    }
    return OllamaService.instance;
  }

  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
      return response.ok;
    } catch (error) {
      console.error('Ollama connection failed:', error);
      return false;
    }
  }

  async pullModel(model: string = this.model): Promise<void> {
    try {
      const response = await fetch(`${OLLAMA_BASE_URL}/api/pull`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: model }),
      });

      if (!response.ok) {
        throw new Error(`Failed to pull model: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to pull model:', error);
      throw error;
    }
  }

  async *streamChat(
    messages: OllamaMessage[],
    onToken?: (token: string) => void
  ): AsyncGenerator<string, void, unknown> {
    const systemPrompt: OllamaMessage = {
      role: 'system',
      content: `You are an expert STEM tutor specializing in Mathematics, Physics, Chemistry, Biology, Computer Science, and Engineering. Your teaching style is:

CORE PRINCIPLES:
- Be concise but thorough - aim for 2-4 sentences per response unless more detail is specifically requested
- Use clear, simple language appropriate for the student's level
- Break down complex concepts into digestible steps
- Provide practical examples and real-world applications
- Encourage critical thinking with follow-up questions
- Be patient, supportive, and encouraging

RESPONSE FORMAT:
- Start with a brief, direct answer
- Follow with a concise explanation
- End with a relevant example or follow-up question when appropriate
- Use bullet points or numbered lists for multi-step processes
- Include relevant formulas or code snippets when needed

SUBJECTS EXPERTISE:
- Mathematics: Algebra, Calculus, Statistics, Geometry, Discrete Math
- Physics: Mechanics, Thermodynamics, Electromagnetism, Quantum Physics
- Chemistry: Organic, Inorganic, Physical Chemistry, Biochemistry
- Biology: Cell Biology, Genetics, Ecology, Human Biology
- Computer Science: Programming, Algorithms, Data Structures, Software Engineering
- Engineering: Mechanical, Electrical, Civil, Chemical Engineering

TEACHING APPROACH:
- Assess the student's current understanding
- Provide step-by-step guidance
- Use analogies and visual descriptions
- Connect new concepts to previously learned material
- Offer practice problems or exercises when relevant
- Celebrate progress and learning milestones

Keep responses focused and actionable. If a topic requires extensive explanation, break it into smaller, manageable parts and ask if the student wants to continue with more detail.`
    };

    const allMessages = [systemPrompt, ...messages];

    try {
      const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: allMessages,
          stream: true,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            top_k: 40,
            repeat_penalty: 1.1,
            num_predict: 512, // Limit response length for conciseness
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body reader available');
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
            if (line.trim()) {
              try {
                const data: OllamaStreamResponse = JSON.parse(line);
                
                if (data.message?.content) {
                  const token = data.message.content;
                  onToken?.(token);
                  yield token;
                }

                if (data.done) {
                  return;
                }
              } catch (parseError) {
                console.warn('Failed to parse streaming response:', parseError);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('Streaming chat error:', error);
      throw error;
    }
  }

  async chat(messages: OllamaMessage[]): Promise<string> {
    let fullResponse = '';
    
    try {
      for await (const token of this.streamChat(messages)) {
        fullResponse += token;
      }
      return fullResponse;
    } catch (error) {
      console.error('Chat error:', error);
      throw error;
    }
  }

  async listModels(): Promise<string[]> {
    try {
      const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
      if (!response.ok) {
        throw new Error(`Failed to list models: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.models?.map((model: any) => model.name) || [];
    } catch (error) {
      console.error('Failed to list models:', error);
      return [];
    }
  }

  setModel(model: string): void {
    this.model = model;
  }

  getModel(): string {
    return this.model;
  }
}

export const ollamaService = OllamaService.getInstance();