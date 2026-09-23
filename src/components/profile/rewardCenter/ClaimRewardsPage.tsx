import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { RewardCenterHeader } from './RewardCenterHeader';
import { RewardCenterProfileBanner } from './RewardCenterProfileBanner';
import { ClaimRewardItem, RewardClaimRecord } from '../../../types/rewardCenter';
import { 
  getRewardCenterSettings, 
  getUserClaimRecords, 
  recordRewardClaim,
  claimAndCreditReward
} from '../../../services/rewardCenterService';
import { History, Info, CheckCircle2, Clock, X, ShieldAlert } from 'lucide-react';

interface ClaimRewardsPageProps {
  onBack: () => void;
}

export const ClaimRewardsPage: React.FC<ClaimRewardsPageProps> = ({ onBack }) => {
  const { user, wallet, setWallet, addTransaction, showToast } = useApp();
  const [rewards, setRewards] = useState<ClaimRewardItem[]>([]);
  const [claimedIds, setClaimedIds] = useState<Set<string>>(new Set());
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [selectedRewardForInfo, setSelectedRewardForInfo] = useState<ClaimRewardItem | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [userClaimHistory, setUserClaimHistory] = useState<RewardClaimRecord[]>([]);

  // Load rewards configuration and user claims from Firestore / cache
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const settings = await getRewardCenterSettings();
        if (isMounted) {
          const activeRewards = (settings.claimRewards || []).filter(r => r.status === 'active');
          setRewards(activeRewards);
        }

        if (user?.id) {
          const claims = await getUserClaimRecords(user.id);
          if (isMounted) {
            setUserClaimHistory(claims);
            const claimedSet = new Set<string>();
            claims.forEach(c => {
              if (c.feature === 'claim') claimedSet.add(c.rewardId);
            });
            setClaimedIds(claimedSet);
          }
        }
      } catch (err) {
        console.warn('Failed to load claim rewards:', err);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // Handle Claim
  const handleClaim = async (reward: ClaimRewardItem) => {
    if (!user?.id) {
      showToast('অনুগ্রহ করে লগইন করুন।');
      return;
    }

    if (claimedIds.has(reward.id)) {
      showToast('আপনি ইতিমধ্যেই এই উপহারটি দাবি করেছেন!');
      return;
    }

    if (claimingId) return; // Prevent double click

    // Condition validation
    if (reward.conditionType === 'deposit' && reward.minDepositAmount) {
      const totalEarnedOrDeposited = Number(wallet?.balance || 0);
      // For deposit conditions, if needed admin check:
      if (totalEarnedOrDeposited < reward.minDepositAmount && !user.isVerified) {
        showToast(`শর্ত অপূর্ণ: মোট ৳${reward.minDepositAmount} ডিপোজিট বা ভেরিফিকেশন প্রয়োজন।`);
        return;
      }
    }

    if (reward.conditionType === 'verified' && !user.isVerified) {
      showToast('শর্ত অপূর্ণ: শুধুমাত্র ভেরিফাইড মেম্বাররা এই উপহার দাবি করতে পারবেন।');
      return;
    }

    setClaimingId(reward.id);

    try {
      const claimAmount = Number(reward.amount) || 0;
      const res = await claimAndCreditReward({
        userId: user.id,
        userPhone: user.phone,
        feature: 'claim',
        rewardId: reward.id,
        rewardTitle: reward.title,
        amount: claimAmount,
        note: `কোড: ${reward.code}`
      });

      if (!res.success) {
        showToast(res.message || 'দাবি ব্যর্থ হয়েছে!');
        if (res.alreadyClaimed) {
          setClaimedIds(prev => new Set([...prev, reward.id]));
        }
        return;
      }

      // 1. Credit balance immediately in Wallet from authoritative response
      const updatedBalance = res.wallet?.balance !== undefined 
        ? res.wallet.balance 
        : Math.round(((Number(wallet.balance) || 0) + claimAmount) * 100) / 100;

      setWallet(prev => ({
        ...prev,
        balance: updatedBalance,
        totalEarned: res.wallet?.totalEarned !== undefined 
          ? res.wallet.totalEarned 
          : Math.round(((Number(prev.totalEarned) || 0) + claimAmount) * 100) / 100,
        incomeBreakdown: {
          ...prev.incomeBreakdown,
          bonusIncome: Math.round(((Number(prev.incomeBreakdown?.bonusIncome) || 0) + claimAmount) * 100) / 100
        },
        updatedAt: res.wallet?.updatedAt || new Date().toISOString()
      }));

      // 2. Add real transaction record
      if (res.transaction) {
        addTransaction(res.transaction);
      } else {
        addTransaction({
          type: 'bonus',
          amount: claimAmount,
          status: 'completed',
          description: `উপহার দাবি: ${reward.title} (কোড: ${reward.code})`,
          paymentMethod: 'system'
        });
      }

      // 3. Update local state
      setClaimedIds(prev => new Set([...prev, reward.id]));
      if (res.claimRecord) {
        setUserClaimHistory(prev => [res.claimRecord!, ...prev]);
      }

      showToast(`অভিনন্দন! ৳${claimAmount.toFixed(2)} আপনার ওয়ালেটে সফলভাবে জমা হয়েছে।`);
    } catch (error) {
      console.error('Claim error:', error);
      showToast('দাবি প্রক্রিয়াকরণে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setClaimingId(null);
    }
  };

  // Badge background mapper matching Screenshot 1
  const getBadgeBg = (type: ClaimRewardItem['couponBadgeType']) => {
    switch (type) {
      case 'red':
        return 'bg-[#FF3B30] text-white';
      case 'magenta':
      case 'purple':
        return 'bg-[#D946EF] text-white';
      case 'orange':
        return 'bg-[#F97316] text-white';
      case 'green':
        return 'bg-[#10B981] text-white';
      case 'blue':
      default:
        return 'bg-[#0096FF] text-white';
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex flex-col font-sans pb-10">
      {/* Dark Maroon Top Bar matching Screenshot 1 */}
      <RewardCenterHeader
        title="দাবি করা"
        onBack={onBack}
        rightAction={
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white/90 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
            title="দাবি ইতিহাস"
          >
            <History className="w-5 h-5" />
          </button>
        }
      />

      {/* Sky Blue Profile Banner matching Screenshot 1 */}
      <RewardCenterProfileBanner
        user={user}
        balance={wallet?.balance || 0}
        theme="sky"
      />

      {/* List of Reward Cards */}
      <div className="p-3.5 space-y-3 max-w-lg mx-auto w-full">
        {rewards.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-xs border border-gray-100">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 font-medium text-sm">বর্তমানে কোনো সক্রিয় উপহার ক্যাম্পেইন নেই।</p>
          </div>
        ) : (
          rewards.map((reward) => {
            const isClaimed = claimedIds.has(reward.id);
            const isProcessing = claimingId === reward.id;

            return (
              <div
                key={reward.id}
                className="bg-white rounded-2xl p-2.5 sm:p-3 shadow-xs border border-gray-100/90 flex items-center justify-between gap-2.5 transition-all hover:shadow-sm"
              >
                {/* Left Coupon Badge Block */}
                <div
                  className={`w-20 sm:w-22 h-20 rounded-xl ${getBadgeBg(reward.couponBadgeType)} p-1.5 flex flex-col items-center justify-center text-center shadow-xs shrink-0 select-none relative overflow-hidden`}
                >
                  <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#F4F5F7] rounded-full" />
                  <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#F4F5F7] rounded-full" />
                  
                  <span className="font-black text-xs leading-tight whitespace-pre-line tracking-tight">
                    {reward.couponBadgeTitle || 'বোনাস'}
                  </span>
                  {reward.couponBadgeSubtitle && (
                    <span className="text-[10px] text-white/90 font-semibold mt-1">
                      {reward.couponBadgeSubtitle}
                    </span>
                  )}
                </div>

                {/* Center Details Block */}
                <div className="flex-1 min-w-0 pr-1">
                  <h3 className="text-xs sm:text-[13px] font-bold text-gray-900 leading-snug line-clamp-2">
                    {reward.title}
                  </h3>

                  <p className="text-xs sm:text-sm font-extrabold text-gray-800 mt-1">
                    পুরস্কার : <span className="text-[#FF4D4F]">৳ {Number(reward.amount).toFixed(2)}</span>
                  </p>

                  <button
                    onClick={() => setSelectedRewardForInfo(reward)}
                    className="inline-flex items-center gap-1 text-[11px] text-gray-500 hover:text-sky-600 font-medium mt-1 cursor-pointer transition-colors"
                  >
                    <span>বর্ণনা</span>
                    <Info className="w-3 h-3 text-sky-500" />
                  </button>
                </div>

                {/* Right Action Block */}
                <div className="flex flex-col items-end shrink-0 pl-1">
                  <span className="text-[10px] text-gray-500 font-medium">নির্ধারিত তারিখ</span>
                  <span className="text-[11px] font-bold text-gray-700 mt-0.5 whitespace-nowrap">
                    {reward.endDate ? reward.endDate.split(' ')[0] : 'সীমিত সময়'}
                  </span>

                  <button
                    onClick={() => handleClaim(reward)}
                    disabled={isClaimed || isProcessing}
                    className={`mt-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs active:scale-95 ${
                      isClaimed
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : isProcessing
                        ? 'bg-emerald-400 text-white cursor-wait'
                        : 'bg-[#00D26A] hover:bg-[#00B85C] text-white'
                    }`}
                  >
                    {isClaimed ? 'দাবি সম্পন্ন' : isProcessing ? 'অপেক্ষা...' : 'দাবি'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Description / Rules Info Modal */}
      {selectedRewardForInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-xl space-y-4 relative">
            <button
              onClick={() => setSelectedRewardForInfo(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-sky-50 flex items-center justify-center text-sky-600">
                <Info className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 text-base">পুরস্কারের শর্ত ও নিয়মাবলী</h3>
            </div>

            <div className="bg-gray-50 rounded-2xl p-3.5 space-y-2 text-xs text-gray-700">
              <p><strong className="text-gray-900">শিরোনাম:</strong> {selectedRewardForInfo.title}</p>
              <p><strong className="text-gray-900">কোড:</strong> {selectedRewardForInfo.code}</p>
              <p><strong className="text-gray-900">পরিমাণ:</strong> ৳{selectedRewardForInfo.amount.toFixed(2)}</p>
              <p><strong className="text-gray-900">মেয়াদ:</strong> {selectedRewardForInfo.startDate} হতে {selectedRewardForInfo.endDate}</p>
              <p><strong className="text-gray-900">প্রয়োজনীয় শর্ত:</strong> {selectedRewardForInfo.requiredCondition || 'সক্রিয় অ্যাকাউন্ট'}</p>
              <div className="pt-2 border-t border-gray-200">
                <strong className="text-gray-900 block mb-1">বিস্তারিত বিবরণ:</strong>
                <p className="text-gray-600 leading-relaxed">{selectedRewardForInfo.description}</p>
              </div>
            </div>

            <button
              onClick={() => setSelectedRewardForInfo(null)}
              className="w-full py-2.5 rounded-xl bg-gray-900 text-white font-bold text-xs"
            >
              বুঝেছি
            </button>
          </div>
        </div>
      )}

      {/* Claim History Modal */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-5 w-full max-w-md shadow-xl max-h-[80vh] flex flex-col relative">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-gray-800" />
                <h3 className="font-bold text-gray-900 text-base">আমার দাবি করা উপহার তালিকা</h3>
              </div>
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
              {userClaimHistory.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-xs">
                  এখনও পর্যন্ত কোনো উপহার দাবি করা হয়নি।
                </div>
              ) : (
                userClaimHistory.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-gray-900">{item.rewardTitle}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        আইডি: {item.id} | {new Date(item.claimedAt).toLocaleString('bn-BD')}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-emerald-600 text-sm">
                        +৳{item.amount.toFixed(2)}
                      </span>
                      <p className="text-[10px] text-emerald-500 font-medium">সফল ✓</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setIsHistoryOpen(false)}
              className="mt-3 w-full py-2.5 rounded-xl bg-gray-900 text-white font-bold text-xs"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
