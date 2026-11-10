import { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  CATEGORIES,
  EMOJIS_BY_CATEGORY,
  searchEmojis,
  getRecentEmojis,
  addRecentEmoji,
  type Emoji,
} from '../lib/emoji';

export interface EmojiPickerProps {
  onPick: (emoji: string) => void;
  onClose?: () => void;
  onRemove?: () => void;
  title?: string;
  className?: string;
  autoFocus?: boolean;
}

export function EmojiPicker({
  onPick,
  onClose,
  onRemove,
  title = 'Pick an emoji',
  className = '',
  autoFocus = true,
}: EmojiPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const categoryHeadingRefs = useRef<(HTMLDivElement | null)[]>([]);
  const searchInputId = useId();

  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<number | 'recent'>('recent');
  const [recents, setRecents] = useState<string[]>(() => getRecentEmojis());

  const searchResults = useMemo(() => {
    if (!query.trim()) return null;
    return searchEmojis(query, 120);
  }, [query]);

  // Click outside and escape handlers
  useEffect(() => {
    if (!onClose) return;
    const onDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  const handleSelect = (emojiChar: string) => {
    addRecentEmoji(emojiChar);
    setRecents(getRecentEmojis());
    onPick(emojiChar);
  };

  const scrollToCategory = (categoryIndex: number | 'recent') => {
    setActiveCategory(categoryIndex);
    if (!scrollContainerRef.current) return;

    if (categoryIndex === 'recent') {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const headingEl = categoryHeadingRefs.current[categoryIndex];
    if (headingEl) {
      const top = headingEl.offsetTop - scrollContainerRef.current.offsetTop;
      scrollContainerRef.current.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <div
      ref={containerRef}
      className={`w-[350px] max-w-[calc(100vw-32px)] bg-elevated rounded-xl shadow-pop flex flex-col overflow-hidden text-fg text-sm border border-line ${className}`}
      role="dialog"
      aria-label={title}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 pt-2.5 pb-2 border-b border-line gap-2">
        <span className="font-medium text-xs text-muted truncate">{title}</span>
        <div className="flex items-center gap-2 shrink-0">
          {onRemove && (
            <button
              type="button"
              className="text-xs text-muted hover:text-danger hover:underline cursor-pointer"
              onClick={onRemove}
            >
              Remove
            </button>
          )}
          {onClose && (
            <button
              type="button"
              className="text-xs text-muted hover:text-fg cursor-pointer p-0.5 rounded hover:bg-hover"
              onClick={onClose}
              aria-label="Close emoji picker"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-2 border-b border-line">
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-hover border border-line focus-within:border-accent">
          <span className="text-muted text-xs">🔍</span>
          <label htmlFor={searchInputId} className="sr-only">
            Search emojis
          </label>
          <input
            id={searchInputId}
            ref={inputRef}
            type="text"
            className="w-full bg-transparent text-sm text-fg placeholder:text-muted focus:outline-none"
            placeholder="Search emojis…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              type="button"
              className="text-xs text-muted hover:text-fg p-0.5"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Category Navigation Bar (when not searching) */}
      {!searchResults && (
        <div className="flex items-center justify-between px-2 py-1.5 border-b border-line bg-sidebar text-base overflow-x-auto scrollbar-none">
          {recents.length > 0 && (
            <button
              type="button"
              className={`p-1 rounded cursor-pointer transition-colors ${
                activeCategory === 'recent'
                  ? 'bg-active'
                  : 'hover:bg-hover opacity-70 hover:opacity-100'
              }`}
              onClick={() => scrollToCategory('recent')}
              title="Recently Used"
              aria-label="Recently Used"
            >
              🕒
            </button>
          )}
          {CATEGORIES.map((cat, idx) => (
            <button
              key={cat.id}
              type="button"
              className={`p-1 rounded cursor-pointer transition-colors ${
                activeCategory === idx ? 'bg-active' : 'hover:bg-hover opacity-70 hover:opacity-100'
              }`}
              onClick={() => scrollToCategory(idx)}
              title={cat.name}
              aria-label={cat.name}
            >
              {cat.icon}
            </button>
          ))}
        </div>
      )}

      {/* Emojis Grid Container */}
      <div
        ref={scrollContainerRef}
        className="h-64 overflow-y-auto p-0 overscroll-contain"
        tabIndex={0}
      >
        {searchResults ? (
          <div>
            <div className="text-[11px] font-semibold text-muted px-1 pb-1">
              {searchResults.length === 0 ? 'No emojis found' : `Results (${searchResults.length})`}
            </div>
            {searchResults.length === 0 ? (
              <div className="text-center py-8 text-muted text-xs">No matching emojis</div>
            ) : (
              <div className="grid grid-cols-8 gap-0.5">
                {searchResults.map((emoji) => (
                  <EmojiButton
                    key={emoji.char}
                    emoji={emoji}
                    onClick={() => handleSelect(emoji.char)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {recents.length > 0 && (
              <div className="mb-3">
                <div className="text-[11px] font-semibold text-muted px-1 pb-1">Recently Used</div>
                <div className="grid grid-cols-8 gap-0.5">
                  {recents.map((char) => (
                    <button
                      key={char}
                      type="button"
                      className="h-9 w-9 flex items-center justify-center text-xl rounded-md hover:bg-hover cursor-pointer transition-transform hover:scale-115 active:scale-95"
                      onClick={() => handleSelect(char)}
                      title={char}
                      aria-label={char}
                    >
                      {char}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {CATEGORIES.map((cat, idx) => {
              const list = EMOJIS_BY_CATEGORY[idx] ?? [];
              if (list.length === 0) return null;
              return (
                <div
                  key={cat.id}
                  ref={(el) => {
                    categoryHeadingRefs.current[idx] = el;
                  }}
                  className="mb-3"
                >
                  <div className="sticky top-0 bg-elevated/95 backdrop-blur-xs py-0.5 px-1 text-[11px] font-semibold text-muted z-1">
                    {cat.name}
                  </div>
                  <div className="grid grid-cols-8 gap-0.5">
                    {list.map((emoji) => (
                      <EmojiButton
                        key={emoji.char}
                        emoji={emoji}
                        onClick={() => handleSelect(emoji.char)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function EmojiButton({ emoji, onClick }: { emoji: Emoji; onClick: () => void }) {
  return (
    <button
      type="button"
      className="h-9 w-9 flex items-center justify-center text-xl rounded-md hover:bg-hover cursor-pointer transition-transform hover:scale-115 active:scale-95"
      onClick={onClick}
      title={`${emoji.name} (${emoji.char})`}
      aria-label={emoji.char}
    >
      {emoji.char}
    </button>
  );
}
