import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { RewardCenterHeader } from './RewardCenterHeader';
import { RewardCenterProfileBanner } from './RewardCenterProfileBanner';
import { RescueFundCampaign, RewardClaimRecord } from '../../../types/rewardCenter';
import { 
  getRewardCenterSettings, 
  getUserClaimRecords, 
  recordRewardClaim,
  claimAndCreditReward
} from '../../../services/rewardCenterService';
import { ShieldCheck, HeartHandshake, AlertCircle, CheckCircle2, Coins, ArrowRight } from 'lucide-react';

interface RescueFundPageProps {
  onBack: () => void;
}

export const RescueFundPage: React.FC<RescueFundPageProps> = ({ onBack }) => {
  const { user, wallet, setWallet, addTransaction, showToast } = useApp();
  const [campaigns, setCampaigns] = useState<RescueFundCampaign[]>([]);
  const [claimedCampaignIds, setClaimedCampaignIds] = useState<Set<string>>(new Set());
  const [isProcessingId, setIsProcessingId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const settings = await getRewardCenterSettings();
        if (isMounted) {
          const activeCampaigns = (settings.rescueFundCampaigns || []).filter(c => c.status === 'active');
          setCampaigns(activeCampaigns);
        }

        if (user?.id) {
          const claims = await getUserClaimRecords(user.id);
          if (isMounted) {
            const set = new Set<string>();
            claims.forEach(c => {
              if (c.feature === 'rescue_fund') set.add(c.rewardId);
            });
            setClaimedCampaignIds(set);
          }
        }
      } catch (err) {
        console.warn('Failed to load rescue fund data:', err);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const handleClaimFund = async (campaign: RescueFundCampaign) => {
    if (!user?.id) {
      showToast('অনুগ্রহ করে লগইন করুন।');
      return;
    }

    if (claimedCampaignIds.has(campaign.id)) {
      showToast('আপনি ইতিমধ্যেই এই তহবিল সহায়তা গ্রহণ করেছেন!');
      return;
    }

    if (isProcessingId) return;

    // Condition check
    if (campaign.conditionType === 'verified' && !user.isVerified) {
      showToast('শর্ত অপূর্ণ: শুধুমাত্র ভেরিফাইড মেম্বাররা এই তহবিল সহায়তা গ্রহণ করতে পারবেন।');
      return;
    }

    setIsProcessingId(campaign.id);

    try {
      const amount = Number(campaign.rewardAmount) || 0;
      const res = await claimAndCreditReward({
        userId: user.id,
        userPhone: user.phone,
        feature: 'rescue_fund',
        rewardId: campaign.id,
        rewardTitle: campaign.name,
        amount: amount,
        note: `উদ্ধার তহবিল সহায়তা: ${campaign.name}`
      });

      if (!res.success) {
        showToast(res.message || 'তহবিল দাবি ব্যর্থ হয়েছে।');
        if (res.alreadyClaimed) {
          setClaimedCampaignIds(prev => new Set([...prev, campaign.id]));
        }
        return;
      }

      // 1. Credit wallet with authoritative balance
      const updatedBalance = res.wallet?.balance !== undefined
        ? res.wallet.balance
        : Math.round(((Number(wallet.balance) || 0) + amount) * 100) / 100;

      setWallet(prev => ({
        ...prev,
        balance: updatedBalance,
        totalEarned: res.wallet?.totalEarned !== undefined
          ? res.wallet.totalEarned
          : Math.round(((Number(prev.totalEarned) || 0) + amount) * 100) / 100,
        incomeBreakdown: {
          ...prev.incomeBreakdown,
          bonusIncome: Math.round(((Number(prev.incomeBreakdown?.bonusIncome) || 0) + amount) * 100) / 100
        },
        updatedAt: res.wallet?.updatedAt || new Date().toISOString()
      }));

      // 2. Add Transaction
      if (res.transaction) {
        addTransaction(res.transaction);
      } else {
        addTransaction({
          type: 'bonus',
          amount: amount,
          status: 'completed',
          description: `উদ্ধার তহবিল সহায়তা: ${campaign.name}`,
          paymentMethod: 'system'
        });
      }

      // 3. Update local state
      setClaimedCampaignIds(prev => new Set([...prev, campaign.id]));
      showToast(`অভিনন্দন! উদ্ধার তহবিল বাবদ ৳${amount.toFixed(2)} আপনার ওয়ালেটে জমা হয়েছে।`);
    } catch (err) {
      console.error('Rescue claim error:', err);
      showToast('তহবিল দাবি ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex flex-col font-sans pb-10">
      {/* Dark Maroon Top Bar */}
      <RewardCenterHeader
        title="উদ্ধার তহবিল"
        onBack={onBack}
      />

      {/* Emerald Green Profile Banner with avatar & real balance */}
      <RewardCenterProfileBanner
        user={user}
        balance={wallet?.balance || 0}
        theme="emerald"
      />

      <div className="p-3.5 space-y-3.5 max-w-lg mx-auto w-full">
        {/* Intro Card */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-4 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1.5">
              <ShieldCheck className="w-5 h-5 text-emerald-200" />
              <h3 className="font-extrabold text-sm sm:text-base">
                মেম্বার সুরক্ষা ও আর্থিক সহায়তা কর্মসূচি
              </h3>
            </div>
            <p className="text-xs text-emerald-100 leading-relaxed">
              সদস্যদের সুরক্ষা ও জরুরি সহযোগিতায় এডমিন কর্তৃক তহবিল ক্যাম্পেইন চালু রাখা হয়। নিয়মিত মেম্বাররা এই তহবিল থেকে সহায়তা অনুদান গ্রহণ করতে পারবেন।
            </p>
          </div>
        </div>

        {/* Active Campaigns List */}
        <div className="space-y-3">
          {campaigns.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-xs border border-gray-100">
              <HeartHandshake className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 font-medium text-sm">
                বর্তমানে কোনো সক্রিয় উদ্ধার তহবিল ক্যাম্পেইন নেই।
              </p>
            </div>
          ) : (
            campaigns.map((camp) => {
              const isClaimed = claimedCampaignIds.has(camp.id);
              const isProcessing = isProcessingId === camp.id;
              const percent = Math.min(100, Math.round(((camp.distributedAmount || 0) / (camp.targetAmount || 1)) * 100));

              return (
                <div
                  key={camp.id}
                  className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Coins className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-gray-900 leading-snug">
                          {camp.name}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                          {camp.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Fund Distribution Progress Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-gray-600">
                      <span>তহবিল বিতরণ অগ্রগতি</span>
                      <span className="text-emerald-600 font-bold">{percent}% সম্পন্ন</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-gray-400">
                      <span>বিতরণ: ৳{camp.distributedAmount?.toLocaleString()}</span>
                      <span>টার্গেট: ৳{camp.targetAmount?.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Conditions & Dates */}
                  <div className="bg-gray-50 rounded-xl p-2.5 text-[11px] text-gray-600 space-y-1">
                    <p><strong className="text-gray-800">শর্ত:</strong> {camp.requiredCondition || 'সক্রিয় অ্যাকাউন্ট'}</p>
                    <p><strong className="text-gray-800">মেয়াদ:</strong> {camp.startDate} হতে {camp.endDate}</p>
                  </div>

                  {/* Claim Action */}
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-[10px] text-gray-400 font-semibold block">সহায়তা পরিমাণ</span>
                      <span className="text-base font-black text-emerald-600">
                        ৳ {Number(camp.rewardAmount).toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={() => handleClaimFund(camp)}
                      disabled={isClaimed || isProcessing}
                      className={`px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 ${
                        isClaimed
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : isProcessing
                          ? 'bg-emerald-400 text-white cursor-wait'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      {isClaimed ? 'গৃহীত সম্পন্ন ✓' : isProcessing ? 'অপেক্ষা...' : 'তহবিল গ্রহণ করুন'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
