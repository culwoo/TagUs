import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MapScreen from './MapScreen'
import { ToastProvider } from '../contexts/ToastContext'
import type { Item } from '../stores/itemsStore'

const sampleItem: Item = {
  id: 1,
  name: '테스트 물건',
  image: 'https://example.com/item.png',
  location: {
    label: '회사 서랍',
    station: '서울역',
    boxNumber: '12번',
    updatedAt: Date.now(),
  },
  status: 'safe',
  createdAt: Date.now(),
  updatedAt: Date.now(),
}

describe('MapScreen', () => {
  it('updates item location', async () => {
    const onUpdateItemLocation = vi.fn().mockResolvedValue(undefined)
    const onUpdateItemStatus = vi.fn().mockResolvedValue(undefined)

    render(
      <ToastProvider>
        <MapScreen items={[sampleItem]} onUpdateItemLocation={onUpdateItemLocation} onUpdateItemStatus={onUpdateItemStatus} />
      </ToastProvider>
    )

    const user = userEvent.setup()
    const labelInput = screen.getByDisplayValue('회사 서랍')
    await user.clear(labelInput)
    await user.type(labelInput, '집 현관')
    await user.click(screen.getByRole('button', { name: '위치 저장' }))

    expect(onUpdateItemLocation).toHaveBeenCalledTimes(1)
    const firstCall = onUpdateItemLocation.mock.calls[0]!
    expect(firstCall[0]).toBe(1)
    expect(firstCall[1]).toMatchObject({
      label: '집 현관',
      station: '서울역',
      boxNumber: '12번',
    })
  })
})
