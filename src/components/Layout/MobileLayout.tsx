import React from 'react';

interface MobileLayoutProps {
  children: React.ReactNode;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  return (
    <div
      data-mobile-layout="true"
      className="hide-scrollbar w-full max-w-[393px] h-[100dvh] bg-[#DEE8F4] relative overflow-y-auto overflow-x-hidden flex flex-col pb-[120px] shadow-none overscroll-y-contain"
    >
      {children}
    </div>
  );
};

export default MobileLayout;
