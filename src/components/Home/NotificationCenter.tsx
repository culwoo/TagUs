import React from 'react';
import { Bell, CheckCheck, Trash2, X } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useNotificationStore } from '../../stores/notificationStore';
import ConfirmModal from '../common/ConfirmModal';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const ANIMATION_MS = 260;

const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const notifications = useNotificationStore((state) => state.notifications);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const deleteNotification = useNotificationStore((state) => state.deleteNotification);
  const deleteAllNotifications = useNotificationStore((state) => state.deleteAllNotifications);
  const { showToast } = useToast();

  const [shouldRender, setShouldRender] = React.useState(isOpen);
  const [isVisible, setIsVisible] = React.useState(false);
  const [isDeleteAllConfirmOpen, setIsDeleteAllConfirmOpen] = React.useState(false);
  const [isDeletingAll, setIsDeletingAll] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsVisible(false);
      const timerId = window.setTimeout(() => {
        setIsVisible(true);
      }, 18);
      return () => window.clearTimeout(timerId);
    }

    setIsVisible(false);
    const timerId = window.setTimeout(() => {
      setShouldRender(false);
    }, ANIMATION_MS);
    return () => window.clearTimeout(timerId);
  }, [isOpen]);

  React.useEffect(() => {
    if (!shouldRender) {
      return;
    }

    const mobileLayout = document.querySelector<HTMLElement>('[data-mobile-layout="true"]');
    const prevLayoutOverflow = mobileLayout?.style.overflowY ?? '';
    const prevLayoutOverscroll = mobileLayout?.style.overscrollBehavior ?? '';

    if (!mobileLayout) {
      return;
    }

    mobileLayout.style.overflowY = 'hidden';
    mobileLayout.style.overscrollBehavior = 'none';

    return () => {
      mobileLayout.style.overflowY = prevLayoutOverflow;
      mobileLayout.style.overscrollBehavior = prevLayoutOverscroll;
    };
  }, [shouldRender]);

  React.useEffect(() => {
    if (!shouldRender) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [onClose, shouldRender]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      showToast('알림 읽음 처리에 실패했습니다.', 'error');
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
      showToast('알림을 삭제했습니다.', 'info');
    } catch (error) {
      console.error('Failed to delete notification:', error);
      showToast('알림 삭제에 실패했습니다.', 'error');
    }
  };

  const handleDeleteAllConfirm = async () => {
    setIsDeletingAll(true);
    try {
      await deleteAllNotifications();
      showToast('모든 알림을 삭제했습니다.', 'info');
      setIsDeleteAllConfirmOpen(false);
    } catch (error) {
      console.error('Failed to delete all notifications:', error);
      showToast('전체 삭제에 실패했습니다.', 'error');
    } finally {
      setIsDeletingAll(false);
    }
  };

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-[180] transition-all duration-300 ${
        isVisible ? 'bg-[#0F172A]/30 backdrop-blur-[1.5px]' : 'bg-transparent pointer-events-none'
      }`}
      onClick={onClose}
    >
      <div
        className={`absolute inset-x-0 bottom-0 h-[min(84vh,680px)] rounded-t-[30px] border border-white/55 p-5 shadow-[0_-12px_40px_rgba(15,23,42,0.18)] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
        style={{
          background:
            'linear-gradient(180deg, rgba(233,242,251,0.98) 0%, rgba(222,232,244,0.96) 100%)',
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[#254179]">
            <Bell size={18} />
            <h3 className="text-lg font-bold">알림 센터</h3>
          </div>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button
                className="neumorphic-button rounded-xl px-3 py-1.5 text-xs font-semibold text-[#254179]"
                onClick={() => setIsDeleteAllConfirmOpen(true)}
                aria-label="알림 전체 삭제"
              >
                전체 삭제
              </button>
            )}
            <button
              className="neumorphic-button rounded-full w-9 h-9 flex items-center justify-center"
              onClick={onClose}
              aria-label="닫기"
            >
              <X size={16} className="text-[#254179]" />
            </button>
          </div>
        </div>

        <div
          className="hide-scrollbar mt-4 space-y-3 overflow-y-auto overscroll-contain max-h-[calc(84vh-98px)] pr-1"
        >
          {notifications.length === 0 && (
            <div className="neumorphic-input rounded-2xl p-4 text-sm text-[#6B7280]">새로운 알림이 없습니다.</div>
          )}

          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-2xl p-4 border border-white/50 ${
                notification.isRead ? 'opacity-70 neumorphic-input' : 'neumorphic-card'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#111827]">{notification.title}</p>
                  <p className="text-sm text-[#4B5563] mt-1 whitespace-pre-wrap">{notification.message}</p>
                  <p className="text-[11px] text-[#6B7280] mt-2">{new Date(notification.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!notification.isRead && (
                    <button
                      className="neumorphic-button rounded-full w-8 h-8 flex items-center justify-center"
                      onClick={() => handleMarkAsRead(notification.id)}
                      aria-label="읽음 처리"
                    >
                      <CheckCheck size={14} className="text-[#254179]" />
                    </button>
                  )}
                  <button
                    className="neumorphic-button rounded-full w-8 h-8 flex items-center justify-center"
                    onClick={() => handleDeleteNotification(notification.id)}
                    aria-label={`알림 삭제: ${notification.title}`}
                  >
                    <Trash2 size={14} className="text-[#254179]" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <ConfirmModal
        isOpen={isDeleteAllConfirmOpen}
        title="알림 전체 삭제"
        message="모든 알림을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        confirmLabel={isDeletingAll ? '삭제 중...' : '전체 삭제'}
        cancelLabel="취소"
        variant="danger"
        onConfirm={handleDeleteAllConfirm}
        onCancel={() => setIsDeleteAllConfirmOpen(false)}
      />
    </div>
  );
};

export default NotificationCenter;
