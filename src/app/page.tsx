'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  generateDailySwedishWords,
  GenerateDailySwedishWordsOutput,
} from '@/ai/flows/generate-daily-swedish-words';
import { regenerateSwedishWords } from '@/ai/flows/regenerate-swedish-words';
import { Button } from '@/components/ui/button';
import { RefreshCw, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FlashCard } from '@/components/flash-card';
import { Loader } from '@/components/loader';
import { WordLogScreen } from '@/components/word-log-screen';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

type Word = {
  swedish: string;
  english: string;
};

const ALL_WORDS_CACHE_KEY = 'svenska-flash-all-words';

export default function Home() {
  const [words, setWords] = useState<Word[]>([]);
  const [allSeenWords, setAllSeenWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showWordLog, setShowWordLog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const cachedAllWords = localStorage.getItem(ALL_WORDS_CACHE_KEY);
      if (cachedAllWords) {
        setAllSeenWords(JSON.parse(cachedAllWords));
      }
    } catch (e) {
      console.error('Could not load all seen words from local storage.', e);
    }
  }, []);

  const handlePronounce = useCallback((text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'sv-SE';
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const handleCardFlip = useCallback((word: Word) => {
    // Track card interaction for better learning analytics
    const WORD_STATS_CACHE_KEY = 'svenska-flash-word-stats';
    const cachedStats = localStorage.getItem(WORD_STATS_CACHE_KEY);
    let wordStats: Record<string, { timesReviewed: number; lastReviewed: string; dateAdded: string }> = 
      cachedStats ? JSON.parse(cachedStats) : {};

    const key = `${word.swedish}-${word.english}`;
    const now = new Date().toISOString();

    if (wordStats[key]) {
      wordStats[key].lastReviewed = now;
      // Don't increment timesReviewed on every flip to avoid inflation
    }

    localStorage.setItem(WORD_STATS_CACHE_KEY, JSON.stringify(wordStats));
  }, []);

  const updateWordStorage = useCallback((newWords: Word[]) => {
    setWords(newWords);
    const today = new Date().toISOString().split('T')[0];
    const storageKey = `svenska-flash-${today}`;
    localStorage.setItem(storageKey, JSON.stringify(newWords));

    const updatedAllWords = [...allSeenWords];
    const now = new Date().toISOString();
    
    // Get or initialize word statistics
    const WORD_STATS_CACHE_KEY = 'svenska-flash-word-stats';
    const cachedStats = localStorage.getItem(WORD_STATS_CACHE_KEY);
    let wordStats: Record<string, { timesReviewed: number; lastReviewed: string; dateAdded: string }> = 
      cachedStats ? JSON.parse(cachedStats) : {};

    newWords.forEach(newWord => {
      const key = `${newWord.swedish}-${newWord.english}`;
      
      // Add to all words if not already there
      if (!updatedAllWords.some(w => w.swedish === newWord.swedish)) {
        updatedAllWords.push(newWord);
        
        // Initialize stats for new words
        if (!wordStats[key]) {
          wordStats[key] = {
            timesReviewed: 1,
            lastReviewed: now,
            dateAdded: now,
          };
        }
      } else {
        // Update review count and last reviewed date for existing words
        if (wordStats[key]) {
          wordStats[key].timesReviewed += 1;
          wordStats[key].lastReviewed = now;
        } else {
          wordStats[key] = {
            timesReviewed: 2, // Since it was already seen before
            lastReviewed: now,
            dateAdded: now, // Fallback for old words without stats
          };
        }
      }
    });

    setAllSeenWords(updatedAllWords);
    localStorage.setItem(ALL_WORDS_CACHE_KEY, JSON.stringify(updatedAllWords));
    localStorage.setItem(WORD_STATS_CACHE_KEY, JSON.stringify(wordStats));
  }, [allSeenWords]);

  const fetchWords = useCallback(async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const storageKey = `svenska-flash-${today}`;
      const cachedWords = localStorage.getItem(storageKey);

      if (cachedWords) {
        setWords(JSON.parse(cachedWords));
      } else {
        const result: GenerateDailySwedishWordsOutput = await generateDailySwedishWords();
        if (result && result.words) {
          updateWordStorage(result.words);
          // Clear old daily caches
          Object.keys(localStorage).forEach((key) => {
            if (key.startsWith('svenska-flash-') && key !== storageKey && key !== ALL_WORDS_CACHE_KEY) {
              localStorage.removeItem(key);
            }
          });
        }
      }
    } catch (error) {
      console.error('Error fetching words:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch new words. Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  }, [toast, updateWordStorage]);

  useEffect(() => {
    fetchWords();
  }, [fetchWords]);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const result = await regenerateSwedishWords({ previousWords: allSeenWords });
      if (result && result.words) {
        updateWordStorage(result.words);
      }
    } catch (error) {
      console.error('Error regenerating words:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to regenerate words. Please try again.',
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  // Show word log screen if requested
  if (showWordLog) {
    return <WordLogScreen onBack={() => setShowWordLog(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
      {/* Header - moderate spacing */}
      <header className="py-8 px-4 text-center relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowWordLog(true)}
          className="absolute top-6 right-4 min-w-0"
        >
          <BookOpen className="h-4 w-4" />
          <span className="ml-2 hidden sm:inline">Learning Log</span>
        </Button>
        
        <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-primary leading-tight">
          Svenska Flash
        </h1>
        <p className="mt-2 text-sm sm:text-base md:text-lg lg:text-xl text-foreground/80 max-w-md mx-auto">
          Your daily dose of Swedish vocabulary
        </p>
      </header>

      {/* Main content - moderate spacing */}
      <main className="px-2 sm:px-4 pt-8 pb-8">
        <div className="flex justify-center">
          {loading ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <Loader className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-primary" />
              <p className="text-sm sm:text-base md:text-lg text-foreground/80">
                Generating your words for today...
              </p>
            </div>
          ) : (
            <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl mx-auto">
              <Carousel className="w-full">
                <CarouselContent>
                  {words.map((word, index) => (
                    <CarouselItem key={index}>
                      <div className="p-1 sm:p-2">
                        <FlashCard
                          index={index}
                          swedish={word.swedish}
                          english={word.english}
                          onPronounce={handlePronounce}
                          onFlip={handleCardFlip}
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="hidden sm:flex -left-8 md:-left-12" />
                <CarouselNext className="hidden sm:flex -right-8 md:-right-12" />
              </Carousel>
              
              {/* Mobile navigation indicators */}
              <div className="flex justify-center mt-4 gap-2 sm:hidden">
                {words.map((_, index) => (
                  <div
                    key={index}
                    className="w-2 h-2 rounded-full bg-foreground/20"
                  />
                ))}
              </div>
              
              {/* Mobile swipe hint */}
              <div className="text-center mt-4 sm:hidden">
                <p className="text-xs text-foreground/50">
                  Swipe to navigate • Tap card to flip
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer - moderate spacing */}
      <footer className="px-4 pt-8 pb-8 text-center">
        {!loading && (
          <Button 
            onClick={handleRegenerate} 
            disabled={isRegenerating}
            size="lg"
            className="w-full max-w-xs sm:w-auto text-sm sm:text-base"
          >
            {isRegenerating ? (
              <Loader className="mr-2 h-4 w-4" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Regenerate Words
          </Button>
        )}
      </footer>
    </div>
  );
}
