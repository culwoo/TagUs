import React, { memo } from 'react';
import ActivityList from '../components/Activity/ActivityList';

const ActivityScreen: React.FC = () => {
  return (
    <div className="pb-12 pt-6">
      <div className="px-6 pb-6">
        <div className="neumorphic-card rounded-[25px] p-6">
          <h2 className="text-2xl font-bold text-[#202020]">활동 기록</h2>
          <p className="text-sm text-[#737373] mt-1">최근 변경사항을 빠르게 확인하세요.</p>
        </div>
      </div>
      <ActivityList />
    </div>
  );
};

export default memo(ActivityScreen);
