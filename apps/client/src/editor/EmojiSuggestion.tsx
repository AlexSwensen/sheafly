import { Extension } from '@tiptap/core';
import { PluginKey } from '@tiptap/pm/state';
import { ReactRenderer } from '@tiptap/react';
import Suggestion, { type SuggestionProps } from '@tiptap/suggestion';
import { searchEmojis, getSuggestedEmojis, addRecentEmoji, type Emoji } from '../lib/emoji';
import { EmojiList, type EmojiListHandle } from './EmojiList';

export const EmojiSuggestionPluginKey = new PluginKey('emojiSuggestion');

function position(el: HTMLElement, rect: DOMRect | null | undefined) {
  if (!rect) return;
  const menuHeight = Math.min(el.offsetHeight || 280, 280);
  const below = rect.bottom + 6;
  const top =
    below + menuHeight > window.innerHeight ? Math.max(8, rect.top - menuHeight - 6) : below;
  el.style.top = `${top}px`;
  el.style.left = `${Math.min(rect.left, window.innerWidth - 270)}px`;
}

export const EmojiSuggestion = Extension.create({
  name: 'emojiSuggestion',
  addProseMirrorPlugins() {
    return [
      Suggestion<Emoji>({
        pluginKey: EmojiSuggestionPluginKey,
        editor: this.editor,
        char: ':',
        startOfLine: false,
        allowSpaces: false,
        items: ({ query }) => {
          if (!query) return getSuggestedEmojis(8);
          return searchEmojis(query, 10);
        },
        command: ({ editor, range, props }) => {
          addRecentEmoji(props.char);
          editor.chain().focus().insertContentAt(range, props.char).run();
        },
        render: () => {
          let renderer: ReactRenderer<EmojiListHandle, SuggestionProps<Emoji>> | null = null;
          let el: HTMLDivElement | null = null;
          return {
            onStart: (props) => {
              renderer = new ReactRenderer(EmojiList, { props, editor: props.editor });
              el = document.createElement('div');
              el.className = 'fixed z-50';
              el.appendChild(renderer.element);
              document.body.appendChild(el);
              position(el, props.clientRect?.());
            },
            onUpdate: (props) => {
              renderer?.updateProps(props);
              if (el) position(el, props.clientRect?.());
            },
            onKeyDown: (props) => {
              if (props.event.key === 'Escape') {
                el?.remove();
                return true;
              }
              return renderer?.ref?.onKeyDown(props) ?? false;
            },
            onExit: () => {
              el?.remove();
              renderer?.destroy();
              el = null;
              renderer = null;
            },
          };
        },
      }),
    ];
  },
});
