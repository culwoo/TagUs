import { useEffect } from 'react';
import { authService } from '../../firebase/auth';
import { hydrateUserData, clearLocalData } from '../../firebase/sync';
import { useAuthStore } from '../../stores/authStore';
import { useActivityStore } from '../../stores/activityStore';
import { useNotificationStore } from '../../stores/notificationStore';

const AuthBootstrap = () => {
  useEffect(() => {
    let isActive = true;

    const unsubscribe = authService.subscribe(async user => {
      if (!isActive) {
        return;
      }

      useAuthStore.getState().setUser(user);

      if (user) {
        try {
          await hydrateUserData(user.uid);
        } catch (error) {
          console.error('User hydration failed:', error);
          await useNotificationStore
            .getState()
            .addNotification('동기화 실패', '네트워크를 확인하고 다시 시도해주세요.', 'error');
        }
      } else {
        clearLocalData();
        useActivityStore.getState().addActivity('auth.signout', '로그아웃 완료');
      }
    });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, []);

  return null;
};

export default AuthBootstrap;
