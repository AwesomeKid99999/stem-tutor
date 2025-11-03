import React from 'react';
import { X, Sun, Moon, Contrast, Type, Minus, Plus, RotateCcw } from 'lucide-react';
import { useTheme, Theme, FontMode } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface ThemeSettingsProps {
  open: boolean;
  onClose: () => void;
}

export const ThemeSettings: React.FC<ThemeSettingsProps> = ({ open, onClose }) => {
  const { 
    theme, 
    fontMode, 
    fontSize, 
    reducedMotion,
    setTheme, 
    setFontMode, 
    setFontSize, 
    setReducedMotion 
  } = useTheme();

  const themes: { value: Theme; label: string; icon: React.ReactNode; description: string }[] = [
    { 
      value: 'light', 
      label: 'Light', 
      icon: <Sun className="h-4 w-4" />,
      description: 'Clean, bright interface'
    },
    { 
      value: 'dark', 
      label: 'Dark', 
      icon: <Moon className="h-4 w-4" />,
      description: 'Easy on the eyes in low light'
    },
    { 
      value: 'high-contrast', 
      label: 'High Contrast', 
      icon: <Contrast className="h-4 w-4" />,
      description: 'Maximum readability'
    },
  ];

  const fontModes: { value: FontMode; label: string; description: string }[] = [
    { 
      value: 'default', 
      label: 'Default Font', 
      description: 'Standard Inter font family'
    },
    { 
      value: 'dyslexic', 
      label: 'Dyslexia-Friendly', 
      description: 'Easier to read for dyslexic users'
    },
  ];

  const adjustFontSize = (delta: number) => {
    const newSize = Math.max(12, Math.min(24, fontSize + delta));
    setFontSize(newSize);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" aria-labelledby="settings-title">
        <DialogHeader>
          <DialogTitle id="settings-title" className="flex items-center gap-2">
            Accessibility & Theme Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Theme Selection */}
          <section aria-labelledby="theme-heading">
            <h3 id="theme-heading" className="text-lg font-semibold mb-4">
              Visual Theme
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {themes.map((themeOption) => (
                <Button
                  key={themeOption.value}
                  variant={theme === themeOption.value ? "default" : "outline"}
                  className={`h-auto p-4 flex flex-col items-center gap-2 focus-ring ${
                    theme === themeOption.value ? 'ring-2 ring-ring' : ''
                  }`}
                  onClick={() => setTheme(themeOption.value)}
                  aria-pressed={theme === themeOption.value}
                >
                  {themeOption.icon}
                  <div className="text-center">
                    <div className="font-medium">{themeOption.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {themeOption.description}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </section>

          <Separator />

          {/* Font Settings */}
          <section aria-labelledby="font-heading">
            <h3 id="font-heading" className="text-lg font-semibold mb-4">
              Font & Readability
            </h3>
            
            {/* Font Mode */}
            <div className="space-y-3 mb-6">
              {fontModes.map((mode) => (
                <div key={mode.value} className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id={`font-${mode.value}`}
                    name="fontMode"
                    value={mode.value}
                    checked={fontMode === mode.value}
                    onChange={(e) => setFontMode(e.target.value as FontMode)}
                    className="w-4 h-4 text-primary focus:ring-2 focus:ring-ring"
                  />
                  <Label htmlFor={`font-${mode.value}`} className="flex-1 cursor-pointer">
                    <div className="font-medium">{mode.label}</div>
                    <div className="text-sm text-muted-foreground">{mode.description}</div>
                  </Label>
                </div>
              ))}
            </div>

            {/* Font Size */}
            <div className="flex items-center justify-between">
              <Label htmlFor="font-size" className="text-sm font-medium">
                Font Size
              </Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => adjustFontSize(-2)}
                  disabled={fontSize <= 12}
                  aria-label="Decrease font size"
                  className="h-8 w-8 focus-ring"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-16 text-center text-sm font-medium">
                  {fontSize}px
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => adjustFontSize(2)}
                  disabled={fontSize >= 24}
                  aria-label="Increase font size"
                  className="h-8 w-8 focus-ring"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </section>

          <Separator />

          {/* Motion Settings */}
          <section aria-labelledby="motion-heading">
            <h3 id="motion-heading" className="text-lg font-semibold mb-4">
              Motion & Animation
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="reduced-motion" className="text-sm font-medium">
                  Reduce Motion
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Minimize animations and transitions for better focus
                </p>
              </div>
              <Switch
                id="reduced-motion"
                checked={reducedMotion}
                onCheckedChange={setReducedMotion}
                aria-describedby="motion-help"
              />
            </div>
          </section>

          <Separator />

          {/* Reset Settings */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => {
                setTheme('light');
                setFontMode('default');
                setFontSize(16);
                setReducedMotion(false);
              }}
              className="focus-ring"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
            
            <Button onClick={onClose} className="focus-ring">
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};