import React, { memo, lazy, Suspense, useState } from 'react';
import MobileLayout from './components/Layout/MobileLayout';
import { useItemsStore } from './stores/itemsStore';
import { useAuthStore } from './stores/authStore';
import AuthBootstrap from './components/Auth/AuthBootstrap';
import AuthGate from './components/Auth/AuthGate';
import { AppTab } from './types/app';

// Lazy load screens
const HomeScreen = lazy(() => import('./screens/HomeScreen'));
const ChatScreen = lazy(() => import('./screens/ChatScreen'));
const MapScreen = lazy(() => import('./screens/MapScreen'));
const ProfileScreen = lazy(() => import('./screens/ProfileScreen'));
const BottomNavBar = lazy(() => import('./components/Navigation/BottomNavBar'));

// Loading component
const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="w-10 h-10 border-4 border-gray-300 border-t-[#0F172A] rounded-full animate-spin" />
  </div>
);

// Memoized components
const MemoizedHomeScreen = memo(HomeScreen);
const MemoizedChatScreen = memo(ChatScreen);
const MemoizedMapScreen = memo(MapScreen);
const MemoizedProfileScreen = memo(ProfileScreen);
const MemoizedBottomNavBar = memo(BottomNavBar);

function App() {
  const items = useItemsStore(state => state.items);
  const addItem = useItemsStore(state => state.addItem);
  const removeItem = useItemsStore(state => state.removeItem);
  const updateItemName = useItemsStore(state => state.updateItemName);
  const updateItemImage = useItemsStore(state => state.updateItemImage);
  const updateItemLocation = useItemsStore(state => state.updateItemLocation);
  const updateItemStatus = useItemsStore(state => state.updateItemStatus);

  const status = useAuthStore(state => state.status);
  const user = useAuthStore(state => state.user);

  const [activeTab, setActiveTab] = useState<AppTab>('home');

  const renderScreen = () => {
    if (activeTab === 'home') {
      return (
        <MemoizedHomeScreen
          items={items}
          onUpdateItemName={updateItemName}
          onUpdateItemImage={updateItemImage}
          onRemoveItem={removeItem}
        />
      );
    }

    if (activeTab === 'chat') {
      return <MemoizedChatScreen />;
    }

    if (activeTab === 'map') {
      return (
        <MemoizedMapScreen
          items={items}
          onUpdateItemLocation={updateItemLocation}
          onUpdateItemStatus={updateItemStatus}
        />
      );
    }

    return <MemoizedProfileScreen />;
  };

  return (
    <>
      <AuthBootstrap />
      {status === 'loading' ? (
        <LoadingSpinner />
      ) : !user ? (
        <AuthGate />
      ) : (
        <MobileLayout>
          <Suspense fallback={<LoadingSpinner />}>
            {renderScreen()}
            <MemoizedBottomNavBar
              activeTab={activeTab}
              onNavigate={setActiveTab}
              onAddItem={addItem}
            />
          </Suspense>
        </MobileLayout>
      )}
    </>
  );
}

export default App;
