import React, { memo } from 'react';
import { useAuthStore } from '../stores/authStore';
import { authService } from '../firebase/auth';
import { useToast } from '../contexts/ToastContext';
import { useActivityStore } from '../stores/activityStore';

const ProfileScreen: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const { showToast } = useToast();

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      useActivityStore.getState().addActivity('auth.signout', '로그아웃 완료');
    } catch (error) {
      console.error('Sign-out failed:', error);
      showToast('로그아웃에 실패했습니다', 'error');
    }
  };

  return (
    <div className="pb-12 pt-6">
      <div className="px-6 pb-6">
        <div className="neumorphic-card rounded-[25px] p-6">
          <h2 className="text-2xl font-bold text-[#202020]">내 프로필</h2>
          <p className="text-sm text-[#737373] mt-1">연결된 계정 정보를 확인하세요.</p>
        </div>
      </div>
      <div className="px-6">
        <div className="neumorphic-card rounded-[25px] p-6">
          <div className="flex items-center gap-4">
            {user?.photoURL ? (
              <div className="w-16 h-16 rounded-full neumorphic-pressed p-1">
                <img src={user.photoURL} alt={user.displayName ?? 'user'} className="w-full h-full rounded-full" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full neumorphic-pressed flex items-center justify-center text-[#254179] font-bold text-xl">
                U
              </div>
            )}
            <div>
              <p className="text-lg font-semibold text-[#202020]">{user?.displayName ?? '사용자'}</p>
              <p className="text-sm text-[#737373]">{user?.email ?? '이메일 없음'}</p>
            </div>
          </div>
          <div className="mt-6">
            <button
              onClick={handleSignOut}
              className="w-full py-4 rounded-xl neumorphic-button text-[#254179] font-bold border-none cursor-pointer"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(ProfileScreen);
