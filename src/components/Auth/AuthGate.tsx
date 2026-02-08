import { useState } from 'react';
import { authService } from '../../firebase/auth';
import { useToast } from '../../contexts/ToastContext';
import { useAuthStore } from '../../stores/authStore';
import { useActivityStore } from '../../stores/activityStore';

const AuthGate = () => {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const { showToast } = useToast();
  const status = useAuthStore(state => state.status);

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);
      await authService.signInWithGoogle();
      useActivityStore.getState().addActivity('auth.signin', 'Google 로그인 성공');
    } catch (error) {
      console.error('Sign-in failed:', error);
      showToast('로그인에 실패했습니다. 다시 시도해주세요.', 'error');
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F9FF] to-[#FFFFFF] flex items-center justify-center px-6">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-[0_20px_60px_rgba(15,23,42,0.08)] p-8">
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-[#0F172A] text-white flex items-center justify-center text-2xl font-bold">
            T
          </div>
        </div>
        <h1 className="text-2xl font-bold text-[#0F172A] text-center">TagUs</h1>
        <p className="text-sm text-[#64748B] text-center mt-2">
          잃어버린 순간을 다시 찾는 가장 빠른 방법
        </p>
        <div className="mt-8 space-y-4">
          <button
            onClick={handleSignIn}
            disabled={isSigningIn || status === 'loading'}
            className="w-full py-3 rounded-xl bg-[#0F172A] text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {isSigningIn ? '로그인 중...' : 'Google로 시작하기'}
          </button>
          <p className="text-xs text-center text-[#94A3B8]">
            로그인 시 모든 기기에서 데이터가 동기화됩니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthGate;
