import React, { memo } from 'react';
import { MessageCircle } from 'lucide-react';
import { useChatStore } from '../stores/chatStore';
import EmptyState from '../components/common/EmptyState';

const ChatScreen: React.FC = () => {
  const threads = useChatStore(state => state.threads);

  if (threads.length === 0) {
    return (
      <div className="pt-8">
        <EmptyState
          title="채팅 준비 중"
          description="분실물 매칭이 연결되면 찾아준 사람과 여기서 대화할 수 있습니다."
          icon={<MessageCircle size={38} className="text-[#254179]" />}
        />
      </div>
    );
  }

  return (
    <div className="pb-12 pt-6">
      <div className="px-6 pb-6">
        <div className="neumorphic-card rounded-[25px] p-6">
          <h2 className="text-2xl font-bold text-[#202020]">채팅</h2>
          <p className="text-sm text-[#737373] mt-1">
            찾아준 사람과의 1:1 대화가 이곳에 표시됩니다.
          </p>
        </div>
      </div>
      <div className="px-6 space-y-4">
        {threads.map(thread => (
          <div key={thread.id} className="neumorphic-card rounded-[20px] p-5">
            <p className="text-base font-semibold text-[#202020]">{thread.title}</p>
            <p className="text-sm text-[#6B7280] mt-1">{thread.preview}</p>
            <p className="text-xs text-[#9CA3AF] mt-3">
              최근 업데이트: {new Date(thread.updatedAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default memo(ChatScreen);
