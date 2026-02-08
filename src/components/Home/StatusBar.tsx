import React from 'react';

const StatusBar: React.FC = () => {
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <div className="flex items-center justify-between px-[38px] pt-[15px] pb-[10px]">
      {/* Time */}
      <span
        className="text-[18px] font-semibold leading-[18px] tracking-[-0.36px] text-[#202020]"
        style={{
          fontFamily: 'SF Pro Display, -apple-system, system-ui, BlinkMacSystemFont, sans-serif',
        }}
      >
        {currentTime}
      </span>

      {/* Status Icons */}
      <div className="flex items-center gap-[8px]">
        <img src="/icons/signal.svg" alt="" className="w-[18px] h-[11px]" />
        <img src="/icons/wifi.svg" alt="" className="w-[18px] h-[13px]" />
        <img src="/icons/battery.svg" alt="" className="w-[27px] h-[12px]" />
      </div>
    </div>
  );
};

export default StatusBar;
