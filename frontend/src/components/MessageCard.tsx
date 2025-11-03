import React from 'react';
import { User, Bot, Volume2, RotateCcw, Eye, Code, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Simple markdown formatter
const formatMarkdown = (text: string): string => {
  return text
    // Headers
    .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-4 mb-2">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
    
    // Bold and italic
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    
    // Code blocks
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-muted p-3 rounded-md overflow-x-auto my-2"><code class="text-sm">$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm font-mono">$1</code>')
    
    // Lists
    .replace(/^\* (.*$)/gm, '<li class="ml-4">• $1</li>')
    .replace(/^- (.*$)/gm, '<li class="ml-4">• $1</li>')
    .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 list-decimal">$1</li>')
    
    // Line breaks
    .replace(/\n\n/g, '</p><p class="mb-2">')
    .replace(/\n/g, '<br>')
    
    // Wrap in paragraph if not already wrapped
    .replace(/^(?!<[h|p|l|u|o|d])/, '<p class="mb-2">')
    .replace(/(?<!>)$/, '</p>');
};

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

interface MessageCardProps {
  message: Message;
}

export const MessageCard: React.FC<MessageCardProps> = ({ message }) => {
  const isUser = message.type === 'user';
  
  const handleExplainDifferently = (type: string) => {
    // This would trigger different explanation modes
    console.log(`Explain differently: ${type}`);
  };

  const handleReadAloud = () => {
    // This would use text-to-speech
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message.content);
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
        isUser 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-gradient-cosmic'
      }`}>
        {isUser ? (
          <User 
            className="h-5 w-5" 
            aria-hidden="true"
          />
        ) : (
          <Bot 
            className="h-5 w-5 text-white" 
            aria-hidden="true"
          />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        {/* Message Header */}
        <div className={`flex items-center gap-2 mb-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-sm font-medium">
            {isUser ? 'You' : 'STEM Forge'}
          </span>
          
          {message.subject && (
            <Badge variant="secondary" className="text-xs">
              {message.subject}
            </Badge>
          )}
          
          <span className="text-xs text-muted-foreground">
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>

        {/* Message Bubble */}
        <div 
          className={`${
            isUser 
              ? 'message-user' 
              : 'message-assistant'
          } max-w-full`}
          role="article"
          aria-label={`Message from ${isUser ? 'user' : 'STEM Forge'}`}
        >
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <div 
              dangerouslySetInnerHTML={{ 
                __html: formatMarkdown(message.content) 
              }} 
            />
            {message.isStreaming && (
              <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse" />
            )}
          </div>
          
          {/* Message badges for special content */}
          {(message.hasSteps || message.hasCode) && (
            <div className="flex gap-2 mt-3 pt-3 border-t border-border/50">
              {message.hasSteps && (
                <Badge variant="outline" className="text-xs">
                  <Lightbulb className="h-3 w-3 mr-1" />
                  Step-by-step
                </Badge>
              )}
              {message.hasCode && (
                <Badge variant="outline" className="text-xs">
                  <Code className="h-3 w-3 mr-1" />
                  Code example
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Assistant Message Actions */}
        {!isUser && (
          <div className="flex flex-wrap gap-2 mt-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs focus-ring"
              onClick={handleReadAloud}
              aria-label="Read message aloud"
            >
              <Volume2 className="h-3 w-3 mr-1" />
              Read aloud
            </Button>
            
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs focus-ring"
                onClick={() => handleExplainDifferently('simpler')}
              >
                Simpler
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs focus-ring"
                onClick={() => handleExplainDifferently('visual')}
              >
                <Eye className="h-3 w-3 mr-1" />
                Visual
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs focus-ring"
                onClick={() => handleExplainDifferently('example')}
              >
                Example
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};