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
  onFlip?: (word: { swedish: string; english: string }) => void;
  index: number;
}

export function FlashCard({ swedish, english, onPronounce, onFlip, index }: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
    if (onFlip) {
      onFlip({ swedish, english });
    }
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
          'relative h-48 sm:h-52 md:h-56 lg:h-60 xl:h-64 w-full cursor-pointer rounded-lg shadow-lg hover:shadow-xl transition-all duration-700 [transform-style:preserve-3d] focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background',
          isFlipped && '[transform:rotateY(180deg)]'
        )}
        tabIndex={0}
        role="button"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCardClick();
          }
        }}
        aria-label={`Flash card: ${swedish}. ${isFlipped ? 'Showing English translation' : 'Press Enter to reveal translation'}`}
      >
        {/* Front of card */}
        <div className="absolute inset-0 [backface-visibility:hidden]">
          <Card className="h-full w-full flex flex-col items-center justify-center bg-card border-2 border-primary/10 hover:border-primary/20 transition-colors">
            <CardContent className="p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center text-center w-full">
              <h3 className="font-headline text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-primary break-words hyphens-auto leading-tight">
                {swedish}
              </h3>
              <div className="mt-2 sm:mt-3 text-xs sm:text-sm text-foreground/60">
                Tap to reveal translation
              </div>
            </CardContent>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 sm:top-3 sm:right-3 text-muted-foreground hover:text-primary transition-colors hover:bg-primary/10"
              onClick={handleSoundClick}
              aria-label={`Pronounce ${swedish}`}
            >
              <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </Card>
        </div>

        {/* Back of card */}
        <div className="absolute inset-0 [transform:rotateY(180deg)] [backface-visibility:hidden]">
          <Card className="h-full w-full flex flex-col items-center justify-center bg-accent border-2 border-accent-foreground/20">
            <CardContent className="p-4 sm:p-6 md:p-8 text-center w-full">
              <p className="font-body text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-accent-foreground break-words hyphens-auto leading-tight">
                {english}
              </p>
              <div className="mt-2 sm:mt-3 text-xs sm:text-sm text-accent-foreground/70">
                Tap to return to Swedish
              </div>
            </CardContent>
            {/* Sound button on back too for convenience */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 sm:top-3 sm:right-3 text-accent-foreground/60 hover:text-accent-foreground transition-colors hover:bg-accent-foreground/10"
              onClick={handleSoundClick}
              aria-label={`Pronounce ${swedish}`}
            >
              <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
