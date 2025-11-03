import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'high-contrast';
export type FontMode = 'default' | 'dyslexic';

interface ThemeContextType {
  theme: Theme;
  fontMode: FontMode;
  fontSize: number;
  reducedMotion: boolean;
  dyslexiaMode: boolean;
  lineSpacing: number;
  setTheme: (theme: Theme) => void;
  setFontMode: (mode: FontMode) => void;
  setFontSize: (size: number) => void;
  setReducedMotion: (reduced: boolean) => void;
  setDyslexiaMode: (enabled: boolean) => void;
  setLineSpacing: (spacing: number) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('stem-tutor-theme');
    return (saved as Theme) || 'light';
  });
  
  const [fontMode, setFontMode] = useState<FontMode>(() => {
    const saved = localStorage.getItem('stem-tutor-font-mode');
    return (saved as FontMode) || 'default';
  });
  
  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem('stem-tutor-font-size');
    return saved ? parseInt(saved, 10) : 16;
  });
  
  const [reducedMotion, setReducedMotion] = useState(() => {
    const saved = localStorage.getItem('stem-tutor-reduced-motion');
    return saved ? JSON.parse(saved) : window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });
  
  const [dyslexiaMode, setDyslexiaMode] = useState(() => {
    const saved = localStorage.getItem('stem-tutor-dyslexia-mode');
    return saved ? JSON.parse(saved) : false;
  });
  
  const [lineSpacing, setLineSpacing] = useState(() => {
    const saved = localStorage.getItem('stem-tutor-line-spacing');
    return saved ? parseFloat(saved) : 1.5;
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Apply theme classes
    root.classList.remove('light', 'dark', 'high-contrast');
    root.classList.add(theme);
    
    // Apply font mode and dyslexia settings
    root.classList.remove('font-dyslexic', 'dyslexia-mode');
    if (fontMode === 'dyslexic' || dyslexiaMode) {
      root.classList.add('font-dyslexic');
      if (dyslexiaMode) {
        root.classList.add('dyslexia-mode');
      }
    }
    
    // Apply font size
    root.style.fontSize = `${fontSize}px`;
    
    // Apply dyslexia-friendly line spacing
    if (dyslexiaMode) {
      root.style.lineHeight = lineSpacing.toString();
    } else {
      root.style.lineHeight = '1.6';
    }
    
    // Apply motion preference
    if (reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
    
    // Save to localStorage
    localStorage.setItem('stem-tutor-theme', theme);
    localStorage.setItem('stem-tutor-font-mode', fontMode);
    localStorage.setItem('stem-tutor-font-size', fontSize.toString());
    localStorage.setItem('stem-tutor-reduced-motion', JSON.stringify(reducedMotion));
    localStorage.setItem('stem-tutor-dyslexia-mode', JSON.stringify(dyslexiaMode));
    localStorage.setItem('stem-tutor-line-spacing', lineSpacing.toString());
  }, [theme, fontMode, fontSize, reducedMotion, dyslexiaMode, lineSpacing]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        fontMode,
        fontSize,
        reducedMotion,
        dyslexiaMode,
        lineSpacing,
        setTheme,
        setFontMode,
        setFontSize,
        setReducedMotion,
        setDyslexiaMode,
        setLineSpacing,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};