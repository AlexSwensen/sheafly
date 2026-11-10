import type { Command } from '../types';

export const emojiCommand: Command = {
  title: 'Emoji',
  description: 'Insert an emoji from the picker',
  icon: '😀',
  keywords: ['emoji', 'icon', 'smiley', 'emoticon'],
  run: (editor, range) => {
    // Delete the slash command text ("/emoji")
    editor.chain().focus().deleteRange(range).run();
    // Dispatch an event so the editor or host container can mount the EmojiPicker
    window.dispatchEvent(new CustomEvent('sheafly:open-emoji-picker'));
  },
};
