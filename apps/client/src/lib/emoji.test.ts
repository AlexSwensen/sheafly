import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  CATEGORIES,
  ALL_EMOJIS,
  EMOJIS_BY_CATEGORY,
  searchEmojis,
  getRecentEmojis,
  addRecentEmoji,
  getSuggestedEmojis,
} from './emoji';

describe('emoji library', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('exposes all 9 standard categories', () => {
    expect(CATEGORIES).toHaveLength(9);
    expect(CATEGORIES.map((c) => c.name)).toEqual([
      'Smileys & Emotion',
      'People & Body',
      'Animals & Nature',
      'Food & Drink',
      'Travel & Places',
      'Activities',
      'Objects',
      'Symbols',
      'Flags',
    ]);
  });

  it('contains around 1900 emojis categorized properly', () => {
    expect(ALL_EMOJIS.length).toBeGreaterThan(1800);
    expect(EMOJIS_BY_CATEGORY).toHaveLength(9);
    for (const group of EMOJIS_BY_CATEGORY) {
      expect(group.length).toBeGreaterThan(50);
    }
  });

  it('searches emojis by exact character, name, or keywords', () => {
    const rocket = searchEmojis('🚀');
    expect(rocket.some((e) => e.char === '🚀')).toBe(true);

    const fire = searchEmojis('fire');
    expect(fire[0].char).toBe('🔥');

    const pizza = searchEmojis('pizza');
    expect(pizza.some((e) => e.char === '🍕')).toBe(true);

    const empty = searchEmojis('');
    expect(empty.length).toBeGreaterThan(0);

    const notFound = searchEmojis('xyznonexistent123');
    expect(notFound).toHaveLength(0);
  });

  it('tracks and persists recent emojis in localStorage', () => {
    expect(getRecentEmojis()).toEqual([]);

    addRecentEmoji('🚀');
    addRecentEmoji('🔥');
    expect(getRecentEmojis()).toEqual(['🔥', '🚀']);

    // Re-adding moves it to front without duplicates
    addRecentEmoji('🚀');
    expect(getRecentEmojis()).toEqual(['🚀', '🔥']);
  });

  it('handles invalid localStorage content gracefully', () => {
    localStorage.setItem('notes.recent_emojis', 'invalid-json');
    expect(getRecentEmojis()).toEqual([]);
  });

  it('provides suggested emojis prioritizing recent emojis and falling back to popular ones', () => {
    const initialSuggestions = getSuggestedEmojis(5);
    expect(initialSuggestions).toHaveLength(5);

    addRecentEmoji('🍕');
    const updatedSuggestions = getSuggestedEmojis(5);
    expect(updatedSuggestions[0].char).toBe('🍕');
  });
});
