const WORDS_PER_MINUTE = 200;

export function estimateReadingTime(rawText: string): { words: number; minutes: number } {
  const words = rawText.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE));
  return { words, minutes };
}
