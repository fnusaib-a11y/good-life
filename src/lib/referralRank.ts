export interface ReferralRankTier {
  level: number;
  nameBn: string;
  nameEn: string;
  badge: string;
  minReferrals: number;
  maxReferrals: number | null;
  targetForNext: number | null;
  icon: string;
  gradientClass: string;
  badgeBgClass: string;
  badgeTextClass: string;
  borderClass: string;
  cardBgClass: string;
  perksBn: string[];
}

export const REFERRAL_RANKS: ReferralRankTier[] = [
  {
    level: 1,
    nameBn: 'ব্রোঞ্জ মেম্বার',
    nameEn: 'Bronze Member',
    badge: '🥉 Bronze',
    minReferrals: 0,
    maxReferrals: 2,
    targetForNext: 3,
    icon: '🥉',
    gradientClass: 'from-amber-700 via-amber-800 to-amber-900',
    badgeBgClass: 'bg-amber-100',
    badgeTextClass: 'text-amber-900 border-amber-300',
    borderClass: 'border-amber-300',
    cardBgClass: 'bg-amber-50/70',
    perksBn: [
      'Good Life প্ল্যাটফর্মে প্রারম্ভিক সদস্য সুবিধা',
      'প্রতি ভেরিফাইড রেফারে ৳২৫ সরাসরি ওয়ালেট বোনাস',
      'দৈনিক মাইক্রো জব ও বিজ্ঞাপন দেখে আয়'
    ]
  },
  {
    level: 2,
    nameBn: 'সিলভার পার্টনার',
    nameEn: 'Silver Partner',
    badge: '🥈 Silver',
    minReferrals: 3,
    maxReferrals: 7,
    targetForNext: 8,
    icon: '🥈',
    gradientClass: 'from-slate-500 via-slate-600 to-slate-700',
    badgeBgClass: 'bg-slate-100',
    badgeTextClass: 'text-slate-800 border-slate-300',
    borderClass: 'border-slate-300',
    cardBgClass: 'bg-slate-50/70',
    perksBn: [
      'প্রোফাইলে এক্সক্লুসিভ সিলভার পার্টনার ব্যাজ',
      'দ্রুত সাপোর্ট ও স্পেশাল নোটিফিকেশন',
      'উইকলি লিডারবোর্ড বোনাস ড্র-তে অগ্রাধিকার'
    ]
  },
  {
    level: 3,
    nameBn: 'গোল্ড লিডার',
    nameEn: 'Gold Leader',
    badge: '🥇 Gold',
    minReferrals: 8,
    maxReferrals: 14,
    targetForNext: 15,
    icon: '🥇',
    gradientClass: 'from-amber-500 via-yellow-500 to-amber-600',
    badgeBgClass: 'bg-yellow-100',
    badgeTextClass: 'text-yellow-900 border-yellow-300',
    borderClass: 'border-yellow-400',
    cardBgClass: 'bg-yellow-50/70',
    perksBn: [
      'গোল্ড লিডার ট্রফি ও ভেরিফাইড রিকগনিশন',
      'অগ্রাধিকারভিত্তিতে দ্রুত টাকা উত্তোলন (Withdrawal)',
      'মাল্টি-লেভেল টিম কমিশন ট্র্যাকিং এক্সেস'
    ]
  },
  {
    level: 4,
    nameBn: 'প্ল্যাটিনাম ম্যানেজার',
    nameEn: 'Platinum Manager',
    badge: '💠 Platinum',
    minReferrals: 15,
    maxReferrals: 29,
    targetForNext: 30,
    icon: '💠',
    gradientClass: 'from-cyan-600 via-sky-600 to-blue-700',
    badgeBgClass: 'bg-cyan-100',
    badgeTextClass: 'text-cyan-900 border-cyan-300',
    borderClass: 'border-cyan-400',
    cardBgClass: 'bg-cyan-50/70',
    perksBn: [
      'প্ল্যাটিনাম ম্যানেজার ভিআইপি ক্লাব মেম্বারশিপ',
      'উইথড্রলে সর্বনিম্ন প্রসেসিং সময়',
      'স্পেশাল মান্থলি পারফরম্যান্স ক্যাশ রিওয়ার্ড'
    ]
  },
  {
    level: 5,
    nameBn: 'ডায়মন্ড ডিরেক্টর',
    nameEn: 'Diamond Director',
    badge: '💎 Diamond',
    minReferrals: 30,
    maxReferrals: 49,
    targetForNext: 50,
    icon: '💎',
    gradientClass: 'from-purple-600 via-indigo-600 to-purple-800',
    badgeBgClass: 'bg-purple-100',
    badgeTextClass: 'text-purple-900 border-purple-300',
    borderClass: 'border-purple-400',
    cardBgClass: 'bg-purple-50/70',
    perksBn: [
      'ডায়মন্ড ডিরেক্টর এক্সক্লুসিভ অ্যাওয়ার্ড',
      'সর্বোচ্চ দৈনিক উইথড্রল লিমিট সুবিধা',
      'এডমিন ও ম্যানেজমেন্ট ডিরেক্ট সাপোর্ট হটলাইন'
    ]
  },
  {
    level: 6,
    nameBn: 'ক্রাউন অ্যাম্বাসেডর',
    nameEn: 'Crown Ambassador',
    badge: '👑 Crown',
    minReferrals: 50,
    maxReferrals: null,
    targetForNext: null,
    icon: '👑',
    gradientClass: 'from-rose-600 via-amber-600 to-yellow-500',
    badgeBgClass: 'bg-gradient-to-r from-amber-100 to-rose-100',
    badgeTextClass: 'text-rose-950 border-amber-400 font-black',
    borderClass: 'border-amber-500',
    cardBgClass: 'bg-gradient-to-r from-amber-50/80 to-rose-50/80',
    perksBn: [
      'Good Life প্ল্যাটফর্মের সর্বোচ্চ সম্মানিত র‍্যাংক',
      'লাইফটাইম রয়্যালটি প্রফিট শেয়ারিং সুবিধা',
      'বার্ষিক এন্টারপ্রেনার সামিট ও গিফট হ্যাম্পার'
    ]
  }
];

export interface UserReferralRankInfo extends ReferralRankTier {
  verifiedCount: number;
  pendingCount: number;
  totalReferralsCount: number;
  remainingForNext: number;
  progressPercent: number;
  nextTier: ReferralRankTier | null;
}

/**
 * Calculate user's referral rank based on verified/active referrals count
 */
export function calculateReferralRank(verifiedCount: number, pendingCount: number = 0): UserReferralRankInfo {
  const count = Math.max(0, verifiedCount);
  
  let currentTier = REFERRAL_RANKS[0];
  for (let i = REFERRAL_RANKS.length - 1; i >= 0; i--) {
    if (count >= REFERRAL_RANKS[i].minReferrals) {
      currentTier = REFERRAL_RANKS[i];
      break;
    }
  }

  const nextTierIndex = REFERRAL_RANKS.findIndex(r => r.level === currentTier.level + 1);
  const nextTier = nextTierIndex >= 0 ? REFERRAL_RANKS[nextTierIndex] : null;

  let progressPercent = 100;
  let remainingForNext = 0;

  if (nextTier && currentTier.targetForNext !== null) {
    const rangeSpan = currentTier.targetForNext - currentTier.minReferrals;
    const progressInCurrent = count - currentTier.minReferrals;
    progressPercent = Math.min(100, Math.max(0, Math.round((progressInCurrent / rangeSpan) * 100)));
    remainingForNext = Math.max(0, currentTier.targetForNext - count);
  }

  return {
    ...currentTier,
    verifiedCount: count,
    pendingCount: Math.max(0, pendingCount),
    totalReferralsCount: count + Math.max(0, pendingCount),
    remainingForNext,
    progressPercent,
    nextTier
  };
}
