import { EmojiPicker } from './EmojiPicker';

export function IconPicker({
  onPick,
  onClose,
}: {
  onPick: (icon: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="absolute top-full left-0 z-30 pt-1">
      <EmojiPicker
        title="Pick an icon"
        onPick={onPick}
        onClose={onClose}
        onRemove={() => onPick('')}
      />
    </div>
  );
}
