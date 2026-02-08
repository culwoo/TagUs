import { useState, useRef } from 'react';
import { Image as ImageIcon, Loader2, X } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { api } from '../../services/api';

interface BackgroundRemovalModalProps {
  imageUrl: string;
  onClose: () => void;
  onRemove: (payload: { previewUrl: string; file: File }) => void;
}

export type RemovalMethod = 'rembg' | 'grabcut' | 'ai';

const base64ToBlob = (base64: string, contentType: string) => {
  const byteCharacters = atob(base64);
  const byteNumbers = Array.from(byteCharacters, char => char.charCodeAt(0));
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: contentType });
};

const BackgroundRemovalModal: React.FC<BackgroundRemovalModalProps> = ({
  imageUrl,
  onClose,
  onRemove,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<RemovalMethod>('ai');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showToast('지원되는 이미지 형식이 아닙니다 (JPEG, PNG, WebP)', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('파일 크기는 10MB 이하여야 합니다', 'error');
      return;
    }

    try {
      setIsProcessing(true);
      showToast('배경 제거 중...', 'info');

      const data = await api.removeBackground({ imageFile: file });
      const processedBlob = base64ToBlob(
        data.processedImageBase64,
        data.contentType || 'image/png'
      );
      const processedFile = new File([processedBlob], `processed-${Date.now()}.png`, {
        type: data.contentType || 'image/png',
      });
      const previewUrl = URL.createObjectURL(processedFile);

      onRemove({ previewUrl, file: processedFile });
      showToast('배경 제거 완료!', 'success');
      onClose();
    } catch (error) {
      console.error('Background removal failed:', error);
      showToast('배경 제거에 실패했습니다. 다시 시도해주세요.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileInputClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 id="modal-title" className="text-xl font-bold text-[#1A1A1A]">
            배경 제거
          </h2>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
            aria-label="닫기"
          >
            <X size={20} color="#666" />
          </button>
        </div>

        {/* Preview Image */}
        <div className="bg-gray-100 rounded-xl p-4 mb-6">
          <img src={imageUrl} alt="Original" className="w-full h-auto rounded-lg" />
        </div>

        {/* Method Selection */}
        <div className="mb-6">
          <label className="text-sm font-semibold text-[#1A1A1A] mb-2 block">제거 방법</label>
          <div className="grid grid-cols-3 gap-2">
            {(['rembg', 'grabcut', 'ai'] as RemovalMethod[]).map(method => (
              <button
                key={method}
                onClick={() => setSelectedMethod(method)}
                disabled={isProcessing}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedMethod === method
                    ? 'border-[#007AFF] bg-[#007AFF] text-white'
                    : 'border-gray-200 hover:border-gray-300'
                } disabled:opacity-50`}
              >
                <div className="text-xs font-medium mb-1">{method.toUpperCase()}</div>
                <div className="text-xs">{method === selectedMethod ? '선택됨' : '선택'}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <button
          onClick={handleFileInputClick}
          disabled={isProcessing}
          className="w-full bg-[#007AFF] text-white py-3 rounded-xl font-semibold hover:bg-[#0062CC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              <span>처리 중...</span>
            </>
          ) : (
            <>
              <ImageIcon size={20} />
              <span>이미지 다시 선택</span>
            </>
          )}
        </button>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isProcessing}
          aria-label="이미지 파일 선택"
        />
      </div>
    </div>
  );
};

export default BackgroundRemovalModal;
