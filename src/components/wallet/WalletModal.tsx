import React, { useState, useEffect } from 'react';
import { 
  X, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle2, 
  History, 
  AlertCircle, 
  Copy, 
  Check, 
  ShieldCheck, 
  FileText,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Send,
  Loader2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const WalletModal: React.FC = () => {
  const { 
    isWalletOpen, 
    setIsWalletOpen, 
    wallet, 
    transactions, 
    depositMoney, 
    addFundsToWallet,
    withdrawMoney, 
    systemSettings,
    showToast,
    isBn,
    walletActiveTab,
    setWalletActiveTab,
    depositRequests,
    user
  } = useApp();

  const [method, setMethod] = useState<'bkash' | 'nagad' | 'rocket' | 'upay'>('bkash');
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [trxId, setTrxId] = useState('');
  const [copiedNumber, setCopiedNumber] = useState(false);
  
  // Inline feedback states
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [depositSuccessData, setDepositSuccessData] = useState<{
    amount: number;
    method: string;
    trxId: string;
    account: string;
  } | null>(null);

  const [withdrawSuccessData, setWithdrawSuccessData] = useState<{
    amount: number;
    fee: number;
    netAmount: number;
    method: string;
    account: string;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-fill account number if empty and user has a phone
  useEffect(() => {
    if (user?.phone && !accountNumber) {
      setAccountNumber(user.phone);
    }
  }, [user?.phone, isWalletOpen]);

  // Clear errors and success states when switching tabs
  useEffect(() => {
    setErrorMsg(null);
  }, [walletActiveTab]);

  if (!isWalletOpen) return null;

  // Dynamic system settings
  const minDeposit = systemSettings.minDepositAmount || 10;
  const maxDeposit = systemSettings.maxDepositAmount || 25000;
  const minWithdraw = systemSettings.minWithdrawalAmount || 50;
  const maxDailyWithdraw = systemSettings.maxDailyWithdrawalAmount || 10000;
  const processingTime = systemSettings.withdrawalProcessingTime || (isBn ? '৩০ মিনিট থেকে ২ ঘণ্টা' : '30 mins to 2 hours');

  const depositNumbers = {
    bkash: systemSettings.depositPaymentNumbers?.bkash || '01877722819',
    nagad: systemSettings.depositPaymentNumbers?.nagad || '01877722819',
    rocket: systemSettings.depositPaymentNumbers?.rocket || '01877722819',
    upay: systemSettings.depositPaymentNumbers?.upay || '01877722819'
  };

  const selectedDepositNumber = depositNumbers[method] || depositNumbers.bkash;

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(selectedDepositNumber).catch(() => {});
    setCopiedNumber(true);
    showToast(isBn ? `নম্বর (${selectedDepositNumber}) কপি হয়েছে!` : `Number (${selectedDepositNumber}) copied!`);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const numAmt = Number(amount);

    if (!numAmt || isNaN(numAmt)) {
      setErrorMsg(isBn ? 'অনুগ্রহ করে সঠিক টাকার অংক লিখুন।' : 'Please enter a valid amount.');
      return;
    }
    if (numAmt < minDeposit) {
      setErrorMsg(isBn ? `সর্বনিম্ন ডিপোজিট ৳${minDeposit}!` : `Minimum deposit is ৳${minDeposit}!`);
      return;
    }
    if (numAmt > maxDeposit) {
      setErrorMsg(isBn ? `সর্বোচ্চ ডিপোজিট সীমা ৳${maxDeposit}!` : `Maximum deposit limit is ৳${maxDeposit}!`);
      return;
    }
    if (!accountNumber || accountNumber.trim().length < 11) {
      setErrorMsg(isBn ? 'অনুগ্রহ করে প্রেরকের সঠিক ১১-ডিজিট মোবাইল নম্বর দিন!' : 'Please enter valid 11-digit sender mobile number!');
      return;
    }
    if (!trxId || trxId.trim().length < 4) {
      setErrorMsg(isBn ? 'অনুগ্রহ করে সঠিক ট্রানজেকশন আইডি (TrxID) লিখুন!' : 'Please enter valid Transaction ID (TrxID)!');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await depositMoney(numAmt, method, trxId.trim(), accountNumber.trim());
      if (res && res.success) {
        const dep = res.deposit;
        setDepositSuccessData({
          amount: dep?.amount || numAmt,
          method: (dep?.paymentMethod || method).toUpperCase(),
          trxId: (dep?.trxId || trxId.trim()).toUpperCase(),
          account: dep?.senderPhone || accountNumber.trim()
        });

        setAmount('');
        setTrxId('');
      } else {
        const failureMsg = res?.message || (isBn ? 'ডিপোজিট আবেদন জমা হতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।' : 'Deposit submission failed. Please try again.');
        setErrorMsg(failureMsg);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || (isBn ? 'ডিপোজিট আবেদন প্রক্রিয়ায় ত্রুটি ঘটেছে।' : 'Error processing deposit request.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const numAmt = Number(amount);

    if (!numAmt || isNaN(numAmt)) {
      setErrorMsg(isBn ? 'অনুগ্রহ করে উত্তোলনের সঠিক টাকার পরিমাণ লিখুন।' : 'Please enter a valid withdrawal amount.');
      return;
    }
    if (numAmt < minWithdraw) {
      setErrorMsg(isBn ? `সর্বনিম্ন উত্তোলন ৳${minWithdraw}!` : `Minimum withdrawal amount is ৳${minWithdraw}!`);
      return;
    }
    if (numAmt > maxDailyWithdraw) {
      setErrorMsg(isBn ? `দৈনিক সর্বোচ্চ উত্তোলন সীমা ৳${maxDailyWithdraw}!` : `Maximum daily limit is ৳${maxDailyWithdraw}!`);
      return;
    }
    if (numAmt > (wallet?.balance ?? 0)) {
      setErrorMsg(isBn ? `পর্যাপ্ত ব্যালেন্স নেই! আপনার বর্তমান ব্যালেন্স ৳${(wallet?.balance ?? 0).toFixed(2)}` : `Insufficient balance! Your current balance is ৳${(wallet?.balance ?? 0).toFixed(2)}`);
      return;
    }
    if (!accountNumber || accountNumber.trim().length < 11) {
      setErrorMsg(isBn ? 'সঠিক ১১-ডিজিট মোবাইল ব্যাংকিং নম্বর দিন!' : 'Please enter valid 11-digit mobile account number!');
      return;
    }

    const fee = Math.max(5, Math.round(numAmt * 0.015));
    const netAmount = numAmt - fee;

    const success = withdrawMoney(numAmt, method, accountNumber.trim());
    if (success) {
      setWithdrawSuccessData({
        amount: numAmt,
        fee,
        netAmount,
        method: method.toUpperCase(),
        account: accountNumber.trim()
      });
      setAmount('');
    }
  };

  // Safe active tab resolution
  const activeTabKey = (walletActiveTab === 'deposit' || walletActiveTab === 'withdraw') ? walletActiveTab : 'overview';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-scale-up border border-gray-100">
        
        {/* Header */}
        <div className="bg-[var(--primary)] px-4 py-3.5 flex items-center justify-between text-white sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">
                {isBn ? 'ওয়ালেট ও লেনদেন' : 'Wallet & Transactions'}
              </h3>
              <p className="text-[10px] text-sky-100 font-medium">
                {isBn ? 'ডিপোজিট, উইথড্র ও অ্যাকাউন্ট বিবরণী' : 'Deposit, Withdraw & Balance'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsWalletOpen(false)}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex p-2 bg-gray-50 border-b border-gray-100 text-xs font-bold gap-1.5">
          <button
            type="button"
            onClick={() => {
              setDepositSuccessData(null);
              setWithdrawSuccessData(null);
              setWalletActiveTab('overview');
            }}
            className={`flex-1 py-2.5 rounded-xl transition-all font-black text-center cursor-pointer ${
              activeTabKey === 'overview' ? 'bg-sky-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900 bg-white border border-gray-200/80'
            }`}
          >
            {isBn ? 'সারসংক্ষেপ' : 'Overview'}
          </button>
          <button
            type="button"
            onClick={() => {
              setDepositSuccessData(null);
              setWithdrawSuccessData(null);
              setWalletActiveTab('deposit');
            }}
            className={`flex-1 py-2.5 rounded-xl transition-all font-black text-center cursor-pointer flex items-center justify-center gap-1 ${
              activeTabKey === 'deposit' ? 'bg-emerald-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900 bg-white border border-gray-200/80'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>{isBn ? '+ ডিপোজিট' : '+ Deposit'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setDepositSuccessData(null);
              setWithdrawSuccessData(null);
              setWalletActiveTab('withdraw');
            }}
            className={`flex-1 py-2.5 rounded-xl transition-all font-black text-center cursor-pointer flex items-center justify-center gap-1 ${
              activeTabKey === 'withdraw' ? 'bg-sky-500 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900 bg-white border border-gray-200/80'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{isBn ? 'উইথড্র' : 'Withdraw'}</span>
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">

          {/* OVERVIEW / HISTORY TAB */}
          {activeTabKey === 'overview' && (
            <>
              {/* Balance Card */}
              <div className="bg-gradient-to-br from-sky-600 via-sky-500 to-indigo-600 rounded-3xl p-4 sm:p-5 text-white shadow-sm border border-sky-400 space-y-3.5">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-sky-100">
                      {isBn ? 'বর্তমান ব্যবহারযোগ্য ব্যালেন্স' : 'Available Wallet Balance'}
                    </span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-black tracking-tight text-white mt-1 font-mono">
                    ৳{(wallet?.balance ?? 0).toFixed(2)}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/20 text-center">
                  <div className="bg-white/15 backdrop-blur-2xs p-2 rounded-xl">
                    <span className="text-[9.5px] font-bold text-sky-100 block">{isBn ? 'পেন্ডিং আয়' : 'Pending'}</span>
                    <span className="text-xs font-black text-white font-mono">৳{(wallet?.pendingBalance ?? 0).toFixed(2)}</span>
                  </div>
                  <div className="bg-white/15 backdrop-blur-2xs p-2 rounded-xl">
                    <span className="text-[9.5px] font-bold text-sky-100 block">{isBn ? 'মোট উপার্জিত' : 'Earned'}</span>
                    <span className="text-xs font-black text-white font-mono">৳{(wallet?.totalEarned ?? 0).toFixed(2)}</span>
                  </div>
                  <div className="bg-white/15 backdrop-blur-2xs p-2 rounded-xl">
                    <span className="text-[9.5px] font-bold text-sky-100 block">{isBn ? 'মোট উত্তোলিত' : 'Withdrawn'}</span>
                    <span className="text-xs font-black text-white font-mono">৳{(wallet?.totalWithdrawn ?? 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setWalletActiveTab('deposit')}
                  className="p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-2xl flex items-center justify-center gap-2 text-emerald-900 font-extrabold text-xs active:scale-95 transition-all cursor-pointer shadow-2xs"
                >
                  <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                  <span>{isBn ? 'টাকা ডিপোজিট করুন' : 'Deposit Money'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setWalletActiveTab('withdraw')}
                  className="p-3 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-2xl flex items-center justify-center gap-2 text-sky-900 font-extrabold text-xs active:scale-95 transition-all cursor-pointer shadow-2xs"
                >
                  <ArrowUpRight className="w-4 h-4 text-sky-600" />
                  <span>{isBn ? 'টাকা উত্তোলন করুন' : 'Withdraw Money'}</span>
                </button>
              </div>

              {/* Transactions History */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-2.5">
                  <h4 className="text-xs font-black text-gray-900 flex items-center gap-1.5">
                    <History className="w-4 h-4 text-sky-600" />
                    <span>{isBn ? 'লেনদেন হিস্টোরি' : 'Transaction History'}</span>
                  </h4>
                  <span className="text-[10px] text-gray-400 font-bold bg-gray-100 px-2 py-0.5 rounded-full">
                    {transactions.length} {isBn ? 'রেকর্ড' : 'records'}
                  </span>
                </div>

                <div className="space-y-2">
                  {transactions.length === 0 ? (
                    <div className="py-8 text-center text-gray-400 text-xs bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                      {isBn ? 'এখনো কোনো লেনদেন রেকর্ড পাওয়া যায়নি।' : 'No transactions recorded yet.'}
                    </div>
                  ) : (
                    transactions.map((t, tIdx) => {
                      const isIncome = ['deposit', 'job_reward', 'referral_bonus', 'reselling_profit', 'bonus', 'order_cashback', 'adjustment', 'refund', 'earning', 'cashback'].includes(t.type as string);
                      return (
                        <div
                          key={t.id ? `${t.id}-${tIdx}` : `tx-${tIdx}`}
                          className="p-3 bg-gray-50 hover:bg-gray-100/80 rounded-2xl border border-gray-100 flex items-center justify-between shadow-2xs transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                              isIncome
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-rose-100 text-rose-700'
                            }`}>
                              {isIncome ? (
                                <ArrowDownLeft className="w-4 h-4" />
                              ) : (
                                <ArrowUpRight className="w-4 h-4" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-gray-900 truncate">{t.description}</div>
                              <div className="text-[10px] text-gray-400 mt-0.5">{t.date}</div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className={`text-xs font-black font-mono block ${
                              isIncome
                                ? 'text-emerald-700'
                                : 'text-rose-600'
                            }`}>
                              {isIncome ? '+' : '-'}৳{(t?.amount ?? 0).toFixed(2)}
                            </span>
                            <span className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded mt-0.5 ${
                              t.status === 'completed' ? 'text-emerald-700 bg-emerald-50' : t.status === 'rejected' ? 'text-rose-700 bg-rose-50' : 'text-amber-700 bg-amber-50'
                            }`}>
                              {t.status === 'completed' ? (isBn ? 'অনুমোদিত' : 'Approved') : t.status === 'rejected' ? (isBn ? 'বাতিল' : 'Rejected') : (isBn ? 'পেন্ডিং' : 'Pending')}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          )}

          {/* DEPOSIT TAB */}
          {activeTabKey === 'deposit' && (
            <div>
              {depositSuccessData ? (
                /* IN-MODAL SUCCESS RECEIPT */
                <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 text-center space-y-4 animate-scale-up">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-xs">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-black text-emerald-950 text-base sm:text-lg">
                      {isBn ? 'ডিপোজিট আবেদন জমা হয়েছে!' : 'Deposit Request Submitted!'}
                    </h4>
                    <p className="text-xs text-emerald-800 font-medium mt-1">
                      {isBn ? 'আপনার পেমেন্ট তথ্য সফলভাবে এডমিন যাচাইয়ের জন্য প্রেরণ করা হয়েছে।' : 'Your payment info has been sent for admin verification.'}
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl p-3.5 border border-emerald-200 text-xs space-y-2 text-left shadow-2xs font-bold text-gray-800">
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-normal">{isBn ? 'ডিপোজিট পরিমাণ:' : 'Amount:'}</span>
                      <span className="text-emerald-700 font-black font-mono">৳{depositSuccessData.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-normal">{isBn ? 'পেমেন্ট মেথড:' : 'Method:'}</span>
                      <span className="text-gray-900">{depositSuccessData.method}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-normal">{isBn ? 'প্রেরক নম্বর:' : 'Sender Phone:'}</span>
                      <span className="text-gray-900 font-mono">{depositSuccessData.account}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-normal">{isBn ? 'ট্রানজেকশন আইডি (TrxID):' : 'TrxID:'}</span>
                      <span className="text-sky-700 font-black font-mono">{depositSuccessData.trxId}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-100 pt-2">
                      <span className="text-gray-500 font-normal">{isBn ? 'স্ট্যাটাস:' : 'Status:'}</span>
                      <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md text-[11px] font-black">
                        {isBn ? 'পেন্ডিং (এডমিন পর্যালোচনা)' : 'Pending Review'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setDepositSuccessData(null);
                        setWalletActiveTab('overview');
                      }}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-md cursor-pointer transition-all active:scale-95"
                    >
                      {isBn ? 'ঠিক আছে (ওয়ালেট দেখুন)' : 'Done (View Wallet)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDepositSuccessData(null)}
                      className="w-full py-2.5 bg-white hover:bg-emerald-100/50 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-300 cursor-pointer"
                    >
                      {isBn ? 'আরেকটি ডিপোজিট করুন' : 'Submit Another Deposit'}
                    </button>
                  </div>
                </div>
              ) : (
                /* DEPOSIT FORM */
                <form onSubmit={handleDeposit} className="space-y-4">
                  {/* Official Payment Number Box */}
                  <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200 text-xs sm:text-sm text-gray-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-black text-sky-950 text-xs sm:text-sm">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{isBn ? 'অফিশিয়াল পার্সোনাল নম্বর (Send Money):' : 'Official Personal Send Money No:'}</span>
                      </div>
                      <span className="text-xs bg-sky-200/90 text-sky-950 px-2.5 py-1 rounded-lg font-black uppercase">
                        {method}
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded-xl font-bold flex justify-between items-center border border-sky-200 shadow-2xs">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-gray-500 block uppercase font-extrabold">
                          {method === 'bkash' ? (isBn ? 'বিকাশ পার্সোনাল' : 'bKash Personal') : method === 'nagad' ? (isBn ? 'নগদ পার্সোনাল' : 'Nagad Personal') : method === 'rocket' ? (isBn ? 'রকেট পার্সোনাল' : 'Rocket Personal') : (isBn ? 'উপায় পার্সোনাল' : 'Upay Personal')}
                        </span>
                        <strong className="text-sky-950 font-black text-base sm:text-lg tracking-widest font-mono">
                          {selectedDepositNumber}
                        </strong>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyNumber}
                        className="px-3 py-2 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-900 flex items-center gap-1.5 text-xs font-black active:scale-95 transition-all cursor-pointer"
                      >
                        {copiedNumber ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        <span>{copiedNumber ? (isBn ? 'কপি হয়েছে' : 'Copied') : (isBn ? 'কপি নম্বর' : 'Copy')}</span>
                      </button>
                    </div>

                    {/* Deposit Rules / Instructions from Admin Settings */}
                    {systemSettings.depositInstructions && (
                      <div className="bg-white p-2.5 rounded-xl border border-sky-100 text-[11px] text-slate-700 leading-relaxed shadow-2xs">
                        <div className="font-extrabold text-sky-950 mb-1 flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-sky-600" />
                          <span>{isBn ? 'ডিপোজিট করার নিয়ম:' : 'Deposit Instructions:'}</span>
                        </div>
                        <div className="space-y-0.5">
                          {systemSettings.depositInstructions.split('\n').map((line, idx) => (
                            <div key={idx} className="flex items-start gap-1">
                              <span className="text-sky-600 font-bold">•</span>
                              <span>{line}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Method Selector */}
                  <div>
                    <label className="block text-xs font-bold text-gray-900 mb-1.5">
                      {isBn ? 'পেমেন্ট মেথড নির্বাচন করুন' : 'Select Payment Method'}
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {(['bkash', 'nagad', 'rocket', 'upay'] as const).map(m => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setMethod(m)}
                          className={`py-2.5 px-1 rounded-xl text-xs font-black border-2 uppercase transition-all truncate text-center cursor-pointer ${
                            method === m ? 'bg-sky-100 border-sky-500 ring-2 ring-sky-300 text-sky-950 shadow-xs scale-[1.02]' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {m === 'bkash' ? 'বিকাশ' : m === 'nagad' ? 'নগদ' : m === 'rocket' ? 'রকেট' : 'উপায়'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sender Phone */}
                  <div>
                    <label className="block text-xs font-bold text-gray-900 mb-1.5">
                      {isBn ? 'প্রেরকের মোবাইল নম্বর (যেখান থেকে টাকা পাঠিয়েছেন)' : 'Sender Mobile Number'}
                    </label>
                    <input
                      type="tel"
                      required
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full text-sm font-bold p-3 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none text-gray-950"
                    />
                  </div>

                  {/* Amount with quick pills */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-gray-900">
                        {isBn ? 'টাকার পরিমাণ (৳)' : 'Deposit Amount (৳)'}
                      </label>
                      <span className="text-[10.5px] text-sky-700 font-extrabold bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                        {isBn ? `সীমা: ৳${minDeposit} - ৳${maxDeposit}` : `Limit: ৳${minDeposit} - ৳${maxDeposit}`}
                      </span>
                    </div>
                    <input
                      type="number"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder={`সর্বনিম্ন ৳${minDeposit}`}
                      min={minDeposit}
                      max={maxDeposit}
                      className="w-full text-sm font-black p-3 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none text-gray-950 font-mono"
                    />
                    
                    {/* Quick amount chips */}
                    <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1">
                      {[50, 100, 200, 500, 1000].map(amt => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setAmount(String(amt))}
                          className="px-2.5 py-1 bg-gray-100 hover:bg-sky-50 hover:text-sky-700 rounded-lg text-xs font-bold text-gray-700 border border-gray-200 shrink-0 cursor-pointer"
                        >
                          +৳{amt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* TrxID */}
                  <div>
                    <label className="block text-xs font-bold text-gray-900 mb-1.5">
                      {isBn ? 'ট্রানজেকশন আইডি (TrxID)' : 'Transaction ID (TrxID)'}
                    </label>
                    <input
                      type="text"
                      required
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                      placeholder="যেমন: 9JH76SDF2"
                      className="w-full text-sm font-black tracking-wider p-3 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none uppercase placeholder:text-gray-400 font-mono"
                    />
                  </div>

                  {/* Inline error if any */}
                  {errorMsg && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs font-bold text-rose-700">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 ${
                      isSubmitting ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{isBn ? 'যাচাই ও জমা করা হচ্ছে...' : 'Verifying & Submitting...'}</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>{isBn ? 'ডিপোজিট আবেদন জমা দিন' : 'Submit Deposit Request'}</span>
                      </>
                    )}
                  </button>

                  {/* Submitted Deposit Requests Tracking */}
                  {depositRequests && depositRequests.filter(d => d.userId === user?.id || (user?.phone && (d.userPhone === user?.phone || d.senderPhone === user?.phone))).length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-gray-900 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-sky-600" />
                          <span>{isBn ? 'আপনার ডিপোজিট আবেদন ও লাইভ স্ট্যাটাস' : 'Your Submitted Deposit Requests'}</span>
                        </span>
                        <span className="text-[10px] text-gray-500 font-bold">
                          {depositRequests.filter(d => d.userId === user?.id || (user?.phone && (d.userPhone === user?.phone || d.senderPhone === user?.phone))).length} {isBn ? 'টি আবেদন' : 'requests'}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {depositRequests
                          .filter(d => d.userId === user?.id || (user?.phone && d.userPhone === user?.phone))
                          .slice(0, 4)
                          .map((req, rIdx) => (
                            <div key={req.id ? `${req.id}-${rIdx}` : `dep-${rIdx}`} className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2 font-black text-gray-900">
                                  <span>৳{req.amount.toFixed(2)}</span>
                                  <span className="text-[10px] px-1.5 py-0.5 bg-gray-200 text-gray-700 rounded uppercase font-bold">{req.paymentMethod}</span>
                                  <span className="text-[10px] text-gray-500 font-mono">TrxID: {req.trxId}</span>
                                </div>
                                <span className="text-[10px] text-gray-400 font-medium">{req.date}</span>
                              </div>
                              <div>
                                {req.status === 'pending' && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full animate-pulse">
                                    <Clock className="w-3 h-3" />
                                    <span>{isBn ? 'অপেক্ষমান (এডমিন যাচাই করছে)' : 'Pending Review'}</span>
                                  </span>
                                )}
                                {req.status === 'approved' && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>{isBn ? 'অনুমোদিত' : 'Approved'}</span>
                                  </span>
                                )}
                                {req.status === 'rejected' && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-black text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full" title={req.rejectionReason}>
                                    <AlertCircle className="w-3 h-3" />
                                    <span>{isBn ? 'বাতিল' : 'Rejected'}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </form>
              )}
            </div>
          )}

          {/* WITHDRAW TAB */}
          {activeTabKey === 'withdraw' && (
            <div>
              {withdrawSuccessData ? (
                /* IN-MODAL SUCCESS RECEIPT */
                <div className="bg-sky-50 border border-sky-200 rounded-3xl p-5 text-center space-y-4 animate-scale-up">
                  <div className="w-14 h-14 bg-sky-100 text-sky-700 rounded-full flex items-center justify-center mx-auto shadow-xs">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-black text-sky-950 text-base sm:text-lg">
                      {isBn ? 'উইথড্র রিকোয়েস্ট সফল হয়েছে!' : 'Withdrawal Request Submitted!'}
                    </h4>
                    <p className="text-xs text-sky-800 font-medium mt-1">
                      {isBn ? `আপনার রিকোয়েস্ট গৃহীত হয়েছে। ${processingTime} এর মধ্যে পেমেন্ট পৌঁছে যাবে।` : `Request received. Processing time: ${processingTime}.`}
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl p-3.5 border border-sky-200 text-xs space-y-2 text-left shadow-2xs font-bold text-gray-800">
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-normal">{isBn ? 'উত্তোলনের পরিমাণ:' : 'Amount:'}</span>
                      <span className="text-rose-600 font-black font-mono">৳{withdrawSuccessData.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-normal">{isBn ? 'সার্ভিস ফি (১.৫%):' : 'Fee:'}</span>
                      <span className="text-gray-500 font-mono">৳{withdrawSuccessData.fee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-100 pt-1.5">
                      <span className="text-gray-900 font-bold">{isBn ? 'আপনি পাবেন (Net):' : 'Net Received:'}</span>
                      <span className="text-emerald-700 font-black font-mono text-sm">৳{withdrawSuccessData.netAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-normal">{isBn ? 'অ্যাকাউন্ট নম্বর:' : 'Account:'}</span>
                      <span className="text-gray-900 font-mono">{withdrawSuccessData.method} ({withdrawSuccessData.account})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-normal">{isBn ? 'বর্তমান ওয়ালেট ব্যালেন্স:' : 'Remaining Balance:'}</span>
                      <span className="text-sky-700 font-mono font-black">৳{(wallet?.balance ?? 0).toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setWithdrawSuccessData(null);
                      setWalletActiveTab('overview');
                    }}
                    className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-md cursor-pointer transition-all active:scale-95"
                  >
                    {isBn ? 'ঠিক আছে (ওয়ালেট দেখুন)' : 'Done (View Wallet)'}
                  </button>
                </div>
              ) : (
                /* WITHDRAW FORM */
                <form onSubmit={handleWithdraw} className="space-y-4">
                  {/* Balance Status Banner */}
                  <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-sky-50 to-indigo-50 rounded-2xl border border-sky-200">
                    <div>
                      <span className="text-[10.5px] font-bold text-gray-500 block">
                        {isBn ? 'উত্তোলনযোগ্য ব্যালেন্স:' : 'Available Balance:'}
                      </span>
                      <span className="text-xl font-black text-sky-950 font-mono">
                        ৳{(wallet?.balance ?? 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-gray-400 block">{isBn ? 'সর্বনিম্ন উত্তোলন' : 'Min Withdraw'}</span>
                      <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        ৳{minWithdraw}
                      </span>
                    </div>
                  </div>

                  {/* Withdrawal rules / processing time */}
                  <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-gray-700">
                      <span>{isBn ? 'প্রসেসিং সময়:' : 'Processing Time:'}</span>
                      <span className="font-black text-sky-700">{processingTime}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-gray-700">
                      <span>{isBn ? 'দৈনিক সর্বোচ্চ উত্তোলন সীমা:' : 'Daily Limit:'}</span>
                      <span className="font-black text-gray-950">৳{maxDailyWithdraw}</span>
                    </div>

                    {systemSettings.withdrawalInstructions && (
                      <div className="bg-white p-2 rounded-xl border border-gray-100 text-[10.5px] text-gray-600 mt-1">
                        {systemSettings.withdrawalInstructions}
                      </div>
                    )}
                  </div>

                  {/* Method Selector */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      {isBn ? 'উত্তোলন মেথড নির্বাচন করুন' : 'Select Withdrawal Method'}
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {(['bkash', 'nagad', 'rocket', 'upay'] as const).map(m => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setMethod(m)}
                          className={`py-2 px-1 rounded-xl text-xs font-black border-2 uppercase transition-all truncate text-center cursor-pointer ${
                            method === m ? 'bg-sky-100 border-sky-400 ring-2 ring-sky-300 text-sky-950 shadow-xs' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {m === 'bkash' ? 'বিকাশ' : m === 'nagad' ? 'নগদ' : m === 'rocket' ? 'রকেট' : 'উপায়'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Account Number */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      {isBn ? 'আপনার অ্যাকাউন্ট নম্বর (Personal)' : 'Your Account Number (Personal)'}
                    </label>
                    <input
                      type="tel"
                      required
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full text-sm font-bold p-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none text-gray-950 font-mono"
                    />
                  </div>

                  {/* Amount with quick chips */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-gray-700">
                        {isBn ? 'উত্তোলন পরিমাণ (৳)' : 'Withdraw Amount (৳)'}
                      </label>
                      <span className="text-[10px] text-gray-500 font-semibold">
                        {isBn ? `সর্বনিম্ন ৳${minWithdraw}` : `Min ৳${minWithdraw}`}
                      </span>
                    </div>
                    <input
                      type="number"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder={`যেমন: ${minWithdraw}`}
                      min={minWithdraw}
                      max={maxDailyWithdraw}
                      className="w-full text-sm font-black p-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none text-gray-950 font-mono"
                    />

                    {/* Quick amount chips */}
                    <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1">
                      {[50, 100, 200, 500].map(amt => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setAmount(String(amt))}
                          className="px-2.5 py-1 bg-gray-100 hover:bg-sky-50 hover:text-sky-700 rounded-lg text-xs font-bold text-gray-700 border border-gray-200 shrink-0 cursor-pointer"
                        >
                          ৳{amt}
                        </button>
                      ))}
                      {(wallet?.balance ?? 0) >= minWithdraw && (
                        <button
                          type="button"
                          onClick={() => setAmount(String(Math.floor(wallet?.balance ?? 0)))}
                          className="px-2.5 py-1 bg-sky-100 text-sky-800 rounded-lg text-xs font-black border border-sky-300 shrink-0 cursor-pointer"
                        >
                          {isBn ? 'সব টাকা' : 'All Balance'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Net calculation preview */}
                  {Number(amount) >= minWithdraw && (
                    <div className="p-3 bg-sky-50/70 border border-sky-200 rounded-xl text-xs space-y-1 font-medium text-gray-700">
                      <div className="flex justify-between">
                        <span>{isBn ? 'উত্তোলনের অংক:' : 'Amount:'}</span>
                        <span className="font-mono font-bold">৳{Number(amount).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-500">
                        <span>{isBn ? 'সার্ভিস ফি (১.৫%):' : 'Fee (1.5%):'}</span>
                        <span className="font-mono">-৳{Math.max(5, Math.round(Number(amount) * 0.015)).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-t border-sky-200/60 pt-1 font-bold text-sky-950">
                        <span>{isBn ? 'আপনি পাবেন (Net):' : 'Net Received:'}</span>
                        <span className="font-mono font-black text-emerald-700">
                          ৳{(Number(amount) - Math.max(5, Math.round(Number(amount) * 0.015))).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Inline error if any */}
                  {errorMsg && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs font-bold text-rose-700">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={(wallet?.balance ?? 0) < minWithdraw}
                    className="w-full py-3.5 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    <span>
                      {(wallet?.balance ?? 0) < minWithdraw 
                        ? (isBn ? `ব্যালেন্স অপ্রতুল (ন্যূনতম ৳${minWithdraw})` : `Insufficient (Min ৳${minWithdraw})`)
                        : (isBn ? 'উইথড্র রিকোয়েস্ট পাঠান' : 'Submit Withdrawal')}
                    </span>
                  </button>
                </form>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default WalletModal;
