import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface RewardCenterHeaderProps {
  title: string;
  onBack: () => void;
  rightAction?: React.ReactNode;
}

export const RewardCenterHeader: React.FC<RewardCenterHeaderProps> = ({
  title,
  onBack,
  rightAction
}) => {
  return (
    <div className="bg-white text-slate-900 px-4 py-3.5 flex items-center justify-between sticky top-0 z-30 border-b border-slate-200 shadow-xs">
      <button
        onClick={onBack}
        className="w-9 h-9 -ml-1 rounded-full flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
        aria-label="Back"
      >
        <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
      </button>

      <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-wide text-center flex-1 truncate px-2">
        {title}
      </h1>

      <div className="w-9 flex items-center justify-end text-slate-700">
        {rightAction || <div className="w-9" />}
      </div>
    </div>
  );
};

export default RewardCenterHeader;
