import React, { memo } from 'react';
import StatusBar from '../components/Home/StatusBar';
import Header from '../components/Home/Header';
import ItemCarousel from '../components/Home/ItemCarousel';
import MemoSection from '../components/Home/MemoSection';
import { Item } from '../stores/itemsStore';
import NotificationCenter from '../components/Home/NotificationCenter';

interface HomeScreenProps {
  items: Item[];
  onUpdateItemName: (itemId: number, newName: string) => Promise<void>;
  onUpdateItemImage: (itemId: number, newImageUrl: string, storagePath?: string) => Promise<void>;
  onRemoveItem: (itemId: number) => Promise<void>;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ items, onUpdateItemName, onUpdateItemImage, onRemoveItem }) => {
  const [isNotificationOpen, setIsNotificationOpen] = React.useState(false);
  const [selectedItemId, setSelectedItemId] = React.useState<number | null>(items[0]?.id ?? null);

  React.useEffect(() => {
    const firstItem = items[0];
    if (!firstItem) {
      setSelectedItemId(null);
      return;
    }

    if (selectedItemId === null || !items.some((item) => item.id === selectedItemId)) {
      setSelectedItemId(firstItem.id);
    }
  }, [items, selectedItemId]);

  const selectedItem = items.find((item) => item.id === selectedItemId) ?? items[0];

  return (
    <div className="flex flex-col pb-6">
      <StatusBar />
      <Header selectedItem={selectedItem} onOpenNotifications={() => setIsNotificationOpen(true)} />
      <ItemCarousel
        items={items}
        onUpdateItemName={onUpdateItemName}
        onUpdateItemImage={onUpdateItemImage}
        onRemoveItem={onRemoveItem}
        onActiveItemChange={(item) => setSelectedItemId(item.id)}
      />
      <MemoSection />
      <NotificationCenter isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
    </div>
  );
};

export default memo(HomeScreen);
