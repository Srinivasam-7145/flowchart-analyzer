import { Volume2, VolumeX } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ExplanationCardProps {
  term: string;
  explanation: string;
  index: number;
}

export const ExplanationCard = ({ term, explanation, index }: ExplanationCardProps) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(`${term}: ${explanation}`);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <Card 
      className="p-6 space-y-3 hover:shadow-medium transition-all duration-300 hover:scale-[1.02] border-border/50"
      style={{ 
        animationDelay: `${index * 0.1}s`,
        animation: 'fadeInUp 0.5s ease-out backwards'
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {term}
          </h3>
          <p className="text-foreground/80 leading-relaxed">
            {explanation}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSpeak}
          className={`flex-shrink-0 transition-colors ${
            isSpeaking 
              ? 'text-primary hover:text-primary/80' 
              : 'text-muted-foreground hover:text-primary'
          }`}
        >
          {isSpeaking ? (
            <VolumeX className="h-5 w-5" />
          ) : (
            <Volume2 className="h-5 w-5" />
          )}
        </Button>
      </div>
    </Card>
  );
};
