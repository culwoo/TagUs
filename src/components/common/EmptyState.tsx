import React from 'react';
import { Package, PlusCircle } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="neumorphic-card w-24 h-24 rounded-full flex items-center justify-center mb-6">
        {icon || <Package size={40} className="text-[#737373]" />}
      </div>
      <h3 className="text-xl font-bold text-[#202020] text-center mb-2">
        {title}
      </h3>
      <p className="text-sm text-[#737373] text-center max-w-[250px] mb-6">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="flex items-center gap-2 px-6 py-3 rounded-xl neumorphic-button text-[#254179] font-semibold border-none cursor-pointer"
        >
          <PlusCircle size={18} />
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
