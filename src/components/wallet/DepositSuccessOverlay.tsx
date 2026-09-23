import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Sparkles, 
  Copy, 
  Check, 
  Wallet, 
  Clock, 
  X, 
  ArrowRight, 
  ShieldCheck,
  PartyPopper
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { fireCelebrationConfetti, playCelebrationSound } from '../../lib/audioCelebration';

export const DepositSuccessOverlay: React.FC = () => {
  const { 
    depositCelebration, 
    closeDepositCelebration, 
    isBn, 
    setActiveTab, 
    setIsWalletOpen,
    setWalletActiveTab
  } = useApp();

  const [copiedTrx, setCopiedTrx] = useState(false);

  // Trigger celebration effects upon mount / data change
  useEffect(() => {
    if (depositCelebration) {
      const isConfirmed = depositCelebration.type === 'confirmed';
      fireCelebrationConfetti(isConfirmed);
      playCelebrationSound(isConfirmed);
    }
  }, [depositCelebration]);

  if (!depositCelebration) return null;

  const isConfirmed = depositCelebration.type === 'confirmed';
  const amount = Number(depositCelebration.amount || 0);

  const handleCopyTrx = () => {
    if (!depositCelebration.trxId) return;
    try {
      navigator.clipboard.writeText(depositCelebration.trxId);
      setCopiedTrx(true);
      setTimeout(() => setCopiedTrx(false), 2000);
    } catch {}
  };

  const handleViewWallet = () => {
    closeDepositCelebration();
    setIsWalletOpen(true);
    setWalletActiveTab('overview');
    setActiveTab('wallet');
  };

  const getMethodBadge = (m: string) => {
    const norm = (m || '').toLowerCase();
    if (norm.includes('bkash')) {
      return { name: 'bKash (বিকাশ)', color: 'bg-pink-50 text-pink-700 border-pink-200' };
    }
    if (norm.includes('nagad')) {
      return { name: 'Nagad (নগদ)', color: 'bg-orange-50 text-orange-700 border-orange-200' };
    }
    if (norm.includes('rocket')) {
      return { name: 'Rocket (রকেট)', color: 'bg-purple-50 text-purple-700 border-purple-200' };
    }
    if (norm.includes('upay')) {
      return { name: 'Upay (উপায়)', color: 'bg-amber-50 text-amber-800 border-amber-200' };
    }
    return { name: m || 'মোবাইল ব্যাংকিং', color: 'bg-sky-50 text-sky-700 border-sky-200' };
  };

  const methodInfo = getMethodBadge(depositCelebration.paymentMethod);

  return (
    <div 
      className="fixed inset-0 z-[160] flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeDepositCelebration();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-emerald-100 flex flex-col animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Decorative Ambient Glow */}
        <div className={`absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-32 blur-3xl opacity-40 pointer-events-none rounded-full ${
          isConfirmed ? 'bg-emerald-400' : 'bg-teal-300'
        }`} />

        {/* Close Button */}
        <button
          type="button"
          onClick={closeDepositCelebration}
          className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full bg-gray-100/90 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition-colors cursor-pointer"
          title={isBn ? 'বন্ধ করুন' : 'Close'}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Hero Banner */}
        <div className={`px-6 pt-7 pb-5 text-center relative ${
          isConfirmed 
            ? 'bg-gradient-to-b from-emerald-500 via-emerald-600 to-teal-700 text-white' 
            : 'bg-gradient-to-b from-teal-600 via-emerald-600 to-emerald-700 text-white'
        }`}>
          {/* Animated Centered Icon with Ripple Rings */}
          <div className="relative inline-block mb-3.5">
            {/* Pulsing Ripple Rings */}
            <div className="absolute inset-0 rounded-full bg-white/25 animate-ping" />
            <div className="absolute -inset-2 rounded-full bg-white/15 animate-pulse" />
            
            <div className="relative w-18 h-18 rounded-full bg-white text-emerald-600 shadow-xl flex items-center justify-center mx-auto border-4 border-white/90">
              {isConfirmed ? (
                <PartyPopper className="w-9 h-9 text-emerald-600 animate-bounce" />
              ) : (
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              )}
            </div>
          </div>

          {/* Status Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-xs text-white border border-white/30 shadow-xs mb-2">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>
              {isConfirmed 
                ? (isBn ? 'ডিপোজিট সফল • অনুমোদিত ✓' : 'Deposit Confirmed • Approved ✓') 
                : (isBn ? 'আবেদন সফল • অপেক্ষমাণ' : 'Request Submitted • In Review')}
            </span>
          </div>

          {/* Title & Subtitle */}
          <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-tight text-white drop-shadow-xs">
            {isConfirmed 
              ? (isBn ? 'অভিনন্দন! ডিপোজিট অনুমোদিত!' : 'Congratulations! Deposit Approved!')
              : (isBn ? 'ডিপোজিট আবেদন জমা হয়েছে!' : 'Deposit Request Submitted!')}
          </h3>
          <p className="text-xs sm:text-sm text-emerald-100 font-medium mt-1 max-w-xs mx-auto">
            {isConfirmed 
              ? (isBn ? 'টাকা সফলভাবে আপনার মূল ওয়ালেট ব্যালেন্সে যোগ করা হয়েছে।' : 'The amount has been successfully credited to your wallet balance.')
              : (isBn ? 'আপনার পেমেন্ট তথ্য এডমিন পর্যালোচনার জন্য জমা দেওয়া হয়েছে।' : 'Your payment info has been safely submitted for admin verification.')}
          </p>

          {/* Big Amount Card in Header */}
          <div className="mt-4 bg-white/15 backdrop-blur-md rounded-2xl py-3 px-4 border border-white/25 inline-flex items-baseline justify-center gap-1.5 shadow-inner">
            <span className="text-xs font-bold text-emerald-100">{isBn ? 'টাকার পরিমাণ:' : 'Amount:'}</span>
            <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white drop-shadow-sm">
              ৳{amount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Voucher / Receipt Details Body */}
        <div className="p-5 sm:p-6 space-y-4 bg-white">
          <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100 space-y-2.5 text-xs text-gray-700 shadow-2xs">
            {/* Payment Method */}
            <div className="flex items-center justify-between">
              <span className="text-gray-500 font-semibold">{isBn ? 'পেমেন্ট মাধ্যম:' : 'Payment Method:'}</span>
              <span className={`px-2.5 py-0.5 rounded-lg border font-bold text-[11px] ${methodInfo.color}`}>
                {methodInfo.name}
              </span>
            </div>

            {/* TrxID with Copy Button */}
            <div className="flex items-center justify-between border-t border-gray-100 pt-2">
              <span className="text-gray-500 font-semibold">{isBn ? 'ট্রানজেকশন আইডি (TrxID):' : 'Transaction ID:'}</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-black text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200 text-xs">
                  {depositCelebration.trxId || 'N/A'}
                </span>
                <button
                  type="button"
                  onClick={handleCopyTrx}
                  className="p-1.5 hover:bg-gray-200 text-gray-500 hover:text-gray-800 rounded-lg transition-colors cursor-pointer"
                  title={isBn ? 'TrxID কপি করুন' : 'Copy TrxID'}
                >
                  {copiedTrx ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Sender Account */}
            {depositCelebration.senderPhone && (
              <div className="flex items-center justify-between border-t border-gray-100 pt-2">
                <span className="text-gray-500 font-semibold">{isBn ? 'প্রেরক মোবাইল নম্বর:' : 'Sender Account:'}</span>
                <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md text-xs">
                  {depositCelebration.senderPhone}
                </span>
              </div>
            )}

            {/* Status Pill */}
            <div className="flex items-center justify-between border-t border-gray-100 pt-2">
              <span className="text-gray-500 font-semibold">{isBn ? 'বর্তমান স্ট্যাটাস:' : 'Current Status:'}</span>
              {isConfirmed ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isBn ? 'অনুমোদিত ও ব্যালেন্সে যুক্ত' : 'Approved & Credited'}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  <span>{isBn ? 'পেন্ডিং (এডমিন পর্যালোচনা)' : 'Pending Review'}</span>
                </span>
              )}
            </div>
          </div>

          {/* Helpful Information Notice */}
          <div className={`p-3 rounded-2xl text-xs flex items-start gap-2.5 border ${
            isConfirmed 
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' 
              : 'bg-amber-50/80 border-amber-200 text-amber-900'
          }`}>
            <Clock className={`w-4 h-4 shrink-0 mt-0.5 ${isConfirmed ? 'text-emerald-600' : 'text-amber-600'}`} />
            <p className="font-medium leading-relaxed">
              {isConfirmed ? (
                isBn 
                  ? 'আপনার নতুন ডিপোজিট দিয়ে পণ্য অর্ডার করতে পারবেন, রিসেলিং করতে পারবেন অথবা অন্যান্য সেবায় ব্যবহার করতে পারবেন।'
                  : 'You can now use your newly credited balance for placing orders, reselling, or joining earning activities.'
              ) : (
                isBn 
                  ? 'সাধারণত ৫ থেকে ১৫ মিনিটের মধ্যে এডমিন ট্রানজেকশন তথ্য যাচাই করে অনুমোদন সম্পন্ন করবেন। অনুমোদন হওয়ার সাথে সাথে ওয়ালেটে টাকা যোগ হবে।'
                  : 'Admin will typically verify the TrxID within 5-15 minutes. Once verified, the balance will be instantly added to your wallet.'
              )}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={handleViewWallet}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Wallet className="w-4 h-4" />
              <span>{isBn ? 'ওয়ালেট ব্যালেন্স দেখুন' : 'View Wallet Balance'}</span>
              <ArrowRight className="w-4 h-4 ml-auto" />
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fireCelebrationConfetti(isConfirmed)}
                className="py-2.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <PartyPopper className="w-3.5 h-3.5 text-amber-600" />
                <span>{isBn ? 'কনফেটি দেখুন 🎉' : 'Confetti 🎉'}</span>
              </button>

              <button
                type="button"
                onClick={closeDepositCelebration}
                className="py-2.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl flex items-center justify-center transition-colors cursor-pointer"
              >
                <span>{isBn ? 'ঠিক আছে' : 'Done'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepositSuccessOverlay;
