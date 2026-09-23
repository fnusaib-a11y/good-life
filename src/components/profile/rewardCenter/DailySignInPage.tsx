import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { RewardCenterHeader } from './RewardCenterHeader';
import { RewardCenterProfileBanner } from './RewardCenterProfileBanner';
import { DailySignInConfig, UserSignInState } from '../../../types/rewardCenter';
import { 
  getRewardCenterSettings, 
  getUserSignInState, 
  saveUserSignInState,
  recordRewardClaim,
  claimAndCreditReward
} from '../../../services/rewardCenterService';
import { Gift, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

interface DailySignInPageProps {
  onBack: () => void;
}

export const DailySignInPage: React.FC<DailySignInPageProps> = ({ onBack }) => {
  const { user, wallet, setWallet, addTransaction, showToast } = useApp();
  const [config, setConfig] = useState<DailySignInConfig | null>(null);
  const [signInState, setSignInState] = useState<UserSignInState>({
    userId: user?.id || '',
    lastSignInDate: '',
    currentStreak: 0,
    totalSignInDays: 0,
    totalRewardEarned: 0,
    claimedDaysHistory: {}
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [activePlanTab, setActivePlanTab] = useState<'plan_new_member' | 'plan_iphone'>('plan_new_member');

  // Format today's date YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];
  const isTodaySignedIn = signInState.lastSignInDate === todayStr;

  // Calculate current target day (1 to 7 cycle based on streak)
  const currentDayIndex = isTodaySignedIn 
    ? ((signInState.currentStreak - 1) % 7) + 1 
    : (signInState.currentStreak % 7) + 1;

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const settings = await getRewardCenterSettings();
        if (isMounted) {
          setConfig(settings.dailySignInConfig);
        }

        if (user?.id) {
          const state = await getUserSignInState(user.id);
          if (isMounted) {
            setSignInState(state);
          }
        }
      } catch (err) {
        console.warn('Failed to load signin data:', err);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const handleSignIn = async (dayNumber: number) => {
    if (!user?.id) {
      showToast('অনুগ্রহ করে লগইন করুন।');
      return;
    }

    if (isTodaySignedIn) {
      showToast('আপনি আজকের সাইন-ইন ইতিমধ্যে সম্পন্ন করেছেন!');
      return;
    }

    if (dayNumber !== currentDayIndex) {
      if (dayNumber < currentDayIndex) {
        showToast('এই দিনের সাইন-ইন ইতিমধ্যে শেষ হয়েছে।');
      } else {
        showToast(`আজ আপনার দিন ${currentDayIndex} এর সাইন-ইন সম্পন্ন করতে হবে।`);
      }
      return;
    }

    if (isProcessing) return; // Prevent double click

    // Condition validation
    if (config?.conditionType === 'deposit' && (config.minDepositAmount || 0) > 0) {
      const balance = Number(wallet?.balance || 0);
      if (balance < (config.minDepositAmount || 0) && !user.isVerified) {
        showToast(`ডিপোজিট শর্ত অপূর্ণ: নূন্যতম ৳${config.minDepositAmount} ডিপোজিট বা ভেরিফিকেশন প্রযোজ্য।`);
        return;
      }
    }

    setIsProcessing(true);

    try {
      const targetDayConfig = config?.days?.find(d => d.day === dayNumber) || {
        day: dayNumber,
        rewardAmount: dayNumber === 7 ? 10 : Number(dayNumber),
        bonusTitle: 'নতুন সদস্যপদ প্রোগ্রাম - লাকি ড্র ১'
      };

      const rewardAmount = Number(targetDayConfig.rewardAmount) || 1;
      const res = await claimAndCreditReward({
        userId: user.id,
        userPhone: user.phone,
        feature: 'signin',
        rewardId: `signin_day_${dayNumber}`,
        rewardTitle: `দৈনিক সাইন-ইন দিন ${dayNumber} (${targetDayConfig.bonusTitle})`,
        amount: rewardAmount,
        note: `দিন ${dayNumber}`
      });

      if (!res.success) {
        showToast(res.message || 'সাইন-ইন রিওয়ার্ড গ্রহণ করা সম্ভব হয়নি!');
        return;
      }

      const newStreak = signInState.currentStreak + 1;
      const newTotalDays = signInState.totalSignInDays + 1;
      const newTotalEarned = Math.round((signInState.totalRewardEarned + rewardAmount) * 100) / 100;

      // 1. Credit User Wallet with authoritative data
      const updatedBalance = res.wallet?.balance !== undefined 
        ? res.wallet.balance 
        : Math.round(((Number(wallet.balance) || 0) + rewardAmount) * 100) / 100;

      setWallet(prev => ({
        ...prev,
        balance: updatedBalance,
        totalEarned: res.wallet?.totalEarned !== undefined 
          ? res.wallet.totalEarned 
          : Math.round(((Number(prev.totalEarned) || 0) + rewardAmount) * 100) / 100,
        incomeBreakdown: {
          ...prev.incomeBreakdown,
          bonusIncome: Math.round(((Number(prev.incomeBreakdown?.bonusIncome) || 0) + rewardAmount) * 100) / 100
        },
        updatedAt: res.wallet?.updatedAt || new Date().toISOString()
      }));

      // 2. Add Transaction
      if (res.transaction) {
        addTransaction(res.transaction);
      } else {
        addTransaction({
          type: 'bonus',
          amount: rewardAmount,
          status: 'completed',
          description: `দৈনিক সাইন-ইন রিওয়ার্ড: দিন ${dayNumber} (${targetDayConfig.bonusTitle})`,
          paymentMethod: 'system'
        });
      }

      // 3. Update User Sign-In State
      const updatedState: UserSignInState = {
        userId: user.id,
        lastSignInDate: todayStr,
        currentStreak: newStreak,
        totalSignInDays: newTotalDays,
        totalRewardEarned: newTotalEarned,
        claimedDaysHistory: {
          ...signInState.claimedDaysHistory,
          [dayNumber]: todayStr
        }
      };

      await saveUserSignInState(updatedState);
      setSignInState(updatedState);

      showToast(`অভিনন্দন! দিন ${dayNumber} সাইন-ইন সম্পন্ন! ৳${rewardAmount.toFixed(2)} ব্যালেন্সে যুক্ত হয়েছে।`);
    } catch (err) {
      console.error('Sign in error:', err);
      showToast('সাইন-ইনে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsProcessing(false);
    }
  };

  const daysList = config?.days || [
    { day: 1, rewardAmount: 1, bonusTitle: 'নতুন সদস্যপদ প্রোগ্রাম - লাকি ড্র ১' },
    { day: 2, rewardAmount: 2, bonusTitle: 'নতুন সদস্যপদ প্রোগ্রাম - লাকি ড্র ১' },
    { day: 3, rewardAmount: 3, bonusTitle: 'নতুন সদস্যপদ প্রোগ্রাম - লাকি ড্র ১' },
    { day: 4, rewardAmount: 4, bonusTitle: 'নতুন সদস্যপদ প্রোগ্রাম - লাকি ড্র ১' },
    { day: 5, rewardAmount: 5, bonusTitle: 'নতুন সদস্যপদ প্রোগ্রাম - লাকি ড্র ১' },
    { day: 6, rewardAmount: 6, bonusTitle: 'নতুন সদস্যপদ প্রোগ্রাম - লাকি ড্র ১' },
    { day: 7, rewardAmount: 10, bonusTitle: 'নতুন সদস্যপদ প্রোগ্রাম - লাকি ড্র ১' }
  ];

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex flex-col font-sans pb-10">
      {/* Dark Maroon Top Bar matching Screenshot 2 */}
      <RewardCenterHeader
        title="সাইন ইন"
        onBack={onBack}
      />

      {/* Warm Orange-Yellow Sunrise Profile Banner matching Screenshot 2 */}
      <div className="relative">
        <RewardCenterProfileBanner
          user={user}
          balance={wallet?.balance || 0}
          theme="orange"
        />

        {/* Floating Stats Card overlapping banner bottom matching Screenshot 2 */}
        <div className="px-4 -mt-3 relative z-20">
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-3 sm:p-4 grid grid-cols-2 divide-x divide-gray-100 text-center">
            {/* Column 1: Check-in days */}
            <div className="px-2">
              <span className="text-xl sm:text-2xl font-black text-[#0284C7] leading-none block">
                {signInState.totalSignInDays || 0}
              </span>
              <span className="text-xs text-gray-500 font-semibold mt-1 block">
                চেক-ইন দিন
              </span>
            </div>

            {/* Column 2: Total rewards */}
            <div className="px-2">
              <span className="text-xl sm:text-2xl font-black text-[#EF4444] leading-none block">
                {signInState.totalRewardEarned || 0}
              </span>
              <span className="text-xs text-gray-500 font-semibold mt-1 block">
                সাইন ইন মোট পুরস্কার
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-3.5 space-y-3 max-w-lg mx-auto w-full mt-1">
        {/* Horizontal Tab Strip matching Screenshot 2 */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActivePlanTab('plan_new_member')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              activePlanTab === 'plan_new_member'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {config?.planTitle || 'নতুন সদস্য বৃদ্ধির পরিকল্পনা'}
          </button>

          <button
            onClick={() => setActivePlanTab('plan_iphone')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              activePlanTab === 'plan_iphone'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {config?.planSubtitle || 'iPhone 17 জেতার জন্য প্র...'}
          </button>
        </div>

        {/* Plan Header Card matching Screenshot 2 */}
        <div className="bg-white rounded-2xl p-3.5 shadow-xs border border-gray-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">
                {config?.planTitle || 'নতুন সদস্য বৃদ্ধির পরিকল্পনা'}
              </h4>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {config?.requiredCondition || 'ডিপোজিট শর্ত: ৳ 100.00'}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            {isTodaySignedIn ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>আজ সম্পন্ন</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 animate-pulse">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>আজও চেক ইন হয়নি ❓</span>
              </span>
            )}
          </div>
        </div>

        {/* 3-Column Grid for Day Cards matching Screenshot 2 */}
        <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
          {daysList.map((dayItem) => {
            const isCompleted = isTodaySignedIn
              ? dayItem.day <= currentDayIndex
              : dayItem.day < currentDayIndex;
            const isCurrentToday = !isTodaySignedIn && dayItem.day === currentDayIndex;
            const isLocked = !isCompleted && !isCurrentToday;

            return (
              <div
                key={dayItem.day}
                className="bg-white rounded-2xl overflow-hidden shadow-xs border border-gray-100 flex flex-col justify-between"
              >
                {/* Header bar with bright blue matching Screenshot 2 */}
                <div className="bg-[#0284C7] text-white py-1 px-1.5 text-center">
                  <span className="font-extrabold text-[11px] tracking-wide block">
                    দিন {dayItem.day}
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-2 flex flex-col items-center justify-center text-center flex-1 bg-[#FAFBFD]">
                  {/* Cash + Red Packet Envelope Graphic */}
                  <div className="relative my-1">
                    <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                      <span className="text-xl">🧧</span>
                    </div>
                  </div>

                  <div className="w-full flex items-center justify-between px-1 text-[10px] text-gray-500 mt-1">
                    <span>বোনাস</span>
                    <span className="font-black text-xs text-gray-900">
                      ৳ {Number(dayItem.rewardAmount).toFixed(2)}
                    </span>
                  </div>

                  <p className="text-[9px] text-gray-400 mt-1 line-clamp-1 w-full text-center">
                    {dayItem.bonusTitle || 'নতুন সদস্যপদ প্রোগ্রাম'}
                  </p>
                </div>

                {/* Button matching Screenshot 2 */}
                <div className="p-1.5 pt-0 bg-[#FAFBFD]">
                  <button
                    onClick={() => handleSignIn(dayItem.day)}
                    disabled={isCompleted || isLocked || isProcessing}
                    className={`w-full py-1.5 rounded-lg text-[11px] font-extrabold transition-all shadow-xs ${
                      isCompleted
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : isCurrentToday
                        ? 'bg-[#FF4D4F] hover:bg-[#F5222D] text-white animate-bounce active:scale-95'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isCompleted ? 'সম্পন্ন ✓' : isProcessing && isCurrentToday ? 'অপেক্ষা...' : 'সাইন ইন'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
