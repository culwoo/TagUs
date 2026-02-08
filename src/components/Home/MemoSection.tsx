import React, { useEffect, useRef, useState } from 'react';
import { useMemoStore } from '../../stores/memoStore';
import { useAuthStore } from '../../stores/authStore';
import { memoService } from '../../firebase/memo';
import { useActivityStore } from '../../stores/activityStore';
import { useNotificationStore } from '../../stores/notificationStore';

const MemoSection: React.FC = () => {
  const { memo, setMemo } = useMemoStore();
  const userId = useAuthStore((state) => state.user?.uid);
  const [isSaving, setIsSaving] = useState(false);
  const isInitial = useRef(true);
  const saveTimeoutRef = useRef<number | null>(null);

  const handleMemoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMemo(e.target.value);
  };

  useEffect(() => {
    if (!userId) {
      return;
    }

    if (isInitial.current) {
      isInitial.current = false;
      return;
    }

    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }

    setIsSaving(true);
    saveTimeoutRef.current = window.setTimeout(async () => {
      try {
        await memoService.saveMemo(userId, memo);
        useActivityStore.getState().addActivity('memo.save', '메모 저장');
      } catch (error) {
        console.error('Memo sync failed:', error);
        await useNotificationStore
          .getState()
          .addNotification('메모 저장 실패', '잠시 후 다시 저장됩니다.', 'warning');
      } finally {
        setIsSaving(false);
      }
    }, 800);

    return () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [memo, userId]);

  return (
    <div className="px-[38px] mt-8 mb-8">
      <div className="neumorphic-card rounded-[25px] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[20px] font-bold text-[#202020] leading-[24px]">
            나의 메모장
          </h2>
          {userId && (
            <span className="text-[10px] text-[#737373]">
              {isSaving ? '저장 중...' : '동기화 완료'}
            </span>
          )}
        </div>

        <textarea
          value={memo}
          onChange={handleMemoChange}
          placeholder="여기에 메모를 작성하세요..."
          className="w-full h-[140px] px-4 py-4 text-[14px] font-normal text-[#737373] bg-[#DEE8F4] neumorphic-input rounded-[20px] resize-none outline-none border-none font-[inherit] leading-relaxed"
          aria-label="메모 입력"
        />
      </div>
    </div>
  );
};

export default MemoSection;
