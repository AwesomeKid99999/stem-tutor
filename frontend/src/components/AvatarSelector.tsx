import React, { useState } from 'react';
import { Check, Sparkles, Crown, Zap } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface AvatarSelectorProps {
  open: boolean;
  onClose: () => void;
}

interface AvatarItem {
  id: string;
  name: string;
  category: 'basic' | 'earned' | 'premium' | 'seasonal';
  emoji: string;
  unlocked: boolean;
  requirement?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface BackgroundItem {
  id: string;
  name: string;
  gradient: string;
  unlocked: boolean;
  requirement?: string;
}

const avatars: AvatarItem[] = [
  { id: 'student', name: 'Student', category: 'basic', emoji: '🧑‍🎓', unlocked: true, rarity: 'common' },
  { id: 'scientist', name: 'Scientist', category: 'basic', emoji: '🧑‍🔬', unlocked: true, rarity: 'common' },
  { id: 'engineer', name: 'Engineer', category: 'basic', emoji: '🧑‍💻', unlocked: true, rarity: 'common' },
  { id: 'mathematician', name: 'Mathematician', category: 'earned', emoji: '🧮', unlocked: false, requirement: 'Complete 10 math lessons', rarity: 'rare' },
  { id: 'astronaut', name: 'Astronaut', category: 'earned', emoji: '🧑‍🚀', unlocked: false, requirement: 'Master Physics Tree', rarity: 'epic' },
  { id: 'wizard', name: 'Code Wizard', category: 'earned', emoji: '🧙‍♂️', unlocked: false, requirement: '100 coding problems solved', rarity: 'legendary' },
  { id: 'robot', name: 'Cyber Bot', category: 'seasonal', emoji: '🤖', unlocked: false, requirement: 'Winter Challenge 2024', rarity: 'epic' }
];

const backgrounds: BackgroundItem[] = [
  { id: 'space', name: 'Deep Space', gradient: 'linear-gradient(135deg, #0f0f23, #1a1a3e, #2a2a5e)', unlocked: true },
  { id: 'lab', name: 'Lab Bench', gradient: 'linear-gradient(135deg, #1e3a8a, #3b82f6, #60a5fa)', unlocked: true },
  { id: 'forest', name: 'Code Forest', gradient: 'linear-gradient(135deg, #064e3b, #059669, #10b981)', unlocked: false, requirement: 'Complete 5 biology topics' },
  { id: 'neon', name: 'Neon City', gradient: 'linear-gradient(135deg, #7c3aed, #a855f7, #c084fc)', unlocked: false, requirement: 'Reach Level 10' },
  { id: 'aurora', name: 'Aurora Borealis', gradient: 'linear-gradient(135deg, #1e40af, #7c3aed, #ec4899)', unlocked: false, requirement: 'Master any skill tree' }
];

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({ open, onClose }) => {
  const [selectedAvatar, setSelectedAvatar] = useState('student');
  const [selectedBackground, setSelectedBackground] = useState('space');

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-500';
      case 'rare': return 'text-blue-500';
      case 'epic': return 'text-purple-500';
      case 'legendary': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'rare': return <Sparkles className="h-3 w-3" />;
      case 'epic': return <Crown className="h-3 w-3" />;
      case 'legendary': return <Zap className="h-3 w-3" />;
      default: return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">👤</span>
            Avatar & Style Customization
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preview */}
          <div className="flex justify-center">
            <div 
              className="w-32 h-32 rounded-2xl flex items-center justify-center text-6xl shadow-glow"
              style={{ background: backgrounds.find(b => b.id === selectedBackground)?.gradient }}
            >
              {avatars.find(a => a.id === selectedAvatar)?.emoji}
            </div>
          </div>

          {/* Avatar Selection */}
          <section>
            <h3 className="text-lg font-semibold mb-4">Choose Your Avatar</h3>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {avatars.map((avatar) => (
                <Button
                  key={avatar.id}
                  variant={selectedAvatar === avatar.id ? "default" : "outline"}
                  className={`h-20 p-2 flex flex-col items-center gap-1 relative ${
                    !avatar.unlocked ? 'opacity-50' : ''
                  } ${selectedAvatar === avatar.id ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => avatar.unlocked && setSelectedAvatar(avatar.id)}
                  disabled={!avatar.unlocked}
                >
                  <div className="text-2xl">{avatar.emoji}</div>
                  <div className="text-xs text-center font-medium">{avatar.name}</div>
                  
                  {/* Rarity indicator */}
                  <div className={`absolute top-1 right-1 ${getRarityColor(avatar.rarity)}`}>
                    {getRarityIcon(avatar.rarity)}
                  </div>
                  
                  {selectedAvatar === avatar.id && avatar.unlocked && (
                    <Check className="absolute -top-2 -right-2 h-5 w-5 bg-primary text-primary-foreground rounded-full p-1" />
                  )}
                  
                  {!avatar.unlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded">
                      <div className="text-xs text-center p-1 text-muted-foreground">
                        🔒
                      </div>
                    </div>
                  )}
                </Button>
              ))}
            </div>
            
            {/* Unlock Requirements */}
            <div className="mt-4 space-y-2">
              {avatars.filter(a => !a.unlocked).map(avatar => (
                <div key={avatar.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{avatar.emoji}</span>
                  <span className="font-medium">{avatar.name}:</span>
                  <span>{avatar.requirement}</span>
                  <Badge variant="outline" className={getRarityColor(avatar.rarity)}>
                    {avatar.rarity}
                  </Badge>
                </div>
              ))}
            </div>
          </section>

          <Separator />

          {/* Background Selection */}
          <section>
            <h3 className="text-lg font-semibold mb-4">Choose Your Background</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {backgrounds.map((bg) => (
                <Button
                  key={bg.id}
                  variant="outline"
                  className={`h-20 p-0 relative overflow-hidden ${
                    !bg.unlocked ? 'opacity-50' : ''
                  } ${selectedBackground === bg.id ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => bg.unlocked && setSelectedBackground(bg.id)}
                  disabled={!bg.unlocked}
                >
                  <div 
                    className="w-full h-full flex items-center justify-center text-white font-medium"
                    style={{ background: bg.gradient }}
                  >
                    {bg.name}
                  </div>
                  
                  {selectedBackground === bg.id && bg.unlocked && (
                    <Check className="absolute top-1 right-1 h-5 w-5 bg-primary text-primary-foreground rounded-full p-1" />
                  )}
                  
                  {!bg.unlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                      🔒
                    </div>
                  )}
                </Button>
              ))}
            </div>
            
            {/* Unlock Requirements */}
            <div className="mt-4 space-y-2">
              {backgrounds.filter(b => !b.unlocked).map(bg => (
                <div key={bg.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-medium">{bg.name}:</span>
                  <span>{bg.requirement}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onClose} className="bg-gradient-cosmic text-white">
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};