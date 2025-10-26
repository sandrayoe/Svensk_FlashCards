'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  generateDailySwedishWords,
  GenerateDailySwedishWordsOutput,
} from '@/ai/flows/generate-daily-swedish-words';
import { regenerateSwedishWords } from '@/ai/flows/regenerate-swedish-words';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FlashCard } from '@/components/flash-card';
import { Loader } from '@/components/loader';

type Word = {
  swedish: string;
  english: string;
};

export default function Home() {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const { toast } = useToast();

  const handlePronounce = useCallback((text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'sv-SE';
      window.speechSynthesis.speak(utterance);
    }
  }, []);

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
          setWords(result.words);
          localStorage.setItem(storageKey, JSON.stringify(result.words));
          // Clear old caches
          Object.keys(localStorage).forEach((key) => {
            if (key.startsWith('svenska-flash-') && key !== storageKey) {
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
  }, [toast]);

  useEffect(() => {
    fetchWords();
  }, [fetchWords]);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const result = await regenerateSwedishWords({});
      if (result && result.words) {
        setWords(result.words);
        const today = new Date().toISOString().split('T')[0];
        const storageKey = `svenska-flash-${today}`;
        localStorage.setItem(storageKey, JSON.stringify(result.words));
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

  return (
    <div className="flex flex-col min-h-screen">
      <header className="py-12 md:py-16 text-center">
        <h1 className="font-headline text-5xl md:text-7xl font-bold text-primary">Svenska Flash</h1>
        <p className="mt-4 text-lg md:text-xl text-foreground/80">Your daily dose of Swedish</p>
      </header>

      <main className="flex-grow flex items-center justify-center px-4">
        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <Loader className="h-12 w-12 text-primary" />
            <p>Generating your words for today...</p>
          </div>
        ) : (
          <div className="w-full max-w-5xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {words.map((word, index) => (
                <FlashCard
                  key={index}
                  index={index}
                  swedish={word.swedish}
                  english={word.english}
                  onPronounce={handlePronounce}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="py-8 text-center">
        {!loading && (
          <Button onClick={handleRegenerate} disabled={isRegenerating}>
            {isRegenerating ? <Loader className="mr-2 h-4 w-4" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Regenerate Words
          </Button>
        )}
      </footer>
    </div>
  );
}
