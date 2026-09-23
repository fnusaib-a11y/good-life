import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { RewardCenterHeader } from './RewardCenterHeader';
import { TemuTicketItem, TemuTicketCampaign } from '../../../types/rewardCenter';
import { 
  getUserTemuTickets, 
  saveUserTemuTicket, 
  getRewardCenterSettings 
} from '../../../services/rewardCenterService';
import { Ticket, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TemuTicketPageProps {
  onBack: () => void;
}

export const TemuTicketPage: React.FC<TemuTicketPageProps> = ({ onBack }) => {
  const { user, wallet, setWallet, addTransaction, showToast } = useApp();
  const [tickets, setTickets] = useState<TemuTicketItem[]>([]);
  const [campaigns, setCampaigns] = useState<TemuTicketCampaign[]>([]);
  const [claimedCampaignIds, setClaimedCampaignIds] = useState<Set<string>>(new Set());
  const [totalClaimedAmount, setTotalClaimedAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  // Load user tickets and admin campaigns from Firestore
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }
      try {
        const [userTickets, settings] = await Promise.all([
          getUserTemuTickets(user.id),
          getRewardCenterSettings()
        ]);

        if (isMounted) {
          setTickets(userTickets);
          const positiveTotal = userTickets
            .filter(t => t.amount > 0 && t.status === 'completed')
            .reduce((sum, t) => sum + t.amount, 0);
          setTotalClaimedAmount(positiveTotal);

          // Active campaigns
          const activeCampaigns = (settings.temuCampaigns || []).filter(c => c.status === 'active');
          setCampaigns(activeCampaigns);

          // Track which campaigns are already claimed
          const claimedSet = new Set<string>();
          userTickets.forEach(t => {
            if (t.campaignId) claimedSet.add(t.campaignId);
          });
          setClaimedCampaignIds(claimedSet);
        }
      } catch (err) {
        console.warn('Failed to load temu tickets:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const handleClaimCampaign = async (campaign: TemuTicketCampaign) => {
    if (!user?.id) {
      showToast('অনুগ্রহ করে লগইন করুন।');
      return;
    }

    if (claimedCampaignIds.has(campaign.id)) {
      showToast('আপনি ইতিমধ্যেই এই টিকিটটি দাবি করেছেন!');
      return;
    }

    if (claimingId) return;
    setClaimingId(campaign.id);

    const now = new Date();
    const formattedDate = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${now.toLocaleTimeString('en-GB')}`;

    try {
      const bonusAmount = Number(campaign.amount) || 0;
      const newTicket: TemuTicketItem = {
        id: `ticket_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        campaignId: campaign.id,
        userId: user.id,
        ticketName: campaign.title,
        condition: campaign.condition || 'অফিশিয়াল টেমু টিকিট উপহার',
        amount: bonusAmount,
        date: formattedDate,
        status: 'completed'
      };

      // 1. Credit wallet
      setWallet(prev => ({
        ...prev,
        balance: Math.round(((Number(prev.balance) || 0) + bonusAmount) * 100) / 100,
        totalEarned: Math.round(((Number(prev.totalEarned) || 0) + bonusAmount) * 100) / 100
      }));

      // 2. Add transaction
      addTransaction({
        type: 'bonus',
        amount: bonusAmount,
        status: 'completed',
        description: `টেমু টিকিট বোনাস: ${campaign.title}`,
        paymentMethod: 'system'
      });

      // 3. Save ticket
      await saveUserTemuTicket(newTicket);

      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch {}

      setTickets(prev => [newTicket, ...prev]);
      setClaimedCampaignIds(prev => new Set(prev).add(campaign.id));
      setTotalClaimedAmount(prev => prev + bonusAmount);
      showToast(`অভিনন্দন! ৳${bonusAmount.toFixed(2)} টেমু টিকিট বোনাস অ্যাকাউন্টে যোগ হয়েছে!`);
    } catch (err) {
      console.error('Ticket claim error:', err);
      showToast('টিকিট দাবি ব্যর্থ হয়েছে।');
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex flex-col font-sans pb-10">
      {/* Dark Maroon Top Bar */}
      <RewardCenterHeader
        title="TEMU টিকিট সেন্টার"
        onBack={onBack}
      />

      {/* Radiant Golden-Yellow Amber Banner with Glowing Treasure Chest */}
      <div className="relative bg-gradient-to-b from-[#F59E0B] via-[#D97706] to-[#92400E] text-white px-4 pt-6 pb-8 overflow-hidden text-center shadow-md">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-200/20 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center justify-center">
          <div className="relative w-32 h-24 mb-2 flex items-center justify-center">
            <div className="absolute inset-0 bg-yellow-300/30 rounded-full blur-xl animate-pulse" />
            <div className="relative text-5xl sm:text-6xl drop-shadow-md select-none transform hover:scale-105 transition-transform">
              👑
              <div className="absolute -bottom-1 -left-2 text-4xl">💰</div>
              <div className="absolute -bottom-1 -right-2 text-4xl">💎</div>
              <div className="absolute -top-1 right-1 text-2xl">✨</div>
            </div>
          </div>

          <div className="relative z-10 mt-1 inline-flex flex-col items-center bg-gradient-to-r from-amber-400/90 via-yellow-200/90 to-amber-400/90 text-amber-950 px-6 py-2 rounded-2xl shadow-lg border border-yellow-100">
            <span className="text-[11px] font-extrabold tracking-wide uppercase">
              মোট দাবিকৃত পরিমাণ
            </span>
            <span className="text-xl sm:text-2xl font-black tracking-tight leading-tight mt-0.5">
              ৳ {totalClaimedAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="p-3.5 space-y-4 max-w-lg mx-auto w-full -mt-2 relative z-20">
        
        {/* Active Temu Campaigns from Admin */}
        {campaigns.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-700 flex items-center gap-1.5 px-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>উপলব্ধ টেমু টিকিট অফার</span>
            </h3>

            {campaigns.map(camp => {
              const isClaimed = claimedCampaignIds.has(camp.id);
              const isProcessing = claimingId === camp.id;

              return (
                <div key={camp.id} className="bg-white rounded-2xl p-4 shadow-sm border border-amber-200/80 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        {camp.category || 'টেমু স্পেশাল'}
                      </span>
                      <span className="text-xs font-black text-emerald-600">
                        ৳{camp.amount.toFixed(2)}
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                      {camp.title}
                    </h4>
                    <p className="text-[11px] text-gray-500 line-clamp-1">
                      {camp.condition}
                    </p>
                  </div>

                  <button
                    disabled={isClaimed || isProcessing}
                    onClick={() => handleClaimCampaign(camp)}
                    className={`px-4 py-2 rounded-xl font-bold text-xs shrink-0 transition shadow-sm ${
                      isClaimed
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white active:scale-95'
                    }`}
                  >
                    {isClaimed ? (
                      <span className="flex items-center gap-1 text-emerald-600 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> গৃহীত
                      </span>
                    ) : isProcessing ? (
                      'দাবি হচ্ছে...'
                    ) : (
                      'দাবি করুন'
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Ticket History Section */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-gray-700 flex items-center gap-1.5 px-1">
            <Ticket className="w-3.5 h-3.5 text-gray-500" />
            <span>টিকিট ইতিহাস ও লেনদেন</span>
          </h3>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100 overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-gray-400">
                লোড হচ্ছে...
              </div>
            ) : tickets.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">
                কোনো টিকিট ইতিহাস পাওয়া যায়নি।
              </div>
            ) : (
              tickets.map((item) => {
                const isPositive = item.amount >= 0;

                return (
                  <div
                    key={item.id}
                    className="p-3 sm:p-3.5 flex items-center justify-between gap-3 hover:bg-gray-50/60 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-gray-400 font-mono">
                        {item.date}
                      </p>
                      <h4 className="text-xs sm:text-[13px] font-bold text-gray-900 mt-0.5 truncate">
                        {item.ticketName}
                      </h4>
                      <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                        {item.condition}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-sm sm:text-base font-black tracking-tight ${
                          isPositive ? 'text-[#00D26A]' : 'text-[#FF4D4F]'
                        }`}
                      >
                        {isPositive ? `+${item.amount.toFixed(2)}` : item.amount.toFixed(2)}
                      </span>
                      <p className="text-[10px] font-semibold text-gray-400 mt-0.5">
                        {item.status === 'completed' ? 'সম্পন্ন' : item.status === 'expired' ? 'মেয়াদোত্তীর্ণ' : 'পেন্ডিং'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemuTicketPage;
