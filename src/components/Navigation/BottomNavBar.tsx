import React, { memo, useRef, useState } from 'react';
import { Home, Loader2, MapPin, MessageCircle, Plus, User } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useAuthStore } from '../../stores/authStore';
import { itemService } from '../../firebase/items';
import { AppTab } from '../../types/app';
import ItemRegistrationModal from '../common/ItemRegistrationModal';
import { createDefaultItemLocation, type Item } from '../../../shared/domain';

interface BottomNavBarProps {
  activeTab: AppTab;
  onNavigate: (tab: AppTab) => void;
  onAddItem: (item: Item) => Promise<void>;
}

interface PendingImage {
  file: File;
  previewUrl: string;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, onNavigate, onAddItem }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingImage, setPendingImage] = useState<PendingImage | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();
  const userId = useAuthStore(state => state.user?.uid);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showToast('지원되는 이미지 형식이 아닙니다 (JPEG, PNG, WebP)', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('파일 크기는 10MB 이하여야 합니다', 'error');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setPendingImage({ file, previewUrl });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRegistrationComplete = async (
    itemName: string,
    processedImageBase64: string | null,
    useOriginal: boolean
  ) => {
    if (!pendingImage) return;

    try {
      setIsProcessing(true);

      let imageUrl: string;
      let storagePath: string | undefined;

      if (useOriginal || !processedImageBase64) {
        if (userId) {
          const uploadResult = await itemService.uploadImage(userId, pendingImage.file);
          imageUrl = uploadResult.downloadUrl;
          storagePath = uploadResult.storagePath;
        } else {
          imageUrl = pendingImage.previewUrl;
        }
      } else {
        const byteCharacters = atob(processedImageBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let index = 0; index < byteCharacters.length; index += 1) {
          byteNumbers[index] = byteCharacters.charCodeAt(index);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/png' });
        const processedFile = new File([blob], `${itemName}.png`, { type: 'image/png' });

        if (userId) {
          const uploadResult = await itemService.uploadImage(userId, processedFile);
          imageUrl = uploadResult.downloadUrl;
          storagePath = uploadResult.storagePath;
        } else {
          imageUrl = `data:image/png;base64,${processedImageBase64}`;
        }
      }

      const timestamp = Date.now();
      const newItem: Item = {
        id: timestamp,
        name: itemName,
        image: imageUrl,
        storagePath,
        location: createDefaultItemLocation(timestamp),
        status: 'safe',
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      await onAddItem(newItem);
      showToast('아이템이 추가되었습니다', 'success');
      onNavigate('home');
    } catch (error) {
      console.error('Error saving item:', error);
      showToast(`저장 오류: ${error instanceof Error ? error.message : String(error)}`, 'error');
    } finally {
      setIsProcessing(false);
      if (pendingImage) {
        URL.revokeObjectURL(pendingImage.previewUrl);
      }
      setPendingImage(null);
    }
  };

  const handleModalClose = () => {
    if (pendingImage) {
      URL.revokeObjectURL(pendingImage.previewUrl);
    }
    setPendingImage(null);
  };

  const openPicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const tabButtonClass = (tab: AppTab) =>
    `flex items-center justify-center w-[44px] h-[44px] rounded-2xl transition ${
      activeTab === tab ? 'neumorphic-pressed text-[#254179]' : 'text-[#111827] opacity-80'
    }`;

  return (
    <>
      <nav
        role="navigation"
        aria-label="메인 네비게이션"
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[393px] h-[94px] bg-[#DEE8F4] rounded-t-[30px] z-[100] neumorphic-nav"
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          aria-label="이미지 파일 업로드"
        />

        <div className="h-full px-7 pb-[max(10px,env(safe-area-inset-bottom))] pt-4 flex items-end justify-between">
          <button
            onClick={() => onNavigate('home')}
            aria-label="홈"
            className={tabButtonClass('home')}
          >
            <Home size={20} />
          </button>
          <button
            onClick={() => onNavigate('chat')}
            aria-label="채팅"
            className={tabButtonClass('chat')}
          >
            <MessageCircle size={20} />
          </button>
          <div className="w-[60px]" />
          <button
            onClick={() => onNavigate('map')}
            aria-label="지도"
            className={tabButtonClass('map')}
          >
            <MapPin size={20} />
          </button>
          <button
            onClick={() => onNavigate('profile')}
            aria-label="프로필"
            className={tabButtonClass('profile')}
          >
            <User size={20} />
          </button>
        </div>

        <button
          onClick={openPicker}
          disabled={isProcessing}
          className="absolute left-1/2 -translate-x-1/2 -top-4 w-[58px] h-[58px] rounded-full bg-[#DEE8F4] border-[2px] border-[#254179]/45 flex items-center justify-center shadow-[0_6px_16px_rgba(37,65,121,0.16)] transition-all duration-200 active:scale-[0.97]"
          aria-label="아이템 추가"
          aria-busy={isProcessing}
        >
          <span className="w-[46px] h-[46px] rounded-full neumorphic-button flex items-center justify-center">
            {isProcessing ? (
              <Loader2 size={22} className="animate-spin text-[#254179]" />
            ) : (
              <Plus size={24} className="text-[#254179]" />
            )}
          </span>
        </button>
      </nav>

      {pendingImage && (
        <ItemRegistrationModal
          imageFile={pendingImage.file}
          imagePreviewUrl={pendingImage.previewUrl}
          onClose={handleModalClose}
          onComplete={handleRegistrationComplete}
        />
      )}
    </>
  );
};

export default memo(BottomNavBar);
