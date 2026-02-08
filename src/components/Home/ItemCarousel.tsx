import React, { useState, memo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { Edit2, Check, X, Camera, Trash2 } from 'lucide-react';
import { Item } from '../../stores/itemsStore';
import EmptyState from '../common/EmptyState';
import ConfirmModal from '../common/ConfirmModal';
import { useToast } from '../../contexts/ToastContext';
import { MAX_ITEM_NAME_LENGTH } from '../../constants/item';

// Import Swiper styles
import 'swiper/css';

interface ItemCarouselProps {
  items: Item[];
  onUpdateItemName: (itemId: number, newName: string) => Promise<void>;
  onUpdateItemImage: (itemId: number, newImageUrl: string, storagePath?: string) => Promise<void>;
  onRemoveItem: (itemId: number) => Promise<void>;
  onActiveItemChange?: (item: Item) => void;
}

const ItemCarousel: React.FC<ItemCarouselProps> = memo(({ items, onUpdateItemName, onUpdateItemImage, onRemoveItem, onActiveItemChange }) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast } = useToast();
  void onUpdateItemImage;

  const handleEditClick = (item: Item) => {
    setEditingId(item.id);
    setEditValue(item.name);
  };

  const handleSave = async (itemId: number) => {
    if (editValue.trim()) {
      setIsSaving(true);
      await onUpdateItemName(itemId, editValue.trim());
      setIsSaving(false);
      setEditingId(null);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleSlideChange = (swiper: SwiperType) => {
    setActiveIndex(swiper.realIndex);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await onRemoveItem(deleteTarget.id);
      showToast('아이템이 삭제되었습니다', 'success');
    } catch (error) {
      console.error('Failed to delete item:', error);
      showToast('아이템 삭제에 실패했습니다', 'error');
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  React.useEffect(() => {
    if (items.length === 0) {
      return;
    }

    if (activeIndex >= items.length) {
      setActiveIndex(items.length - 1);
      return;
    }

    const activeItem = items[activeIndex];
    if (activeItem && onActiveItemChange) {
      onActiveItemChange(activeItem);
    }
  }, [activeIndex, items, onActiveItemChange]);

  // 빈 상태 처리
  if (items.length === 0) {
    return (
      <div className="w-full py-8 px-6">
        <EmptyState
          title="아직 등록된 물건이 없어요"
          description="하단의 + 버튼을 눌러 물건 사진을 촬영하면 AI가 자동으로 인식해요!"
          icon={<Camera size={40} className="text-[#254179]" />}
        />
      </div>
    );
  }

  return (
    <>
      <div className="w-full pt-3 pb-4 px-6">
      <Swiper
        spaceBetween={20}
        slidesPerView={1}
        loop={items.length > 1}
        onSlideChange={handleSlideChange}
        touchStartPreventDefault={false}
        touchMoveStopPropagation={false}
        nested
        style={{
          overflow: 'visible',
          paddingTop: '10px',
          paddingBottom: '14px',
          touchAction: 'pan-y',
        }}
      >
        {items.map((item) => (
          <SwiperSlide
            key={item.id}
            style={{
              overflow: 'visible',
            }}
          >
            <div className="flex flex-col items-center justify-center">
              {/* Image Container with Neumorphic Card - 메인 컬러 배경 */}
              <div
                className="w-[240px] h-[240px] rounded-[24px] flex items-center justify-center mx-auto overflow-hidden"
                style={{
                  background: '#DEE8F4',
                  boxShadow: '12px 12px 24px rgba(163, 177, 198, 0.5), -12px -12px 24px rgba(255, 255, 255, 0.7)',
                }}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  loading="lazy"
                  className="w-full h-full object-contain p-4"
                />
              </div>

              {/* Item Name with inline Edit button */}
              <div className="mt-6 flex flex-col items-center gap-3 justify-center">
                {editingId === item.id ? (
                  <>
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditValue(e.target.value)}
                      maxLength={MAX_ITEM_NAME_LENGTH}
                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === 'Enter') handleSave(item.id);
                        if (e.key === 'Escape') handleCancel();
                      }}
                      disabled={isSaving}
                      autoFocus
                      className="text-base font-semibold text-[#202020] neumorphic-input rounded-xl px-4 py-2 w-[200px] text-center outline-none border-none disabled:opacity-50"
                    />
                    <p className="text-[11px] text-[#9CA3AF] mt-[-6px]">
                      {editValue.length}/{MAX_ITEM_NAME_LENGTH}
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleSave(item.id)}
                        disabled={isSaving}
                        className="neumorphic-button border-none rounded-full w-9 h-9 flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="저장"
                      >
                        <Check size={16} color="#254179" />
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={isSaving}
                        className="neumorphic-button border-none rounded-full w-9 h-9 flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="취소"
                      >
                        <X size={16} color="#254179" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="relative w-[240px] h-9">
                    <span
                      className="absolute inset-0 flex items-center justify-center text-base font-semibold text-[#202020] truncate px-12"
                      title={item.name}
                    >
                      {item.name}
                    </span>
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <button
                        onClick={() => handleEditClick(item)}
                        className="neumorphic-button w-7 h-7 rounded-full border-none cursor-pointer flex items-center justify-center"
                        aria-label={`${item.name} 이름 수정`}
                      >
                        <Edit2 size={12} color="#254179" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(item)}
                        className="neumorphic-button w-7 h-7 rounded-full border-none cursor-pointer flex items-center justify-center"
                        aria-label={`${item.name} 삭제`}
                      >
                        <Trash2 size={12} className="text-[#DC2626]" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* 하단 도트 인디케이터 - 크기 증가 */}
      <div className="flex justify-center gap-3 mt-2">
        {items.map((_, index) => (
          <div
            key={index}
            className="transition-all duration-300"
            style={{
              width: index === activeIndex ? '32px' : '12px',
              height: '12px',
              borderRadius: '6px',
              background: index === activeIndex ? '#254179' : '#DEE8F4',
              boxShadow: index === activeIndex
                ? '3px 3px 6px rgba(163, 177, 198, 0.4), -3px -3px 6px rgba(255, 255, 255, 0.5)'
                : 'inset 3px 3px 6px rgba(163, 177, 198, 0.3), inset -3px -3px 6px rgba(255, 255, 255, 0.4)',
            }}
          />
        ))}
      </div>
      </div>
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="아이템 삭제"
        message={`"${deleteTarget?.name}"을(를) 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmLabel={isDeleting ? '삭제 중...' : '삭제'}
        cancelLabel="취소"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
});

ItemCarousel.displayName = 'ItemCarousel';

export default ItemCarousel;
