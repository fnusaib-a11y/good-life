import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { RewardCenterHeader } from './RewardCenterHeader';
import { RewardCenterProfileBanner } from './RewardCenterProfileBanner';
import { PromoCodeItem, RewardClaimRecord } from '../../../types/rewardCenter';
import { 
  getRewardCenterSettings, 
  getUserClaimRecords, 
  recordRewardClaim,
  saveRewardCenterSettings 
} from '../../../services/rewardCenterService';
import { Ticket, Copy, Check, Sparkles, Tag, ShieldCheck } from 'lucide-react';

interface PromoCodePageProps {
  onBack: () => void;
}

export const PromoCodePage: React.FC<PromoCodePageProps> = ({ onBack }) => {
  const { user, wallet, setWallet, addTransaction, showToast } = useApp();
  const [promoCodes, setPromoCodes] = useState<PromoCodeItem[]>([]);
  const [inputCode, setInputCode] = useState('');
  const [redeemedCodeIds, setRedeemedCodeIds] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const settings = await getRewardCenterSettings();
        if (isMounted) {
          const activeList = (settings.promoCodes || []).filter(c => c.status === 'active');
          setPromoCodes(activeList);
        }

        if (user?.id) {
          const claims = await getUserClaimRecords(user.id);
          if (isMounted) {
            const used = new Set<string>();
            claims.forEach(c => {
              if (c.feature === 'promo') used.add(c.rewardId.toUpperCase());
            });
            setRedeemedCodeIds(used);
          }
        }
      } catch (err) {
        console.warn('Failed to load promo codes:', err);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const handleRedeem = async (codeToRedeem?: string) => {
    const rawCode = (codeToRedeem || inputCode).trim().toUpperCase();
    if (!rawCode) {
      showToast('অনুগ্রহ করে একটি প্রচার কোড লিখুন।');
      return;
    }

    if (!user?.id) {
      showToast('অনুগ্রহ করে লগইন করুন।');
      return;
    }

    if (redeemedCodeIds.has(rawCode)) {
      showToast('আপনি ইতিমধ্যেই এই প্রচার কোডটি খালাস করেছেন!');
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Find matching promo code in active list
      const matched = promoCodes.find(c => c.code.toUpperCase() === rawCode);

      if (!matched) {
        showToast('ভুল বা অবৈধ প্রচার কোড! অনুগ্রহ করে সঠিক কোড দিন।');
        setIsSubmitting(false);
        return;
      }

      // Check expiry date
      if (matched.expiryDate) {
        const expiry = new Date(matched.expiryDate).getTime();
        if (Date.now() > expiry) {
          showToast('এই প্রচার কোডের মেয়াদ শেষ হয়ে গেছে।');
          setIsSubmitting(false);
          return;
        }
      }

      // Check total usage limit
      if (matched.totalUsageLimit && matched.usedCount >= matched.totalUsageLimit) {
        showToast('এই প্রচার কোডের সর্বমোট ব্যবহারের সীমা শেষ হয়ে গেছে।');
        setIsSubmitting(false);
        return;
      }

      const rewardAmount = Number(matched.rewardAmount) || 0;
      const uniqueTxId = `tx_promo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const nowIso = new Date().toISOString();

      // 1. Credit wallet balance
      setWallet(prev => ({
        ...prev,
        balance: Math.round(((Number(prev.balance) || 0) + rewardAmount) * 100) / 100,
        totalEarned: Math.round(((Number(prev.totalEarned) || 0) + rewardAmount) * 100) / 100,
        incomeBreakdown: {
          ...prev.incomeBreakdown,
          bonusIncome: Math.round(((Number(prev.incomeBreakdown?.bonusIncome) || 0) + rewardAmount) * 100) / 100
        }
      }));

      // 2. Add Transaction
      addTransaction({
        type: 'bonus',
        amount: rewardAmount,
        status: 'completed',
        description: `প্রচার কোড খালাস: ${matched.code} (${matched.title})`,
        paymentMethod: 'system'
      });

      // 3. Persist claim
      const claimRecord: RewardClaimRecord = {
        id: uniqueTxId,
        userId: user.id,
        feature: 'promo',
        rewardId: rawCode,
        rewardTitle: matched.title,
        amount: rewardAmount,
        claimedAt: nowIso,
        status: 'completed',
        note: `কোড: ${matched.code}`
      };
      await recordRewardClaim(claimRecord);

      // 4. Increment usedCount in settings
      const settings = await getRewardCenterSettings();
      const updatedPromoList = (settings.promoCodes || []).map(p => {
        if (p.code.toUpperCase() === rawCode) {
          return { ...p, usedCount: (p.usedCount || 0) + 1 };
        }
        return p;
      });
      await saveRewardCenterSettings({
        ...settings,
        promoCodes: updatedPromoList
      });

      // 5. Update local state
      setRedeemedCodeIds(prev => new Set([...prev, rawCode]));
      setInputCode('');
      showToast(`অভিনন্দন! প্রচার কোড খালাস সফল! ৳${rewardAmount.toFixed(2)} ওয়ালেটে যোগ হয়েছে।`);
    } catch (err) {
      console.error('Promo redeem error:', err);
      showToast('কোড খালাস করতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setInputCode(code);
    showToast(`কোড "${code}" কপি এবং ইনপুটে বসানো হয়েছে!`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex flex-col font-sans pb-10">
      {/* Dark Maroon Top Bar matching Screenshot 4 */}
      <RewardCenterHeader
        title="প্রচার কোড রিডিম করুন"
        onBack={onBack}
      />

      {/* Sky Blue Profile Banner matching Screenshot 4 */}
      <RewardCenterProfileBanner
        user={user}
        balance={wallet?.balance || 0}
        theme="sky"
      />

      <div className="p-3.5 space-y-4 max-w-lg mx-auto w-full">
        {/* Redeem Input Box matching Screenshot 4 */}
        <div className="bg-white rounded-2xl p-2.5 sm:p-3 shadow-xs border border-gray-100 flex items-center gap-2">
          <input
            type="text"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value.toUpperCase())}
            placeholder="আপনার প্রচার কোড পূরণ করুন"
            className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm font-semibold text-gray-800 placeholder-gray-400 focus:outline-none uppercase tracking-wider"
          />

          <button
            onClick={() => handleRedeem()}
            disabled={!inputCode.trim() || isSubmitting}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 shrink-0 ${
              inputCode.trim() && !isSubmitting
                ? 'bg-[#0284C7] hover:bg-[#0369A1] text-white shadow-sky-200'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? 'অপেক্ষা...' : 'খালাস'}
          </button>
        </div>

        {/* Section Heading matching Screenshot 4 */}
        <div className="pt-1">
          <h2 className="text-sm font-bold text-gray-800 tracking-tight">
            প্রচার কোড তালিকা
          </h2>
        </div>

        {/* Promo Codes List or Clean Empty State matching Screenshot 4 */}
        {promoCodes.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center shadow-xs border border-gray-100 flex flex-col items-center justify-center space-y-3">
            {/* Cute Pastel Tickets Illustration matching Screenshot 4 */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              <div className="absolute w-20 h-14 bg-pink-200/70 rounded-xl -rotate-12 transform shadow-xs border border-pink-300/60" />
              <div className="absolute w-20 h-14 bg-amber-200/70 rounded-xl rotate-6 transform shadow-xs border border-amber-300/60" />
              <div className="relative w-22 h-14 bg-purple-300/80 rounded-xl -rotate-2 transform shadow-sm border border-purple-400/60 flex items-center justify-center">
                <Ticket className="w-8 h-8 text-white drop-shadow-xs" />
              </div>
            </div>

            <p className="text-xs sm:text-sm font-semibold text-gray-400 max-w-xs leading-relaxed">
              কোন প্রচার কোড বর্তমানে উপলব্ধ নেই।
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {promoCodes.map((item) => {
              const isUsed = redeemedCodeIds.has(item.code.toUpperCase());

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-3.5 shadow-xs border border-gray-100 flex items-center justify-between gap-3 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Tag className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-gray-900 tracking-wider">
                          {item.code}
                        </span>
                        <span className="text-[10px] font-extrabold text-[#FF4D4F] bg-red-50 px-2 py-0.5 rounded-full">
                          ৳{Number(item.rewardAmount).toFixed(2)}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-gray-700 mt-1 truncate">
                        {item.title}
                      </h4>
                      {item.description && (
                        <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopyCode(item.code)}
                      disabled={isUsed}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                        isUsed
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : copiedCode === item.code
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : 'bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200'
                      }`}
                    >
                      {isUsed ? (
                        <span>ব্যবহৃত ✓</span>
                      ) : copiedCode === item.code ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>কপি</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>ব্যবহার</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
