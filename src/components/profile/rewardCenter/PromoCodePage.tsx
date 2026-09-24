import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { RewardCenterHeader } from './RewardCenterHeader';
import { RewardCenterProfileBanner } from './RewardCenterProfileBanner';
import { RewardClaimRecord } from '../../../types/rewardCenter';
import { 
  getRewardCenterSettings, 
  getUserClaimRecords, 
  claimAndCreditReward,
  saveRewardCenterSettings
} from '../../../services/rewardCenterService';
import { Ticket, CheckCircle2, Sparkles, Send, ExternalLink, ShieldCheck, Clock, Check } from 'lucide-react';

interface PromoCodePageProps {
  onBack: () => void;
}

export const PromoCodePage: React.FC<PromoCodePageProps> = ({ onBack }) => {
  const { user, wallet, setWallet, addTransaction, showToast } = useApp();
  const [inputCode, setInputCode] = useState('');
  const [redeemedCodeIds, setRedeemedCodeIds] = useState<Set<string>>(new Set());
  const [myRedeemedHistory, setMyRedeemedHistory] = useState<RewardClaimRecord[]>([]);
  const [telegramUrl, setTelegramUrl] = useState<string>('https://t.me/goodlife_official');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const settings = await getRewardCenterSettings();
        if (isMounted && settings.telegramChannelUrl) {
          setTelegramUrl(settings.telegramChannelUrl);
        }

        if (user?.id) {
          const claims = await getUserClaimRecords(user.id);
          if (isMounted) {
            const used = new Set<string>();
            const promoClaims: RewardClaimRecord[] = [];
            claims.forEach(c => {
              if (c.feature === 'promo') {
                used.add(c.rewardId.toUpperCase());
                promoClaims.push(c);
              }
            });
            setRedeemedCodeIds(used);
            setMyRedeemedHistory(promoClaims);
          }
        }
      } catch (err) {
        console.warn('Failed to load promo code state:', err);
      } finally {
        if (isMounted) setLoadingHistory(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const handleRedeem = async () => {
    const rawCode = inputCode.trim().toUpperCase();
    if (!rawCode) {
      showToast('অনুগ্রহ করে একটি প্রচার কোড লিখুন।');
      return;
    }

    if (!user?.id) {
      showToast('অনুগ্রহ করে প্রথমে লগইন করুন।');
      return;
    }

    if (redeemedCodeIds.has(rawCode)) {
      showToast('আপনি ইতিমধ্যেই এই প্রচার কোডটি ব্যবহার করেছেন! একই কোড দ্বিতীয়বার গ্রহণযোগ্য নয়।');
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // 1. Fetch live settings directly from Firestore (authoritative read)
      const settings = await getRewardCenterSettings();
      const allPromos = settings.promoCodes || [];
      const matched = allPromos.find(c => c.code.toUpperCase() === rawCode);

      if (!matched || matched.status !== 'active') {
        showToast('ভুল অথবা নিষ্ক্রিয় প্রচার কোড! টেলিগ্রাম চ্যানেল থেকে সঠিক কোড সংগ্রহ করুন।');
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
      if (matched.totalUsageLimit && (matched.usedCount || 0) >= matched.totalUsageLimit) {
        showToast('এই প্রচার কোডের সর্বমোট ব্যবহারের সীমা শেষ হয়ে গেছে।');
        setIsSubmitting(false);
        return;
      }

      const rewardAmount = Number(matched.rewardAmount) || 0;
      if (rewardAmount <= 0) {
        showToast('এই কোডে কোনো বৈধ রিওয়ার্ড নেই।');
        setIsSubmitting(false);
        return;
      }

      // 2. Atomic duplicate-proof Firestore transaction (runTransaction verifies claim status)
      const res = await claimAndCreditReward({
        userId: user.id,
        userPhone: user.phone,
        feature: 'promo',
        rewardId: rawCode,
        rewardTitle: matched.title || `প্রচার কোড: ${matched.code}`,
        amount: rewardAmount,
        note: `কোড: ${matched.code}`
      });

      if (!res.success) {
        showToast(res.message || 'প্রচার কোড খালাস ব্যর্থ হয়েছে!');
        if (res.alreadyClaimed) {
          setRedeemedCodeIds(prev => new Set([...prev, rawCode]));
        }
        setIsSubmitting(false);
        return;
      }

      // 3. Update wallet state with authoritative new balance
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

      // 4. Record Transaction
      if (res.transaction) {
        addTransaction(res.transaction);
      } else {
        addTransaction({
          type: 'bonus',
          amount: rewardAmount,
          status: 'completed',
          description: `প্রচার কোড খালাস: ${matched.code} (${matched.title || 'বোনাস'})`,
          paymentMethod: 'system'
        });
      }

      // 5. Increment usedCount in settings
      const updatedPromoList = allPromos.map(p => {
        if (p.code.toUpperCase() === rawCode) {
          return { ...p, usedCount: (p.usedCount || 0) + 1 };
        }
        return p;
      });
      await saveRewardCenterSettings({
        ...settings,
        promoCodes: updatedPromoList
      });

      // 6. Update user's personal claim history
      const newRecord: RewardClaimRecord = {
        id: res.claimRecord?.id || `claim_promo_${Date.now()}`,
        userId: user.id,
        userPhone: user.phone,
        feature: 'promo',
        rewardId: rawCode,
        rewardTitle: matched.title || matched.code,
        amount: rewardAmount,
        claimedAt: new Date().toISOString(),
        status: 'completed',
        note: `কোড: ${matched.code}`
      };

      setRedeemedCodeIds(prev => new Set([...prev, rawCode]));
      setMyRedeemedHistory(prev => [newRecord, ...prev]);
      setInputCode('');
      showToast(`অভিনন্দন! প্রচার কোড সফলভাবে খালাস হয়েছে! ৳${rewardAmount.toFixed(2)} মূল ব্যালেন্সে যুক্ত হয়েছে।`);
    } catch (err) {
      console.error('Promo redeem error:', err);
      showToast('কোড খালাস করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex flex-col font-sans pb-10">
      {/* Dark Maroon Top Bar */}
      <RewardCenterHeader
        title="প্রচার কোড রিডিম করুন"
        onBack={onBack}
      />

      {/* Sky Blue Profile Banner with Live Balance */}
      <RewardCenterProfileBanner
        user={user}
        balance={wallet?.balance || 0}
        theme="sky"
      />

      <div className="p-3.5 space-y-4 max-w-lg mx-auto w-full">
        {/* Redeem Input Box */}
        <div className="bg-white rounded-2xl p-2.5 sm:p-3 shadow-xs border border-gray-100 flex items-center gap-2">
          <input
            type="text"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value.toUpperCase())}
            placeholder="আপনার প্রচার কোড লিখুন"
            className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm font-semibold text-gray-800 placeholder-gray-400 focus:outline-none uppercase tracking-wider font-mono"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleRedeem();
              }
            }}
          />

          <button
            onClick={handleRedeem}
            disabled={!inputCode.trim() || isSubmitting}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 shrink-0 cursor-pointer ${
              inputCode.trim() && !isSubmitting
                ? 'bg-[#0284C7] hover:bg-[#0369A1] text-white shadow-sky-200'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? 'যাচাই হচ্ছে...' : 'খালাস'}
          </button>
        </div>

        {/* Telegram Channel Announcement Card */}
        <div className="bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 border border-sky-100 rounded-3xl p-5 shadow-xs text-sky-950 space-y-3">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-sky-200">
              <Send className="w-6 h-6 ml-0.5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-sky-950 flex items-center gap-1.5">
                <span>অফিশিয়াল টেলিগ্রাম চ্যানেল থেকে কোড নিন</span>
                <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
              </h3>
              <p className="text-xs text-sky-800/90 mt-1 leading-relaxed">
                নতুন প্রচার কোড শুধুমাত্র আমাদের অফিসিয়াল টেলিগ্রাম চ্যানেলে প্রকাশ করা হয়। টেলিগ্রাম থেকে কোড সংগ্রহ করে উপরের বক্সে বসিয়ে সাথে সাথে ক্যাশ বোনাস গ্রহণ করুন!
              </p>
            </div>
          </div>

          <div className="pt-1 flex flex-col sm:flex-row items-center gap-2">
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-5 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-extrabold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>টেলিগ্রাম চ্যানেলে যুক্ত হন</span>
              <ExternalLink className="w-3.5 h-3.5 ml-0.5 opacity-80" />
            </a>
            <span className="text-[11px] text-sky-700/80 font-medium">
              💡 ১টি কোড ১ জন ইউজার একবারই ব্যবহার করতে পারবেন
            </span>
          </div>
        </div>

        {/* User's Personal Redeemed Promo Codes History */}
        <div className="space-y-2.5 pt-1">
          <h3 className="text-xs font-bold text-gray-700 px-1 flex items-center justify-between">
            <span>আমার রিডিম করা কোডের ইতিহাস ({myRedeemedHistory.length})</span>
            <span className="text-[11px] font-normal text-gray-400">ব্যক্তিগত রেকর্ড</span>
          </h3>

          {myRedeemedHistory.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 sm:p-10 text-center shadow-xs border border-gray-100 flex flex-col items-center justify-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center">
                <Ticket className="w-7 h-7" />
              </div>
              <p className="text-xs sm:text-sm font-semibold text-gray-400 max-w-xs leading-relaxed">
                আপনি এখনও পর্যন্ত কোনো প্রচার কোড রিডিম করেননি। আমাদের টেলিগ্রাম চ্যানেলে যোগ দিয়ে কোড সংগ্রহ করুন!
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xs border border-gray-100 divide-y divide-gray-100 overflow-hidden">
              {myRedeemedHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-gray-900 tracking-wider">
                          {item.rewardId}
                        </span>
                        <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          +৳{Number(item.amount).toFixed(2)}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                        {item.rewardTitle || 'প্রচার কোড রিওয়ার্ড'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      সফল ✓
                    </span>
                    <p className="text-[10px] text-gray-400 mt-0.5 font-mono">
                      {item.claimedAt ? item.claimedAt.split('T')[0] : 'সম্প্রতি'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
