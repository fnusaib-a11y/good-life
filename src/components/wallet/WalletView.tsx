import React, { useState, useMemo } from 'react';
import { 
  Wallet, 
  Menu, 
  History, 
  ChevronRight, 
  ArrowUpRight, 
  ArrowDownCircle,
  Calendar,
  Clock,
  TrendingUp,
  BarChart3,
  Coins,
  Gift,
  X,
  CheckCircle2,
  Tag,
  Briefcase,
  Users,
  Award,
  ShoppingBag,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { 
  calculateRevenueAnalytics, 
  getPeriodDetail, 
  PeriodDetail 
} from '../../lib/revenueAnalytics';
import TransactionItem from './TransactionItem';

const WalletView: React.FC = () => {
  const { 
    wallet, 
    transactions,
    depositRequests,
    user,
    setIsWithdrawOpen, 
    setIsWalletOpen, 
    setWalletActiveTab, 
    setIsSideDrawerOpen, 
    isBn,
    addEarning,
    adminAdjustUserBalance,
    showToast,
    setActiveTab,
    setIsVerificationModalOpen
  } = useApp();

  const [selectedPeriodKey, setSelectedPeriodKey] = useState<'today' | 'yesterday' | 'week' | 'month' | 'total' | 'withdrawn' | null>(null);

  const balanceNumber = Number(wallet?.balance ?? 0);

  const myDepositRequests = useMemo(() => {
    return (depositRequests || []).filter(d => d.userId === user?.id || (user?.phone && d.userPhone === user?.phone));
  }, [depositRequests, user?.id, user?.phone]);

  // Compute live revenue stats
  const stats = useMemo(() => {
    return calculateRevenueAnalytics(transactions, wallet, user);
  }, [transactions, wallet, user]);

  const balance = (wallet?.balance ?? 0).toFixed(2) + "৳";

  // Selected period details
  const currentPeriodDetail = useMemo<PeriodDetail | null>(() => {
    if (!selectedPeriodKey) return null;
    return getPeriodDetail(selectedPeriodKey, transactions, wallet, user);
  }, [selectedPeriodKey, transactions, wallet, user]);

  const menuItems = [
    { 
      key: 'today' as const, 
      title: isBn ? "আজকের আয়" : "Today's Income", 
      subtitle: isBn ? "আজকের সর্বমোট অর্জিত আয়" : "Total Earned Today",
      amount: stats.today,
      count: stats.todayCount,
      icon: Calendar,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200'
    },
    { 
      key: 'yesterday' as const, 
      title: isBn ? "গতকালের আয়" : "Yesterday's Income", 
      subtitle: isBn ? "গতকালের সর্বমোট আয়" : "Total Earned Yesterday",
      amount: stats.yesterday,
      count: stats.yesterdayCount,
      icon: Clock,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      badgeColor: 'text-indigo-700 bg-indigo-50 border-indigo-200'
    },
    { 
      key: 'week' as const, 
      title: isBn ? "গত ৭ দিনের আয়" : "Last 7 Days Income", 
      subtitle: isBn ? "গত ৭ দিনের মোট আয়" : "Total Earned in 7 Days",
      amount: stats.week,
      count: stats.weekCount,
      icon: TrendingUp,
      color: 'text-sky-600',
      bgColor: 'bg-sky-50',
      badgeColor: 'text-sky-700 bg-sky-50 border-sky-200'
    },
    { 
      key: 'month' as const, 
      title: isBn ? "গত ৩০ দিনের আয়" : "Last 30 Days Income", 
      subtitle: isBn ? "গত ৩০ দিনের মোট আয়" : "Total Earned in 30 Days",
      amount: stats.month,
      count: stats.monthCount,
      icon: BarChart3,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      badgeColor: 'text-amber-700 bg-amber-50 border-amber-200'
    },
    { 
      key: 'total' as const, 
      title: isBn ? "সর্বমোট আয়" : "Total Income", 
      subtitle: isBn ? "এখন পর্যন্ত সর্বমোট অর্জিত অর্থ" : "All-Time Total Earned",
      amount: stats.total,
      count: stats.totalCount,
      icon: Coins,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      badgeColor: 'text-teal-700 bg-teal-50 border-teal-200'
    },
    { 
      key: 'withdrawn' as const, 
      title: isBn ? "মোট ইনকাম উইথড্র" : "Total Income Withdrawn", 
      subtitle: isBn ? "সর্বমোট উত্তোলিত অর্থ" : "Total Amount Withdrawn",
      amount: stats.withdrawn,
      count: stats.withdrawnCount,
      icon: ArrowUpRight,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      badgeColor: 'text-rose-700 bg-rose-50 border-rose-200'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F5F6F8] pb-24">
      {/* Top Bar */}
      <div className="bg-[var(--primary)] px-4 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm text-white">
        <Menu className="w-6 h-6 text-white cursor-pointer" onClick={() => setIsSideDrawerOpen(true)} />
        <h1 className="font-bold text-lg text-white">{isBn ? "ওয়ালেট ও রেভিনিউ" : "Wallet & Revenue"}</h1>
        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={() => {
              setWalletActiveTab('overview');
              setIsWalletOpen(true);
            }}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            title={isBn ? "লেনদেন বিবরণী" : "Transaction History"}
          >
            <History className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Wallet Balance Section */}
      <div className="flex flex-col items-center py-7 bg-white border-b border-gray-100 shadow-2xs">
        <div className="w-16 h-16 bg-sky-50 rounded-2xl flex items-center justify-center mb-3 shadow-inner">
          <Wallet className="w-9 h-9 text-sky-600" />
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-gray-950 mb-0.5 tracking-tight">{balance}</h2>
        <p className="text-xs sm:text-sm font-bold text-gray-600">{isBn ? "বর্তমান মোট ব্যালান্স" : "Current Available Balance"}</p>
        <div className="flex items-center gap-1.5 mt-1 mb-5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <p className="text-[11px] text-gray-400 font-medium">{isBn ? "লাইভ অ্যাকাউন্ট থেকে সিঙ্ককৃত" : "Live Account Synced"}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-3 w-full px-5 max-w-md">
          <button 
            type="button"
            onClick={() => {
              setWalletActiveTab('deposit');
              setIsWalletOpen(true);
            }}
            className="py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-2xl font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowDownCircle className="w-4 h-4 text-white" />
            <span>{isBn ? "ডিপোজিট (+)" : "Deposit (+)"}</span>
          </button>
          <button 
            type="button"
            onClick={() => {
              setWalletActiveTab('withdraw');
              setIsWalletOpen(true);
            }}
            className="py-3 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-2xl font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4 text-white" />
            <span>{isBn ? "উত্তোলন (-)" : "Withdraw (-)"}</span>
          </button>
        </div>
      </div>

      {/* User Deposit Requests Tracking (Always answers 'Where is the money user sent?') */}
      {myDepositRequests.length > 0 && (
        <div className="px-4 pt-4 max-w-lg mx-auto">
          <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <ArrowDownCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-black text-xs sm:text-sm text-gray-900">
                    {isBn ? 'আপনার ডিপোজিট আবেদন ও ট্র্যাকিং' : 'Your Deposit Tracking'}
                  </h4>
                  <p className="text-[10px] text-gray-500">
                    {isBn ? 'প্রেরিত টাকা ও এডমিন অনুমোদনের লাইভ অবস্থা' : 'Live status of submitted deposits'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setWalletActiveTab('deposit');
                  setIsWalletOpen(true);
                }}
                className="text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                {isBn ? '+ নতুন ডিপোজিট' : '+ New Deposit'}
              </button>
            </div>

            <div className="space-y-2">
              {myDepositRequests.slice(0, 3).map((req, rIdx) => (
                <div key={req.id ? `${req.id}-${rIdx}` : `dep-${rIdx}`} className="p-3 bg-gray-50/90 rounded-xl border border-gray-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-gray-900 font-mono">৳{req.amount.toFixed(2)}</span>
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-gray-200 rounded text-gray-700">{req.paymentMethod}</span>
                      <span className="text-[10px] text-gray-500 font-mono">TrxID: {req.trxId}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 font-medium">{req.date}</p>
                  </div>
                  <div>
                    {req.status === 'pending' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-700 bg-amber-100/80 border border-amber-200 px-2.5 py-1 rounded-full animate-pulse">
                        <Clock className="w-3 h-3" />
                        <span>{isBn ? 'অপেক্ষমান (এডমিন যাচাই করছে)' : 'Pending Review'}</span>
                      </span>
                    )}
                    {req.status === 'approved' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-100/80 border border-emerald-200 px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{isBn ? 'অনুমোদিত ও ব্যালেন্সে যুক্ত' : 'Approved'}</span>
                      </span>
                    )}
                    {req.status === 'rejected' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-rose-700 bg-rose-100/80 border border-rose-200 px-2.5 py-1 rounded-full" title={req.rejectionReason}>
                        <X className="w-3 h-3" />
                        <span>{isBn ? 'বাতিল' : 'Rejected'}</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Income Analytics List Header */}
      <div className="px-4 pt-5 pb-2 flex items-center justify-between">
        <div>
          <h3 className="font-black text-gray-900 text-sm sm:text-base">{isBn ? "আয়ের দৈনিক ও সাময়িক রিপোর্ট" : "Income & Revenue Reports"}</h3>
          <p className="text-[11px] text-gray-500 font-medium">{isBn ? "বিস্তারিত দেখতে যেকোনো রিপোর্টে ট্যাপ করুন" : "Tap on any period to view transaction details"}</p>
        </div>
      </div>

      {/* List Items with Live Earned Amounts */}
      <div className="px-4 space-y-2.5 max-w-lg mx-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <div 
              key={item.key} 
              onClick={() => {
                setSelectedPeriodKey(item.key);
              }}
              className="bg-white p-3.5 rounded-2xl flex items-center justify-between shadow-2xs border border-gray-100/90 cursor-pointer hover:border-sky-300 hover:shadow-xs transition-all active:scale-[0.99] group"
            >
              {/* Left Side: Icon & Titles */}
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-11 h-11 ${item.bgColor} rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs`}>
                  <Icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-gray-950 text-xs sm:text-sm leading-tight group-hover:text-sky-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[10.5px] text-gray-400 font-medium truncate mt-0.5">
                    {item.subtitle}
                  </p>
                </div>
              </div>

              {/* Right Side: LIVE EARNED AMOUNT + Chevron */}
              <div className="flex items-center gap-2.5 text-right shrink-0">
                <div>
                  <span className={`block font-black text-sm sm:text-base font-mono tracking-tight ${
                    item.key === 'withdrawn' ? 'text-rose-600' : 'text-emerald-700'
                  }`}>
                    ৳{item.amount.toFixed(2)}
                  </span>
                  <span className="block text-[9.5px] font-bold text-gray-400">
                    {item.count > 0 
                      ? (isBn ? `${item.count}টি আয় রেকর্ড` : `${item.count} records`) 
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

      {/* Latest Transactions Log */}
      <div className="px-4 pt-8 pb-2">
        <h3 className="font-black text-gray-900 text-sm sm:text-base">{isBn ? "সর্বশেষ লেনদেন" : "Latest Transactions"}</h3>
      </div>
      <div className="px-4 space-y-2.5 max-w-lg mx-auto pb-8">
        {transactions.slice(0, 5).map((tx, txIdx) => (
          <TransactionItem key={tx.id ? `${tx.id}-${txIdx}` : `tx-${txIdx}`} tx={tx} isBn={isBn} />
        ))}
        {transactions.length === 0 && (
          <p className="text-center text-xs text-gray-500 py-4">{isBn ? "কোনো লেনদেন পাওয়া যায়নি" : "No transactions found"}</p>
        )}
      </div>

      {/* PERIOD DETAIL BREAKDOWN MODAL */}
      {currentPeriodDetail && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-scale-up border border-gray-100 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
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

            {/* Total Highlight Card */}
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

              {/* Source Breakdown (Jobs, Referrals, Bonus, etc.) */}
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

            {/* Transaction List */}
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
                    {isBn ? 'এই সময়ে এখনো কোনো আয় যুক্ত হয়নি' : 'No earnings recorded for this period yet'}
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-1 max-w-xs mx-auto">
                    {isBn ? 'মাইক্রো জব সম্পন্ন করুন অথবা বন্ধুদের রেফার করে আজই আয় শুরু করুন!' : 'Complete micro jobs or refer friends to earn daily rewards!'}
                  </p>
                  <div className="flex justify-center gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPeriodKey(null);
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
                  <TransactionItem key={tx.id ? `${tx.id}-${txIdx}` : `tx-p-${txIdx}`} tx={tx} isBn={isBn} />
                ))
              )}
            </div>

            {/* Modal Footer */}
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
  );
};

export default WalletView;
