import React from 'react';
import { Bot } from 'lucide-react';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex gap-3">
      {/* Avatar */}
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-cosmic flex items-center justify-center">
        <Bot className="h-5 w-5 text-white" aria-hidden="true" />
      </div>

      {/* Typing Animation */}
      <div className="message-assistant max-w-[200px]" role="status" aria-live="polite">
        <div className="flex items-center gap-1">
          <span className="text-sm text-muted-foreground">STEM Forge is thinking</span>
          <div className="flex gap-1 ml-2">
            <div 
              className="w-2 h-2 bg-primary rounded-full animate-typing-dots"
              style={{ animationDelay: '0ms' }}
            />
            <div 
              className="w-2 h-2 bg-primary rounded-full animate-typing-dots"
              style={{ animationDelay: '150ms' }}
            />
            <div 
              className="w-2 h-2 bg-primary rounded-full animate-typing-dots"
              style={{ animationDelay: '300ms' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};