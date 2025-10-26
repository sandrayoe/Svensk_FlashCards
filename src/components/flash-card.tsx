'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FlashCardProps {
  swedish: string;
  english: string;
  onPronounce: (text: string) => void;
  index: number;
}

export function FlashCard({ swedish, english, onPronounce, index }: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  const handleSoundClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onPronounce(swedish);
  };

  return (
    <div
      className="group rounded-lg [perspective:1000px] animate-card-in opacity-0"
      style={{ animationDelay: `${index * 100}ms` }}
      onClick={handleCardClick}
    >
      <div
        className={cn(
          'relative h-48 w-full cursor-pointer rounded-lg shadow-lg transition-transform duration-700 [transform-style:preserve-3d]',
          isFlipped && '[transform:rotateY(180deg)]'
        )}
      >
        {/* Front of card */}
        <div className="absolute inset-0 [backface-visibility:hidden]">
          <Card className="h-full w-full flex flex-col items-center justify-center bg-card">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <h3 className="font-headline text-2xl md:text-3xl font-semibold text-primary">{swedish}</h3>
            </CardContent>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-muted-foreground hover:text-primary"
              onClick={handleSoundClick}
              aria-label={`Pronounce ${swedish}`}
            >
              <Volume2 className="h-5 w-5" />
            </Button>
          </Card>
        </div>

        {/* Back of card */}
        <div className="absolute inset-0 [transform:rotateY(180deg)] [backface-visibility:hidden]">
          <Card className="h-full w-full flex items-center justify-center bg-accent">
            <CardContent className="p-4">
              <p className="font-body text-xl md:text-2xl font-bold text-accent-foreground">{english}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
