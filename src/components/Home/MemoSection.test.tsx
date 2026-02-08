import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MemoSection from '../Home/MemoSection';
import { useMemoStore } from '../../stores/memoStore';

describe('MemoSection', () => {
  beforeEach(() => {
    localStorage.clear();
    useMemoStore.persist.clearStorage();
  });

  it('renders memo section with default text', () => {
    render(<MemoSection />);
    expect(screen.getByText('나의 메모장')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('여기에 메모를 작성하세요...')).toBeInTheDocument();
  });

  it('loads saved memo from localStorage', async () => {
    localStorage.setItem(
      'tagus-memo-storage',
      JSON.stringify({ state: { memo: 'Test memo content' }, version: 0 })
    );
    await useMemoStore.persist.rehydrate();
    render(<MemoSection />);
    const textarea = screen.getByPlaceholderText('여기에 메모를 작성하세요...');
    expect(textarea).toHaveValue('Test memo content');
  });

  it('saves memo to localStorage when changed', async () => {
    render(<MemoSection />);
    const textarea = screen.getByPlaceholderText('여기에 메모를 작성하세요...');
    await userEvent.type(textarea, 'New memo');
    expect(localStorage.getItem('tagus-memo-storage')).toContain('New memo');
  });
});
