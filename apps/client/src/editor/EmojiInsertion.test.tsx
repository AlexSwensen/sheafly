import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NoteEditor } from './NoteEditor';
import { db } from '../lib/db';
import { syncEngine } from '../lib/sync';
import { makeNote } from '../test/factories';

const editor = () => document.querySelector('.ProseMirror') as HTMLElement;

async function renderEditor() {
  const note = makeNote({ id: 'n', content: null });
  await db.notes.add(note);
  render(<NoteEditor note={note} focusSignal={0} />);
  const user = userEvent.setup();
  await user.click(editor());
  return user;
}

beforeEach(() => {
  vi.spyOn(syncEngine, 'schedule').mockImplementation(() => {});
});

describe('document emoji insertion', () => {
  it('opens emoji autocomplete with recent/suggested emojis when typing just ":"', async () => {
    const user = await renderEditor();
    await user.keyboard(':');

    await waitFor(() =>
      expect(screen.getByRole('listbox', { name: 'Emoji suggestions' })).toBeTruthy(),
    );
    expect(screen.getByText('Recently used / Suggested')).toBeTruthy();
  });

  it('opens emoji autocomplete when typing ":"', async () => {
    const user = await renderEditor();
    await user.keyboard(':rocket');

    await waitFor(() =>
      expect(screen.getByRole('listbox', { name: 'Emoji suggestions' })).toBeTruthy(),
    );
    expect(screen.getByText('🚀')).toBeTruthy();
  });

  it('selects emoji from autocomplete with keyboard and inserts it into document', async () => {
    const user = await renderEditor();
    await user.keyboard(':pizza{Enter}');

    await waitFor(() =>
      expect(screen.queryByRole('listbox', { name: 'Emoji suggestions' })).toBeNull(),
    );
    expect(editor().textContent).toContain('🍕');
  });

  it('closes autocomplete on Escape', async () => {
    const user = await renderEditor();
    await user.keyboard(':fire');

    await waitFor(() =>
      expect(screen.getByRole('listbox', { name: 'Emoji suggestions' })).toBeTruthy(),
    );
    await user.keyboard('{Escape}');
    await waitFor(() =>
      expect(screen.queryByRole('listbox', { name: 'Emoji suggestions' })).toBeNull(),
    );
  });

  it('inserts emoji into document using the modal emoji picker', async () => {
    const user = await renderEditor();
    await user.keyboard('/emoji{Enter}');

    await waitFor(() => expect(screen.getByText('Insert emoji into document')).toBeTruthy());
    const searchInput = screen.getByPlaceholderText('Search emojis…');
    await user.type(searchInput, 'rocket');

    const rocketButton = screen.getByRole('button', { name: '🚀' });
    await user.click(rocketButton);

    await waitFor(() => expect(screen.queryByText('Insert emoji into document')).toBeNull());
    expect(editor().textContent).toContain('🚀');
  });
});
