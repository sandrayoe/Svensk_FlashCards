'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Volume2, Calendar, BookOpen, ArrowLeft, Search, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Word = {
  swedish: string;
  english: string;
};

type WordLog = {
  word: Word;
  dateAdded: string;
  timesReviewed: number;
  lastReviewed: string;
};

const ALL_WORDS_CACHE_KEY = 'svenska-flash-all-words';
const WORD_STATS_CACHE_KEY = 'svenska-flash-word-stats';

interface WordLogScreenProps {
  onBack: () => void;
}

export function WordLogScreen({ onBack }: WordLogScreenProps) {
  const [wordLogs, setWordLogs] = useState<WordLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<WordLog[]>([]);
  const [totalWords, setTotalWords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'alphabetical' | 'frequency'>('recent');

  const handlePronounce = (text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'sv-SE';
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    const loadWordLogs = () => {
      try {
        // Get all learned words
        const cachedAllWords = localStorage.getItem(ALL_WORDS_CACHE_KEY);
        const allWords: Word[] = cachedAllWords ? JSON.parse(cachedAllWords) : [];

        // Get or initialize word statistics
        const cachedStats = localStorage.getItem(WORD_STATS_CACHE_KEY);
        let wordStats: Record<string, { timesReviewed: number; lastReviewed: string; dateAdded: string }> = 
          cachedStats ? JSON.parse(cachedStats) : {};

        // Create word logs with statistics
        const logs: WordLog[] = allWords.map(word => {
          const key = `${word.swedish}-${word.english}`;
          const stats = wordStats[key];
          
          if (!stats) {
            // Initialize stats for new words
            const now = new Date().toISOString();
            wordStats[key] = {
              timesReviewed: 1,
              lastReviewed: now,
              dateAdded: now,
            };
          }

          return {
            word,
            dateAdded: stats?.dateAdded || new Date().toISOString(),
            timesReviewed: stats?.timesReviewed || 1,
            lastReviewed: stats?.lastReviewed || new Date().toISOString(),
          };
        });

        // Save updated stats
        localStorage.setItem(WORD_STATS_CACHE_KEY, JSON.stringify(wordStats));

        // Sort by most recent first
        logs.sort((a, b) => new Date(b.lastReviewed).getTime() - new Date(a.lastReviewed).getTime());

        setWordLogs(logs);
        setFilteredLogs(logs);
        setTotalWords(logs.length);
      } catch (error) {
        console.error('Error loading word logs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWordLogs();
  }, []);

  // Filter and search functionality
  useEffect(() => {
    let filtered = wordLogs;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(log => 
        log.word.swedish.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.word.english.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'alphabetical':
          return a.word.swedish.localeCompare(b.word.swedish);
        case 'frequency':
          return b.timesReviewed - a.timesReviewed;
        case 'recent':
        default:
          return new Date(b.lastReviewed).getTime() - new Date(a.lastReviewed).getTime();
      }
    });

    setFilteredLogs(filtered);
  }, [wordLogs, searchQuery, sortBy]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  const getProgressColor = (timesReviewed: number) => {
    return 'bg-primary';
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
        <header className="py-6 sm:py-8 px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary">Learning Log</h1>
          </div>
        </header>
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading your learning progress...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
      {/* Header */}
      <header className="py-6 sm:py-8 px-4 border-b border-border/50">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">Learning Log</h1>
              <p className="text-sm sm:text-base text-foreground/70 mt-1">
                View and track your Swedish vocabulary
              </p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mt-6 mb-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/50" />
              <Input
                placeholder="Search words..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="alphabetical">Alphabetical</SelectItem>
                <SelectItem value="frequency">Most Encountered</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <BookOpen className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{totalWords}</div>
                <div className="text-sm text-foreground/70">Words Learned</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-accent" />
                <div className="text-2xl font-bold">
                  {(() => {
                    // Calculate unique days based on dateAdded
                    const uniqueDays = new Set(
                      wordLogs.map(log => new Date(log.dateAdded).toDateString())
                    );
                    return uniqueDays.size;
                  })()}
                </div>
                <div className="text-sm text-foreground/70">Days Active</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="h-8 w-8 mx-auto mb-2 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">�</span>
                </div>
                <div className="text-2xl font-bold">
                  {(() => {
                    const uniqueDays = new Set(
                      wordLogs.map(log => new Date(log.dateAdded).toDateString())
                    );
                    const daysActive = uniqueDays.size;
                    return daysActive > 0 ? Math.round(totalWords / daysActive) : 0;
                  })()}
                </div>
                <div className="text-sm text-foreground/70">Avg per Day</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </header>

      {/* Word List */}
      <main className="flex-grow px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Explanation Card */}
          {wordLogs.length > 0 && (
            <Card className="mb-6 bg-accent/10 border-accent/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">💡</div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">What do the numbers mean?</h3>
                    <p className="text-xs text-foreground/70">
                      <strong>"Seen X times"</strong> = How many different practice sessions this word appeared in. 
                      Each time you get new daily words or regenerate words, it counts as one session for each word.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {wordLogs.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="h-16 w-16 mx-auto mb-4 text-foreground/30" />
                <h3 className="text-xl font-semibold mb-2">No words learned yet</h3>
                <p className="text-foreground/70">
                  Start learning Swedish words to see your progress here!
                </p>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-full">
              <div className="mb-4">
                <p className="text-sm text-foreground/70">
                  Showing {filteredLogs.length} of {wordLogs.length} words
                </p>
              </div>
              <div className="space-y-3">
                {filteredLogs.map((log, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        {/* Word Information */}
                        <div className="flex-grow">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg sm:text-xl font-semibold text-primary">
                              {log.word.swedish}
                            </h3>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-primary"
                              onClick={() => handlePronounce(log.word.swedish)}
                              aria-label={`Pronounce ${log.word.swedish}`}
                            >
                              <Volume2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-foreground/80 mb-3">{log.word.english}</p>
                          
                          {/* Progress and dates */}
                          <div className="flex flex-wrap items-center gap-2 text-sm">
                            <Badge 
                              variant="secondary" 
                              className={`${getProgressColor(log.timesReviewed)} text-white`}
                            >
                              Seen {log.timesReviewed} time{log.timesReviewed !== 1 ? 's' : ''}
                            </Badge>
                            <span className="text-foreground/40">•</span>
                            <span className="text-foreground/60">
                              Added {formatDate(log.dateAdded)}
                            </span>
                            <span className="text-foreground/40">•</span>
                            <span className="text-foreground/60">
                              Last seen {formatDate(log.lastReviewed)}
                            </span>
                          </div>
                        </div>

                        {/* Review Count */}
                        <div className="hidden sm:flex flex-col items-end gap-2 min-w-[80px]">
                          <div className="text-2xl font-bold text-primary">
                            {log.timesReviewed}
                          </div>
                          <div className="text-xs text-foreground/60">
                            time{log.timesReviewed !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </main>
    </div>
  );
}