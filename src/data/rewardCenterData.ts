import { RewardCenterOptionConfig } from '../types';

/**
 * Default Admin-Controlled Reward Center Options Database Structure
 * Designed to mirror the reference image layout while allowing Admin customization.
 */
export const DEFAULT_REWARD_CENTER_OPTIONS: RewardCenterOptionConfig[] = [
  {
    id: 'claim',
    title: 'দাবি করা',
    titleEn: 'Claim Rewards',
    icon: 'gift',
    gradient: 'from-[#00D26A] via-[#059669] to-[#047857]',
    badgeCount: 3,
    enabled: true,
    description: 'আপনার সক্রিয় টাস্ক, ক্যাম্পেইন এবং অর্জিত উপহারসমূহ দাবি করার হাব।',
    descriptionEn: 'Hub for claiming completed tasks, campaigns, and earned gift rewards.',
    rules: [
      'সক্রিয় ক্যাম্পেইন বা টাস্কের শর্ত পূরণ হলে রিওয়ার্ড দাবি করা যাবে',
      'দাবি করার পর রিয়েল-টাইম ভেরিফিকেশন সাপেক্ষে ওয়ালেটে যুক্ত হবে'
    ],
    requiredConditions: 'টাস্ক সম্পন্ন বা ক্যাম্পেইন যোগ্যতা অর্জন',
    order: 1
  },
  {
    id: 'signin',
    title: 'সাইন ইন',
    titleEn: 'Daily Sign-In',
    icon: 'calendar',
    gradient: 'from-[#00C6FF] via-[#0072FF] to-[#1D4ED8]',
    enabled: true,
    description: 'প্রতিদিন অ্যাপে সাইন ইন করে দৈনিক অ্যাটেনডেন্স স্ট্রিক চালু রাখুন।',
    descriptionEn: 'Sign in daily to maintain attendance streak and unlock VIP perks.',
    rules: [
      'প্রতি ২৪ ঘণ্টায় একবার সাইন ইন রেকর্ড করা যাবে',
      'টানা ৭ দিন সাইন ইন বজায় রাখলে বিশেষ অগ্রাধিকার সুবিধা'
    ],
    requiredConditions: 'সক্রিয় অ্যাকাউন্ট লগইন',
    order: 2
  },
  {
    id: 'rescue_fund',
    title: 'উদ্ধার তহবিল',
    titleEn: 'Rescue Fund',
    icon: 'coins',
    gradient: 'from-[#FFA726] via-[#FB8C00] to-[#E65100]',
    enabled: true,
    description: 'মেম্বারদের বিশেষ আর্থিক সুরক্ষা, ক্যাশব্যাক ও সহায়তা তহবিল।',
    descriptionEn: 'Special member protection, cashback assistance, and relief fund.',
    rules: [
      'নির্দিষ্ট মেম্বারশিপ টায়ার অনুযায়ী ফান্ড সহায়তা প্রদান করা হয়',
      'প্রয়োজনে এডমিন পর্যালোচনা সাপেক্ষে তহবিল সক্রিয় হয়'
    ],
    requiredConditions: 'ভেরিফাইড মেম্বারশিপ স্ট্যাটাস',
    order: 3
  },
  {
    id: 'invite',
    title: 'বন্ধুদের আমন্ত্রণ জানান',
    titleEn: 'Invite Friends',
    icon: 'users',
    gradient: 'from-[#FF6584] via-[#F43F5E] to-[#E11D48]',
    enabled: true,
    description: 'রেফারেল লিংক শেয়ার করে বন্ধুদের আমন্ত্রণ জানান ও লাইফটাইম রেফারেল কমিশন উপভোগ করুন।',
    descriptionEn: 'Share referral link to invite friends and enjoy lifetime referral bonuses.',
    rules: [
      'বন্ধু আপনার সঠিক রেফারেল কোড বা লিংক ব্যবহার করে যুক্ত হতে হবে',
      'বন্ধুর ভেরিফিকেশন সম্পন্ন হলে ওয়ালেটে কমিশন যুক্ত হবে'
    ],
    requiredConditions: 'ইউনিক রেফারেল কোড শেয়ারিং',
    order: 4
  },
  {
    id: 'promo_code',
    title: 'প্রচার কোড',
    titleEn: 'Promo Code',
    icon: 'promo',
    gradient: 'from-[#00E5FF] via-[#00B4D8] to-[#0077B6]',
    enabled: true,
    description: 'অফিসিয়াল টেলিগ্রাম বা সোশ্যাল চ্যানেল থেকে প্রাপ্ত প্রচার কোড রিডিম করুন।',
    descriptionEn: 'Redeem promotional voucher codes from official Telegram and social channels.',
    rules: [
      'একটি প্রচার কোড প্রতি অ্যাকাউন্ট থেকে একবারই রিডিমযোগ্য',
      'মেয়াদোত্তীর্ণ বা ভুল কোড স্বয়ংক্রিয়ভাবে বাতিল হবে'
    ],
    requiredConditions: 'বৈধ প্রমো ভাউচার কোড',
    order: 5
  },
  {
    id: 'temu_ticket',
    title: 'টেমু টিকিট',
    titleEn: 'Temu Ticket',
    icon: 'ticket',
    gradient: 'from-[#0A2540] via-[#1E40AF] to-[#0284C7]',
    enabled: true,
    description: 'টেমু টিকিট বোনাস, স্বাগত উপহার ড্র ও বিশেষ টিকিট লেনদেন ইতিহাস হাব।',
    descriptionEn: 'Temu ticket bonuses, welcome reward draws, and lucky ticket history hub.',
    rules: [
      'সদস্যপদ কার্যক্রম ও ড্র টিকিট অনুযায়ী বোনাস ক্রেডিট হয়',
      'প্রযোজ্য ক্ষেত্রে টিকিটের পয়েন্ট ওয়ালেটে রূপান্তর করা যায়'
    ],
    requiredConditions: 'সক্রিয় অ্যাকাউন্ট বা টিকিট ক্যাম্পেইন অংশগ্রহণ',
    order: 6
  }
];
