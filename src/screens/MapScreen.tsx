import React, { memo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { MapPin } from 'lucide-react';
import type { Item, ItemLocation, ItemStatus } from '../stores/itemsStore';
import EmptyState from '../components/common/EmptyState';
import { useToast } from '../contexts/ToastContext';
import { useNotificationStore } from '../stores/notificationStore';

import 'swiper/css';

interface MapScreenProps {
  items: Item[];
  onUpdateItemLocation: (itemId: number, location: ItemLocation) => Promise<void>;
  onUpdateItemStatus: (itemId: number, status: ItemStatus) => Promise<void>;
}

const statuses: ItemStatus[] = ['safe', 'lost', 'found'];

const statusLabel: Record<ItemStatus, string> = {
  safe: '보관 중',
  lost: '분실',
  found: '찾음',
};

const MapScreen: React.FC<MapScreenProps> = ({ items, onUpdateItemLocation, onUpdateItemStatus }) => {
  const [drafts, setDrafts] = React.useState<Record<number, ItemLocation>>({});
  const [savingId, setSavingId] = React.useState<number | null>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const swiperRef = React.useRef<SwiperType | null>(null);
  const { showToast } = useToast();
  const locationById = React.useMemo(() => new Map(items.map((item) => [item.id, item.location])), [items]);

  React.useEffect(() => {
    if (items.length === 0) {
      setActiveIndex(0);
      return;
    }

    if (activeIndex >= items.length) {
      setActiveIndex(items.length - 1);
    }
  }, [activeIndex, items.length]);

  const activeItem = items[activeIndex] ?? items[0];
  const activeDraft =
    activeItem && (drafts[activeItem.id] ?? activeItem.location);

  const updateDraft = (itemId: number, patch: Partial<ItemLocation>) => {
    setDrafts((prev) => ({
      ...prev,
      [itemId]: {
        ...(locationById.get(itemId) ?? { label: '미지정', station: '', boxNumber: '', updatedAt: Date.now() }),
        ...(prev[itemId] ?? {}),
        ...patch,
      },
    }));
  };

  const saveLocation = async (item: Item) => {
    const target = drafts[item.id] ?? item.location;
    setSavingId(item.id);
    const locationPayload: ItemLocation = {
      label: target.label || '미지정',
      station: target.station || '',
      boxNumber: target.boxNumber || '',
      updatedAt: Date.now(),
    };

    try {
      await onUpdateItemLocation(item.id, locationPayload);
      await useNotificationStore.getState().addNotification('위치 업데이트', `"${item.name}" 위치가 저장되었습니다.`, 'success');
      showToast('아이템 위치를 저장했습니다', 'success');
    } catch (error) {
      console.error('Location update failed:', error);
      showToast('위치 저장에 실패했습니다', 'error');
    } finally {
      setSavingId(null);
    }
  };

  const updateStatus = async (item: Item, status: ItemStatus) => {
    try {
      await onUpdateItemStatus(item.id, status);
      await useNotificationStore.getState().addNotification('상태 변경', `"${item.name}" 상태가 ${statusLabel[status]}(으)로 변경되었습니다.`, 'info');
      showToast(`상태를 ${statusLabel[status]}로 변경했습니다`, 'info');
    } catch (error) {
      console.error('Status update failed:', error);
      showToast('상태 변경에 실패했습니다', 'error');
    }
  };

  const handleSlideChange = (swiper: SwiperType) => {
    setActiveIndex(swiper.realIndex);
  };

  if (items.length === 0) {
    return (
      <div className="pt-8">
        <EmptyState title="아이템이 없습니다" description="+ 버튼으로 물건을 등록하면 위치를 기록할 수 있습니다." icon={<MapPin size={38} />} />
      </div>
    );
  }

  return (
    <div className="pb-12 pt-6">
      <div className="px-6 pb-4">
        <div className="neumorphic-card rounded-[25px] p-6">
          <h2 className="text-2xl font-bold text-[#202020]">아이템별 위치</h2>
          <p className="text-sm text-[#737373] mt-1">홈 순서 그대로 넘기면서 위치를 수정하세요.</p>
        </div>
      </div>

      <div className="px-6">
        <Swiper
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          spaceBetween={20}
          slidesPerView={1}
          loop={items.length > 1}
          onSlideChange={handleSlideChange}
          touchStartPreventDefault={false}
          touchMoveStopPropagation={false}
          nested
          style={{
            overflow: 'visible',
            paddingTop: '8px',
            paddingBottom: '12px',
            touchAction: 'pan-y',
          }}
        >
          {items.map((item) => (
            <SwiperSlide key={item.id} style={{ overflow: 'visible' }}>
              <div className="flex flex-col items-center justify-center">
                <div
                  className="w-[240px] h-[240px] rounded-[24px] flex items-center justify-center mx-auto overflow-hidden"
                  style={{
                    background: '#DEE8F4',
                    boxShadow: '12px 12px 24px rgba(163, 177, 198, 0.5), -12px -12px 24px rgba(255, 255, 255, 0.7)',
                  }}
                >
                  <img src={item.image} alt={item.name} loading="lazy" className="w-full h-full object-contain p-4" />
                </div>
                <div className="mt-5 text-center">
                  <p className="text-[22px] font-bold text-[#202020] leading-[1.2] max-w-[260px] truncate" title={item.name}>
                    {item.name}
                  </p>
                  <p className="text-sm text-[#737373] mt-1">{statusLabel[item.status]}</p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="mt-2 flex items-center justify-center gap-3">
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className="transition-all duration-300 border-none"
              style={{
                width: index === activeIndex ? '32px' : '12px',
                height: '12px',
                borderRadius: '6px',
                background: index === activeIndex ? '#254179' : '#DEE8F4',
                boxShadow:
                  index === activeIndex
                    ? '3px 3px 6px rgba(163, 177, 198, 0.4), -3px -3px 6px rgba(255, 255, 255, 0.5)'
                    : 'inset 3px 3px 6px rgba(163, 177, 198, 0.3), inset -3px -3px 6px rgba(255, 255, 255, 0.4)',
              }}
              onClick={() => {
                if (items.length > 1) {
                  swiperRef.current?.slideToLoop(index);
                } else {
                  swiperRef.current?.slideTo(index);
                }
                setActiveIndex(index);
              }}
              aria-label={`${index + 1}번째 아이템으로 이동`}
            />
          ))}
        </div>

      </div>

      {activeItem && activeDraft && (
        <div className="px-6 mt-5">
          <div className="neumorphic-card rounded-[24px] p-5">
            <div className="grid grid-cols-3 gap-2 mb-4">
              {statuses.map((status) => (
                <button
                  key={status}
                  className={`py-2 rounded-lg text-xs font-semibold border-none ${
                    activeItem.status === status ? 'neumorphic-pressed text-[#254179]' : 'neumorphic-button text-[#374151]'
                  }`}
                  onClick={() => updateStatus(activeItem, status)}
                >
                  {statusLabel[status]}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <input
                value={activeDraft.label}
                onChange={(event) => updateDraft(activeItem.id, { label: event.target.value })}
                placeholder="예: 회사 사물함"
                className="w-full neumorphic-input border-none rounded-xl px-4 py-3 text-[#202020] outline-none"
              />
              <input
                value={activeDraft.station}
                onChange={(event) => updateDraft(activeItem.id, { station: event.target.value })}
                placeholder="예: 서울역 1호선"
                className="w-full neumorphic-input border-none rounded-xl px-4 py-3 text-[#202020] outline-none"
              />
              <input
                value={activeDraft.boxNumber}
                onChange={(event) => updateDraft(activeItem.id, { boxNumber: event.target.value })}
                placeholder="예: 보관함 230번"
                className="w-full neumorphic-input border-none rounded-xl px-4 py-3 text-[#202020] outline-none"
              />
              <button
                className="w-full py-3 rounded-xl neumorphic-button text-[#254179] font-semibold border-none disabled:opacity-60"
                onClick={() => saveLocation(activeItem)}
                disabled={savingId === activeItem.id}
              >
                {savingId === activeItem.id ? '저장 중...' : '위치 저장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(MapScreen);
