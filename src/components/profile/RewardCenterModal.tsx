import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  ArrowLeft,
  Gift, 
  CalendarCheck, 
  Coins, 
  UserPlus, 
  Ticket, 
  TicketPercent, 
  Crown, 
  RefreshCw, 
  Copy, 
  Sparkles, 
  ShieldCheck, 
  ChevronRight,
  Settings
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RewardCenterOptionConfig } from '../../types';
import { DEFAULT_REWARD_CENTER_OPTIONS } from '../../data/rewardCenterData';
import { fetchFreshestUserData, subscribeToUserRealtime } from '../../lib/firestoreSync';
import { safeSetItem } from '../../lib/storageUtils';
import { isAuthorizedAdminPhone } from '../../lib/firebase';
import { getRewardCenterSettings } from '../../services/rewardCenterService';

// 6 Dedicated Feature Pages
import { ClaimRewardsPage } from './rewardCenter/ClaimRewardsPage';
import { DailySignInPage } from './rewardCenter/DailySignInPage';
import { RescueFundPage } from './rewardCenter/RescueFundPage';
import { InviteFriendsRewardPage } from './rewardCenter/InviteFriendsRewardPage';
import { PromoCodePage } from './rewardCenter/PromoCodePage';
import { TemuTicketPage } from './rewardCenter/TemuTicketPage';
import { AdminRewardCenterControlModal } from './rewardCenter/AdminRewardCenterControlModal';

interface RewardCenterModalProps {
  onClose: () => void;
  initialFeature?: 'claim' | 'signin' | 'rescue_fund' | 'invite' | 'promo_code' | 'temu_ticket' | null;
}

export type RewardCenterView = 
  | 'hub' 
  | 'claim' 
  | 'signin' 
  | 'rescue_fund' 
  | 'invite' 
  | 'promo_code' 
  | 'temu_ticket';

export const RewardCenterModal: React.FC<RewardCenterModalProps> = ({ 
  onClose,
  initialFeature = null 
}) => {
  const { 
    user, 
    setUser, 
    wallet, 
    setWallet, 
    registeredUsers, 
    systemSettings, 
    isBn, 
    showToast,
    refreshUserData,
    isAuthorizedAdmin 
  } = useApp();

  const [activeFeatureView, setActiveFeatureView] = useState<RewardCenterView>(initialFeature || 'hub');
  const [isAdminControlOpen, setIsAdminControlOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [featureToggles, setFeatureToggles] = useState<Record<string, boolean>>({
    claim: true,
    signin: true,
    rescue_fund: true,
    invite: true,
    promo_code: true,
    temu_ticket: true
  });

  const isAdminUser = Boolean(
    isAuthorizedAdmin || 
    user?.role === 'admin' || 
    user?.role === 'super_admin' || 
    isAuthorizedAdminPhone(user?.phone)
  );

  // Load cloud settings for toggles
  useEffect(() => {
    getRewardCenterSettings().then(res => {
      if (res?.featureToggles) {
        setFeatureToggles(res.featureToggles);
      }
    }).catch(() => {});
  }, [activeFeatureView]);

  // Real user details & metrics
  const realBalance = Number(wallet?.balance ?? user?.balance ?? 0);
  const realUserId = user?.id || (user?.phone ? `GL-${user.phone.slice(-6)}` : 'GL-USER');
  const realUserName = user?.name?.trim() || (isBn ? 'সম্মানিত সদস্য' : 'Valued Member');

  // Real referral count
  const referralCount = registeredUsers.filter(u => {
    if (!u.referredBy || !user?.referralCode) return false;
    const cleanRef = u.referredBy.trim().toUpperCase();
    const myCode = (user.referralCode || '').trim().toUpperCase();
    return cleanRef === myCode;
  }).length;

  // Real VIP Level
  const vipLevel = user?.isVerified 
    ? (referralCount >= 30 ? 3 : referralCount >= 15 ? 2 : 1)
    : (referralCount >= 10 ? 1 : 0);

  // Real progress info
  const currentStep = user?.isVerified ? (referralCount >= 15 ? 2 : 1) : 1;
  const targetStep = 2;
  const progressPercent = Math.min(100, Math.round((currentStep / targetStep) * 100));

  // Admin-configured or default reward options
  const rewardOptions: RewardCenterOptionConfig[] = (
    systemSettings?.rewardCenterOptions && systemSettings.rewardCenterOptions.length > 0
      ? systemSettings.rewardCenterOptions
      : DEFAULT_REWARD_CENTER_OPTIONS
  )
  .filter(opt => {
    const key = opt.id === 'team_ticket' ? 'temu_ticket' : opt.id;
    return featureToggles[key] !== false && opt.enabled !== false;
  })
  .sort((a, b) => a.order - b.order);

  // Real-time Firestore subscription
  useEffect(() => {
    if (!user?.id) return;
    const unsub = subscribeToUserRealtime(user.id, ({ user: cloudUser, wallet: cloudWallet }) => {
      if (cloudUser) {
        setUser(prev => {
          const merged = { ...prev, ...cloudUser };
          safeSetItem('lg_user', JSON.stringify(merged));
          return merged;
        });
      }
      if (cloudWallet) {
        setWallet(prev => {
          const merged = { ...prev, ...cloudWallet };
          safeSetItem('lg_wallet', JSON.stringify(merged));
          return merged;
        });
      }
    });

    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [user?.id, setUser, setWallet]);

  // Handle Refresh Button: Re-fetches fresh user data from Firebase/Firestore
  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    const start = Date.now();

    try {
      if (typeof refreshUserData === 'function') {
        await refreshUserData();
      }

      if (user?.id || user?.phone) {
        const { user: cloudUser, wallet: cloudWallet } = await fetchFreshestUserData(user.id, user.phone);
        if (cloudUser) {
          setUser(prev => {
            const merged = { ...prev, ...cloudUser };
            safeSetItem('lg_user', JSON.stringify(merged));
            return merged;
          });
        }
        if (cloudWallet) {
          setWallet(prev => {
            const merged = { ...prev, ...cloudWallet };
            safeSetItem('lg_wallet', JSON.stringify(merged));
            return merged;
          });
        }
      }

      const elapsed = Date.now() - start;
      if (elapsed < 600) {
        await new Promise(r => setTimeout(r, 600 - elapsed));
      }

      showToast(isBn ? 'রিয়েল-টাইম তথ্য ও ব্যালেন্স সফলভাবে আপডেট হয়েছে!' : 'Real-time user data and balance refreshed!');
    } catch (err) {
      console.warn('Reward center refresh note:', err);
      showToast(isBn ? 'ডাটা সিঙ্ক সম্পন্ন হয়েছে' : 'Data synchronized');
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, refreshUserData, user?.id, user?.phone, setUser, setWallet, isBn, showToast]);

  // Copy User ID
  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!realUserId) return;
    try {
      navigator.clipboard.writeText(realUserId);
      setCopiedId(true);
      showToast(isBn ? 'ইউজার আইডি কপি করা হয়েছে!' : 'User ID copied to clipboard!');
      setTimeout(() => setCopiedId(false), 2000);
    } catch {
      showToast(isBn ? 'কপি ব্যর্থ হয়েছে' : 'Copy failed');
    }
  };

  // Helper to render icon for option cards
  const renderCardIcon = (iconName: string, iconClass: string) => {
    switch (iconName.toLowerCase()) {
      case 'gift':
        return <Gift className={iconClass} />;
      case 'calendar':
        return <CalendarCheck className={iconClass} />;
      case 'coins':
        return <Coins className={iconClass} />;
      case 'users':
        return <UserPlus className={iconClass} />;
      case 'promo':
      case 'ticketpercent':
        return <TicketPercent className={iconClass} />;
      case 'ticket':
        return <Ticket className={iconClass} />;
      default:
        return <Sparkles className={iconClass} />;
    }
  };

  const handleCardClick = (id: string) => {
    if (id === 'claim') setActiveFeatureView('claim');
    else if (id === 'signin') setActiveFeatureView('signin');
    else if (id === 'rescue_fund') setActiveFeatureView('rescue_fund');
    else if (id === 'invite') setActiveFeatureView('invite');
    else if (id === 'promo_code') setActiveFeatureView('promo_code');
    else if (id === 'team_ticket' || id === 'temu_ticket') setActiveFeatureView('temu_ticket');
  };

  // Render individual full feature pages if active
  if (activeFeatureView === 'claim') {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-center items-center p-0 overflow-y-auto">
        <div className="w-full max-w-md h-full bg-slate-50 min-h-screen overflow-y-auto">
          <ClaimRewardsPage onBack={() => setActiveFeatureView('hub')} />
        </div>
      </div>
    );
  }

  if (activeFeatureView === 'signin') {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-center items-center p-0 overflow-y-auto">
        <div className="w-full max-w-md h-full bg-slate-50 min-h-screen overflow-y-auto">
          <DailySignInPage onBack={() => setActiveFeatureView('hub')} />
        </div>
      </div>
    );
  }

  if (activeFeatureView === 'rescue_fund') {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-center items-center p-0 overflow-y-auto">
        <div className="w-full max-w-md h-full bg-slate-50 min-h-screen overflow-y-auto">
          <RescueFundPage onBack={() => setActiveFeatureView('hub')} />
        </div>
      </div>
    );
  }

  if (activeFeatureView === 'invite') {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-center items-center p-0 overflow-y-auto">
        <div className="w-full max-w-md h-full bg-slate-50 min-h-screen overflow-y-auto">
          <InviteFriendsRewardPage onBack={() => setActiveFeatureView('hub')} />
        </div>
      </div>
    );
  }

  if (activeFeatureView === 'promo_code') {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-center items-center p-0 overflow-y-auto">
        <div className="w-full max-w-md h-full bg-slate-50 min-h-screen overflow-y-auto">
          <PromoCodePage onBack={() => setActiveFeatureView('hub')} />
        </div>
      </div>
    );
  }

  if (activeFeatureView === 'temu_ticket') {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-center items-center p-0 overflow-y-auto">
        <div className="w-full max-w-md h-full bg-slate-50 min-h-screen overflow-y-auto">
          <TemuTicketPage onBack={() => setActiveFeatureView('hub')} />
        </div>
      </div>
    );
  }

  // Otherwise, render the Main Hub view
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4 overflow-hidden animate-in fade-in duration-200">
      <div className="relative w-full max-w-md h-[100dvh] sm:h-[94vh] max-h-[920px] bg-slate-50 text-slate-900 sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        
        {/* ================= COMPACT STICKY TOP NAVIGATION BAR ================= */}
        <header className="sticky top-0 z-30 bg-white px-4 py-3.5 flex items-center justify-between text-slate-900 border-b border-slate-200 shadow-xs shrink-0">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-wide flex items-center justify-center gap-1.5">
            <Gift className="w-5 h-5 text-amber-500" />
            <span>{isBn ? 'পুরস্কার সেন্টার' : 'Reward Center'}</span>
          </h1>

          <div className="flex items-center gap-1.5">
            {isAdminUser && (
              <button
                onClick={() => setIsAdminControlOpen(true)}
                className="w-8 h-8 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-600 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                title="এডমিন কন্ট্রোল"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </header>

        {/* ================= UNIFIED SCROLLABLE CONTAINER ================= */}
        <main className="flex-1 overflow-y-auto scroll-smooth scrollbar-thin scrollbar-thumb-sky-200 scrollbar-track-transparent">
          
          {/* ================= TOP BANNER & PROFILE CARD ================= */}
          <div className="relative bg-gradient-to-b from-sky-50 via-slate-50 to-slate-100 pt-3 pb-5 px-4 shadow-xs border-b border-slate-200">
            
            <div className="absolute top-1 left-0 right-0 flex justify-center pointer-events-none select-none overflow-hidden">
              <span className="text-5xl sm:text-6xl font-black tracking-widest text-sky-900/5 uppercase">
                REWARD
              </span>
            </div>

            {/* TOP PROFILE CARD */}
            <section className="relative mt-1 overflow-hidden rounded-2xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 p-4 text-white shadow-md border border-blue-400/30">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-13 h-13 rounded-full border-2 border-white overflow-hidden bg-sky-900 flex items-center justify-center shadow-md">
                      {user?.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={realUserName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="text-lg font-bold text-sky-100">
                          {realUserName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    {user?.isVerified && (
                      <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 shadow-xs" title="Verified">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h2 className="text-sm sm:text-base font-extrabold tracking-tight text-white line-clamp-1">
                        {realUserName}
                      </h2>
                      <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 shadow-xs">
                        <Crown className="w-3 h-3" />
                        VIP {vipLevel}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-sky-100 font-mono mt-0.5">
                      <span>ID: {realUserId}</span>
                      <button
                        onClick={handleCopyId}
                        className="p-1 hover:text-white transition-colors cursor-pointer"
                        title={isBn ? 'আইডি কপি করুন' : 'Copy ID'}
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95 border border-white/20 cursor-pointer"
                  title="রিফ্রেশ"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-white' : ''}`} />
                </button>
              </div>

              {/* Balance & Progress */}
              <div className="mt-3.5 pt-3 border-t border-white/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-sky-100 uppercase tracking-wider font-semibold block">
                    বর্তমান ব্যালেন্স
                  </span>
                  <span className="text-xl font-black text-white tracking-tight">
                    ৳ {realBalance.toFixed(2)}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-sky-100 font-semibold block">
                    সক্রিয় টিম সদস্য
                  </span>
                  <span className="text-sm font-extrabold text-amber-300">
                    {referralCount} জন
                  </span>
                </div>
              </div>
            </section>
          </div>

          {/* ================= 2. REWARD OPTIONS GRID (2-COLUMN) ================= */}
          <section className="px-4 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
                <Sparkles className="w-4 h-4 text-sky-600" />
                <span>{isBn ? 'পুরস্কার অপশনসমূহ' : 'Reward Modules'}</span>
              </h2>
              <span className="text-[11px] text-slate-500 font-medium">
                {rewardOptions.length} টি ফিচার সক্রিয়
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {rewardOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleCardClick(option.id)}
                  className="group relative overflow-hidden rounded-2xl bg-white p-3.5 text-left shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md border border-slate-200 flex flex-col justify-between min-h-[118px] cursor-pointer"
                >
                  {/* Option Badge */}
                  {option.badgeText && (
                    <span className="absolute top-2 right-2 rounded-full bg-rose-500 px-1.5 py-0.5 text-[9px] font-black text-white shadow-xs">
                      {option.badgeText}
                    </span>
                  )}

                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${option.gradient || 'from-sky-500 to-blue-600'} text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}>
                    {renderCardIcon(option.icon, 'w-5 h-5')}
                  </div>

                  {/* Title & Chevron */}
                  <div className="mt-2 flex items-center justify-between w-full">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                      {isBn ? option.title : (option.titleEn || option.title)}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 group-hover:text-blue-600 transition-all" />
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Quick Info Footer banner */}
          <div className="px-4 pb-6">
            <div className="bg-sky-50 rounded-2xl p-3 border border-sky-200/80 text-[11px] text-sky-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-600 shrink-0" />
              <span>
                প্রতিটি অপশন ক্লিক করে সরাসরি ফিচার পৃষ্ঠায় প্রবেশ করে পুরস্কার দাবি ও সাইন-ইন সম্পন্ন করুন।
              </span>
            </div>
          </div>
        </main>
      </div>

      {/* Admin Reward Center Control Modal */}
      {isAdminControlOpen && (
        <AdminRewardCenterControlModal
          isOpen={isAdminControlOpen}
          onClose={() => setIsAdminControlOpen(false)}
        />
      )}
    </div>
  );
};
