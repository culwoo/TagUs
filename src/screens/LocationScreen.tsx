import React, { memo, useEffect, useState } from 'react';
import { useLocationStore } from '../stores/locationStore';
import { useToast } from '../contexts/ToastContext';
import { useAuthStore } from '../stores/authStore';
import { locationService } from '../firebase/location';
import { useActivityStore } from '../stores/activityStore';

const LocationScreen: React.FC = () => {
  const { location, setLocation } = useLocationStore();
  const [draft, setDraft] = useState(location);
  const userId = useAuthStore((state) => state.user?.uid);
  const { showToast } = useToast();

  useEffect(() => {
    setDraft(location);
  }, [location]);

  const handleSave = async () => {
    try {
      setLocation(draft);
      if (userId) {
        await locationService.updateLocation(userId, draft);
      }
      useActivityStore.getState().addActivity('location.update', '위치 정보 업데이트');
      showToast('위치 정보가 저장되었습니다', 'success');
    } catch (error) {
      console.error('Location update failed:', error);
      showToast('위치 저장에 실패했습니다', 'error');
    }
  };

  return (
    <div className="pb-12 pt-6">
      <div className="px-6 pb-6">
        <div className="neumorphic-card rounded-[25px] p-6">
          <h2 className="text-2xl font-bold text-[#202020]">보관 위치</h2>
          <p className="text-sm text-[#737373] mt-1">분실물 보관 위치를 업데이트하세요.</p>
        </div>
      </div>
      <div className="px-6 space-y-5">
        <div className="neumorphic-card rounded-[20px] p-5">
          <label className="text-xs font-semibold text-[#737373] block mb-3">현재 위치 이름</label>
          <input
            value={draft.name}
            onChange={(event) => setDraft({ ...draft, name: event.target.value })}
            className="w-full neumorphic-input border-none rounded-xl px-4 py-3 text-[#202020] outline-none"
          />
        </div>
        <div className="neumorphic-card rounded-[20px] p-5">
          <label className="text-xs font-semibold text-[#737373] block mb-3">역명</label>
          <input
            value={draft.station}
            onChange={(event) => setDraft({ ...draft, station: event.target.value })}
            className="w-full neumorphic-input border-none rounded-xl px-4 py-3 text-[#202020] outline-none"
          />
        </div>
        <div className="neumorphic-card rounded-[20px] p-5">
          <label className="text-xs font-semibold text-[#737373] block mb-3">보관함 번호</label>
          <input
            value={draft.boxNumber}
            onChange={(event) => setDraft({ ...draft, boxNumber: event.target.value })}
            className="w-full neumorphic-input border-none rounded-xl px-4 py-3 text-[#202020] outline-none"
          />
        </div>
        <button
          onClick={handleSave}
          className="w-full py-4 rounded-xl neumorphic-button text-[#254179] font-bold text-lg border-none cursor-pointer"
        >
          저장하기
        </button>
      </div>
    </div>
  );
};

export default memo(LocationScreen);
