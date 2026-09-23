import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  Copy, 
  Check, 
  Clock, 
  CreditCard, 
  AlertCircle, 
  ArrowRight,
  Info,
  Smartphone,
  Hash,
  Send
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { safeSetItem } from '../../lib/storageUtils';

export const VerificationModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { 
    user, 
    setUser, 
    systemSettings, 
    showToast, 
    language,
    depositMoney,
    submitVerificationRequest,
    addTransaction 
  } = useApp();

  const isBn = language === 'bn';

  // Selected payment method
  const [selectedMethod, setSelectedMethod] = useState<'bkash' | 'nagad'>('bkash');
  const [senderNumber, setSenderNumber] = useState('');
  const [trxId, setTrxId] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const verificationFee = systemSettings.verificationFee ?? 100;
  const paymentNumbers = systemSettings.verificationPaymentNumbers || {
    bkash: '01877722819',
    nagad: '01877722819',
    upay: '01877722819'
  };

  const currentNumber = paymentNumbers[selectedMethod] || '01877722819';
  const instructions = systemSettings.verificationInstructions || 
    '১. উপরে প্রদত্ত নম্বরে ভেরিফিকেশন ফি পাঠান (Send Money)।\n২. টাকা পাঠানোর পর প্রেরক নম্বর ও TrxID লিখে সাবমিট করুন।\n৩. এডমিন টিম যাচাই করে প্রোফাইল দ্রুত ভেরিফাই করে দেবে।';

  const handleCopy = (text: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(text).catch(() => {});
      }
    } catch {
      // safe fallback
    }
    setIsCopied(true);
    showToast(isBn ? 'নম্বর কপি করা হয়েছে!' : 'Number copied!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderNumber.trim()) {
      showToast(isBn ? 'যে নম্বর থেকে টাকা পাঠিয়েছেন তা লিখুন!' : 'Please enter sender phone number!');
      return;
    }
    if (!trxId.trim()) {
      showToast(isBn ? 'ট্রানজেকশন আইডি (TrxID) লিখুন!' : 'Please enter Transaction ID!');
      return;
    }

    setSubmitting(true);

    const formattedTrxId = trxId.trim().toUpperCase();
    const cleanSender = senderNumber.trim();
    const methodName = selectedMethod === 'bkash' ? 'bKash' : 'Nagad';

    try {
      // 1. Submit through the real backend API using depositMoney with verification flag
      const result = await depositMoney(
        verificationFee,
        methodName,
        formattedTrxId,
        cleanSender,
        {
          isVerification: true,
          depositType: 'verification',
          purpose: 'Account Verification',
          nidNumber: user.nidNumber || ''
        }
      );

      // 2. Also register verification request for multi-queue synchronization
      if (typeof submitVerificationRequest === 'function') {
        submitVerificationRequest({
          method: methodName,
          senderNumber: cleanSender,
          trxId: formattedTrxId,
          amount: verificationFee,
          nidNumber: user.nidNumber || ''
        });
      }

      // 3. Update user verification status to pending locally
      const updatedUser = {
        ...user,
        verificationStatus: 'pending' as const,
        bio: `Payment: ${selectedMethod.toUpperCase()} | Sender: ${cleanSender} | TrxID: ${formattedTrxId}`
      };

      setUser(updatedUser);
      safeSetItem('lg_user', JSON.stringify(updatedUser));

      // 4. Save to local verification requests history for backward compatibility
      try {
        const existingReqs = JSON.parse(localStorage.getItem('lg_verification_requests') || '[]');
        const filtered = existingReqs.filter((r: any) => r.trxId !== formattedTrxId);
        filtered.unshift({
          userId: user.id,
          userName: user.name,
          userPhone: user.phone,
          method: selectedMethod,
          senderNumber: cleanSender,
          trxId: formattedTrxId,
          amount: verificationFee,
          purpose: 'Account Verification',
          isVerification: true,
          submittedAt: new Date().toLocaleString('bn-BD'),
          status: 'pending'
        });
        safeSetItem('lg_verification_requests', JSON.stringify(filtered));
      } catch {
        // ignore
      }

      showToast(
        result?.message || 
        (isBn 
          ? 'ভেরিফিকেশন ডিপোজিট রিকোয়েস্ট সফলভাবে জমা হয়েছে! এডমিন প্যানেলে জমা হয়েছে এবং এডমিন দ্রুত অনুমোদন করবে।' 
          : 'Verification deposit request submitted! Admin will verify soon.')
      );
    } catch (err: any) {
      console.error('Verification deposit submit error:', err);
      showToast(isBn ? 'ভেরিফিকেশন রিকোয়েস্ট জমা দিতে সমস্যা হয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন।' : 'Failed to submit verification request.');
    } finally {
      setSubmitting(false);
    }
  };

  const getMethodBadge = (m: 'bkash' | 'nagad') => {
    switch (m) {
      case 'bkash':
        return { name: 'বিকাশ (bKash)', bg: 'bg-[#D12053] text-white', border: 'border-[#D12053]' };
      case 'nagad':
        return { name: 'নগদ (Nagad)', bg: 'bg-[#F7921E] text-white', border: 'border-[#F7921E]' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-scale-up border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-500 to-sky-600 px-5 py-4 flex items-center justify-between text-white shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg leading-tight">
                {isBn ? 'প্রোফাইল ভেরিফিকেশন' : 'Profile Verification'}
              </h3>
              <p className="text-xs font-medium text-sky-100 mt-0.5">
                {isBn ? 'অ্যাকাউন্ট ভেরিফাই ও প্রিমিয়াম এক্সেস' : 'Account Verification & Access'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-white/20 transition-colors text-white cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Already Verified State */}
        {user.isVerified || user.verificationStatus === 'verified' ? (
          <div className="p-6 text-center space-y-4 my-auto overflow-y-auto">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-md border border-emerald-200">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <div className="inline-block px-3.5 py-1 bg-emerald-100 text-emerald-800 text-xs sm:text-sm font-black rounded-full mb-2">
                ✓ {isBn ? 'ভেরিফাইড অ্যাকাউন্ট' : 'Verified Account'}
              </div>
              <h3 className="text-lg sm:text-xl font-black text-gray-900">
                {isBn ? 'আপনার প্রোফাইল সম্পূর্ণ ভেরিফাইড!' : 'Your profile is verified!'}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-xs mx-auto leading-relaxed">
                {isBn 
                  ? 'আপনি এখন আনলিমিটেড পেমেন্ট উত্তোলন, হাই-পেইং মাইক্রো জব এবং সকল প্রিমিয়াম সুবিধা উপভোগ করতে পারবেন।' 
                  : 'You now have full access to unlimited withdrawals, high paying jobs and premium features.'}
              </p>
            </div>

            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200/80 text-left text-xs sm:text-sm space-y-1.5 text-emerald-950 font-medium">
              <div className="font-bold flex items-center gap-1.5 text-emerald-950 pb-1 border-b border-emerald-200/60">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{isBn ? 'অ্যাকাউন্ট স্ট্যাটাস ও সুবিধা' : 'Account Status & Benefits'}</span>
              </div>
              <div>• {isBn ? 'দৈনিক উইথড্রয়াল লিমিট: আনলিমিটেড' : 'Daily withdrawal: Unlimited'}</div>
              <div>• {isBn ? 'রেফারেল ও টিম কমিশন: সক্রিয়' : 'Team commission: Active'}</div>
              <div>• {isBn ? 'মাইক্রো ফ্রিল্যান্সিং: ফুল এক্সেস' : 'Freelancing: Full Access'}</div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3.5 bg-sky-500 hover:bg-sky-600 text-white font-black text-sm rounded-xl shadow-md cursor-pointer transition-all"
            >
              {isBn ? 'ঠিক আছে' : 'OK'}
            </button>
          </div>
        ) : user.verificationStatus === 'pending' ? (
          /* 2. Pending Verification State */
          <div className="p-6 text-center space-y-4 my-auto overflow-y-auto">
            <div className="w-16 h-16 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center mx-auto shadow-md border border-sky-200">
              <Clock className="w-9 h-9 animate-pulse" />
            </div>
            <div>
              <div className="inline-block px-3.5 py-1 bg-sky-100 text-sky-900 text-xs sm:text-sm font-black rounded-full mb-2">
                ⏳ {isBn ? 'যাচাই প্রক্রিয়াধীন (Pending)' : 'Under Review'}
              </div>
              <h3 className="text-base sm:text-lg font-black text-gray-900">
                {isBn ? 'আপনার ভেরিফিকেশন তথ্য জমা হয়েছে' : 'Verification Submitted'}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-xs mx-auto leading-relaxed">
                {isBn 
                  ? 'আপনার প্রেরিত ট্রানজেকশন নম্বর ও পেমেন্ট এডমিন টিম যাচাই করছে। অল্প সময়ের মধ্যে ভেরিফিকেশন সফল হবে।' 
                  : 'Admin team is reviewing your payment and transaction details. It will be verified shortly.'}
              </p>
            </div>

            {user.bio && (
              <div className="bg-gray-50 rounded-2xl p-3.5 border border-gray-200 text-left text-xs text-gray-800 font-mono">
                <span className="font-bold text-gray-900 block font-sans mb-1 text-xs sm:text-sm">
                  {isBn ? 'জমা দেওয়া তথ্য:' : 'Submitted Details:'}
                </span>
                {user.bio}
              </div>
            )}

            <div className="pt-2 flex gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setUser({ ...user, verificationStatus: 'unverified' });
                  showToast(isBn ? 'পুনরায় নতুন করে তথ্য দিতে পারবেন।' : 'You can re-submit details.');
                }}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs sm:text-sm rounded-xl cursor-pointer transition-all"
              >
                {isBn ? 'নতুন করে পাঠান' : 'Re-submit'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-sky-500 hover:bg-sky-600 text-white font-black text-xs sm:text-sm rounded-xl cursor-pointer shadow-sm transition-all"
              >
                {isBn ? 'বন্ধ করুন' : 'Close'}
              </button>
            </div>
          </div>
        ) : (
          /* 3. Real Payment & Verification Form */
          <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
            {/* Top Fee Box */}
            <div className="bg-gradient-to-r from-sky-50 via-blue-50 to-sky-50 border-2 border-sky-200 rounded-2xl p-4 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center text-white font-black text-xl shadow-xs">
                  ৳
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-600">
                    {isBn ? 'ভেরিফিকেশন ফি' : 'Verification Fee'}
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-gray-950 flex items-baseline gap-1">
                    <span>৳{verificationFee}</span>
                    <span className="text-xs font-bold text-gray-500">({isBn ? 'এককালীন' : 'One-time'})</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-black rounded-lg shadow-2xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  {isBn ? 'আজীবন মেয়াদ' : 'Lifetime'}
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-1.5">
                {isBn ? '১. পেমেন্ট মেথড নির্বাচন করুন' : '1. Select Payment Method'}
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedMethod('bkash')}
                  className={`py-3 px-3 rounded-2xl text-xs sm:text-sm font-black border-2 transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    selectedMethod === 'bkash'
                      ? 'bg-[#D12053] text-white border-[#D12053] shadow-md scale-[1.01]'
                      : 'bg-white text-gray-800 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-sm font-extrabold tracking-wide">বিকাশ</span>
                  <span className="text-[10px] opacity-90 font-semibold tracking-wider uppercase">bKash Personal</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('nagad')}
                  className={`py-3 px-3 rounded-2xl text-xs sm:text-sm font-black border-2 transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    selectedMethod === 'nagad'
                      ? 'bg-[#F7921E] text-white border-[#F7921E] shadow-md scale-[1.01]'
                      : 'bg-white text-gray-800 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-sm font-extrabold tracking-wide">নগদ</span>
                  <span className="text-[10px] opacity-90 font-semibold tracking-wider uppercase">Nagad Personal</span>
                </button>
              </div>
            </div>

            {/* Admin Payment Number Card with 1-click Copy */}
            <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-lg border border-slate-800 relative overflow-hidden">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-sky-400" />
                  <span className="text-xs sm:text-sm font-bold text-gray-200">
                    {getMethodBadge(selectedMethod).name} — {isBn ? 'পার্সোনাল (Send Money)' : 'Personal'}
                  </span>
                </div>
                <span className="text-xs bg-sky-500 text-white font-black px-2 py-0.5 rounded-md shadow-2xs">
                  ৳{verificationFee}
                </span>
              </div>

              <div className="flex items-center justify-between bg-black/60 rounded-xl p-3 border border-white/10 gap-2">
                <div className="font-mono text-lg sm:text-xl font-black tracking-widest text-sky-300 select-all">
                  {currentNumber}
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(currentNumber)}
                  className="px-3.5 py-2 bg-sky-500 hover:bg-sky-600 text-white text-xs sm:text-sm font-black rounded-lg flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer shrink-0"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>{isBn ? 'কপি হয়েছে' : 'Copied'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-white" />
                      <span>{isBn ? 'কপি নম্বর' : 'Copy'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Input Submission Form */}
            <div className="space-y-3.5 pt-1">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-1.5">
                  {isBn ? '২. প্রেরক নম্বর (যে নম্বর থেকে টাকা পাঠিয়েছেন)' : '2. Sender Phone Number'}{' '}
                  <span className="text-red-500 font-extrabold">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Smartphone className="w-4 h-4 text-gray-500" />
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength={11}
                    value={senderNumber}
                    onChange={(e) => setSenderNumber(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm font-bold text-gray-950 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all placeholder:text-gray-400 placeholder:font-normal"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-1.5">
                  {isBn ? '৩. ট্রানজেকশন আইডি (TrxID / Transaction ID)' : '3. Transaction ID (TrxID)'}{' '}
                  <span className="text-red-500 font-extrabold">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Hash className="w-4 h-4 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    required
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                    placeholder={isBn ? 'যেমন: BL8A92KXYZ' : 'e.g. BL8A92KXYZ'}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm font-black tracking-wider text-gray-950 uppercase focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all placeholder:text-gray-400 placeholder:font-normal"
                  />
                </div>
              </div>
            </div>

            {/* Clear, High-Contrast Instructions Section */}
            <div className="bg-sky-50 border border-sky-200 rounded-2xl p-3.5 sm:p-4 space-y-2 text-slate-900 shadow-2xs">
              <div className="font-black flex items-center gap-2 text-sky-950 text-xs sm:text-sm tracking-wide">
                <Info className="w-4 h-4 text-sky-600 shrink-0" />
                <span>{isBn ? 'জরুরি নির্দেশনা (ভেরিফিকেশন নিয়মাবলী)' : 'Important Instructions'}</span>
              </div>
              <div className="text-xs sm:text-sm text-slate-800 whitespace-pre-line leading-relaxed font-semibold divide-y divide-sky-100/80">
                {instructions.split('\n').map((line, idx) => (
                  <div key={idx} className="py-1 first:pt-0 last:pb-0 flex items-start gap-1.5">
                    <span className="text-sky-600 font-black shrink-0">•</span>
                    <span>{line}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-sky-500 hover:bg-sky-600 text-white font-black text-sm sm:text-base rounded-xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {submitting ? (
                <span>{isBn ? 'যাচাই করা হচ্ছে...' : 'Submitting...'}</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{isBn ? 'ভেরিফিকেশন আবেদন জমা দিন' : 'Submit Verification'}</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default VerificationModal;
