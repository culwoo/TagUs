import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';
import { ToastProvider } from './contexts/ToastContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { useAuthStore } from './stores/authStore';
import { useItemsStore } from './stores/itemsStore';
import { useMemoStore } from './stores/memoStore';

vi.mock('./components/Auth/AuthBootstrap', () => ({
  default: () => null,
}));

const renderApp = () =>
  render(
    <ErrorBoundary>
      <ToastProvider>
        <App />
      </ToastProvider>
    </ErrorBoundary>
  );

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    useItemsStore.persist.clearStorage();
    useMemoStore.persist.clearStorage();
    useItemsStore.getState().setItems([]);
    useMemoStore.getState().setMemo('');

    useAuthStore.getState().setUser({
      uid: 'test-user',
      email: 'test@example.com',
      displayName: 'Tester',
      photoURL: null,
    });
  });

  it('renders app shell without crashing', async () => {
    renderApp();
    expect(
      await screen.findByRole('navigation', { name: '메인 네비게이션' }, { timeout: 5000 })
    ).toBeInTheDocument();
  });

  it('renders home empty state', async () => {
    renderApp();
    expect(await screen.findByText('아직 등록된 물건이 없어요')).toBeInTheDocument();
  });

  it('renders memo and chat navigation', async () => {
    renderApp();
    expect(await screen.findByText('나의 메모장')).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: '채팅' })).toBeInTheDocument();
  });
});
