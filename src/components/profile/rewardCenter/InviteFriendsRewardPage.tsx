import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { RewardCenterHeader } from './RewardCenterHeader';
import { RewardCenterProfileBanner } from './RewardCenterProfileBanner';
import { getRewardCenterSettings } from '../../../services/rewardCenterService';
import { InviteLinkConfig } from '../../../types/rewardCenter';
import { Copy, Share2, Users, CheckCircle, Clock, ShieldCheck, Gift, AlertCircle, Lock } from 'lucide-react';

interface InviteFriendsRewardPageProps {
  onBack: () => void;
}

export const InviteFriendsRewardPage: React.FC<InviteFriendsRewardPageProps> = ({ onBack }) => {
  const { user, wallet, registeredUsers, showToast } = useApp();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [inviteConfig, setInviteConfig] = useState<InviteLinkConfig | null>(null);
  const [inviteBonusAmount, setInviteBonusAmount] = useState<number>(10);
  const [inviteTerms, setInviteTerms] = useState<string>('');
  const [loadingConfig, setLoadingConfig] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getRewardCenterSettings().then(s => {
      if (!isMounted) return;
      if (s?.inviteLinkConfig) {
        setInviteConfig(s.inviteLinkConfig);
      }
      if (s?.inviteBonusAmount !== undefined) {
        setInviteBonusAmount(s.inviteBonusAmount);
      }
      if (s?.inviteTerms) {
        setInviteTerms(s.inviteTerms);
      }
      setLoadingConfig(false);
    }).catch(() => {
      if (isMounted) setLoadingConfig(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const referralCode = user?.referralCode || user?.phone || 'GL000000';
  const isInviteEnabled = inviteConfig ? inviteConfig.enabled !== false : true;
  
  // Real Admin configured link strictly (no hardcoded demo link)
  const linkTemplate = inviteConfig?.linkTemplate?.trim() || (typeof window !== 'undefined' ? `${window.location.origin}/?ref={code}` : 'https://goodlife.app/?ref={code}');
  const inviteLink = isInviteEnabled
    ? (linkTemplate.includes('{code}')
        ? linkTemplate.replace(/\{code\}/g, referralCode)
        : (linkTemplate.includes('?') ? `${linkTemplate}&ref=${referralCode}` : `${linkTemplate}?ref=${referralCode}`))
    : '';

  // Filter real invited users matching logged in user's referralCode or phone
  const myInvitedUsers = (registeredUsers || []).filter(u => {
    if (!u) return false;
    return (
      (u.referredBy && u.referredBy === referralCode) ||
      (u.referredBy && user.phone && u.referredBy === user.phone)
    );
  });

  const verifiedCount = myInvitedUsers.filter(u => u.isVerified).length;
  const referralIncome = Number(wallet?.incomeBreakdown?.referralIncome || 0);

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(referralCode);
    setCopiedCode(true);
    showToast(`রেফারেল কোড "${referralCode}" কপি করা হয়েছে!`);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleCopyLink = () => {
    if (!isInviteEnabled) {
      showToast('অ্যাডমিন কর্তৃক আমন্ত্রণ লিংক সাময়িকভাবে বন্ধ রাখা হয়েছে।');
      return;
    }
    navigator.clipboard?.writeText(inviteLink);
    setCopiedLink(true);
    showToast('আমন্ত্রণ লিংক ক্লিপবোর্ডে কপি করা হয়েছে!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShare = async () => {
    if (!isInviteEnabled) {
      showToast('অ্যাডমিন কর্তৃক আমন্ত্রণ লিংক সাময়িকভাবে বন্ধ রাখা হয়েছে।');
      return;
    }
    const shareMessage = inviteConfig?.shareMessage || 'Good Life প্ল্যাটফর্মে যোগ দিন এবং সাথে সাথে সাইন-আপ ও রিওয়ার্ড বোনাস গ্রহণ করুন!';
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Good Life মেম্বারশিপ আমন্ত্রণ',
          text: `${shareMessage} আমার রেফারেল কোড: ${referralCode}`,
          url: inviteLink
        });
      } catch {
        // user cancelled or not supported
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex flex-col font-sans pb-10">
      {/* Dark Maroon Top Bar */}
      <RewardCenterHeader
        title="বন্ধুদের আমন্ত্রণ জানান"
        onBack={onBack}
      />

      {/* Rose-Red Gradient Profile Banner */}
      <RewardCenterProfileBanner
        user={user}
        balance={wallet?.balance || 0}
        theme="rose"
      />

      <div className="p-3.5 space-y-3.5 max-w-lg mx-auto w-full">
        {!isInviteEnabled && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-center gap-2.5 text-amber-900 text-xs font-semibold">
            <Lock className="w-5 h-5 text-amber-600 shrink-0" />
            <span>অ্যাডমিন কর্তৃক বন্ধুদের আমন্ত্রণ লিংক ফিচারটি সাময়িকভাবে বন্ধ রাখা হয়েছে।</span>
          </div>
        )}

        {/* Referral Code & Link Box */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 space-y-3">
          <div>
            <span className="text-[11px] font-bold text-gray-400 block uppercase tracking-wider">
              আপনার রেফারেল কোড
            </span>
            <div className="flex items-center justify-between bg-gray-50 rounded-xl p-2.5 mt-1 border border-gray-100">
              <span className="font-mono font-black text-lg text-gray-900 tracking-wider">
                {referralCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="px-3.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedCode ? 'কপি হয়েছে' : 'কপি করুন'}</span>
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                আমন্ত্রণ লিংক
              </span>
              {!isInviteEnabled && (
                <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">
                  নিষ্ক্রিয়
                </span>
              )}
            </div>

            {isInviteEnabled ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  readOnly
                  value={inviteLink}
                  className="flex-1 bg-gray-50 rounded-xl px-3 py-2 text-xs text-gray-700 border border-gray-100 font-mono truncate"
                />
                <button
                  onClick={handleCopyLink}
                  className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all active:scale-95 cursor-pointer"
                  title="কপি লিংক"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={handleShare}
                  className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>শেয়ার</span>
                </button>
              </div>
            ) : (
              <div className="mt-1 bg-gray-50 rounded-xl p-3 text-xs text-gray-400 font-medium border border-gray-100 flex items-center gap-2">
                <Lock className="w-4 h-4 text-gray-400" />
                <span>আমন্ত্রণ লিংক বর্তমানে অ্যাডমিন দ্বারা স্থগিত রয়েছে</span>
              </div>
            )}
          </div>
        </div>

        {/* Real Stats Grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white rounded-2xl p-3 shadow-xs border border-gray-100 text-center">
            <span className="text-lg font-black text-gray-900 block">
              {myInvitedUsers.length}
            </span>
            <span className="text-[10px] text-gray-500 font-semibold mt-0.5 block leading-tight">
              মোট আমন্ত্রিত
            </span>
          </div>

          <div className="bg-white rounded-2xl p-3 shadow-xs border border-gray-100 text-center">
            <span className="text-lg font-black text-emerald-600 block">
              {verifiedCount}
            </span>
            <span className="text-[10px] text-gray-500 font-semibold mt-0.5 block leading-tight">
              ভেরিফাইড মেম্বার
            </span>
          </div>

          <div className="bg-white rounded-2xl p-3 shadow-xs border border-gray-100 text-center">
            <span className="text-lg font-black text-[#FF4D4F] block">
              ৳ {referralIncome.toFixed(2)}
            </span>
            <span className="text-[10px] text-gray-500 font-semibold mt-0.5 block leading-tight">
              রেফারেল আয়
            </span>
          </div>
        </div>

        {/* Real Referral Members History */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-gray-700 px-1">
            আমার আমন্ত্রিত বন্ধুদের তালিকা ({myInvitedUsers.length})
          </h3>

          <div className="bg-white rounded-2xl shadow-xs border border-gray-100 divide-y divide-gray-100 overflow-hidden">
            {myInvitedUsers.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">
                <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                এখনও পর্যন্ত কোনো বন্ধু যুক্ত হননি। বন্ধুদের লিংক শেয়ার করুন!
              </div>
            ) : (
              myInvitedUsers.map((member) => (
                <div
                  key={member.id}
                  className="p-3 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs">
                      {(member.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">
                        {member.name || 'নতুন সদস্য'}
                      </p>
                      <p className="text-[10px] text-gray-400 font-mono">
                        {member.phone ? `${member.phone.substring(0, 3)}****${member.phone.substring(7)}` : 'মোবাইল গোপন'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        member.isVerified
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-amber-50 text-amber-600'
                      }`}
                    >
                      {member.isVerified ? 'ভেরিফাইড' : 'পেন্ডিং'}
                    </span>
                    <p className="text-[9px] text-gray-400 mt-0.5">
                      {member.joinedDate || 'সম্প্রতি'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bonus & Rules Card */}
        {inviteTerms ? (
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 space-y-2">
            <h4 className="font-bold text-gray-800 flex items-center gap-1.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>আমন্ত্রণ নিয়ম ও শর্তাবলী</span>
            </h4>
            <p className="whitespace-pre-line text-gray-500 text-[11px] leading-relaxed">
              {inviteTerms}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Gift className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <span className="font-bold text-gray-800 block">প্রতি সফল আমন্ত্রণে ৳{inviteBonusAmount.toFixed(2)} বোনাস</span>
              <span className="text-[11px] text-gray-500 block">বন্ধু অ্যাকাউন্ট খুলে ভেরিফাই করলে আপনার ওয়ালেটে রেফারেল বোনাস জমা হবে।</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
