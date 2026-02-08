import React, { useState } from 'react';
import { X, Loader2, Check, Camera, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { MAX_ITEM_NAME_LENGTH } from '../../constants/item';

interface ItemRegistrationModalProps {
    imageFile: File;
    imagePreviewUrl: string;
    onClose: () => void;
    onComplete: (itemName: string, imageBase64: string | null, useOriginal: boolean) => void;
}

type RegistrationStep = 'naming' | 'processing' | 'complete';

interface ProcessingStatus {
    step: string;
    progress: number;
}

const ItemRegistrationModal: React.FC<ItemRegistrationModalProps> = ({
    imageFile,
    imagePreviewUrl,
    onClose,
    onComplete,
}) => {
    const [itemName, setItemName] = useState('');
    const [currentStep, setCurrentStep] = useState<RegistrationStep>('naming');
    const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({
        step: '',
        progress: 0,
    });
    const [error, setError] = useState<string | null>(null);

    const normalizeBackgroundError = (message: string) => {
        const lower = message.toLowerCase();
        if (lower.includes('request entity too large') || lower.includes('content too large') || lower.includes('413')) {
            return '이미지 전송 용량 한도를 초과했습니다. 더 작은 이미지로 시도해주세요.';
        }
        if (lower.includes('a server error has occurred') || lower.includes('function_invocation_failed')) {
            return '서버 배경 제거 기능에 장애가 있습니다. 잠시 후 다시 시도해주세요.';
        }
        return message;
    };

    // 그대로 등록 (배경 제거 없이)
    const handleRegisterAsIs = () => {
        if (!itemName.trim()) {
            setError('물건 이름을 입력해주세요');
            return;
        }
        setError(null);
        onComplete(itemName.trim(), null, true);
    };

    // AI 배경 제거 후 등록
    const handleRegisterWithBgRemoval = async () => {
        if (!itemName.trim()) {
            setError('물건 이름을 입력해주세요');
            return;
        }

        setError(null);
        setCurrentStep('processing');

        try {
            setProcessingStatus({ step: '배경 제거 중...', progress: 30 });

            const result = await api.removeBackground({
                imageFile,
                itemName: itemName.trim(),
            });

            setProcessingStatus({ step: '이미지 처리 중...', progress: 75 });

            setProcessingStatus({ step: '등록 완료!', progress: 100 });
            setCurrentStep('complete');

            setTimeout(() => {
                onComplete(itemName.trim(), result.processedImageBase64, false);
            }, 800);

        } catch (err) {
            const rawMessage = err instanceof Error ? err.message : '배경 제거 요청에 실패했습니다.';
            const message = normalizeBackgroundError(rawMessage);
            setCurrentStep('naming');
            setProcessingStatus({ step: '', progress: 0 });
            setError(`배경 제거 실패: ${message}. 원본으로 등록하려면 '그대로 등록'을 눌러주세요.`);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4"
            style={{ touchAction: 'none' }}
            onClick={(e) => e.target === e.currentTarget && currentStep === 'naming' && onClose()}
        >
            <div
                className="w-full max-w-[340px] rounded-3xl p-5"
                style={{
                    background: '#DEE8F4',
                    boxShadow: '20px 20px 40px rgba(163, 177, 198, 0.5), -20px -20px 40px rgba(255, 255, 255, 0.7)',
                    maxHeight: '85vh',
                    overflow: 'auto',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-[#202020]">
                        {currentStep === 'naming' && '물건 등록'}
                        {currentStep === 'processing' && '처리 중...'}
                        {currentStep === 'complete' && '등록 완료!'}
                    </h2>
                    {currentStep === 'naming' && (
                        <button
                            onClick={onClose}
                            className="neumorphic-button w-8 h-8 rounded-full border-none cursor-pointer flex items-center justify-center"
                            aria-label="닫기"
                        >
                            <X size={16} color="#254179" />
                        </button>
                    )}
                </div>

                {/* Image Preview - 작은 크기 */}
                <div
                    className="w-full aspect-[4/3] rounded-xl mb-4 flex items-center justify-center overflow-hidden"
                    style={{
                        background: '#DEE8F4',
                        boxShadow: 'inset 4px 4px 8px rgba(163, 177, 198, 0.3), inset -4px -4px 8px rgba(255, 255, 255, 0.4)',
                    }}
                >
                    <img
                        src={imagePreviewUrl}
                        alt="미리보기"
                        className="w-full h-full object-contain p-3"
                    />
                </div>

                {/* Step: Naming */}
                {currentStep === 'naming' && (
                    <>
                        <div className="mb-3 p-3 rounded-xl neumorphic-input text-xs text-[#4B5563]">
                            물건 이름은 사용자가 직접 입력합니다.
                        </div>

                        <div className="mb-4">
                            <input
                                type="text"
                                value={itemName}
                                onChange={(e) => setItemName(e.target.value)}
                                placeholder="물건 이름을 입력하세요"
                                autoFocus
                                maxLength={MAX_ITEM_NAME_LENGTH}
                                className="w-full neumorphic-input rounded-xl px-4 py-2.5 text-sm text-[#202020] outline-none border-none placeholder:text-[#a0a0a0]"
                            />
                            <p className="text-[11px] text-[#9CA3AF] mt-1 text-right">
                                {itemName.length}/{MAX_ITEM_NAME_LENGTH}
                            </p>
                            {error && (
                                <p className="text-red-500 text-xs mt-1.5">{error}</p>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={handleRegisterAsIs}
                                disabled={!itemName.trim()}
                                className="flex-1 neumorphic-button rounded-xl py-2.5 text-sm font-medium text-[#254179] border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                            >
                                <Camera size={16} />
                                그대로 등록
                            </button>

                            <button
                                onClick={handleRegisterWithBgRemoval}
                                disabled={!itemName.trim()}
                                className="flex-1 rounded-xl py-2.5 text-sm font-medium text-white border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                                style={{
                                    background: 'linear-gradient(135deg, #254179, #3b5998)',
                                    boxShadow: '3px 3px 6px rgba(163, 177, 198, 0.4), -3px -3px 6px rgba(255, 255, 255, 0.3)',
                                }}
                            >
                                <Sparkles size={16} />
                                배경 제거
                            </button>
                        </div>
                    </>
                )}

                {/* Step: Processing */}
                {currentStep === 'processing' && (
                    <div className="text-center py-2">
                        <div className="flex justify-center mb-3">
                            <Loader2 size={32} className="text-[#254179] animate-spin" />
                        </div>
                        <p className="text-[#202020] font-medium text-sm mb-2">
                            {processingStatus.step}
                        </p>
                        <div
                            className="w-full h-2 rounded-full overflow-hidden"
                            style={{
                                background: '#DEE8F4',
                                boxShadow: 'inset 2px 2px 4px rgba(163, 177, 198, 0.4), inset -2px -2px 4px rgba(255, 255, 255, 0.5)',
                            }}
                        >
                            <div
                                className="h-full rounded-full transition-all duration-300"
                                style={{
                                    width: `${processingStatus.progress}%`,
                                    background: 'linear-gradient(90deg, #254179, #3b5998)',
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Step: Complete */}
                {currentStep === 'complete' && (
                    <div className="text-center py-2">
                        <div
                            className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                            style={{
                                background: '#254179',
                                boxShadow: '3px 3px 6px rgba(163, 177, 198, 0.4), -3px -3px 6px rgba(255, 255, 255, 0.5)',
                            }}
                        >
                            <Check size={24} color="white" />
                        </div>
                        <p className="text-[#202020] font-semibold">
                            {itemName}
                        </p>
                        <p className="text-[#737373] text-xs mt-1">
                            등록 완료!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ItemRegistrationModal;
