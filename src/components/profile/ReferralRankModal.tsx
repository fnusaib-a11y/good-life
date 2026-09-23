import React from 'react';
import { 
  X, 
  Award, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  Users, 
  Info,
  Gift
} from 'lucide-react';
import { REFERRAL_RANKS, UserReferralRankInfo } from '../../lib/referralRank';

interface ReferralRankModalProps {
  rankInfo: UserReferralRankInfo;
  isBn: boolean;
  onClose: () => void;
  onOpenReferralModal?: () => void;
}

export const ReferralRankModal: React.FC<ReferralRankModalProps> = ({
  rankInfo,
  isBn,
  onClose,
  onOpenReferralModal
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 sm:p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-scale-up border border-gray-100">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-600 px-5 py-4 flex items-center justify-between text-white shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-xs shadow-inner">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg text-white">
                  {isBn ? 'রেফারেল র‍্যাংকিং ও লেভেল' : 'Referral Ranks & Levels'}
                </h3>
                <span className="text-[10px] font-black bg-white/25 px-2 py-0.5 rounded-full border border-white/30 text-white">
                  {rankInfo.badge}
                </span>
              </div>
              <p className="text-[11px] text-amber-100 font-medium">
                {isBn ? 'সক্রিয় ভেরিফাইড রেফারেলের মাধ্যমে র‍্যাংক বৃদ্ধি' : 'Rank up via verified active referrals'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 active:scale-95 transition-all text-white cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          
          {/* Current Rank Status Card */}
          <div className={`bg-gradient-to-br ${rankInfo.gradientClass} rounded-3xl p-5 text-white shadow-lg relative overflow-hidden`}>
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-36 h-36 bg-black/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full backdrop-blur-xs border border-white/20">
                  {isBn ? 'আপনার বর্তমান র‍্যাংক' : 'Your Current Rank'}
                </span>
                <span className="text-2xl">{rankInfo.icon}</span>
              </div>

              <div>
                <h4 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                  <span>{isBn ? rankInfo.nameBn : rankInfo.nameEn}</span>
                </h4>
                <p className="text-xs text-white/80 font-medium mt-0.5">
                  {isBn ? `লেভেল ${rankInfo.level} পার্টনারশিপ স্তর` : `Level ${rankInfo.level} Partner Tier`}
                </p>
              </div>

              {/* Progress Bar to next level */}
              <div className="bg-black/20 backdrop-blur-md rounded-2xl p-3 border border-white/15 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                    <span>{isBn ? `ভেরিফাইড রেফার: ${rankInfo.verifiedCount} জন` : `Verified: ${rankInfo.verifiedCount}`}</span>
                  </span>
                  <span>
                    {rankInfo.nextTier && rankInfo.targetForNext !== null 
                      ? (isBn ? `পরবর্তী টার্গেট: ${rankInfo.targetForNext} জন` : `Next Target: ${rankInfo.targetForNext}`)
                      : (isBn ? 'সর্বোচ্চ র‍্যাংক অর্জিত 🏆' : 'Max Rank Reached 🏆')}
                  </span>
                </div>

                <div className="w-full h-2.5 bg-black/30 rounded-full overflow-hidden p-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-300 via-amber-300 to-emerald-400 rounded-full transition-all duration-700 shadow-sm"
                    style={{ width: `${rankInfo.progressPercent}%` }}
                  />
                </div>

                {rankInfo.nextTier && rankInfo.remainingForNext > 0 ? (
                  <p className="text-[11px] text-amber-100 font-semibold">
                    {isBn 
                      ? `পরবর্তী র‍্যাংক '${rankInfo.nextTier.nameBn}'-এ পৌঁছাতে আর মাত্র ${rankInfo.remainingForNext} টি ভেরিফাইড রেফার প্রয়োজন!`
                      : `Only ${rankInfo.remainingForNext} more verified referral(s) needed for ${rankInfo.nextTier.nameEn}!`}
                  </p>
                ) : (
                  <p className="text-[11px] text-emerald-200 font-semibold">
                    {isBn ? 'অভিনন্দন! আপনি সর্বোচ্চ ক্রাউন র‍্যাংকে রয়েছেন।' : 'Congratulations! You reached the pinnacle rank.'}
                  </p>
                )}
              </div>

              {/* Verified vs Pending Stats in Current Card */}
              <div className="grid grid-cols-2 gap-2 text-center pt-0.5">
                <div className="bg-white/15 rounded-xl p-2 border border-white/15">
                  <span className="text-[10px] text-white/80 block font-semibold">
                    {isBn ? 'ভেরিফাইড (বোনাস অর্জিত)' : 'Verified (Active)'}
                  </span>
                  <span className="text-lg font-black text-white">
                    {rankInfo.verifiedCount} <span className="text-xs font-semibold">{isBn ? 'জন' : ''}</span>
                  </span>
                </div>
                <div className="bg-white/15 rounded-xl p-2 border border-white/15">
                  <span className="text-[10px] text-white/80 block font-semibold">
                    {isBn ? 'ভেরিফিকেশন অপেক্ষমাণ' : 'Pending Verification'}
                  </span>
                  <span className="text-lg font-black text-yellow-300">
                    {rankInfo.pendingCount} <span className="text-xs font-semibold">{isBn ? 'জন' : ''}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* CRITICAL POLICY / RULE BANNER */}
          <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-2 border-amber-300/80 rounded-2xl p-4 text-amber-950 space-y-2 shadow-xs">
            <div className="flex items-center gap-2 text-amber-900 font-black text-sm">
              <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
              <span>{isBn ? 'রেফারেল বোনাস ও র‍্যাংক বৃদ্ধি নীতি:' : 'Referral Bonus & Ranking Policy:'}</span>
            </div>
            <div className="text-xs leading-relaxed text-amber-900 font-medium space-y-1.5 pl-1">
              <p className="flex items-start gap-1.5">
                <span className="text-amber-600 font-bold">•</span>
                <span>
                  {isBn 
                    ? 'আপনার রেফার কোড দিয়ে কেউ রেজিস্ট্রেশন করলে তিনি আপনার রেফারেল তালিকায় যুক্ত হবেন।'
                    : 'When someone signs up with your code, they join your referral list.'}
                </span>
              </p>
              <p className="flex items-start gap-1.5">
                <span className="text-rose-600 font-black">★</span>
                <span className="font-bold text-rose-950">
                  {isBn 
                    ? 'রেফার করা ইউজার যতক্ষণ পর্যন্ত তাদের আইডি এক্টিভ/ভেরিফাই না করবে, তত সময় পর্যন্ত রেফার বোনাস (৳২৫) ওয়ালেটে জমা হবে না এবং র‍্যাংক গণনা শুরু হবে না।'
                    : 'The referral bonus will NOT be credited to your wallet until the referred user activates/verifies their ID.'}
                </span>
              </p>
              <p className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span className="text-emerald-950 font-bold">
                  {isBn 
                    ? 'রেফার্ড ইউজারের আইডি ভেরিফাই হওয়া মাত্রই সাথে সাথে আপনার ওয়ালেটে ৳২৫ বোনাস যুক্ত হবে এবং আপনার র‍্যাংক বৃদ্ধি পাবে!'
                    : 'As soon as their ID is verified/activated, ৳25 bonus is instantly credited to your wallet and your rank progresses!'}
                </span>
              </p>
            </div>
          </div>

          {/* ALL 6 RANK TIERS ROADMAP */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h5 className="text-sm font-black text-gray-900 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-amber-600" />
                <span>{isBn ? 'সকল র‍্যাংক টিয়ার ও সুবিধাসমূহ' : 'All Rank Tiers & Roadmap'}</span>
              </h5>
              <span className="text-[11px] font-bold text-gray-500">
                {isBn ? 'মোট ৬টি স্তর' : '6 Tiers'}
              </span>
            </div>

            <div className="space-y-2.5">
              {REFERRAL_RANKS.map((tier) => {
                const isCurrent = tier.level === rankInfo.level;
                const isUnlocked = rankInfo.verifiedCount >= tier.minReferrals;

                return (
                  <div
                    key={tier.level}
                    className={`rounded-2xl p-3.5 border transition-all ${
                      isCurrent
                        ? `${tier.cardBgClass} ${tier.borderClass} border-2 shadow-md ring-2 ring-amber-400/40`
                        : isUnlocked
                        ? 'bg-gray-50/80 border-gray-200'
                        : 'bg-white border-gray-100 opacity-90'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                          isCurrent 
                            ? `bg-gradient-to-br ${tier.gradientClass} text-white shadow-md`
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {tier.icon}
                        </div>

                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h6 className="font-black text-xs sm:text-sm text-gray-900 leading-tight">
                              {isBn ? tier.nameBn : tier.nameEn}
                            </h6>
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${tier.badgeBgClass} ${tier.badgeTextClass}`}>
                              {tier.badge}
                            </span>
                            {isCurrent && (
                              <span className="text-[9.5px] font-black bg-amber-500 text-white px-2 py-0.5 rounded-full shadow-xs animate-pulse">
                                {isBn ? 'আপনার বর্তমান র‍্যাংক' : 'Current Rank'}
                              </span>
                            )}
                          </div>

                          <p className="text-[11px] font-bold text-gray-600">
                            {isBn ? 'প্রয়োজন:' : 'Requirement:'}{' '}
                            <span className="text-amber-700 font-extrabold">
                              {tier.maxReferrals !== null
                                ? `${tier.minReferrals} - ${tier.maxReferrals} টি ভেরিফাইড রেফার`
                                : `${tier.minReferrals}+ টি ভেরিফাইড রেফার`}
                            </span>
                          </p>

                          {/* Perks List */}
                          <ul className="text-[10.5px] text-gray-600 space-y-0.5 pt-1">
                            {tier.perksBn.map((perk, pIdx) => (
                              <li key={pIdx} className="flex items-center gap-1.5">
                                <Sparkles className="w-2.5 h-2.5 text-amber-500 shrink-0" />
                                <span>{perk}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        {isUnlocked ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-1 rounded-lg">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{isBn ? 'আনলকড' : 'Unlocked'}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">
                            <Clock className="w-3 h-3" />
                            <span>
                              {isBn 
                                ? `বাকি ${tier.minReferrals - rankInfo.verifiedCount} টি`
                                : `${tier.minReferrals - rankInfo.verifiedCount} left`}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-gray-50 border-t border-gray-100 flex items-center gap-2">
          {onOpenReferralModal && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenReferralModal();
              }}
              className="flex-1 py-2.5 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 active:scale-98 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>{isBn ? 'রেফারেল টিম দেখুন' : 'View Referral Team'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className={`${onOpenReferralModal ? 'px-4' : 'w-full'} py-2.5 bg-gray-900 hover:bg-gray-800 active:scale-98 text-white font-black text-xs rounded-xl transition-all cursor-pointer`}
          >
            {isBn ? 'ঠিক আছে' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
