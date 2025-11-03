import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Upload, Image, RotateCcw, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageCard } from '@/components/MessageCard';
import { TypingIndicator } from '@/components/TypingIndicator';
import { useToast } from '@/hooks/use-toast';
import { ollamaService, type OllamaMessage } from '@/services/ollama';
import { chatAPI, type Chat, type ChatMessage } from '@/services/chat';
import { pythonAPI } from '@/services/python-api';
import { Badge } from '@/components/ui/badge';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  subject?: string;
  hasSteps?: boolean;
  hasCode?: boolean;
  isStreaming?: boolean;
}

const initialMessages: Message[] = [
  {
    id: '1',
    type: 'assistant',
    content: "🌟 Welcome to your STEM Forge! I'm here to help you master mathematics, coding, physics, biology, chemistry, and engineering. What would you like to explore today?",
    timestamp: new Date(),
    subject: 'welcome'
  },
];

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [ollamaConnected, setOllamaConnected] = useState<boolean | null>(null);
  const [pythonBackendAvailable, setPythonBackendAvailable] = useState<boolean | null>(null);
  const [currentStreamingId, setCurrentStreamingId] = useState<string | null>(null);
  const [currentChatId, setCurrentChatId] = useState<string>('default-chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    checkOllamaConnection();
    loadOrCreateChat();
  }, []);

  const loadOrCreateChat = async () => {
    try {
      // Try to load existing chat
      const chat = await chatAPI.getById(currentChatId);
      const chatMessages = chat.messages.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
      setMessages([...initialMessages, ...chatMessages]);
    } catch (error) {
      // Chat doesn't exist, create it
      try {
        await chatAPI.create({
          id: currentChatId,
          name: 'STEM Forge Chat',
          messages: []
        });
      } catch (createError) {
        console.error('Failed to create chat:', createError);
      }
    }
  };

  const checkOllamaConnection = async () => {
    try {
      // Check Python backend first
      const pythonHealth = await pythonAPI.health();
      const pythonAvailable = !pythonHealth.error;
      setPythonBackendAvailable(pythonAvailable);
      
      if (pythonAvailable) {
        // Python backend is available, check Ollama through it
        const status = await pythonAPI.getOllamaStatus();
        setOllamaConnected(status.data?.connected || false);
        
        if (!status.data?.connected) {
          console.log('Ollama not connected through Python backend');
        }
      } else {
        console.log('Python backend not available, checking direct Ollama connection');
        // Fall back to direct Ollama connection
        const connected = await ollamaService.checkConnection();
        setOllamaConnected(connected);
        
        if (!connected) {
          console.log('Direct Ollama connection also failed');
        }
      }
      
      // Only show error if both services are unavailable
      if (!pythonAvailable && !ollamaConnected) {
        toast({
          title: "AI Services Unavailable",
          description: "Please start Ollama server (ollama serve) or the Python backend",
          variant: "destructive",
        });
      }
    } catch (error) {
      setOllamaConnected(false);
      setPythonBackendAvailable(false);
      console.error('Failed to check AI service connection:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Check AI service availability
    if (ollamaConnected === false && pythonBackendAvailable === false) {
      toast({
        title: "AI Service Not Available",
        description: "Please start Ollama server or Python backend and try again.",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      type: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
      hasCode: inputValue.toLowerCase().includes('code') || inputValue.toLowerCase().includes('program'),
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setInputValue('');
    setIsTyping(true);
    setCurrentStreamingId(assistantMessageId);

    // Save user message to backend
    try {
      await chatAPI.addMessage(currentChatId, {
        type: 'user',
        content: inputValue,
        hasCode: inputValue.toLowerCase().includes('code') || inputValue.toLowerCase().includes('program'),
      });
    } catch (error) {
      console.error('Failed to save user message:', error);
    }

    try {
      let fullResponse = '';

      // Use Python backend if available, otherwise fall back to direct Ollama
      if (pythonBackendAvailable) {
        // Convert messages to history format for Python backend
        const conversationHistory = messages
          .filter(msg => msg.type !== 'assistant' || !msg.subject) // Exclude welcome message
          .map(msg => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content,
          }));

        // Stream the response from Python backend
        for await (const token of pythonAPI.streamChat(inputValue, currentChatId, conversationHistory)) {
          fullResponse += token;
          
          setMessages(prev => prev.map(msg => 
            msg.id === assistantMessageId 
              ? { ...msg, content: fullResponse }
              : msg
          ));
        }
      } else {
        // Fall back to direct Ollama connection
        const ollamaMessages: OllamaMessage[] = messages
          .filter(msg => msg.type !== 'assistant' || !msg.subject) // Exclude welcome message
          .map(msg => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content,
          }));

        // Add current user message
        ollamaMessages.push({
          role: 'user',
          content: inputValue,
        });

        // Stream the response
        for await (const token of ollamaService.streamChat(ollamaMessages)) {
          fullResponse += token;
          
          setMessages(prev => prev.map(msg => 
            msg.id === assistantMessageId 
              ? { ...msg, content: fullResponse }
              : msg
          ));
        }
      }

      // Mark streaming as complete
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { ...msg, isStreaming: false }
          : msg
      ));

      // Save assistant message to backend
      try {
        await chatAPI.addMessage(currentChatId, {
          type: 'assistant',
          content: fullResponse,
          hasCode: fullResponse.toLowerCase().includes('code') || fullResponse.toLowerCase().includes('```'),
          hasSteps: fullResponse.includes('step') || fullResponse.includes('1.') || fullResponse.includes('2.'),
        });
      } catch (error) {
        console.error('Failed to save assistant message:', error);
      }

    } catch (error) {
      console.error('Failed to get response from AI service:', error);
      
      const errorMessage = pythonBackendAvailable 
        ? "I'm having trouble connecting to the AI service through the Python backend. Please check if Ollama is running and the gemma3n model is available."
        : "I'm having trouble connecting to the AI service. Please make sure Ollama is running with 'ollama serve' and the gemma3n model is installed.";
      
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { 
              ...msg, 
              content: errorMessage,
              isStreaming: false 
            }
          : msg
      ));

      toast({
        title: "AI Response Error",
        description: "Connection failed. Try refreshing the connection or check the setup.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
      setCurrentStreamingId(null);
    }
  };



  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceInput = () => {
    setIsListening(!isListening);
    if (!isListening) {
      toast({
        title: "Voice Input",
        description: "Voice input would be activated here with proper speech recognition.",
      });
    }
  };

  const handleFileUpload = () => {
    toast({
      title: "File Upload",
      description: "File upload functionality would allow you to share code, images, or documents.",
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Messages Area */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4"
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {messages.map((message) => (
          <MessageCard key={message.id} message={message} />
        ))}
        
        {isTyping && <TypingIndicator />}
        
        {/* Service Unavailable Message */}
        {(!ollamaConnected && !pythonBackendAvailable) && (
          <div className="flex items-center justify-center p-6">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-destructive mb-2">AI Services Not Available</h3>
              <p className="text-sm text-muted-foreground mb-4">
                To use the AI tutor, you need either Ollama or the Python backend running.
              </p>
              <div className="space-y-2 text-sm text-left">
                <p><strong>Option 1:</strong> Start Ollama server</p>
                <code className="block bg-muted p-2 rounded text-xs">ollama serve</code>
                <p><strong>Option 2:</strong> Use the startup script</p>
                <code className="block bg-muted p-2 rounded text-xs">start.bat</code>
              </div>
              <Button 
                onClick={checkOllamaConnection} 
                className="mt-4"
                size="sm"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Check Again
              </Button>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-card/50 backdrop-blur-sm p-4">
        <div className="max-w-4xl mx-auto">
          {/* Connection Status */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {ollamaConnected === null ? (
                <Badge variant="outline" className="text-xs">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1 animate-pulse" />
                  Checking AI services...
                </Badge>
              ) : pythonBackendAvailable ? (
                <Badge variant="outline" className="text-xs text-green-700 border-green-200">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Python Backend + Ollama
                </Badge>
              ) : ollamaConnected ? (
                <Badge variant="outline" className="text-xs text-blue-700 border-blue-200">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Direct Ollama (gemma3n)
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs text-red-700 border-red-200">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  AI Services Unavailable
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={checkOllamaConnection}
                className="text-xs"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Refresh
              </Button>
              
              {(!ollamaConnected && !pythonBackendAvailable) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toast({
                      title: "Setup Instructions",
                      description: "1. Run 'ollama serve' in terminal, or 2. Start Python backend with start.bat",
                    });
                  }}
                  className="text-xs"
                >
                  Help
                </Button>
              )}
            </div>
          </div>
          <div className="flex gap-2 mb-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs focus-ring"
              onClick={() => setInputValue("Explain quadratic equations")}
            >
              Explain quadratic equations
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs focus-ring"
              onClick={() => setInputValue("Help me debug this Python code")}
            >
              Debug Python code
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs focus-ring"
              onClick={() => setInputValue("What is photosynthesis?")}
            >
              What is photosynthesis?
            </Button>
          </div>
          
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                id="chat-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about STEM subjects..."
                className="min-h-[44px] max-h-32 resize-none focus-ring pr-20"
                aria-label="Chat input"
              />
              
              <div className="absolute right-2 bottom-2 flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 focus-ring"
                  onClick={handleFileUpload}
                  aria-label="Upload file"
                >
                  <Upload className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 focus-ring ${isListening ? 'text-red-500' : ''}`}
                  onClick={handleVoiceInput}
                  aria-label={isListening ? "Stop voice input" : "Start voice input"}
                >
                  <Mic className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className="btn-cosmic h-11 px-6 focus-ring"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};