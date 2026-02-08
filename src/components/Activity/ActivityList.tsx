import { useActivityStore } from '../../stores/activityStore';

const ActivityList = () => {
  const activities = useActivityStore((state) => state.activities);

  if (activities.length === 0) {
    return (
      <div className="px-6 py-16">
        <div className="neumorphic-pressed rounded-[20px] p-8 text-center text-sm text-[#737373]">
          아직 기록된 활동이 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="neumorphic-card rounded-[20px] p-5">
          <p className="text-sm font-semibold text-[#202020]">{activity.message}</p>
          <p className="text-xs text-[#737373] mt-1">
            {new Date(activity.timestamp).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ActivityList;
