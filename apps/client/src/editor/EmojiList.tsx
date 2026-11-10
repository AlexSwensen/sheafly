import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import type { SuggestionProps, SuggestionKeyDownProps } from '@tiptap/suggestion';
import type { Emoji } from '../lib/emoji';

export interface EmojiListHandle {
  onKeyDown: (props: SuggestionKeyDownProps) => boolean;
}

export const EmojiList = forwardRef<EmojiListHandle, SuggestionProps<Emoji>>(
  function EmojiList(props, ref) {
    const [selected, setSelected] = useState(0);
    useEffect(() => setSelected(0), [props.items]);

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        const n = props.items.length;
        if (!n) return false;
        if (event.key === 'ArrowDown') return (setSelected((s) => (s + 1) % n), true);
        if (event.key === 'ArrowUp') return (setSelected((s) => (s + n - 1) % n), true);
        if (event.key === 'Enter' || event.key === 'Tab')
          return (props.command(props.items[selected]), true);
        return false;
      },
    }));

    const menu =
      'w-[260px] max-h-72 overflow-y-auto bg-elevated rounded-lg shadow-pop p-1 border border-line';
    if (!props.items.length) {
      return (
        <div className={menu}>
          <div className="p-2 text-muted text-xs">No matching emoji</div>
        </div>
      );
    }

    const header = !props.query ? 'Recently used / Suggested' : 'Emoji';

    return (
      <div className={menu} role="listbox" aria-label="Emoji suggestions">
        <div className="text-[11px] font-semibold text-muted px-2 pt-1 pb-1">{header}</div>
        {props.items.map((item, i) => (
          <button
            key={item.char}
            type="button"
            role="option"
            aria-selected={i === selected}
            className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded text-left text-sm cursor-pointer transition-colors ${
              i === selected ? 'bg-hover text-fg' : 'text-fg hover:bg-hover'
            }`}
            onClick={() => props.command(item)}
            onMouseEnter={() => setSelected(i)}
          >
            <span className="text-xl leading-none w-6 text-center shrink-0">{item.char}</span>
            <span className="truncate text-xs font-medium">{item.name}</span>
          </button>
        ))}
      </div>
    );
  },
);
