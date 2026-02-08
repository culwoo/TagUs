import { useState, useMemo } from 'react';
import { Trash2, Edit2, Check, X, Image as ImageIcon, Search, Package } from 'lucide-react';
import { Item } from '../../stores/itemsStore';
import { useToast } from '../../contexts/ToastContext';
import { itemService } from '../../firebase/items';
import { useAuthStore } from '../../stores/authStore';
import EmptyState from '../common/EmptyState';
import ConfirmModal from '../common/ConfirmModal';
import { MAX_ITEM_NAME_LENGTH } from '../../constants/item';

interface ItemsListProps {
  items: Item[];
  onUpdateItemName: (itemId: number, newName: string) => Promise<void>;
  onUpdateItemImage: (itemId: number, newImageUrl: string, storagePath?: string) => Promise<void>;
  onRemoveItem: (itemId: number) => Promise<void>;
}

const ItemsList: React.FC<ItemsListProps> = ({ items, onUpdateItemName, onUpdateItemImage, onRemoveItem }) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast } = useToast();
  const userId = useAuthStore((state) => state.user?.uid);

  // 검색 필터링
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter((item) => item.name.toLowerCase().includes(query));
  }, [items, searchQuery]);

  const handleEditClick = (item: Item) => {
    setEditingId(item.id);
    setEditValue(item.name);
  };

  const handleSave = async (itemId: number) => {
    if (!editValue.trim()) return;
    setIsSaving(true);
    await onUpdateItemName(itemId, editValue.trim());
    setIsSaving(false);
    setEditingId(null);
    showToast('아이템 이름이 업데이트되었습니다', 'success');
  };

  const handleImageChange = async (itemId: number, file: File) => {
    try {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        showToast('지원되는 이미지 형식이 아닙니다 (JPEG, PNG, WebP)', 'error');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        showToast('파일 크기는 10MB 이하여야 합니다', 'error');
        return;
      }

      let imageUrl = URL.createObjectURL(file);
      let storagePath: string | undefined;

      if (userId) {
        const uploadResult = await itemService.uploadImage(userId, file);
        imageUrl = uploadResult.downloadUrl;
        storagePath = uploadResult.storagePath;
      }

      await onUpdateItemImage(itemId, imageUrl, storagePath);
      showToast('아이템 이미지가 업데이트되었습니다', 'success');
    } catch (error) {
      console.error('Image update failed:', error);
      showToast('이미지 업데이트에 실패했습니다', 'error');
    }
  };

  const handleDeleteClick = (item: Item) => {
    setDeleteTarget(item);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await onRemoveItem(deleteTarget.id);
      showToast('아이템이 삭제되었습니다', 'success');
    } catch (error) {
      console.error('Delete failed:', error);
      showToast('삭제에 실패했습니다', 'error');
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteTarget(null);
  };

  // 빈 상태 처리
  if (items.length === 0) {
    return (
      <EmptyState
        title="등록된 아이템이 없어요"
        description="+ 버튼을 눌러 물건 사진을 촬영하면 AI가 자동으로 인식해요!"
        icon={<Package size={40} className="text-[#254179]" />}
      />
    );
  }

  return (
    <>
      {/* 검색 바 */}
      {items.length > 0 && (
        <div className="px-6 pb-4">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#737373]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="아이템 검색..."
              className="w-full neumorphic-input border-none rounded-xl pl-11 pr-4 py-3 text-[#202020] text-sm outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#202020]"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 검색 결과 없음 */}
      {filteredItems.length === 0 && searchQuery && (
        <EmptyState
          title="검색 결과가 없어요"
          description={`"${searchQuery}"와 일치하는 아이템을 찾을 수 없습니다.`}
          icon={<Search size={40} className="text-[#737373]" />}
        />
      )}

      {/* 아이템 목록 */}
      <div className="space-y-5 px-6 pb-6">
        {filteredItems.map((item) => (
          <div key={item.id} className="neumorphic-card rounded-[20px] p-5">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-xl neumorphic-pressed p-1">
                <img src={item.image} alt={item.name} className="w-full h-full rounded-lg object-cover" />
              </div>
              <div className="flex-1">
                {editingId === item.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={editValue}
                      onChange={(event) => setEditValue(event.target.value)}
                      maxLength={MAX_ITEM_NAME_LENGTH}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSave(item.id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      className="flex-1 neumorphic-input border-none rounded-lg px-3 py-2 text-sm text-[#202020] outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSave(item.id)}
                      disabled={isSaving}
                      className="w-9 h-9 rounded-full neumorphic-button border-none flex items-center justify-center text-[#254179] cursor-pointer disabled:opacity-50"
                    >
                      <Check size={18} />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="w-9 h-9 rounded-full neumorphic-button border-none flex items-center justify-center text-[#254179] cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base font-semibold text-[#202020]">{item.name}</p>
                      <p className="text-xs text-[#737373]">ID #{item.id}</p>
                    </div>
                    <button
                      onClick={() => handleEditClick(item)}
                      className="w-9 h-9 rounded-full neumorphic-button border-none flex items-center justify-center text-[#254179] cursor-pointer"
                      aria-label="아이템 이름 수정"
                    >
                      <Edit2 size={16} />
                    </button>
                  </div>
                )}
                <div className="mt-4 flex items-center gap-2">
                  <label className="w-9 h-9 rounded-full neumorphic-button border-none cursor-pointer flex items-center justify-center text-[#254179]">
                    <ImageIcon size={16} />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) {
                          handleImageChange(item.id, file);
                        }
                      }}
                    />
                  </label>
                  <button
                    onClick={() => handleDeleteClick(item)}
                    className="w-9 h-9 rounded-full neumorphic-button border-none flex items-center justify-center text-[#DC2626] cursor-pointer"
                    aria-label="아이템 삭제"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 삭제 확인 모달 */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="아이템 삭제"
        message={`"${deleteTarget?.name}"을(를) 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmLabel={isDeleting ? '삭제 중...' : '삭제'}
        cancelLabel="취소"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </>
  );
};

export default ItemsList;
