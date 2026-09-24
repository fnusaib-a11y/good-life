import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  TrendingUp, 
  Wallet, 
  ArrowUpRight, 
  History, 
  ChevronRight, 
  Clock, 
  Calendar, 
  BarChart3, 
  Coins, 
  Gift, 
  ArrowDownCircle, 
  Briefcase, 
  Users, 
  Award, 
  ShoppingBag, 
  Sparkles, 
  RefreshCw 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { safeSetItem } from '../../lib/storageUtils';
import { 
  calculateRevenueAnalytics, 
  aggregateUserTransactions,
  getPeriodDetail, 
  PeriodDetail 
} from '../../lib/revenueAnalytics';

export const RevenueAnalyticsModal: React.FC = () => {
  const { 
    isRevenueOpen, 
    setIsRevenueOpen, 
    isBn, 
    wallet, 
    setWallet,
    transactions, 
    user,
    setLanguage, 
    setIsWalletOpen, 
    setWalletActiveTab,
    showToast,
    setActiveTab
  } = useApp();

  const [selectedPeriodKey, setSelectedPeriodKey] = useState<'today' | 'yesterday' | 'week' | 'month' | 'total' | 'withdrawn' | null>(null);

  // Compute live revenue stats
  const stats = useMemo(() => {
    return calculateRevenueAnalytics(transactions, wallet, user);
  }, [transactions, wallet, user]);

  const aggReport = useMemo(() => {
    return aggregateUserTransactions({ transactions, user, wallet });
  }, [transactions, wallet, user]);

  // Selected period details
  const currentPeriodDetail = useMemo<PeriodDetail | null>(() => {
    if (!selectedPeriodKey) return null;
    return getPeriodDetail(selectedPeriodKey, transactions, wallet, user);
  }, [selectedPeriodKey, transactions, wallet, user]);

  const rawBal = Number(wallet?.balance ?? 0);
  const userBal = Number(user?.balance ?? 0);
  const netBal = Number(aggReport?.balance?.calculatedNet ?? 0);
  const currentBal = Number(aggReport?.balance?.current ?? 0);
  // Ensure valid funds from Real Deposit/Earning/Reward/Transaction are never shown as 0
  const balanceNumber = rawBal > 0 
    ? rawBal 
    : (userBal > 0 
      ? userBal 
      : (currentBal > 0 ? currentBal : (netBal > 0 ? netBal : 0)));
  const balance = balanceNumber.toFixed(2) + "৳";
  const toggleLanguage = () => setLanguage(isBn ? 'en' : 'bn');

  // Self-heal wallet state if calculated balance has real valid funds but wallet.balance was 0
  useEffect(() => {
    if (balanceNumber > 0 && Number(wallet?.balance ?? 0) === 0 && user?.id) {
      setWallet(prev => {
        const healed = {
          ...prev,
          balance: balanceNumber,
          updatedAt: new Date().toISOString()
        };
        safeSetItem('lg_wallet', JSON.stringify(healed));
        safeSetItem(`lg_wallet_${user.id}`, JSON.stringify(healed));
        fetch(`/api/wallet/${encodeURIComponent(user.id)}/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wallet: healed, phone: user.phone || '' })
        }).catch(() => {});
        return healed;
      });
    }
  }, [balanceNumber, wallet?.balance, user?.id]);

  if (!isRevenueOpen) return null;

  const menuItems = [
    { 
      key: 'today' as const, 
      title: isBn ? "আজকের আয়" : "Today's Income", 
      subtitle: isBn ? "আজকের সর্বমোট অর্জিত আয়" : "Total Earned Today",
      amount: stats.today,
      count: stats.todayCount,
      icon: Calendar,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    { 
      key: 'yesterday' as const, 
      title: isBn ? "গতকালের আয়" : "Yesterday's Income", 
      subtitle: isBn ? "গতকালের সর্বমোট আয়" : "Total Earned Yesterday",
      amount: stats.yesterday,
      count: stats.yesterdayCount,
      icon: Clock,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    { 
      key: 'week' as const, 
      title: isBn ? "গত ৭ দিনের আয়" : "Last 7 Days Income", 
      subtitle: isBn ? "গত ৭ দিনের মোট আয়" : "Total Earned in 7 Days",
      amount: stats.week,
      count: stats.weekCount,
      icon: TrendingUp,
      color: 'text-sky-600',
      bgColor: 'bg-sky-50'
    },
    { 
      key: 'month' as const, 
      title: isBn ? "গত ৩০ দিনের আয়" : "Last 30 Days Income", 
      subtitle: isBn ? "গত ৩০ দিনের মোট আয়" : "Total Earned in 30 Days",
      amount: stats.month,
      count: stats.monthCount,
      icon: BarChart3,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    },
    { 
      key: 'total' as const, 
      title: isBn ? "সর্বমোট আয়" : "Total Income", 
      subtitle: isBn ? "এখন পর্যন্ত সর্বমোট অর্জিত অর্থ" : "All-Time Total Earned",
      amount: stats.total,
      count: stats.totalCount,
      icon: Coins,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50'
    },
    { 
      key: 'withdrawn' as const, 
      title: isBn ? "মোট ইনকাম উইথড্র" : "Total Income Withdrawn", 
      subtitle: isBn ? "সর্বমোট উত্তোলিত অর্থ" : "Total Amount Withdrawn",
      amount: stats.withdrawn,
      count: stats.withdrawnCount,
      icon: ArrowUpRight,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50'
    }
  ];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-gray-100 p-0 animate-fade-in">
      <div className="bg-[#F5F6F8] w-full h-full flex flex-col shadow-none overflow-y-auto pb-24">
        
        {/* Topbar */}
        <div className="bg-[var(--primary)] px-4 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm text-white">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsRevenueOpen(false)}
              className="p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <h1 className="font-bold text-lg text-white">{isBn ? "রেভিনিউ এনালিটিক্স" : "Revenue Analytics"}</h1>
          </div>

          <div className="flex items-center gap-4">
            <button 
              type="button" 
              onClick={toggleLanguage}
              className="text-xs font-bold bg-white/20 px-2 py-1 rounded-md text-white cursor-pointer hover:bg-white/30 transition-colors"
            >
              {isBn ? "EN" : "বাংলা"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRevenueOpen(false);
                setWalletActiveTab('overview');
                setIsWalletOpen(true);
              }}
              className="p-1 hover:bg-white/10 rounded-full text-white cursor-pointer"
            >
              <History className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Balance Section */}
        <div className="bg-white p-6 flex flex-col items-center border-b border-gray-100 shadow-2xs">
          <div className="w-16 h-16 bg-sky-50 rounded-2xl flex items-center justify-center mb-3">
            <Wallet className="w-8 h-8 text-sky-600" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-0.5 tracking-tight">{balance}</h2>
          <p className="text-xs sm:text-sm font-bold text-gray-600">{isBn ? "বর্তমান মূল ব্যালান্স" : "Current Available Balance"}</p>
          
          <div className="flex items-center gap-1.5 mt-1 mb-5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <p className="text-[11px] text-gray-500 font-medium">{isBn ? "লাইভ অ্যাকাউন্ট ও ট্রানজেকশন সিঙ্ককৃত" : "Live Real-Time Account Synced"}</p>
          </div>

          {/* Main Action Buttons: Deposit and Withdraw only */}
          <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
            <button 
              type="button"
              onClick={() => {
                setIsRevenueOpen(false);
                setWalletActiveTab('deposit');
                setIsWalletOpen(true);
              }}
              className="py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowDownCircle className="w-4 h-4 shrink-0" />
              <span>{isBn ? "ডিপোজিট (+)" : "Deposit (+)"}</span>
            </button>
            <button 
              type="button"
              onClick={() => {
                setIsRevenueOpen(false);
                setWalletActiveTab('withdraw');
                setIsWalletOpen(true);
              }}
              className="py-3 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4 shrink-0" />
              <span>{isBn ? "উইথড্র (-)" : "Withdraw (-)"}</span>
            </button>
          </div>
        </div>

        {/* Income List Header */}
        <div className="px-4 pt-5 pb-1 max-w-lg mx-auto w-full">
          <h3 className="font-black text-gray-900 text-sm sm:text-base">
            {isBn ? "আয়ের দৈনিক ও সাময়িক রিপোর্ট" : "Income & Revenue Reports"}
          </h3>
          <p className="text-[11px] text-gray-500 font-medium">
            {isBn ? "টাকার অংকসহ বিস্তারিত দেখতে ট্যাপ করুন" : "Tap any item to see transaction breakdown"}
          </p>
        </div>

        {/* Income List */}
        <div className="p-4 space-y-2.5 flex-1 max-w-lg mx-auto w-full">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <div 
                key={item.key} 
                className="bg-white p-3.5 rounded-2xl flex items-center justify-between shadow-2xs border border-gray-100 cursor-pointer hover:border-sky-300 hover:shadow-xs transition-all active:scale-[0.99] group"
                onClick={() => {
                  setSelectedPeriodKey(item.key);
                }}
              >
                {/* Left */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-11 h-11 ${item.bgColor} rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs`}>
                    <Icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div className="min-w-0">
                    <span className="font-extrabold text-xs sm:text-sm text-gray-950 group-hover:text-sky-600 transition-colors block">
                      {item.title}
                    </span>
                    <span className="text-[10.5px] text-gray-400 font-medium truncate block mt-0.5">
                      {item.subtitle}
                    </span>
                  </div>
                </div>

                {/* Right: LIVE AMOUNT */}
                <div className="flex items-center gap-2.5 text-right shrink-0">
                  <div>
                    <span className={`block font-black text-sm sm:text-base font-mono tracking-tight ${
                      item.key === 'withdrawn' ? 'text-rose-600' : 'text-emerald-700'
                    }`}>
                      ৳{item.amount.toFixed(2)}
                    </span>
                    <span className="block text-[9.5px] font-bold text-gray-400">
                      {item.count > 0 
                        ? (isBn ? `${item.count}টি রেকর্ড` : `${item.count} records`) 
                        : (isBn ? '০ লেনদেন' : '0 tx')}
                    </span>
                  </div>

                  <div className="w-7 h-7 rounded-full bg-gray-50 group-hover:bg-sky-50 flex items-center justify-center transition-colors">
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* PERIOD DETAIL BREAKDOWN MODAL */}
        {currentPeriodDetail && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-scale-up border border-gray-100 flex flex-col max-h-[90vh]">
              
              {/* Header */}
              <div className="bg-gradient-to-r from-sky-600 to-indigo-600 p-4 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm sm:text-base leading-tight">
                      {isBn ? currentPeriodDetail.titleBn : currentPeriodDetail.titleEn}
                    </h3>
                    <p className="text-[10px] text-sky-100">
                      {isBn ? currentPeriodDetail.subtitleBn : currentPeriodDetail.subtitleEn}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedPeriodKey(null)}
                  className="p-1.5 bg-white/20 hover:bg-white/30 rounded-full text-white cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Total Card */}
              <div className="p-4 bg-gray-50 border-b border-gray-100">
                <div className="bg-white border border-gray-200/90 rounded-2xl p-3.5 flex items-center justify-between shadow-2xs">
                  <div>
                    <span className="text-[10.5px] font-bold text-gray-500 block">
                      {isBn ? 'এই সময়ের মোট অর্জিত অর্থ' : 'Total Amount for this Period'}
                    </span>
                    <div className={`text-2xl font-black font-mono tracking-tight mt-0.5 ${
                      currentPeriodDetail.key === 'withdrawn' ? 'text-rose-600' : 'text-emerald-600'
                    }`}>
                      ৳{currentPeriodDetail.amount.toFixed(2)}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold text-gray-400 block">{isBn ? 'মোট লেনদেন' : 'Transactions'}</span>
                    <span className="inline-block text-xs font-black bg-sky-100 text-sky-800 px-2 py-0.5 rounded-md mt-0.5">
                      {currentPeriodDetail.count} {isBn ? 'টি' : 'items'}
                    </span>
                  </div>
                </div>

                {/* Source Breakdown */}
                {currentPeriodDetail.key !== 'withdrawn' && (
                  <div className="grid grid-cols-2 gap-2 mt-2.5">
                    <div className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-2xs">
                      <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-gray-500">
                        <Briefcase className="w-3.5 h-3.5 text-sky-600" />
                        <span>{isBn ? 'মাইক্রো জব' : 'Micro Jobs'}</span>
                      </div>
                      <span className="text-xs font-black text-gray-900 font-mono mt-0.5 block">
                        ৳{currentPeriodDetail.breakdown.jobs.toFixed(2)}
                      </span>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-2xs">
                      <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-gray-500">
                        <Users className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{isBn ? 'রেফারেল বোনাস' : 'Referrals'}</span>
                      </div>
                      <span className="text-xs font-black text-gray-900 font-mono mt-0.5 block">
                        ৳{currentPeriodDetail.breakdown.referrals.toFixed(2)}
                      </span>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-2xs">
                      <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-gray-500">
                        <Award className="w-3.5 h-3.5 text-amber-600" />
                        <span>{isBn ? 'ডেইলি/সাইন-আপ' : 'Rewards'}</span>
                      </div>
                      <span className="text-xs font-black text-gray-900 font-mono mt-0.5 block">
                        ৳{currentPeriodDetail.breakdown.bonuses.toFixed(2)}
                      </span>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-2xs">
                      <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-gray-500">
                        <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{isBn ? 'রিসেলিং ও অন্য' : 'Reselling'}</span>
                      </div>
                      <span className="text-xs font-black text-gray-900 font-mono mt-0.5 block">
                        ৳{(currentPeriodDetail.breakdown.reselling + currentPeriodDetail.breakdown.other).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Transactions list */}
              <div className="p-4 flex-1 overflow-y-auto space-y-2">
                <span className="text-xs font-black text-gray-900 block mb-1">
                  {isBn ? 'লেনদেনসমূহের তালিকা' : 'Transaction History'}
                </span>

                {currentPeriodDetail.transactions.length === 0 ? (
                  <div className="text-center py-8 px-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-2 text-sky-600">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                      {isBn ? 'এই সময়ে এখনো কোনো লেনদেন পাওয়া যায়নি' : 'No transactions recorded for this period yet'}
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-1 max-w-xs mx-auto">
                      {isBn ? 'মাইক্রো জব সম্পন্ন করুন বা ব্যালেন্স টেস্ট বাটন দিয়ে ট্রানজেকশন তৈরি করুন!' : 'Complete jobs or use test actions!'}
                    </p>
                    <div className="flex justify-center gap-2 mt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPeriodKey(null);
                          setIsRevenueOpen(false);
                          setActiveTab('jobs');
                        }}
                        className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-black text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <Briefcase className="w-3.5 h-3.5" />
                        <span>{isBn ? 'টাস্ক খুঁজুন' : 'Find Tasks'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  currentPeriodDetail.transactions.map((tx, txIdx) => (
                    <div 
                      key={tx.id ? `${tx.id}-${txIdx}` : `tx-rev-${txIdx}`} 
                      className="p-3 bg-white border border-gray-200/80 rounded-2xl flex items-center justify-between gap-3 shadow-2xs hover:border-sky-300 transition-colors"
                    >
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-gray-950 block truncate">
                          {tx.description || (isBn ? 'আয় রিওয়ার্ড' : 'Reward Income')}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-0.5">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span>{tx.date || (isBn ? 'আজ' : 'Today')}</span>
                          <span>•</span>
                          <span className="capitalize text-emerald-600 font-bold">{tx.status || 'completed'}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`text-xs sm:text-sm font-black font-mono ${
                          tx.type === 'withdrawal' || (tx.type === 'adjustment' && tx.description?.includes('ডেবিট')) ? 'text-rose-600' : 'text-emerald-700'
                        }`}>
                          {tx.type === 'withdrawal' || (tx.type === 'adjustment' && tx.description?.includes('ডেবিট')) ? '-' : '+'}৳{Number(tx.amount || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Close Button */}
              <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                <button
                  type="button"
                  onClick={() => setSelectedPeriodKey(null)}
                  className="w-full py-2.5 bg-gray-950 hover:bg-gray-800 text-white font-black text-xs rounded-xl shadow-xs cursor-pointer active:scale-95 transition-all"
                >
                  {isBn ? 'বন্ধ করুন' : 'Close'}
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default RevenueAnalyticsModal;
