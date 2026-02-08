import { beforeEach, describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Header from '../Home/Header'
import { useItemsStore } from '../../stores/itemsStore'
import type { Item } from '../../stores/itemsStore'

const selectedItem: Item = {
  id: 1,
  name: '테스트 물건',
  image: 'https://example.com/item.png',
  location: {
    label: '서랍',
    station: '서울역',
    boxNumber: '12번',
    updatedAt: Date.now(),
  },
  status: 'safe',
  createdAt: Date.now(),
  updatedAt: Date.now(),
}

describe('Header', () => {
  beforeEach(() => {
    localStorage.clear()
    useItemsStore.persist.clearStorage()
    useItemsStore.getState().setItems([])
  })

  it('renders latest location information', () => {
    render(<Header selectedItem={selectedItem} onOpenNotifications={() => undefined} />)
    expect(screen.getByText('서랍')).toBeInTheDocument()
    expect(screen.getByText('서울역')).toBeInTheDocument()
    expect(screen.getByText('12번')).toBeInTheDocument()
  })

  it('calls open notifications when button is clicked', async () => {
    const onOpenNotifications = vi.fn()
    render(<Header onOpenNotifications={onOpenNotifications} />)
    await userEvent.click(screen.getByRole('button', { name: '알림' }))
    expect(onOpenNotifications).toHaveBeenCalledTimes(1)
  })

  it('shows fallback location text when no selected item exists', () => {
    render(<Header onOpenNotifications={() => undefined} />)
    expect(screen.getByText('최근 위치 미지정')).toBeInTheDocument()
    expect(screen.getByText('위치를 아직 기록하지 않았어요')).toBeInTheDocument()
    expect(screen.getByText('아이템별 보관 위치를 등록하세요')).toBeInTheDocument()
  })
})
