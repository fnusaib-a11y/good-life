import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Copy, 
  Check, 
  AlertCircle, 
  Clock, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  DollarSign, 
  Phone, 
  Info,
  Lock,
  Zap,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';

interface SpecialSocialDepositRequiredPageProps {
  onClose: () => void;
}

export const SpecialSocialDepositRequiredPage: React.FC<SpecialSocialDepositRequiredPageProps> = ({ onClose }) => {
  const { 
    user, 
    systemSettings, 
    depositMoney, 
    depositRequests, 
    showToast, 
    language 
  } = useApp();

  const isBn = language === 'bn';
  const config = systemSettings.specialSocialConfig || {
    isEnabled: true,
    depositRequired: true,
    depositAmount: 150,
    notificationTitle: 'বিশেষ সোশ্যাল ইনকামের জন্য ডিপোজিট নির্দেশিকা',
    description: 'বিশেষ সোশ্যাল ইনকাম ফিচারে আনলিমিটেড উচ্চ-আয়ের জিমেইল ক্রিয়েশন, ইনস্টাগ্রাম প্রমোশন, হোয়াটসঅ্যাপ ও টেলিগ্রাম প্রিমিয়াম মাইক্রো টাস্ক রয়েছে। এই প্রিমিয়াম টাস্কগুলোতে প্রবেশের জন্য এবং জেনুইন ওয়ার্কার নিশ্চিত করতে এককালীন সিকিউরিটি ডিপোজিট আবশ্যক। ডিপোজিট সফলভাবে সম্পন্ন হলে আপনার একাউন্টে এই ফিচারটি আজীবনের জন্য আনলক হয়ে যাবে।',
    paymentMethod: 'bKash / Nagad',
    paymentNumber: '01877722819',
    terms: '১. নির্ধারিত বিকাশ অথবা নগদ নম্বরে সেন্ড মানি (Send Money) সম্পন্ন করুন।\n২. টাকা পাঠানোর পর যে নম্বর থেকে পাঠিয়েছেন সেই নম্বর ও TrxID লিখে সাবমিট করুন।\n৩. এডমিন প্যানেলে যাচাইকরণের পর শুধুমাত্র আপনার একাউন্টের জন্য এই ফিচারটি চালু হয়ে যাবে।\n৪. কোনো ভুল বা অসত্য তথ্য দিলে রিকোয়েস্ট বাতিল হতে পারে।'
  };

  // Check if current user has an existing deposit for special social income
  const userPendingDeposit = depositRequests.find(d => 
    (d.userId === user.id || (user.phone && d.userPhone === user.phone)) &&
    (d.depositType === 'special_social' || d.purpose === 'বিশেষ সোশ্যাল ইনকাম এক্সেস' || (d.purpose && d.purpose.includes('বিশেষ সোশ্যাল'))) &&
    d.status === 'pending'
  );

  const [hasAgreed, setHasAgreed] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash');
  const [senderPhone, setSenderPhone] = useState(user.phone || '');
  const [trxId, setTrxId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNumber(true);
    showToast(isBn ? 'নম্বর কপি করা হয়েছে!' : 'Number copied!');
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleSubmitDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderPhone.trim() || senderPhone.trim().length < 11) {
      showToast(isBn ? 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন' : 'Enter a valid 11-digit phone number');
      return;
    }
    if (!trxId.trim() || trxId.trim().length < 6) {
      showToast(isBn ? 'সঠিক ট্রানজেকশন আইডি (TrxID) দিন' : 'Enter a valid TrxID');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await depositMoney(
        config.depositAmount,
        selectedMethod,
        trxId.trim(),
        senderPhone.trim(),
        {
          depositType: 'special_social',
          purpose: 'বিশেষ সোশ্যাল ইনকাম এক্সেস'
        }
      );

      if (res.success) {
        setSubmitSuccess(true);
        showToast(isBn ? 'ডিপোজিট সফলভাবে জমা হয়েছে! এডমিন অনুমোদনের অপেক্ষা করুন।' : 'Deposit submitted successfully! Waiting for admin approval.');
      } else {
        showToast(res.message || (isBn ? 'ডিপোজিট জমা ব্যর্থ হয়েছে' : 'Failed to submit deposit'));
      }
    } catch {
      showToast(isBn ? 'নেটওয়ার্ক এরর, আবার চেষ্টা করুন' : 'Network error, please retry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPending = Boolean(userPendingDeposit || user.specialSocialStatus === 'pending' || submitSuccess);
  const isRejected = user.specialSocialStatus === 'rejected' && !isPending;

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-xs flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        className="w-full sm:max-w-xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh] border border-gray-100"
      >
        {/* Top Header */}
        <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-blue-700 text-white p-4 sm:p-5 flex items-center justify-between shrink-0 shadow-sm relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center gap-3 relative z-10">
            <button 
              onClick={onClose}
              id="btn-back-special-social"
              className="p-2 bg-white/15 hover:bg-white/25 active:scale-95 rounded-xl transition-all cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                <h2 className="text-base sm:text-lg font-black tracking-tight leading-tight text-white">
                  {config.notificationTitle || (isBn ? 'বিশেষ সোশ্যাল ইনকাম' : 'Special Social Income')}
                </h2>
              </div>
              <p className="text-[11px] text-sky-100 font-medium mt-0.5">
                {isBn ? 'নিরাপদ ডিপোজিট ও একাউন্ট আনলক নির্দেশিকা' : 'Secure Deposit & Unlock Guidelines'}
              </p>
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur-xs px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase flex items-center gap-1 text-white border border-white/20">
            <Lock className="w-3 h-3 text-amber-300" />
            <span>{isPending ? (isBn ? 'রিভিউধীন' : 'In Review') : (isBn ? 'ডিপোজিট প্রয়োজন' : 'Deposit Required')}</span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 bg-gray-50/50">
          
          {/* If Pending Approval Status */}
          {isPending ? (
            <motion.div 
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-amber-50 border-2 border-amber-300/80 rounded-2xl p-5 text-center space-y-3"
            >
              <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Clock className="w-7 h-7 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-black text-amber-900">
                  {isBn ? 'ডিপোজিট রিকোয়েস্ট যাচাই চলছে' : 'Deposit Verification In Progress'}
                </h3>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  {isBn 
                    ? `আপনার ৳${config.depositAmount} ডিপোজিট আবেদনটি অ্যাডমিন প্যানেলে অপেক্ষমাণ রয়েছে। অ্যাডমিন TrxID যাচাই করে অনুমোদন দিলে এই সেকশনটি শুধুমাত্র আপনার জন্য স্বয়ংক্রিয়ভাবে আনলক হয়ে যাবে।`
                    : `Your deposit request of ৳${config.depositAmount} is currently pending admin verification. Once verified, this section will be unlocked for your account.`}
                </p>
              </div>

              {(userPendingDeposit || trxId) && (
                <div className="bg-white/80 rounded-xl p-3 text-left border border-amber-200 text-xs space-y-1.5 font-medium">
                  <div className="flex justify-between">
                    <span className="text-gray-500">{isBn ? 'টাকার পরিমাণ:' : 'Amount:'}</span>
                    <span className="font-black text-gray-900">৳{config.depositAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">TrxID:</span>
                    <span className="font-mono font-bold text-indigo-600">{userPendingDeposit?.trxId || trxId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{isBn ? 'স্ট্যাটাস:' : 'Status:'}</span>
                    <span className="font-bold text-amber-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {isBn ? 'পেন্ডিং (অপেক্ষমাণ)' : 'Pending'}
                    </span>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
                >
                  {isBn ? 'ঠিক আছে, অপেক্ষা করছি' : 'Got it, waiting'}
                </button>
              </div>
            </motion.div>
          ) : (
            <>
              {/* If Previously Rejected Alert */}
              {isRejected && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3 text-rose-900">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <h4 className="font-bold">{isBn ? 'পূর্বের ডিপোজিট রিকোয়েস্ট বাতিল হয়েছিল' : 'Previous Deposit Request Rejected'}</h4>
                    <p className="text-rose-700 mt-0.5">
                      {isBn ? 'সঠিক নম্বরে টাকা পাঠিয়ে সঠিক TrxID দিয়ে পুনরায় ডিপোজিট রিকোয়েস্ট জমা দিন।' : 'Please send the payment to the correct number and re-submit with the valid TrxID.'}
                    </p>
                  </div>
                </div>
              )}

              {/* 1. Admin's Why Deposit is Needed Description */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-sky-700">
                  <Info className="w-4 h-4 text-sky-600" />
                  <h4 className="text-xs sm:text-sm font-black text-gray-900">
                    {isBn ? 'কেন ডিপোজিট করতে হবে?' : 'Why is Deposit Required?'}
                  </h4>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">
                  {config.description}
                </p>
              </div>

              {/* 2. Admin Payment Details Box */}
              <div className="bg-gradient-to-br from-indigo-50/70 via-sky-50/60 to-white p-4 sm:p-5 rounded-2xl border border-indigo-100/90 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-600">
                    {isBn ? 'নির্ধারিত ডিপোজিট পরিমাণ:' : 'Required Deposit Amount:'}
                  </span>
                  <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-3 py-1 rounded-xl text-sm font-black shadow-xs flex items-center gap-1">
                    <span>৳{config.depositAmount}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <div className="bg-white p-2.5 rounded-xl border border-indigo-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-500 font-bold block">{isBn ? 'পেমেন্ট মেথড' : 'Payment Method'}</span>
                      <span className="text-xs font-black text-gray-800">{config.paymentMethod || 'bKash / Nagad'}</span>
                    </div>
                    <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded-md">Send Money</span>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-indigo-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-500 font-bold block">{isBn ? 'অফিশিয়াল পেমেন্ট নম্বর' : 'Official Payment Number'}</span>
                      <span className="text-xs font-black text-indigo-700 font-mono tracking-wider">{config.paymentNumber || '01877722819'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(config.paymentNumber || '01877722819')}
                      className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                    >
                      {copiedNumber ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedNumber ? (isBn ? 'কপি হয়েছে' : 'Copied') : (isBn ? 'কপি' : 'Copy')}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 3. Terms & Instructions from Admin */}
              {config.terms && (
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-amber-800 font-black text-xs">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>{isBn ? 'প্রয়োজনীয় নির্দেশনা ও শর্তাবলী' : 'Instructions & Terms'}</span>
                  </div>
                  <p className="text-[11.5px] text-amber-900 leading-relaxed whitespace-pre-line font-medium">
                    {config.terms}
                  </p>
                </div>
              )}

              {/* 4. Agreement Button or Reveal Form */}
              {!hasAgreed ? (
                <div className="pt-2">
                  <button
                    type="button"
                    id="btn-agree-special-social-deposit"
                    onClick={() => setHasAgreed(true)}
                    className="w-full py-3.5 bg-gradient-to-r from-sky-600 via-indigo-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white font-black rounded-2xl text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>{isBn ? 'আমি সম্মত / Deposit করতে চাই' : 'I Agree / Want to Deposit'}</span>
                  </button>
                  <p className="text-center text-[10.5px] text-gray-500 mt-2">
                    {isBn ? 'সম্মতি দিলে ডিপোজিট তথ্য জমা দেওয়ার ফর্মটি দেখতে পাবেন।' : 'Click to proceed with your payment information.'}
                  </p>
                </div>
              ) : (
                /* 5. Deposit Submission Form */
                <motion.form 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  onSubmit={handleSubmitDeposit}
                  className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-indigo-200 shadow-sm space-y-3.5"
                >
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <h4 className="text-xs sm:text-sm font-black text-gray-900 flex items-center gap-1.5">
                      <Send className="w-4 h-4 text-indigo-600" />
                      <span>{isBn ? 'ডিপোজিট ফর্ম পূরণ করুন' : 'Fill Deposit Form'}</span>
                    </h4>
                    <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      ৳{config.depositAmount}
                    </span>
                  </div>

                  {/* Payment Method Selector */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      {isBn ? 'পেমেন্ট মেথড নির্বাচন করুন:' : 'Select Payment Method:'}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['bKash', 'Nagad', 'Rocket'] as const).map(method => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setSelectedMethod(method)}
                          className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                            selectedMethod === method
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {method === 'bKash' ? 'বিকাশ' : method === 'Nagad' ? 'নগদ' : 'রকেট'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sender Phone Number */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      {isBn ? 'যে নম্বর থেকে টাকা পাঠিয়েছেন (Sender Number):' : 'Sender Phone Number:'}
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        value={senderPhone}
                        onChange={(e) => setSenderPhone(e.target.value)}
                        placeholder="017XXXXXXXX"
                        className="w-full pl-9 pr-3 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none font-medium"
                        required
                      />
                    </div>
                  </div>

                  {/* Transaction ID */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      {isBn ? 'ট্রানজেকশন আইডি (TrxID):' : 'Transaction ID (TrxID):'}
                    </label>
                    <input
                      type="text"
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                      placeholder={isBn ? 'মেসেজ থেকে TrxID কপি করে এখানে লিখুন' : 'Enter TrxID from SMS'}
                      className="w-full px-3 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none font-mono uppercase font-bold"
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setHasAgreed(false)}
                      className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
                    >
                      {isBn ? 'বাতিল' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span>{isBn ? 'সাবমিট হচ্ছে...' : 'Submitting...'}</span>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-white" />
                          <span>{isBn ? 'ডিপোজিট সাবমিট করুন' : 'Submit Deposit'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.form>
              )}
            </>
          )}

        </div>
      </motion.div>
    </div>
  );
};

export default SpecialSocialDepositRequiredPage;
