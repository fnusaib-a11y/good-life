import React from 'react';
import { UserProfile } from '../../../types';

interface RewardCenterProfileBannerProps {
  user: UserProfile;
  balance: number;
  theme?: 'sky' | 'orange' | 'gold' | 'emerald' | 'rose';
  children?: React.ReactNode;
}

export const RewardCenterProfileBanner: React.FC<RewardCenterProfileBannerProps> = ({
  user,
  balance,
  theme = 'sky',
  children
}) => {
  // Theme gradients
  const themeGradients = {
    sky: 'from-[#00c6ff] via-[#00a8e8] to-[#0077b6]',
    orange: 'from-[#FA8C16] via-[#FAAD14] to-[#FADB14]',
    gold: 'from-[#F59E0B] via-[#D97706] to-[#B45309]',
    emerald: 'from-[#10B981] via-[#059669] to-[#047857]',
    rose: 'from-[#FB7185] via-[#F43F5E] to-[#E11D48]'
  };

  // User display ID
  const displayId = user?.phone || user?.id || 't3867582688';

  return (
    <div className={`relative bg-gradient-to-b ${themeGradients[theme]} text-white px-4 pt-4 pb-6 overflow-hidden shadow-xs`}>
      {/* Soft translucent decorative bubbles matching screenshots */}
      <div className="absolute top-2 right-6 w-20 h-20 bg-white/10 rounded-full blur-xs pointer-events-none" />
      <div className="absolute bottom-1 right-20 w-12 h-12 bg-white/15 rounded-full blur-xs pointer-events-none" />
      <div className="absolute top-8 left-1/3 w-8 h-8 bg-white/10 rounded-full blur-xs pointer-events-none" />
      <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-sm pointer-events-none" />

      {/* Profile info row */}
      <div className="relative z-10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar with thick white circular border */}
          <div className="relative w-13 h-13 rounded-full border-2 border-white shadow-md overflow-hidden bg-white/20 shrink-0">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name || 'User'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-lg text-white">
                {(user?.name || 'U').charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* User ID & Name */}
          <div className="min-w-0">
            <p className="text-white text-sm sm:text-base font-bold truncate leading-tight drop-shadow-xs">
              {displayId}
            </p>
            {user?.name && user.name !== displayId && (
              <p className="text-white/80 text-xs truncate mt-0.5 font-medium">
                {user.name}
              </p>
            )}
          </div>
        </div>

        {/* Real Balance display */}
        <div className="text-right shrink-0">
          <p className="text-xs text-white/80 font-medium">ব্যালেন্স</p>
          <p className="text-lg sm:text-xl font-extrabold text-white tracking-tight drop-shadow-xs">
            ৳ {Number(balance || 0).toFixed(2)}
          </p>
        </div>
      </div>

      {children && (
        <div className="relative z-10 mt-3">
          {children}
        </div>
      )}
    </div>
  );
};
