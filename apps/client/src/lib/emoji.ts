import emojiKeywords from 'emojilib';
import emojiMetadata from 'unicode-emoji-json';

export interface EmojiCategory {
  id: string;
  name: string;
  icon: string;
}

export interface Emoji {
  char: string;
  name: string;
  category: number;
  keywords: string[];
}

export const CATEGORIES: readonly EmojiCategory[] = [
  { id: 'smileys', name: 'Smileys & Emotion', icon: '😀' },
  { id: 'people', name: 'People & Body', icon: '🧑' },
  { id: 'animals', name: 'Animals & Nature', icon: '🐶' },
  { id: 'food', name: 'Food & Drink', icon: '🍔' },
  { id: 'travel', name: 'Travel & Places', icon: '✈️' },
  { id: 'activities', name: 'Activities', icon: '⚽' },
  { id: 'objects', name: 'Objects', icon: '💡' },
  { id: 'symbols', name: 'Symbols', icon: '🔣' },
  { id: 'flags', name: 'Flags', icon: '🚩' },
] as const;

const GROUP_INDEX_MAP = new Map<string, number>(
  CATEGORIES.map((cat, idx) => [cat.name.toLowerCase(), idx]),
);

const RECENT_KEY = 'notes.recent_emojis';
const MAX_RECENTS = 24;

export const ALL_EMOJIS: Emoji[] = Object.entries(emojiMetadata).map(([char, meta]) => {
  const group = meta.group ?? '';
  const category = GROUP_INDEX_MAP.get(group.toLowerCase()) ?? 0;
  const keywords = (emojiKeywords as Record<string, string[]>)[char] ?? [];
  return {
    char,
    name: meta.name,
    category,
    keywords,
  };
});

export const EMOJIS_BY_CATEGORY: Emoji[][] = CATEGORIES.map((_, idx) =>
  ALL_EMOJIS.filter((e) => e.category === idx),
);

export function searchEmojis(query: string, limit = 80): Emoji[] {
  const q = query.trim().toLowerCase();
  if (!q) return ALL_EMOJIS.slice(0, limit);

  const exact: Emoji[] = [];
  const startsWithName: Emoji[] = [];
  const secondary: Emoji[] = [];

  for (const e of ALL_EMOJIS) {
    const nameLower = e.name.toLowerCase();
    if (e.char === q || nameLower === q) {
      exact.push(e);
      continue;
    }

    if (nameLower.startsWith(q)) {
      startsWithName.push(e);
      continue;
    }

    const matchesName = nameLower.includes(q);
    const matchesKeyword = e.keywords.some((k) => k.toLowerCase().includes(q));

    if (matchesName || matchesKeyword) {
      secondary.push(e);
    }
  }

  return [...exact, ...startsWithName, ...secondary].slice(0, limit);
}

export function getRecentEmojis(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed
        .filter((item): item is string => typeof item === 'string')
        .slice(0, MAX_RECENTS);
    }
  } catch {
    // Ignore invalid JSON / storage errors
  }
  return [];
}

export function addRecentEmoji(char: string) {
  if (!char) return;
  try {
    const existing = getRecentEmojis().filter((e) => e !== char);
    const updated = [char, ...existing].slice(0, MAX_RECENTS);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage errors
  }
}

const DEFAULT_POPULAR_EMOJIS = ['👍', '❤️', '🔥', '🚀', '🎉', '✨', '😀', '😂', '🙏', '👀'];

export function getSuggestedEmojis(limit = 10): Emoji[] {
  const recentChars = getRecentEmojis();
  const suggestions: Emoji[] = [];
  const seen = new Set<string>();

  for (const char of recentChars) {
    const found = ALL_EMOJIS.find((e) => e.char === char);
    if (found && !seen.has(found.char)) {
      seen.add(found.char);
      suggestions.push(found);
      if (suggestions.length >= limit) return suggestions;
    }
  }

  for (const char of DEFAULT_POPULAR_EMOJIS) {
    if (seen.has(char)) continue;
    const found = ALL_EMOJIS.find((e) => e.char === char);
    if (found) {
      seen.add(found.char);
      suggestions.push(found);
      if (suggestions.length >= limit) return suggestions;
    }
  }

  for (const emoji of ALL_EMOJIS) {
    if (seen.has(emoji.char)) continue;
    suggestions.push(emoji);
    if (suggestions.length >= limit) break;
  }

  return suggestions;
}
