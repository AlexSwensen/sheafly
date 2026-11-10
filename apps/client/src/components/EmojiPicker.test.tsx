import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmojiPicker } from './EmojiPicker';

describe('EmojiPicker', () => {
  it('renders picker with title, search and categories', () => {
    render(<EmojiPicker onPick={() => {}} onClose={() => {}} title="Choose an emoji" />);
    expect(screen.getByText('Choose an emoji')).toBeTruthy();
    expect(screen.getByPlaceholderText('Search emojis…')).toBeTruthy();
  });

  it('picks an emoji upon clicking it', async () => {
    const onPick = vi.fn();
    render(<EmojiPicker onPick={onPick} />);
    const user = userEvent.setup();

    // Search for rocket to get a stable button target
    const searchInput = screen.getByPlaceholderText('Search emojis…');
    await user.type(searchInput, 'rocket');

    const rocketButton = screen.getByRole('button', { name: '🚀' });
    await user.click(rocketButton);

    expect(onPick).toHaveBeenCalledWith('🚀');
  });

  it('triggers onRemove when Remove button is clicked', async () => {
    const onRemove = vi.fn();
    render(<EmojiPicker onPick={() => {}} onRemove={onRemove} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Remove' }));
    expect(onRemove).toHaveBeenCalledOnce();
  });

  it('triggers onClose when Close button is clicked', async () => {
    const onClose = vi.fn();
    render(<EmojiPicker onPick={() => {}} onClose={onClose} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Close emoji picker' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('filters emojis when query is typed and clears with clear button', async () => {
    render(<EmojiPicker onPick={() => {}} />);
    const user = userEvent.setup();

    const searchInput = screen.getByPlaceholderText('Search emojis…');
    await user.type(searchInput, 'pizza');
    expect(screen.getByRole('button', { name: '🍕' })).toBeTruthy();

    const clearButton = screen.getByRole('button', { name: 'Clear search' });
    await user.click(clearButton);
    expect((searchInput as HTMLInputElement).value).toBe('');
  });

  it('shows no matching emojis message when search yields nothing', async () => {
    render(<EmojiPicker onPick={() => {}} />);
    const user = userEvent.setup();

    const searchInput = screen.getByPlaceholderText('Search emojis…');
    await user.type(searchInput, 'zzzznonexistentquery999');
    expect(screen.getByText('No matching emojis')).toBeTruthy();
  });

  it('closes on Escape key and outside clicks', () => {
    const onClose = vi.fn();
    render(
      <div>
        <button>outside</button>
        <EmojiPicker onPick={() => {}} onClose={onClose} />
      </div>,
    );

    fireEvent.mouseDown(screen.getByText('Pick an emoji'));
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.mouseDown(screen.getByText('outside'));
    expect(onClose).toHaveBeenCalledOnce();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
