export const exportLearningData = () => {
  try {
    const ALL_WORDS_CACHE_KEY = 'svenska-flash-all-words';
    const WORD_STATS_CACHE_KEY = 'svenska-flash-word-stats';
    
    const allWords = localStorage.getItem(ALL_WORDS_CACHE_KEY);
    const wordStats = localStorage.getItem(WORD_STATS_CACHE_KEY);
    
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      words: allWords ? JSON.parse(allWords) : [],
      statistics: wordStats ? JSON.parse(wordStats) : {},
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `svenska-flash-export-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    return true;
  } catch (error) {
    console.error('Error exporting data:', error);
    return false;
  }
};

export const importLearningData = (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (typeof result !== 'string') {
          throw new Error('Invalid file content');
        }
        
        const importData = JSON.parse(result);
        
        // Validate the import data structure
        if (!importData.version || !importData.words || !importData.statistics) {
          throw new Error('Invalid export file format');
        }
        
        // Merge with existing data
        const ALL_WORDS_CACHE_KEY = 'svenska-flash-all-words';
        const WORD_STATS_CACHE_KEY = 'svenska-flash-word-stats';
        
        const existingWords = localStorage.getItem(ALL_WORDS_CACHE_KEY);
        const existingStats = localStorage.getItem(WORD_STATS_CACHE_KEY);
        
        let mergedWords = existingWords ? JSON.parse(existingWords) : [];
        let mergedStats = existingStats ? JSON.parse(existingStats) : {};
        
        // Merge words (avoid duplicates)
        importData.words.forEach((importWord: any) => {
          if (!mergedWords.some((w: any) => w.swedish === importWord.swedish)) {
            mergedWords.push(importWord);
          }
        });
        
        // Merge statistics (take the higher review count for duplicates)
        Object.keys(importData.statistics).forEach(key => {
          const importStat = importData.statistics[key];
          const existingStat = mergedStats[key];
          
          if (!existingStat || importStat.timesReviewed > existingStat.timesReviewed) {
            mergedStats[key] = importStat;
          }
        });
        
        // Save merged data
        localStorage.setItem(ALL_WORDS_CACHE_KEY, JSON.stringify(mergedWords));
        localStorage.setItem(WORD_STATS_CACHE_KEY, JSON.stringify(mergedStats));
        
        resolve(true);
      } catch (error) {
        console.error('Error importing data:', error);
        resolve(false);
      }
    };
    
    reader.onerror = () => {
      console.error('Error reading file');
      resolve(false);
    };
    
    reader.readAsText(file);
  });
};