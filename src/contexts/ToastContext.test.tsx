import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ToastProvider, useToast } from './ToastContext'

describe('Toast', () => {
  it('renders toast message', async () => {
    const TestComponent = () => {
      const { showToast } = useToast()
      return (
        <button onClick={() => showToast('Test message', 'info')}>
          Show Toast
        </button>
      )
    }

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    const button = screen.getByText('Show Toast')
    await userEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('Test message')).toBeInTheDocument()
    })
  })
})
