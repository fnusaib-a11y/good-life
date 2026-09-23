import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  ShoppingBag, 
  CheckCircle2, 
  ShieldCheck, 
  Send,
  Lock,
  KeyRound,
  LogOut,
  AlertCircle,
  TrendingUp,
  Wallet,
  Package,
  PlusCircle,
  Sliders,
  Sparkles,
  ChevronRight,
  Zap,
  Globe,
  ArrowDownLeft,
  Search,
  Layers,
  ChevronLeft,
  Menu,
  PlaySquare,
  GraduationCap,
  Volume2,
  VolumeX,
  Bell,
  HelpCircle,
  Keyboard,
  Store,
  Megaphone,
  Gift
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { isAuthorizedAdminPhone } from '../../lib/firebase';
import { 
  setupAdminFirestoreListeners, 
  getAdminSoundEnabled, 
  setAdminSoundEnabled,
  playAdminAlertChime
} from '../../lib/adminRealtimeService';
import { AdminOverviewTab } from './AdminOverviewTab';
import { AdminButtonsTab } from './AdminButtonsTab';
import { AdminPostsTab } from './AdminPostsTab';
import { AdminBannersTab } from './AdminBannersTab';
import { AdminJobSubmissionsTab } from './AdminJobSubmissionsTab';
import { AdminApprovalQueue } from './AdminApprovalQueue';
import { AdminWithdrawalsTab } from './AdminWithdrawalsTab';
import { AdminOrdersTab } from './AdminOrdersTab';
import { AdminUsersTab } from './AdminUsersTab';
import { AdminProductsTab } from './AdminProductsTab';
import { AdminJobsTab } from './AdminJobsTab';
import { AdminBroadcastTab } from './AdminBroadcastTab';
import { AdminReportsTab } from './AdminReportsTab';
import { AdminSettingsTab } from './AdminSettingsTab';
import { AdminAutoAdsSection } from './AdminAutoAdsSection';
import { AdminApplicationsTab } from './AdminApplicationsTab';
import { AdminAuditTrailTab } from './AdminAuditTrailTab';
import { AdminQuizManagementSection } from './AdminQuizManagementSection';
import { AdminTypingManagementTab } from './AdminTypingManagementTab';
import { AdminSpecialSocialSettingsTab } from './AdminSpecialSocialSettingsTab';
import { AdminShopManagementTab } from './AdminShopManagementTab';
import { AdminVendorManagementTab } from './AdminVendorManagementTab';
import { AdminCourseManagementTab } from './AdminCourseManagementTab';
import { AdminFreelanceManagementTab } from './AdminFreelanceManagementTab';
import { AdminMarketingManagementTab } from './AdminMarketingManagementTab';
import { AdminRewardCenterTab } from './AdminRewardCenterTab';

export type AdminTabType = 
  | 'overview'
  | 'buttons'
  | 'jobs' 
  | 'submissions' 
  | 'applications'
  | 'course_mgmt'
  | 'freelance_mgmt'
  | 'marketing_mgmt'
  | 'reward_center_mgmt'
  | 'autoads'
  | 'posts'
  | 'banners'
  | 'deposits'
  | 'withdrawals' 
  | 'orders' 
  | 'products'
  | 'shops'
  | 'vendors'
  | 'users' 
  | 'broadcast' 
  | 'reports' 
  | 'settings'
  | 'audit'
  | 'quiz'
  | 'typing'
  | 'special_social_settings';

export type AdminCategoryGroup = 'all' | 'finance' | 'jobs' | 'shop' | 'users' | 'system';

interface TabItemConfig {
  id: AdminTabType;
  label: string;
  enLabel: string;
  category: 'overview' | 'finance' | 'jobs' | 'shop' | 'users' | 'system';
  icon: React.ReactNode;
  badge?: number;
  badgeColor?: string;
  description: string;
  searchKeywords: string[];
}

export const AdminDashboardModal: React.FC = () => {
  const { 
    isAdminDashboardOpen, 
    setIsAdminDashboardOpen, 
    jobSubmissions, 
    adMarketingSubmissions,
    orders, 
    withdrawalRequests, 
    depositRequests,
    fetchFreshDeposits,
    reports,
    courseApplications,
    verificationRequests,
    shops,
    vendors,
    user,
    setUser,
    language,
    setLanguage,
    showToast 
  } = useApp();

  const isBn = language === 'bn';

  const [activeTab, setActiveTab] = useState<AdminTabType>('overview');
  const [activeCategory, setActiveCategory] = useState<AdminCategoryGroup>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState('');

  // Real-time alert banner and Sound states
  const [realtimeAlert, setRealtimeAlert] = useState<{ title: string; message: string; type: string; id: string } | null>(null);
  const [isSoundOn, setIsSoundOn] = useState<boolean>(() => getAdminSoundEnabled());

  const isAuthorizedPhone = isAuthorizedAdminPhone(user?.phone);

  const pendingSubmissionsCount = jobSubmissions.filter(s => s.status === 'pending').length;
  const pendingAdMarketingCount = (adMarketingSubmissions || []).filter(s => s.status === 'pending').length;
  const totalSubmissionsPending = pendingSubmissionsCount + pendingAdMarketingCount;
  const pendingApplicationsCount = (courseApplications || []).filter(a => a.status === 'pending').length;
  const pendingDepositsCount = depositRequests.filter(d => (d.status || 'pending').toLowerCase() === 'pending').length;
  const pendingWithdrawalsCount = withdrawalRequests.filter(w => w.status === 'pending').length;
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
  const pendingReportsCount = reports.filter(r => r.status === 'pending').length;
  const pendingVerificationsCount = (verificationRequests || []).filter(v => v.status === 'pending').length;
  const totalPendingUrgent = totalSubmissionsPending + pendingApplicationsCount + pendingDepositsCount + pendingWithdrawalsCount + pendingOrdersCount + pendingReportsCount + pendingVerificationsCount;

  // Setup Firestore & Realtime SSE snapshot listener and custom event listener
  useEffect(() => {
    if (!isAdminDashboardOpen) return;

    // Fetch fresh deposits immediately when admin panel opens
    if (fetchFreshDeposits) {
      fetchFreshDeposits();
    }

    if (!isAuthorizedPhone) return;

    // Start Firestore & SSE real-time listeners
    const unsubscribeFirestore = setupAdminFirestoreListeners();

    // Listen for custom event triggered by listeners or user submissions
    const handleAlert = (e: any) => {
      const detail = e.detail;
      if (detail) {
        setRealtimeAlert({
          title: detail.title || 'নতুন পেন্ডিং রিকোয়েস্ট!',
          message: detail.message || '',
          type: detail.type || 'deposit',
          id: detail.id || ''
        });
      }
    };

    const handleDepositUpdate = () => {
      if (fetchFreshDeposits) {
        fetchFreshDeposits();
      }
    };

    window.addEventListener('goodlife:new_pending_request' as any, handleAlert);
    window.addEventListener('goodlife:deposit_updated' as any, handleDepositUpdate);

    return () => {
      unsubscribeFirestore();
      window.removeEventListener('goodlife:new_pending_request' as any, handleAlert);
      window.removeEventListener('goodlife:deposit_updated' as any, handleDepositUpdate);
    };
  }, [isAdminDashboardOpen, isAuthorizedPhone, fetchFreshDeposits]);

  // Auto-hide alert banner after 8 seconds
  useEffect(() => {
    if (!realtimeAlert) return;
    const timer = setTimeout(() => {
      setRealtimeAlert(null);
    }, 8000);
    return () => clearTimeout(timer);
  }, [realtimeAlert]);

  // Tab definitions grouped with meta info
  const tabConfigs: TabItemConfig[] = useMemo(() => [
    {
      id: 'overview',
      label: 'ওভারভিউ ও মেট্রিক্স',
      enLabel: 'Overview',
      category: 'overview',
      icon: <LayoutDashboard className="w-4 h-4" />,
      description: 'সামগ্রিক পরিসংখ্যান, সেলস ও লাইভ সিস্টেম হেলথ',
      searchKeywords: ['overview', 'ড্যাশবোর্ড', 'মেট্রিক্স', 'summary', 'statistics', 'sales']
    },
    {
      id: 'deposits',
      label: 'ডিপোজিট কিউ',
      enLabel: 'Deposit Queue',
      category: 'finance',
      icon: <ArrowDownLeft className="w-4 h-4" />,
      badge: pendingDepositsCount,
      badgeColor: 'bg-emerald-500',
      description: 'ইউজারদের ডিপোজিট TrxID যাচাই ও ব্যালেন্সে অনুমোদন',
      searchKeywords: ['deposit', 'ডিপোজিট', 'টাকা জমা', 'bKash', 'nagad', 'trxid', 'payment']
    },
    {
      id: 'withdrawals',
      label: 'উইথড্র রিকোয়েস্ট',
      enLabel: 'Withdrawals',
      category: 'finance',
      icon: <Wallet className="w-4 h-4" />,
      badge: pendingWithdrawalsCount,
      badgeColor: 'bg-rose-500',
      description: 'উত্তোলন রিকোয়েস্ট প্রসেসিং ও পে-আউট অনুমোদন',
      searchKeywords: ['withdraw', 'উইথড্র', 'উত্তোলন', 'টাকা তোলা', 'payout', 'bkash', 'nagad']
    },
    {
      id: 'course_mgmt',
      label: 'কোর্স ও আবেদন ম্যানেজমেন্ট',
      enLabel: 'Course Management',
      category: 'jobs',
      icon: <GraduationCap className="w-4 h-4" />,
      badge: pendingApplicationsCount,
      badgeColor: 'bg-emerald-500',
      description: 'রিয়েল ফায়ারবেস ডেটাবেস থেকে কোর্স পোস্ট তৈরি, এডিট, ডিলিট ও আবেদন রিভিউ',
      searchKeywords: ['course', 'কোর্স', 'কোর্স আবেদন', 'training', 'একাডেমি', 'course management']
    },
    {
      id: 'freelance_mgmt',
      label: 'ফ্রিল্যান্সিং অপরচুনিটি',
      enLabel: 'Freelance Management',
      category: 'jobs',
      icon: <Briefcase className="w-4 h-4" />,
      description: 'ফ্রিল্যান্সিং অপরচুনিটি পোস্ট তৈরি, পেমেন্ট ইনফো, এডিট ও ডিলিট',
      searchKeywords: ['freelance', 'ফ্রিল্যান্সিং', 'অপরচুনিটি', 'গিগ', 'gig', 'remote job']
    },
    {
      id: 'marketing_mgmt',
      label: 'বিজ্ঞাপন মার্কেটিং ও প্রুফ জমা',
      enLabel: 'Ad Marketing & Proofs',
      category: 'jobs',
      icon: <Megaphone className="w-4 h-4" />,
      badge: pendingAdMarketingCount,
      badgeColor: 'bg-purple-500',
      description: 'বিজ্ঞাপন মার্কেটিং টাস্ক তৈরি, ইউজার প্রুফ রিভিউ ও রিয়েল রিওয়ার্ড অনুমোদন',
      searchKeywords: ['marketing', 'বিজ্ঞাপন', 'বিজ্ঞাপন মার্কেটিং', 'প্রুফ', 'ad proof', 'campaign']
    },
    {
      id: 'reward_center_mgmt',
      label: 'পুরস্কার সেন্টার (রিয়েল)',
      enLabel: 'Reward Center System',
      category: 'finance',
      icon: <Gift className="w-4 h-4" />,
      description: 'দাবি করা, সাইন ইন, উদ্ধার তহবিল, আমন্ত্রণ, প্রচার কোড ও টেমু টিকিট কন্ট্রোল',
      searchKeywords: ['reward', 'পুরস্কার', 'দাবি', 'সাইন ইন', 'উদ্ধার তহবিল', 'promo', 'temu', 'টিকিট']
    },
    {
      id: 'submissions',
      label: 'জব ও অ্যাড প্রুফ রিভিউ',
      enLabel: 'Job & Ad Proofs',
      category: 'jobs',
      icon: <Briefcase className="w-4 h-4" />,
      badge: totalSubmissionsPending,
      badgeColor: 'bg-sky-500',
      description: 'ইউজারদের মাইক্রো জব ও বিজ্ঞাপন শেয়ার প্রুফ যাচাই ও রিওয়ার্ড অনুমোদন',
      searchKeywords: ['submission', 'review', 'জব রিভিউ', 'প্রুফ', 'কাজ', 'task', 'proof', 'ad', 'বিজ্ঞাপন', 'মার্কেটিং']
    },
    {
      id: 'applications',
      label: 'কোর্স ও ফ্রিল্যান্সিং আবেদন',
      enLabel: 'Course & Freelance Apps',
      category: 'jobs',
      icon: <GraduationCap className="w-4 h-4" />,
      badge: pendingApplicationsCount,
      badgeColor: 'bg-teal-500',
      description: 'ইউজারদের স্কিল কোর্স ভর্তি ও ফ্রিল্যান্সিং জবের আবেদন রিভিউ ও যোগাযোগ',
      searchKeywords: ['application', 'course', 'কোর্স', 'ফ্রিল্যান্সিং', 'আবেদন', 'ভর্তি', 'freelance', 'skill']
    },
    {
      id: 'autoads',
      label: 'বিজ্ঞাপন ম্যানেজমেন্ট (Ads View)',
      enLabel: 'Ads View Setup',
      category: 'jobs',
      icon: <PlaySquare className="w-4 h-4" />,
      description: 'এডস ভিউ তে কোন কোন বিজ্ঞাপন শো হবে, প্রতিটির সময়, রিওয়ার্ড ও কুলডাউন নির্ধারণ',
      searchKeywords: ['ads', 'বিজ্ঞাপন', 'এডস ভিউ', 'auto ads', 'ads view', 'sponsor', 'ব্যানার']
    },
    {
      id: 'quiz',
      label: 'কুইজ ম্যানেজমেন্ট (Quiz)',
      enLabel: 'Quiz Management',
      category: 'jobs',
      icon: <HelpCircle className="w-4 h-4" />,
      description: 'কুইজ সেটিংস, প্রশ্ন তৈরি ও এডিট, দুটি Ad কনফিগার এবং কুইজ হিস্ট্রি মনিটরিং',
      searchKeywords: ['quiz', 'কুইজ', 'কুইজ খেলে আয়', 'প্রশ্ন', 'questions', 'quiz settings', 'quiz history']
    },
    {
      id: 'typing',
      label: 'টাইপিং জব (Typing Jobs)',
      enLabel: 'Typing Job Management',
      category: 'jobs',
      icon: <Keyboard className="w-4 h-4" />,
      description: 'টাইপিং কাজ তৈরি, নির্দেশনা, রেফারেন্স ডকুমেন্ট ও জমাকৃত কাজের রিভিউ অনুমোদন',
      searchKeywords: ['typing', 'টাইপিং', 'টাইপিং জব', 'লেখা', 'image to text', 'pdf to text', 'question', 'প্রশ্নপত্র']
    },
    {
      id: 'jobs',
      label: 'মাইক্রো জবস পোস্ট',
      enLabel: 'Micro Jobs',
      category: 'jobs',
      icon: <PlusCircle className="w-4 h-4" />,
      description: 'নতুন মাইক্রো জব তৈরি, এডিট ও বাজেট ব্যবস্থাপনা',
      searchKeywords: ['jobs', 'মাইক্রো জব', 'post job', 'কাজ', 'new task', 'quiz', 'typing']
    },
    {
      id: 'orders',
      label: 'শপ অর্ডারস',
      enLabel: 'Shop Orders',
      category: 'shop',
      icon: <ShoppingBag className="w-4 h-4" />,
      badge: pendingOrdersCount,
      badgeColor: 'bg-blue-500',
      description: 'কাস্টমারদের শপ অর্ডার ও ডেলিভারি স্ট্যাটাস ট্র্যাকিং',
      searchKeywords: ['order', 'অর্ডার', 'বিক্রি', 'sales', 'delivery', 'shopping']
    },
    {
      id: 'products',
      label: 'পণ্য ও ইনভেন্টরি',
      enLabel: 'Products',
      category: 'shop',
      icon: <Package className="w-4 h-4" />,
      description: 'হোলসেল ও রিসেলিং পণ্য, স্টক ও হট অফার ম্যানেজমেন্ট',
      searchKeywords: ['product', 'পণ্য', 'প্রোডাক্ট', 'inventory', 'stock', 'offer']
    },
    {
      id: 'shops',
      label: 'শপ ও পেমেন্ট ম্যানেজমেন্ট',
      enLabel: 'Shop & Payments',
      category: 'shop',
      icon: <Store className="w-4 h-4" />,
      badge: shops.length > 0 ? shops.length : undefined,
      badgeColor: 'bg-emerald-600',
      description: 'একাধিক শপ তৈরি, লোগো, ডেসক্রিপশন ও বিকাশ/নগদ/রকেট পেমেন্ট নম্বর কন্ট্রোল',
      searchKeywords: ['shop', 'শপ', 'দোকান', 'payment', 'বিকাশ', 'নগদ', 'রকেট', 'মার্চেন্ট', 'shop management']
    },
    {
      id: 'vendors',
      label: 'ভেন্ডর অনুমোদন ও পারমিশন',
      enLabel: 'Vendor Approvals',
      category: 'shop',
      icon: <ShieldCheck className="w-4 h-4" />,
      badge: vendors.length > 0 ? vendors.length : undefined,
      badgeColor: 'bg-indigo-600',
      description: 'ভেন্ডর অনুমোদন, শপে অ্যাসাইন ও পারমিশন (প্রোডাক্ট অ্যাড, স্টক, অর্ডার) কন্ট্রোল',
      searchKeywords: ['vendor', 'ভেন্ডর', 'সেলার', 'merchant', 'permission', 'পারমিশন']
    },
    {
      id: 'users',
      label: 'ইউজার ও KYC',
      enLabel: 'Users & KYC',
      category: 'users',
      icon: <Users className="w-4 h-4" />,
      badge: pendingVerificationsCount > 0 ? pendingVerificationsCount : undefined,
      badgeColor: 'bg-indigo-600',
      description: 'নিবন্ধিত ইউজার প্রোফাইল, ব্যালেন্স অ্যাডজাস্ট ও ভেরিফিকেশন অনুমোদন',
      searchKeywords: ['user', 'ইউজার', 'সদস্য', 'kyc', 'verification', 'balance', 'profile', 'ভেরিফিকেশন']
    },
    {
      id: 'reports',
      label: 'অভিযোগ ও রিপোর্ট',
      enLabel: 'Reports & Tickets',
      category: 'users',
      icon: <AlertCircle className="w-4 h-4" />,
      badge: pendingReportsCount,
      badgeColor: 'bg-amber-500',
      description: 'সাপোর্ট টিকিট ও ইউজারদের অভিযোগ পর্যালোচনা',
      searchKeywords: ['report', 'অভিযোগ', 'support', 'সাপোর্ট', 'ticket', 'issue']
    },
    {
      id: 'buttons',
      label: 'বাটন ও অটো অ্যাডস কন্ট্রোল',
      enLabel: 'Buttons & Auto Ads',
      category: 'system',
      icon: <Sliders className="w-4 h-4" />,
      description: 'অটো বিজ্ঞাপন (Ads View), টাইমার ও আর্নিং বাটন কন্ট্রোল',
      searchKeywords: ['buttons', 'বাটন', 'ads', 'অ্যাড', 'ads view', 'বিজ্ঞাপন', 'toggle', 'features', 'on off', 'ফিচার']
    },
    {
      id: 'banners',
      label: 'ব্যানার স্লাইডার',
      enLabel: 'Banners',
      category: 'system',
      icon: <Layers className="w-4 h-4" />,
      description: 'হোমপেজ প্রোমোশনাল ব্যানার তৈরি ও লিংক সেটআপ',
      searchKeywords: ['banner', 'ব্যানার', 'slider', 'স্লাইডার', 'promo']
    },
    {
      id: 'posts',
      label: 'ভিডিও ও রিলস',
      enLabel: 'Reels & Posts',
      category: 'system',
      icon: <Sparkles className="w-4 h-4" />,
      description: 'শর্ট ভিডিও ও প্রমোশনাল রিলস পোস্ট নিয়ন্ত্রণ',
      searchKeywords: ['reels', 'পোস্ট', 'ভিডিও', 'video', 'shorts']
    },
    {
      id: 'broadcast',
      label: 'নোটিশ ব্রডকাস্ট',
      enLabel: 'Broadcast',
      category: 'system',
      icon: <Send className="w-4 h-4" />,
      description: 'সকল ইউজারের কাছে পুশ নোটিফিকেশন ও নোটিশ প্রেরণ',
      searchKeywords: ['broadcast', 'ব্রডকাস্ট', 'নোটিশ', 'notice', 'announcement']
    },
    {
      id: 'audit',
      label: 'অডিট ট্রেইল (Audit Trail)',
      enLabel: 'Audit Trail',
      category: 'system',
      icon: <ShieldCheck className="w-4 h-4" />,
      description: 'ডিপোজিট অনুমোদন, অর্ডার ভেরিফিকেশন ও রিজেকশন কারণের স্বচ্ছ অডিট লগ',
      searchKeywords: ['audit', 'অডিট', 'ট্রেইল', 'history', 'log', 'স্বচ্ছতা', 'লগ']
    },
    {
      id: 'settings',
      label: 'সিস্টেম সেটিংস',
      enLabel: 'Settings',
      category: 'system',
      icon: <KeyRound className="w-4 h-4" />,
      description: 'রেফার বোনাস, সাপোর্ট ফোন নম্বর ও ভেরিফিকেশন ফি নির্ধারণ',
      searchKeywords: ['settings', 'সেটিংস', 'rules', 'phone', 'support', 'fee', 'পাসওয়ার্ড']
    },
    {
      id: 'special_social_settings',
      label: 'বিশেষ সোশ্যাল ইনকাম',
      enLabel: 'Special Social Income',
      category: 'system',
      icon: <Zap className="w-4 h-4 text-amber-500" />,
      description: 'বিশেষ সোশ্যাল ইনকাম টাস্ক ডিপোজিট রিকোয়ার্ড, ফি ও নোটিশ কনফিগারেশন',
      searchKeywords: ['special social', 'বিশেষ সোশ্যাল', 'social income', 'টাস্ক', 'gmail', 'instagram', 'whatsapp', 'telegram']
    }
  ], [pendingDepositsCount, pendingWithdrawalsCount, pendingSubmissionsCount, pendingOrdersCount, pendingReportsCount, pendingVerificationsCount]);

  // Categories definition
  const categoryFilters = [
    { id: 'all' as AdminCategoryGroup, label: isBn ? 'সকল মেনু' : 'All Menu', count: tabConfigs.length },
    { id: 'finance' as AdminCategoryGroup, label: isBn ? 'পেমেন্ট ও অর্থ' : 'Finance', badge: pendingDepositsCount + pendingWithdrawalsCount },
    { id: 'jobs' as AdminCategoryGroup, label: isBn ? 'কাজ ও টাস্ক' : 'Jobs', badge: pendingSubmissionsCount },
    { id: 'shop' as AdminCategoryGroup, label: isBn ? 'শপ ও অর্ডার' : 'Shop', badge: pendingOrdersCount },
    { id: 'users' as AdminCategoryGroup, label: isBn ? 'ইউজার ও KYC' : 'Users', badge: pendingReportsCount + pendingVerificationsCount },
    { id: 'system' as AdminCategoryGroup, label: isBn ? 'সিস্টেম সেটিংস' : 'System' }
  ];

  // Filtered tab items based on category and search query
  const filteredTabs = useMemo(() => {
    return tabConfigs.filter(tab => {
      const matchesCategory = activeCategory === 'all' || tab.category === activeCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase().trim();
      return (
        tab.label.toLowerCase().includes(query) ||
        tab.enLabel.toLowerCase().includes(query) ||
        tab.description.toLowerCase().includes(query) ||
        tab.searchKeywords.some(kw => kw.toLowerCase().includes(query))
      );
    });
  }, [tabConfigs, activeCategory, searchQuery]);

  if (!isAdminDashboardOpen) return null;

  // If user does not have the authorized admin phone number 01877722819, block completely
  if (!isAuthorizedPhone) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
        <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden p-6 animate-scale-up text-center space-y-4 border border-red-100">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm border border-red-100">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[10px] font-black text-red-800 bg-red-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {isBn ? 'অ্যাক্সেস সংরক্ষিত' : 'Access Restricted'}
            </span>
            <h3 className="text-lg font-black text-gray-950 mt-2">
              {isBn ? 'অননুমোদিত প্রবেশাধিকার' : 'Unauthorized Access'}
            </h3>
            <p className="text-xs text-gray-600 mt-2 leading-relaxed">
              {isBn 
                ? 'অ্যাডমিন প্যানেল শুধুমাত্র অনুমোদিত অ্যাডমিন নম্বর (01877722819) এর জন্য সংরক্ষিত।' 
                : 'The Admin Panel is strictly reserved for the authorized phone number (01877722819).'}
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsAdminDashboardOpen(false)}
              className="w-full py-3 px-4 bg-gray-950 hover:bg-gray-800 text-white font-bold text-xs rounded-2xl shadow-md transition-colors"
            >
              {isBn ? 'প্যানেল বন্ধ করুন' : 'Close Panel'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isAdmin = user.role === 'admin' || user.role === 'super_admin';

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthorizedPhone) {
      setPinError(isBn ? 'শুধুমাত্র 01877722819 নম্বরটি অ্যাডমিন হিসেবে অনুমোদিত!' : 'Only 01877722819 is authorized as admin!');
      return;
    }
    if (enteredPin === '7788' || enteredPin === '1234') {
      setUser(prev => ({
        ...prev,
        role: 'super_admin',
        name: prev.name.includes('Admin') ? prev.name : `${prev.name} (Admin)`,
        isVerified: true
      }));
      setPinError('');
      setEnteredPin('');
      showToast(isBn ? 'সুপার এডমিন মোড সফলভাবে আনলক হয়েছে!' : 'Super Admin Mode Unlocked!');
    } else {
      setPinError(isBn ? 'ভুল পিন কোড! সঠিক এডমিন পিন দিন।' : 'Incorrect Admin PIN code!');
    }
  };

  const handleExitAdmin = () => {
    setUser(prev => ({
      ...prev,
      role: 'user'
    }));
    setIsAdminDashboardOpen(false);
    showToast(isBn ? 'এডমিন মোড লক ও বন্ধ করা হয়েছে।' : 'Admin Mode locked and closed.');
  };

  // If not admin, show locked PIN authorization screen
  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
        <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden p-6 animate-scale-up text-center space-y-4 border border-gray-100">
          <div className="w-16 h-16 bg-gradient-to-tr from-sky-500 to-sky-400 text-white rounded-3xl flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[10px] font-black text-sky-800 bg-sky-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {isBn ? 'সংরক্ষিত নিরাপত্তা জোন' : 'Restricted Security Zone'}
            </span>
            <h3 className="text-lg font-black text-gray-950 mt-1">
              {isBn ? 'সুপার এডমিন কনসোল' : 'Super Admin Console'}
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              {isBn 
                ? 'এডমিন কন্ট্রোল সেন্টারে প্রবেশের জন্য ৪-ডিজিটের সিকিউরিটি পিন প্রদান করুন।' 
                : 'Enter your 4-digit security PIN to access the management portal.'}
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-3 pt-1">
            <div>
              <input
                type="password"
                maxLength={6}
                value={enteredPin}
                onChange={(e) => {
                  setEnteredPin(e.target.value);
                  setPinError('');
                }}
                placeholder="••••"
                className="w-full py-3 px-4 bg-gray-50 border border-gray-300 rounded-2xl text-center text-lg font-black tracking-widest focus:ring-2 focus:ring-sky-400 focus:outline-hidden"
              />
              {pinError && (
                <p className="text-[11px] text-red-600 font-bold mt-1.5 flex items-center justify-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{pinError}</span>
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAdminDashboardOpen(false)}
                className="py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                {isBn ? 'বন্ধ করুন' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="py-3 bg-sky-500 hover:bg-sky-600 text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
              >
                {isBn ? 'আনলক করুন' : 'Unlock Portal'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const currentTabConfig = tabConfigs.find(t => t.id === activeTab) || tabConfigs[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm sm:p-3 lg:p-5 animate-fade-in">
      <div className="bg-[#f8fafc] w-full h-full sm:h-[96vh] sm:max-w-7xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-700/30">
        
        {/* Top Header Bar */}
        <header className="bg-slate-950 text-white px-4 py-3 sm:px-6 sm:py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors cursor-pointer"
              aria-label="Toggle Menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-sky-300 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm sm:text-base text-white tracking-wide">
                  {isBn ? 'অ্যাডমিন কন্ট্রোল হাব' : 'Admin Control Hub'}
                </h3>
                <span className="bg-sky-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                  SUPER ADMIN
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium">
                  {user?.phone ? `${user.phone} • ` : ''}
                  {isBn ? 'পূর্ণ নিয়ন্ত্রণ ক্ষমতা সক্রিয়' : 'Full system privileges'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Tools in Header */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Urgent Tasks Counter Pill */}
            {totalPendingUrgent > 0 ? (
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-300 rounded-full text-xs font-bold">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>{totalPendingUrgent}টি জরুরি অপেক্ষমাণ কাজ</span>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-full text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>সকল কিউ পরিচ্ছন্ন</span>
              </div>
            )}

            {/* Sound Toggle Button */}
            <button
              onClick={() => {
                const next = !isSoundOn;
                setIsSoundOn(next);
                setAdminSoundEnabled(next);
                if (next) playAdminAlertChime();
                showToast(next ? 'লাইভ অ্যালার্ট সাউন্ড চালু করা হয়েছে 🔔' : 'লাইভ অ্যালার্ট সাউন্ড মিউট করা হয়েছে 🔕');
              }}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer border ${
                isSoundOn 
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/60' 
                  : 'bg-slate-800 text-slate-400 border-slate-700/60 hover:bg-slate-700'
              }`}
              title={isSoundOn ? 'সাউন্ড অ্যালার্ট চালু (ক্লিক করে মিউট করুন)' : 'সাউন্ড অ্যালার্ট বন্ধ (ক্লিক করে চালু করুন)'}
            >
              {isSoundOn ? <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
              <span className="hidden sm:inline">{isSoundOn ? 'সাউন্ড অন' : 'মিউট'}</span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
              title="Toggle Language"
            >
              <Globe className="w-3.5 h-3.5 text-sky-400" />
              <span className="uppercase">{language}</span>
            </button>

            {/* Lock / Exit Admin Button */}
            <button
              onClick={handleExitAdmin}
              className="px-2.5 sm:px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
              title="Lock Admin Mode"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isBn ? 'লক' : 'Lock'}</span>
            </button>

            {/* Close Modal */}
            <button
              onClick={() => setIsAdminDashboardOpen(false)}
              className="p-1.5 sm:p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer"
              title="Close Panel"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </header>

        {/* Real-time Notification Banner */}
        {realtimeAlert && (
          <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-sky-950 text-white px-4 py-2.5 flex items-center justify-between gap-3 border-b border-indigo-500/40 shadow-lg z-30 shrink-0 animate-fade-in">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/30 text-indigo-300 flex items-center justify-center shrink-0 border border-indigo-400/40">
                <Bell className="w-4 h-4 animate-bounce text-amber-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-white flex items-center gap-2">
                  <span>{realtimeAlert.title}</span>
                  <span className="text-[10px] bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded-full font-mono">LIVE UPDATE</span>
                </p>
                <p className="text-[11px] text-slate-300 truncate font-medium">
                  {realtimeAlert.message}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  if (realtimeAlert.type === 'verification') setActiveTab('users');
                  else if (realtimeAlert.type === 'order') setActiveTab('orders');
                  else setActiveTab('deposits');
                  setRealtimeAlert(null);
                  setIsMobileMenuOpen(false);
                }}
                className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-950 text-xs font-black rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                {isBn ? 'এখনই দেখুন' : 'Review Now'}
              </button>
              <button
                onClick={() => setRealtimeAlert(null)}
                className="p-1 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Urgent Action Badges Bar (Clickable Shortcuts) */}
        {totalPendingUrgent > 0 && (
          <div className="bg-amber-50 border-b border-amber-200/80 px-4 py-2 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar shrink-0 text-xs">
            <div className="flex items-center gap-2 shrink-0 text-amber-900 font-bold">
              <Zap className="w-4 h-4 text-amber-600 fill-amber-500" />
              <span>{isBn ? 'জরুরি দৃষ্টি আকর্ষণ:' : 'Urgent Actions:'}</span>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              {pendingWithdrawalsCount > 0 && (
                <button
                  onClick={() => { setActiveTab('withdrawals'); setIsMobileMenuOpen(false); }}
                  className="px-2.5 py-1 bg-rose-600 text-white rounded-lg font-bold flex items-center gap-1 hover:bg-rose-700 transition-colors shadow-2xs cursor-pointer"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>{pendingWithdrawalsCount}টি উইথড্র</span>
                </button>
              )}

              {pendingDepositsCount > 0 && (
                <button
                  onClick={() => { setActiveTab('deposits'); setIsMobileMenuOpen(false); }}
                  className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-bold flex items-center gap-1 hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                >
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                  <span>{pendingDepositsCount}টি ডিপোজিট</span>
                </button>
              )}

              {pendingVerificationsCount > 0 && (
                <button
                  onClick={() => { setActiveTab('users'); setIsMobileMenuOpen(false); }}
                  className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg font-bold flex items-center gap-1 hover:bg-indigo-700 transition-colors shadow-2xs cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{pendingVerificationsCount}টি ভেরিফিকেশন</span>
                </button>
              )}

              {pendingSubmissionsCount > 0 && (
                <button
                  onClick={() => { setActiveTab('submissions'); setIsMobileMenuOpen(false); }}
                  className="px-2.5 py-1 bg-sky-600 text-white rounded-lg font-bold flex items-center gap-1 hover:bg-sky-700 transition-colors shadow-2xs cursor-pointer"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>{pendingSubmissionsCount}টি জব রিভিউ</span>
                </button>
              )}

              {pendingOrdersCount > 0 && (
                <button
                  onClick={() => { setActiveTab('orders'); setIsMobileMenuOpen(false); }}
                  className="px-2.5 py-1 bg-blue-600 text-white rounded-lg font-bold flex items-center gap-1 hover:bg-blue-700 transition-colors shadow-2xs cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{pendingOrdersCount}টি নতুন অর্ডার</span>
                </button>
              )}

              {pendingReportsCount > 0 && (
                <button
                  onClick={() => { setActiveTab('reports'); setIsMobileMenuOpen(false); }}
                  className="px-2.5 py-1 bg-amber-600 text-white rounded-lg font-bold flex items-center gap-1 hover:bg-amber-700 transition-colors shadow-2xs cursor-pointer"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{pendingReportsCount}টি রিপোর্ট</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Category Filter Pills (Mobile & Tablet Top Strip) */}
        <div className="lg:hidden bg-white border-b border-slate-200 px-3 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          {categoryFilters.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{cat.label}</span>
              {cat.badge !== undefined && cat.badge > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  activeCategory === cat.id ? 'bg-amber-400 text-slate-950' : 'bg-rose-500 text-white'
                }`}>
                  {cat.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Mobile Horizontal Subtabs Strip */}
        <div className="lg:hidden bg-slate-50 border-b border-slate-200 px-3 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          {filteredTabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {tab.icon}
                <span>{isBn ? tab.label : tab.enLabel}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    isActive ? 'bg-white text-sky-600' : 'bg-rose-500 text-white'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Main Body with Desktop Sidebar + Main Content */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Mobile Sliding Navigation Drawer */}
          {isMobileMenuOpen && (
            <div className="lg:hidden absolute inset-0 z-30 flex">
              {/* Backdrop */}
              <div 
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
              />

              {/* Drawer Container */}
              <div className="relative w-[85%] max-w-xs bg-white h-full shadow-2xl flex flex-col z-40 border-r border-slate-200 animate-slide-right">
                {/* Drawer Header */}
                <div className="p-4 bg-slate-950 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-sky-500 text-slate-950 flex items-center justify-center font-black text-sm">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-white">অ্যাডমিন মেনু</h4>
                      <p className="text-[10px] text-slate-400">ট্যাব নির্বাচন করুন</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Search Bar in Mobile Drawer */}
                <div className="p-3 border-b border-slate-100 bg-slate-50">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="মেনু খুঁজুন (যেমন: ডিপোজিট)..."
                      className="w-full py-2 pl-9 pr-8 bg-white text-xs text-slate-800 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
                    />
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Category Filters in Mobile Drawer */}
                <div className="px-3 py-2 flex flex-wrap gap-1 border-b border-slate-100 bg-white">
                  {categoryFilters.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        activeCategory === cat.id
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span>{cat.label}</span>
                      {cat.badge !== undefined && cat.badge > 0 && (
                        <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${
                          activeCategory === cat.id ? 'bg-amber-400 text-slate-950' : 'bg-rose-500 text-white'
                        }`}>
                          {cat.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Tabs List in Mobile Drawer */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {filteredTabs.map(tab => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full p-2.5 rounded-xl text-left font-bold transition-all flex items-center justify-between cursor-pointer ${
                          isActive
                            ? 'bg-sky-600 text-white shadow-sm'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`p-2 rounded-lg ${
                            isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {tab.icon}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-black truncate">{isBn ? tab.label : tab.enLabel}</div>
                            <div className={`text-[10px] truncate ${isActive ? 'text-sky-100' : 'text-slate-400'}`}>
                              {tab.description}
                            </div>
                          </div>
                        </div>

                        {tab.badge !== undefined && tab.badge > 0 && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                            isActive ? 'bg-white text-sky-600' : `${tab.badgeColor || 'bg-rose-500'} text-white`
                          }`}>
                            {tab.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Desktop Left Navigation Sidebar */}
          <aside className={`hidden lg:flex flex-col bg-white border-r border-slate-200 transition-all duration-200 shrink-0 ${
            isSidebarCollapsed ? 'w-18' : 'w-72'
          }`}>
            {/* Quick Search in Sidebar */}
            <div className="p-3 border-b border-slate-100">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isSidebarCollapsed ? '' : (isBn ? 'মেনু বা অপশন খুঁজুন...' : 'Search tabs...')}
                  className={`w-full py-2 bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-hidden transition-all ${
                    isSidebarCollapsed ? 'pl-8 pr-2' : 'pl-9 pr-3'
                  }`}
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Pills on Desktop */}
            {!isSidebarCollapsed && (
              <div className="px-3 pt-2.5 pb-1 flex flex-wrap gap-1 border-b border-slate-100">
                {categoryFilters.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      activeCategory === cat.id
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>{cat.label}</span>
                    {cat.badge !== undefined && cat.badge > 0 && (
                      <span className={`px-1 py-0.1 rounded-full text-[9px] font-black ${
                        activeCategory === cat.id ? 'bg-amber-400 text-slate-950' : 'bg-rose-500 text-white'
                      }`}>
                        {cat.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Scrollable Tabs List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 no-scrollbar">
              {filteredTabs.length === 0 ? (
                <div className="p-4 text-center text-slate-400 text-xs">
                  <Search className="w-6 h-6 mx-auto mb-1 opacity-40" />
                  <span>কোনো মেনু পাওয়া যায়নি</span>
                </div>
              ) : (
                filteredTabs.map(tab => {
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      title={tab.description}
                      className={`w-full p-2.5 rounded-xl text-left font-bold transition-all flex items-center justify-between group cursor-pointer ${
                        isActive
                          ? 'bg-sky-600 text-white shadow-xs'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`p-1.5 rounded-lg transition-colors ${
                          isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                        }`}>
                          {tab.icon}
                        </div>
                        {!isSidebarCollapsed && (
                          <div className="min-w-0">
                            <div className="text-xs truncate">{isBn ? tab.label : tab.enLabel}</div>
                            <div className={`text-[10px] truncate font-normal ${
                              isActive ? 'text-sky-100' : 'text-slate-400'
                            }`}>
                              {tab.description}
                            </div>
                          </div>
                        )}
                      </div>

                      {tab.badge !== undefined && tab.badge > 0 && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                          isActive ? 'bg-white text-sky-600' : `${tab.badgeColor || 'bg-rose-500'} text-white`
                        }`}>
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Sidebar Footer Collapse Toggle */}
            <div className="p-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="w-full py-2 px-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              >
                {isSidebarCollapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <>
                    <ChevronLeft className="w-4 h-4" />
                    <span className="text-[11px]">{isBn ? 'সাইডবার ছোট করুন' : 'Collapse'}</span>
                  </>
                )}
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col min-w-0 bg-[#f8fafc] overflow-hidden">
            {/* Context Breadcrumb & Tab Header */}
            <div className="bg-white border-b border-slate-200/80 px-4 py-3 sm:px-6 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-sky-50 text-sky-600 rounded-xl border border-sky-100">
                  {currentTabConfig.icon}
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                    <span>{isBn ? currentTabConfig.label : currentTabConfig.enLabel}</span>
                    {currentTabConfig.badge !== undefined && currentTabConfig.badge > 0 && (
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-black rounded-full border border-rose-200">
                        {currentTabConfig.badge} টি অপেক্ষমাণ
                      </span>
                    )}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {currentTabConfig.description}
                  </p>
                </div>
              </div>

              {/* Quick Navigation Dropdown for instant jump */}
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-xs text-slate-400 font-semibold">{isBn ? 'সরাসরি যান:' : 'Jump:'}</span>
                <select
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value as AdminTabType)}
                  aria-label={isBn ? 'অ্যাডমিন ট্যাব পরিবর্তন করুন' : 'Change admin tab'}
                  className="py-1.5 px-3 bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl focus:ring-1 focus:ring-sky-500 focus:outline-hidden cursor-pointer"
                >
                  {tabConfigs.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.label} {t.badge ? `(${t.badge})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tab Viewport */}
            <div className="flex-1 p-3 sm:p-5 overflow-y-auto no-scrollbar space-y-4">
              {activeTab === 'overview' && (
                <AdminOverviewTab onNavigateTab={(tab) => setActiveTab(tab)} />
              )}

              {activeTab === 'buttons' && (
                <AdminButtonsTab />
              )}

              {activeTab === 'jobs' && (
                <AdminJobsTab />
              )}

              {activeTab === 'submissions' && (
                <AdminJobSubmissionsTab />
              )}

              {activeTab === 'applications' && (
                <AdminApplicationsTab />
              )}

              {activeTab === 'course_mgmt' && (
                <AdminCourseManagementTab />
              )}

              {activeTab === 'freelance_mgmt' && (
                <AdminFreelanceManagementTab />
              )}

              {activeTab === 'marketing_mgmt' && (
                <AdminMarketingManagementTab />
              )}

              {activeTab === 'reward_center_mgmt' && (
                <AdminRewardCenterTab />
              )}

              {activeTab === 'autoads' && (
                <AdminAutoAdsSection />
              )}

              {activeTab === 'quiz' && (
                <AdminQuizManagementSection />
              )}

              {activeTab === 'typing' && (
                <AdminTypingManagementTab />
              )}

              {activeTab === 'posts' && (
                <AdminPostsTab />
              )}

              {activeTab === 'banners' && (
                <AdminBannersTab />
              )}

              {activeTab === 'deposits' && (
                <AdminApprovalQueue onNavigateTab={(tab) => setActiveTab(tab)} />
              )}

              {activeTab === 'withdrawals' && (
                <AdminWithdrawalsTab />
              )}

              {activeTab === 'orders' && (
                <AdminOrdersTab />
              )}

              {activeTab === 'products' && (
                <AdminProductsTab />
              )}

              {activeTab === 'shops' && (
                <AdminShopManagementTab />
              )}

              {activeTab === 'vendors' && (
                <AdminVendorManagementTab />
              )}

              {activeTab === 'users' && (
                <AdminUsersTab />
              )}

              {activeTab === 'broadcast' && (
                <AdminBroadcastTab />
              )}

              {activeTab === 'reports' && (
                <AdminReportsTab />
              )}

              {activeTab === 'audit' && (
                <AdminAuditTrailTab />
              )}

              {activeTab === 'settings' && (
                <AdminSettingsTab />
              )}

              {activeTab === 'special_social_settings' && (
                <AdminSpecialSocialSettingsTab onNavigateTab={(tab) => setActiveTab(tab)} />
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardModal;
