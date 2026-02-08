import React from 'react';
import { Bell } from 'lucide-react';
import type { Item } from '../../stores/itemsStore';

interface HeaderProps {
  onOpenNotifications: () => void;
  selectedItem?: Item;
}

const Header: React.FC<HeaderProps> = ({ onOpenNotifications, selectedItem }) => {
  const locationLabel = selectedItem?.location.label || '최근 위치 미지정';
  const station = selectedItem?.location.station || '위치를 아직 기록하지 않았어요';
  const boxNumber = selectedItem?.location.boxNumber || '아이템별 보관 위치를 등록하세요';

  return (
    <header className="px-6 pt-2 pb-2 flex flex-col items-center relative">
      {/* Notification Icon */}
      <button
        onClick={onOpenNotifications}
        className="absolute right-6 top-4 w-10 h-10 rounded-full neumorphic-button flex items-center justify-center"
        aria-label="알림"
      >
        <Bell size={17} className="text-[#254179]" />
      </button>

      {/* Location Info */}
      <div className="flex flex-col items-center gap-[13px]">
        {/* Location Pin Icon */}
        <img src="/icons/location-pin.svg" alt="" className="w-[12px] h-[23px]" />
        
        {/* Location Name */}
        <span className="text-[14px] font-semibold text-[#202020]">
          {locationLabel}
        </span>

        {/* Station Info */}
        <div className="flex flex-col items-center gap-[5px]">
          <h1 className="text-[20px] font-bold text-[#202020] m-0 leading-[24px]">
            {station}
          </h1>

          <span className="text-[14px] text-[#737373] font-normal leading-[17px]">
            {boxNumber}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
