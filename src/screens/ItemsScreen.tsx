import React, { memo } from 'react';
import ItemsList from '../components/Items/ItemsList';
import { Item } from '../stores/itemsStore';

interface ItemsScreenProps {
  items: Item[];
  onUpdateItemName: (itemId: number, newName: string) => Promise<void>;
  onUpdateItemImage: (itemId: number, newImageUrl: string, storagePath?: string) => Promise<void>;
  onRemoveItem: (itemId: number) => Promise<void>;
}

const ItemsScreen: React.FC<ItemsScreenProps> = ({
  items,
  onUpdateItemName,
  onUpdateItemImage,
  onRemoveItem,
}) => {
  return (
    <div className="pb-12 pt-6">
      <div className="px-6 pb-6">
        <div className="neumorphic-card rounded-[25px] p-6">
          <h2 className="text-2xl font-bold text-[#202020]">내 아이템</h2>
          <p className="text-sm text-[#737373] mt-1">등록된 분실물과 메모를 한눈에 확인하세요.</p>
        </div>
      </div>
      <ItemsList
        items={items}
        onUpdateItemName={onUpdateItemName}
        onUpdateItemImage={onUpdateItemImage}
        onRemoveItem={onRemoveItem}
      />
    </div>
  );
};

export default memo(ItemsScreen);
