import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  AppTab, 
  UserProfile, 
  UserRole,
  WalletState, 
  Transaction, 
  Product, 
  CartItem, 
  Order, 
  MicroJob, 
  JobSubmission, 
  AdMarketingSubmission,
  TargetBonus, 
  ReelItem, 
  GroupLink, 
  NetworkUser, 
  LeaderboardUser, 
  AppNotification, 
  WithdrawalRequest,
  DepositRequest,
  DepositCelebrationData,
  ReportItem,
  SystemSettings,
  AppBanner,
  CourseFreelanceApplication,
  VerificationRequest,
  AuditLog,
  Shop,
  ShopVendor,
  ShopPaymentMethods
} from '../types';
import { fireCelebrationConfetti, playCelebrationSound } from '../lib/audioCelebration';
import { generateShortReferralCode, formatStrict4DigitReferral } from '../lib/referral';
import { calculateReferralRank, UserReferralRankInfo } from '../lib/referralRank';
import { 
  INITIAL_USER, 
  INITIAL_FEATURED_PRODUCTS, 
  INITIAL_CATEGORIES, 
  INITIAL_GROUP_LINKS, 
  INITIAL_MICRO_JOBS, 
  INITIAL_TARGET_BONUSES, 
  INITIAL_REELS, 
  INITIAL_LEADERBOARD, 
  INITIAL_NETWORK_USERS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_SYSTEM_SETTINGS,
  INITIAL_BANNERS,
  VENDOR_PROFILES
} from '../data/initialData';
import {
  syncUserWithFirestore,
  syncOrderWithFirestore,
  syncJobSubmissionWithFirestore,
  syncWithdrawalWithFirestore,
  syncReportWithFirestore,
  syncJobWithFirestore,
  deleteJobFromFirestore,
  subscribeToMicroJobs,
  subscribeToJobSubmissions,
  syncApplicationWithFirestore,
  syncDepositRequestWithFirestore,
  fetchDepositRequestsFromFirestore,
  subscribeToDepositRequests,
  syncTransactionWithFirestore,
  syncVerificationRequestWithFirestore,
  syncAuditLogWithFirestore,
  syncNotificationWithFirestore,
  fetchNotificationsForUserFromFirestore,
  subscribeToUserNotifications,
  markNotificationAsReadInFirestore,
  isFakeOrDummyNotification,
  fetchInitialFirestoreData,
  fetchUserFromFirestore,
  fetchFreshestUserData,
  creditUserDepositInFirestore,
  subscribeToUserRealtime
} from '../lib/firestoreSync';
import { playAdminNotificationSound, triggerPendingRequestAlert } from '../lib/adminRealtimeService';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { safeSetItem, safeGetItem } from '../lib/storageUtils';
import { getTranslation, Language } from '../lib/translations';
import { ADMIN_PHONE_NUMBER, isAuthorizedAdminPhone } from '../lib/firebase';
import { 
  normalizePhoneNumber, 
  isValidBangladeshiPhone, 
  normalizeEmail, 
  isValidEmail, 
  checkAccountUniqueness, 
  sanitizeRegisteredUsersStore,
  getStoredRegisteredUsers
} from '../lib/userValidation';
import {
  aggregateUserTransactions,
  fetchUserTransactions,
  filterTransactionsByType,
  filterTransactionsByDate,
  AggregatedUserTransactionReport
} from '../services/transactionAggregationService';

interface AppContextType {
  // Navigation
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  isSideDrawerOpen: boolean;
  setIsSideDrawerOpen: (open: boolean) => void;
  
  // Auth & User
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  isLoggedIn: boolean;
  setIsLoggedIn: (logged: boolean) => void;
  isAuthorizedAdmin: boolean;
  adminPhoneNumber: string;
  hasSeenOnboarding: boolean;
  setHasSeenOnboarding: (seen: boolean) => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  authModalMode: 'login' | 'register' | 'forgot' | 'verify_otp';
  setAuthModalMode: (mode: 'login' | 'register' | 'forgot' | 'verify_otp') => void;
  loginWithCredentials: (phoneOrEmail: string, password: string) => Promise<{ success: boolean; message?: string }> | { success: boolean; message?: string };
  registerUser: (data: { name: string; phone: string; email?: string; password: string; referralCode?: string; avatar?: string }) => { success: boolean; message?: string };
  loginAsRole: (role: UserProfile['role']) => void;
  logout: () => void;
  verifyProfile: (nid: string, address: string) => void;
  updateUserProfile: (updatedFields: Partial<UserProfile>) => void;
  refreshUserData: () => Promise<void>;

  // Active Modals & Sub-Views
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  selectedJob: MicroJob | null;
  setSelectedJob: (job: MicroJob | null) => void;
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (open: boolean) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isJobHistoryOpen: boolean;
  setIsJobHistoryOpen: (open: boolean) => void;
  isWalletOpen: boolean;
  setIsWalletOpen: (open: boolean) => void;
  isWithdrawOpen: boolean;
  setIsWithdrawOpen: (open: boolean) => void;
  isAddMoneyOpen: boolean;
  setIsAddMoneyOpen: (open: boolean) => void;
  isVerificationModalOpen: boolean;
  setIsVerificationModalOpen: (open: boolean) => void;
  isNetworkModalOpen: boolean;
  setIsNetworkModalOpen: (open: boolean) => void;
  isAgencyModalOpen: boolean;
  setIsAgencyModalOpen: (open: boolean) => void;
  isLeaderboardOpen: boolean;
  setIsLeaderboardOpen: (open: boolean) => void;
  isRevenueOpen: boolean;
  setIsRevenueOpen: (open: boolean) => void;
  isSavedPostsOpen: boolean;
  setIsSavedPostsOpen: (open: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  isPolicyModalOpen: boolean;
  setIsPolicyModalOpen: (open: boolean) => void;
  policyModalTab: 'about' | 'privacy' | 'terms';
  setPolicyModalTab: (tab: 'about' | 'privacy' | 'terms') => void;
  openPolicyModal: (tab?: 'about' | 'privacy' | 'terms') => void;
  isReportModalOpen: boolean;
  setIsReportModalOpen: (open: boolean) => void;
  reportTarget: { type: string; id: string; name: string } | null;
  setReportTarget: (target: { type: string; id: string; name: string } | null) => void;
  isAdminDashboardOpen: boolean;
  setIsAdminDashboardOpen: (open: boolean) => void;

  // Easy & Special Income Modals
  activeIncomeModal: string | null;
  setActiveIncomeModal: (modalId: string | null) => void;
  addEarning: (amount: number, description: string, category?: keyof WalletState['incomeBreakdown']) => void;
  addJob: (job: { title: string; category: string; reward: number; availableSlots: number; instructions: string[]; targetUrl?: string; proofRequirement?: string }) => void;
  rechargeMobile: (operator: string, phone: string, amount: number) => boolean;

  // Wallet & Financials
  wallet: WalletState;
  setWallet: React.Dispatch<React.SetStateAction<WalletState>>;
  transactions: Transaction[];
  walletActiveTab: 'overview' | 'deposit' | 'withdraw';
  setWalletActiveTab: (tab: 'overview' | 'deposit' | 'withdraw') => void;
  addTransaction: (tx: Omit<Transaction, 'id' | 'date'>) => void;
  withdrawalRequests: WithdrawalRequest[];
  submitWithdrawal: (amount: number, method: 'bKash' | 'Nagad' | 'Bank', account: string, name: string) => boolean;
  addFundsToWallet: (amount: number, method: string, reference: string) => void;
  depositMoney: (amount: number, method: string, trxId: string, senderPhone?: string, options?: { isVerification?: boolean; purpose?: string; depositType?: 'verification' | 'standard' | 'special_social'; nidNumber?: string }) => Promise<{ success: boolean; message?: string; deposit?: DepositRequest }>;
  withdrawMoney: (amount: number, method: string, accountNumber: string, accountName?: string) => boolean;
  depositRequests: DepositRequest[];
  fetchFreshDeposits: () => Promise<DepositRequest[]>;
  adminApproveDeposit: (depositId: string) => void;
  adminRejectDeposit: (depositId: string, reason?: string) => void;
  depositCelebration: {
    type: 'submitted' | 'confirmed';
    amount: number;
    trxId?: string;
    senderPhone?: string;
    paymentMethod?: string;
  } | null;
  setDepositCelebration: (data: {
    type: 'submitted' | 'confirmed';
    amount: number;
    trxId?: string;
    senderPhone?: string;
    paymentMethod?: string;
  } | null) => void;
  closeDepositCelebration: () => void;
  syncReferralEarnings: () => { credited: number; totalReferrals: number; verifiedCount?: number; pendingCount?: number };
  userReferralRank: UserReferralRankInfo;
  verifiedReferralsCount: number;
  pendingReferralsCount: number;

  // Shop & Cart & Orders
  products: Product[];
  categories: typeof INITIAL_CATEGORIES;
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, color?: string, size?: string, customSellingPrice?: number, customResellerProfit?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  orders: Order[];
  createOrder: (orderDetails: {
    customerName: string;
    phone: string;
    address: { division: string; district: string; upazila: string; area: string };
    paymentMethod: 'cod' | 'wallet' | 'bkash' | 'nagad' | 'rocket';
    deliveryAdvancePaid?: boolean;
    deliveryAdvanceMethod?: 'bkash' | 'nagad' | 'rocket' | 'wallet';
    deliveryAdvanceTrxId?: string;
    shopId?: string;
    shopName?: string;
  }) => Order | null;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  persistWishlistToFirestore: (wishlist: string[]) => Promise<void>;

  // Shops & Vendors (Admin Controlled Multi-Shop System)
  shops: Shop[];
  activeShopId: string;
  setActiveShopId: (shopId: string) => void;
  viewingShopId: string | null;
  setViewingShopId: (shopId: string | null) => void;
  activeShop: Shop | null;
  vendors: ShopVendor[];
  refreshShops: () => Promise<void>;
  refreshVendors: () => Promise<void>;
  adminCreateShop: (shopData: Partial<Shop>) => Promise<{ success: boolean; shop?: Shop; message?: string }>;
  adminUpdateShop: (shopId: string, updates: Partial<Shop>) => Promise<{ success: boolean; shop?: Shop; message?: string }>;
  adminDeleteShop: (shopId: string) => Promise<{ success: boolean; message?: string }>;
  adminToggleShopStatus: (shopId: string) => Promise<{ success: boolean; message?: string }>;
  adminCreateVendor: (vendorData: Partial<ShopVendor>) => Promise<{ success: boolean; vendor?: ShopVendor; message?: string }>;
  adminUpdateVendor: (vendorId: string, updates: Partial<ShopVendor>) => Promise<{ success: boolean; vendor?: ShopVendor; message?: string }>;
  adminDeleteVendor: (vendorId: string) => Promise<{ success: boolean; message?: string }>;
  adminToggleVendorStatus: (vendorId: string) => Promise<{ success: boolean; message?: string }>;

  // Micro Jobs & Submissions
  jobs: MicroJob[];
  jobSubmissions: JobSubmission[];
  submitJobProof: (job: MicroJob, proofText: string, proofImage?: string, proofLink?: string) => void;

  // Ad Marketing Submissions
  adMarketingSubmissions: AdMarketingSubmission[];
  submitAdMarketingProof: (data: {
    campaignTitle?: string;
    rewardAmount?: number;
    postLink?: string;
    proofImage?: string;
    note?: string;
  }) => boolean;

  // Target Bonuses
  bonuses: TargetBonus[];
  claimBonus: (bonusId: string) => void;

  // Reels & Posts
  reels: ReelItem[];
  toggleLikeReel: (reelId: string) => void;
  toggleSaveReel: (reelId: string) => void;
  toggleFollowCreator: (reelId: string) => void;
  createUserPost: (postData: {
    caption: string;
    thumbnailUrl: string;
    videoUrl?: string;
    hashtags?: string[];
    productId?: string;
    productName?: string;
    productPrice?: number;
    productImage?: string;
    postType?: 'reel' | 'post' | 'proof';
  }) => void;
  adminApprovePost: (postId: string) => void;
  adminRejectPost: (postId: string, reason?: string) => void;
  deleteUserPost: (postId: string) => void;
  updateUserCover: (coverUrl: string) => void;

  // Profile Navigation & Poster Linking
  viewingProfileUser: UserProfile | null;
  setViewingProfileUser: (user: UserProfile | null) => void;
  targetProfilePostId: string | null;
  setTargetProfilePostId: (postId: string | null) => void;
  navigateToPosterProfile: (product: Product) => void;
  navigateToResellingAndOpenProduct: (product: Product) => void;

  // Admin Controls
  adminApproveJobSubmission: (submissionId: string) => void;
  adminRejectJobSubmission: (submissionId: string, reason: string) => void;
  adminApproveAdMarketingSubmission: (submissionId: string) => void;
  adminRejectAdMarketingSubmission: (submissionId: string, reason: string) => void;
  adminApproveWithdrawal: (withdrawalId: string) => void;
  adminRejectWithdrawal: (withdrawalId: string, reason: string) => void;
  adminUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  adminAddProduct: (product: Omit<Product, 'id'>) => void;
  adminUpdateProduct: (productId: string, updates: Partial<Product>) => void;
  adminToggleOfferProduct: (productId: string, isOfferProduct?: boolean, offerTag?: string) => void;
  adminDeleteProduct: (productId: string) => void;
  adminCreateJob: (job: Omit<MicroJob, 'id'>) => void;
  userPostJob: (job: Omit<MicroJob, 'id'>) => boolean;
  adminUpdateJob: (jobId: string, updates: Partial<MicroJob>) => void;
  adminDeleteJob: (jobId: string) => void;
  registeredUsers: UserProfile[];
  fetchFreshUsers: () => Promise<UserProfile[]>;
  adminSuspendUser: (userId: string, reason?: string) => Promise<boolean>;
  adminBlockUser: (userId: string, reason?: string) => Promise<boolean>;
  adminActivateUser: (userId: string) => Promise<boolean>;
  adminVerifyUser: (userId: string) => Promise<boolean>;
  adminUnverifyUser: (userId: string) => Promise<boolean>;
  adminUpdateUserStatus: (userId: string, status: 'active' | 'suspended' | 'blocked', reason?: string) => Promise<boolean>;
  fetchUserFinancials: (userId: string) => Promise<{
    userId: string;
    userName: string;
    userPhone: string;
    currentBalance: number;
    totalDeposit: number;
    totalWithdraw: number;
    totalEarned: number;
    approvedDepositsCount: number;
    transactions: Transaction[];
  } | null>;
  getUserTransactionReport: (userOverride?: UserProfile) => AggregatedUserTransactionReport;
  fetchAndAggregateUserTransactions: (userId?: string) => Promise<AggregatedUserTransactionReport>;
  adminAdjustUserBalance: (userIdOrAmount: string | number, amountOrType?: any, typeOrReason?: any, reason?: string) => void;
  adminBroadcastNotification: (notification: { title: string; message: string; type: AppNotification['type'] }) => void;
  adminResolveReport: (reportId: string, status: 'resolved' | 'dismissed') => void;
  adminToggleUserVerification: (userId: string) => void;
  adminApproveVerification: (userIdOrReqId: string) => void;
  adminRejectVerification: (userIdOrReqId: string, reason?: string) => void;
  adminBulkApproveVerifications: (ids: string[]) => void;
  adminBulkRejectVerifications: (ids: string[], reason: string) => void;
  adminUpdateUserRole: (userId: string, role: UserRole) => void;
  adminDeleteUser: (userId: string) => void;

  // Verification Requests state & submit
  verificationRequests: VerificationRequest[];
  submitVerificationRequest: (data: { method: string; senderNumber: string; trxId: string; amount?: number; nidNumber?: string }) => void;

  // Reselling Order Two-Step Validation & Bulk Actions
  adminVerifyOrderPayment: (orderId: string) => void;
  adminReleaseOrderEarnings: (orderId: string) => void;
  adminRejectOrder: (orderId: string, reason: string) => void;
  adminBulkVerifyOrderPayments: (orderIds: string[]) => void;
  adminBulkReleaseOrderEarnings: (orderIds: string[]) => void;
  adminBulkRejectOrders: (orderIds: string[], reason: string) => void;

  // Bulk Deposit Actions
  adminBulkApproveDeposits: (depositIds: string[]) => void;
  adminBulkRejectDeposits: (depositIds: string[], reason: string) => void;

  // Admin Master Dynamic Controls
  systemSettings: SystemSettings;
  updateSystemSettings: (updates: Partial<SystemSettings>) => void;
  claimAutoAdsReward: (rewardAmount: number, totalAdsCount: number) => boolean;
  creditUserReward: (amount: number, description: string, incomeType?: 'job' | 'ads' | 'bonus') => boolean;
  resetAdsCooldown: () => void;
  toggleFeature: (featureKey: keyof SystemSettings['featureToggles']) => void;
  updateFeatureReward: (key: keyof SystemSettings['featureRewards'], amount: number) => void;
  banners: AppBanner[];
  adminAddBanner: (banner: Omit<AppBanner, 'id'>) => void;
  adminUpdateBanner: (bannerId: string, updates: Partial<AppBanner>) => void;
  adminDeleteBanner: (bannerId: string) => void;
  adminAddReel: (reel: Omit<ReelItem, 'id' | 'likesCount' | 'commentsCount' | 'sharesCount' | 'viewsCount'>) => void;
  adminUpdateReel: (reelId: string, updates: Partial<ReelItem>) => void;
  adminDeleteReel: (reelId: string) => void;
  adminAddBonus: (bonus: Omit<TargetBonus, 'id' | 'isClaimed'>) => void;
  adminUpdateBonus: (bonusId: string, updates: Partial<TargetBonus>) => void;
  adminDeleteBonus: (bonusId: string) => void;

  // Social & Groups
  groupLinks: GroupLink[];
  updateGroupLink: (id: string, url: string) => void;

  // Network & Leaderboard
  networkUsers: NetworkUser[];
  leaderboard: LeaderboardUser[];

  // Notifications
  notifications: AppNotification[];
  allNotifications?: AppNotification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  unreadNotificationCount: number;

  // Audit Trail
  auditLogs: AuditLog[];
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;

  // Reports
  reports: ReportItem[];
  submitReport: (reason: string, description: string) => void;

  // Course & Freelance Applications
  courseApplications: CourseFreelanceApplication[];
  submitCourseFreelanceApplication: (appData: Omit<CourseFreelanceApplication, 'id' | 'submittedAt' | 'status'>) => Promise<string>;
  adminUpdateApplicationStatus: (appId: string, status: CourseFreelanceApplication['status'], adminNotes?: string) => void;
  adminDeleteApplication: (appId: string) => void;

  // Settings
  language: 'bn' | 'en';
  isBn: boolean;
  setLanguage: (lang: 'bn' | 'en') => void;
  t: ReturnType<typeof getTranslation>;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  isDeviceFrameActive: boolean;
  setIsDeviceFrameActive: (active: boolean) => void;
  
  // Toast
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const generateTxId = (prefix = 'tx'): string => {
  const rand = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${Date.now()}_${rand}`;
};

const sanitizeAndDeduplicateTransactions = (list: any[]): Transaction[] => {
  if (!Array.isArray(list)) return [];
  const seenIds = new Set<string>();
  const seenKeys = new Set<string>();
  const cleaned: Transaction[] = [];
  for (let i = 0; i < list.length; i++) {
    const t = list[i];
    if (!t || typeof t !== 'object') continue;
    if (['tx_1001', 'tx_1002', 'tx_1003', 'tx_1004'].includes(t.id)) continue;
    
    const id = t.id ? String(t.id) : '';
    // Discard duplicates created by previous dup bugs
    if (id.includes('_dup_')) {
      continue;
    }
    
    if (id && seenIds.has(id)) {
      continue; // Strictly skip duplicate ID
    }

    // Compound deduplication key
    const compoundKey = `${t.userId || ''}_${t.type}_${Number(t.amount || 0).toFixed(2)}_${t.referenceId || t.date || id}`;
    if (seenKeys.has(compoundKey)) {
      continue;
    }

    const finalId = id || generateTxId('tx');
    seenIds.add(finalId);
    seenKeys.add(compoundKey);
    cleaned.push({ ...t, id: finalId });
  }
  return cleaned;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [walletActiveTab, setWalletActiveTab] = useState<'overview' | 'deposit' | 'withdraw'>('overview');
  const [isSideDrawerOpen, setIsSideDrawerOpen] = useState<boolean>(false);

  // Auth State
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('lg_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.id === 'usr_nusaib_001' || parsed.name === 'Nusaib') {
          return {
            ...INITIAL_USER,
            referralCode: formatStrict4DigitReferral(INITIAL_USER.referralCode)
          };
        }
        // Strict Security: Only 01877722819 is authorized to have admin/super_admin role
        if ((parsed.role === 'admin' || parsed.role === 'super_admin') && !isAuthorizedAdminPhone(parsed.phone)) {
          parsed.role = 'user';
        }
        parsed.referralCode = formatStrict4DigitReferral(parsed.referralCode);
        return parsed;
      } catch {}
    }
    return {
      ...INITIAL_USER,
      referralCode: formatStrict4DigitReferral(INITIAL_USER.referralCode)
    };
  });
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);
  const creditReferralRewardRef = useRef<(userId: string, userName?: string, userPhone?: string) => boolean>(() => false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('lg_logged_in') === 'true';
  });
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean>(() => {
    return localStorage.getItem('lg_onboarding') === 'true';
  });
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'forgot' | 'verify_otp'>('login');

  // Modals
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedJob, setSelectedJob] = useState<MicroJob | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isJobHistoryOpen, setIsJobHistoryOpen] = useState<boolean>(false);
  const [isWalletOpen, setIsWalletOpen] = useState<boolean>(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState<boolean>(false);
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState<boolean>(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState<boolean>(false);
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState<boolean>(false);
  const [isAgencyModalOpen, setIsAgencyModalOpen] = useState<boolean>(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [isRevenueOpen, setIsRevenueOpen] = useState<boolean>(false);
  const [isSavedPostsOpen, setIsSavedPostsOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState<boolean>(false);
  const [policyModalTab, setPolicyModalTab] = useState<'about' | 'privacy' | 'terms'>('about');

  const openPolicyModal = (tab: 'about' | 'privacy' | 'terms' = 'about') => {
    setPolicyModalTab(tab);
    setIsPolicyModalOpen(true);
  };
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [reportTarget, setReportTarget] = useState<{ type: string; id: string; name: string } | null>(null);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState<boolean>(false);
  const [activeIncomeModal, setActiveIncomeModal] = useState<string | null>(null);

  // Deposit Celebration Modal State
  const [depositCelebration, setDepositCelebration] = useState<{
    type: 'submitted' | 'confirmed';
    amount: number;
    trxId?: string;
    senderPhone?: string;
    paymentMethod?: string;
  } | null>(null);

  const closeDepositCelebration = useCallback(() => {
    setDepositCelebration(null);
  }, []);

  // Registered users collection for Real Admin & Auth Sync
  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem('lg_registered_users');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed
            .map(item => {
              const u = item.user || item;
              return {
                ...u,
                balance: item.wallet?.balance ?? u.balance ?? 0
              };
            })
            .filter(u => u && u.id !== 'usr_default_01' && u.phone && u.phone !== '01700000000' && u.name !== 'Nusaib' && u.name !== 'নতুন সদস্য');
        }
      }
    } catch {}
    return [];
  });

  const persistRegisteredUsers = useCallback((users: (UserProfile | { user: UserProfile; password?: string; wallet?: any })[]) => {
    try {
      const existingList = getStoredRegisteredUsers();
      const passMap = new Map<string, string>();
      const walletMap = new Map<string, any>();
      
      existingList.forEach(item => {
        const u = item.user;
        if (u?.id) {
          if (item.password) passMap.set(u.id, item.password);
          if (item.wallet) walletMap.set(u.id, item.wallet);
        }
        if (u?.phone) {
          const pNorm = normalizePhoneNumber(u.phone);
          if (pNorm && item.password) passMap.set(pNorm, item.password);
        }
      });

      const structuredList = users.map(entry => {
        const u = (entry as any).user || entry;
        const uid = u.id;
        const pNorm = normalizePhoneNumber(u.phone);
        const pass = (entry as any).password || 
          passMap.get(uid) || 
          (pNorm ? passMap.get(pNorm) : null) || 
          (uid ? localStorage.getItem(`lg_password_${uid}`) : null) || 
          (pNorm ? localStorage.getItem(`lg_password_${pNorm}`) : null);
        const w = (entry as any).wallet || walletMap.get(uid) || u.wallet;
        
        if (uid && pass) {
          localStorage.setItem(`lg_password_${uid}`, pass);
        }
        if (pNorm && pass) {
          localStorage.setItem(`lg_password_${pNorm}`, pass);
        }

        return {
          user: u,
          ...(pass ? { password: pass } : {}),
          ...(w ? { wallet: w } : {})
        };
      });

      safeSetItem('lg_registered_users', JSON.stringify(structuredList));
    } catch (err) {
      console.warn('persistRegisteredUsers error:', err);
    }
  }, []);

  // Clean Production Wallet - Pure 0 balance, No Demo amounts
  const [wallet, setWallet] = useState<WalletState>(() => {
    const saved = localStorage.getItem('lg_wallet');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // If it was the old demo balance of 210.50 or 1000 withdrawn, purge it completely
        if (parsed.balance === 210.5 || parsed.totalWithdrawn === 1000 || parsed.totalEarned === 1210.5) {
          return {
            balance: 0.00,
            pendingBalance: 0.00,
            totalWithdrawn: 0.00,
            totalEarned: 0.00,
            incomeBreakdown: {
              jobIncome: 0.00,
              referralIncome: 0.00,
              resellingProfit: 0.00,
              bonusIncome: 0.00,
              affiliateIncome: 0.00,
              adsIncome: 0.00,
              otherIncome: 0.00
            }
          };
        }
        return {
          balance: typeof parsed.balance === 'number' ? parsed.balance : 0.00,
          pendingBalance: typeof parsed.pendingBalance === 'number' ? parsed.pendingBalance : 0.00,
          totalWithdrawn: typeof parsed.totalWithdrawn === 'number' ? parsed.totalWithdrawn : 0.00,
          totalEarned: typeof parsed.totalEarned === 'number' ? parsed.totalEarned : 0.00,
          incomeBreakdown: {
            jobIncome: Number(parsed.incomeBreakdown?.jobIncome) || 0.00,
            referralIncome: Number(parsed.incomeBreakdown?.referralIncome) || 0.00,
            resellingProfit: Number(parsed.incomeBreakdown?.resellingProfit) || 0.00,
            bonusIncome: Number(parsed.incomeBreakdown?.bonusIncome) || 0.00,
            affiliateIncome: Number(parsed.incomeBreakdown?.affiliateIncome) || 0.00,
            adsIncome: Number(parsed.incomeBreakdown?.adsIncome) || 0.00,
            otherIncome: Number(parsed.incomeBreakdown?.otherIncome) || 0.00
          }
        };
      } catch {
        // use default
      }
    }
    return {
      balance: 0.00,
      pendingBalance: 0.00,
      totalWithdrawn: 0.00,
      totalEarned: 0.00,
      incomeBreakdown: {
        jobIncome: 0.00,
        referralIncome: 0.00,
        resellingProfit: 0.00,
        bonusIncome: 0.00,
        affiliateIncome: 0.00,
        adsIncome: 0.00,
        otherIncome: 0.00
      }
    };
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    let saved: string | null = null;
    try {
      const savedUserStr = localStorage.getItem('lg_user');
      if (savedUserStr) {
        const u = JSON.parse(savedUserStr);
        if (u && u.id) {
          saved = localStorage.getItem(`lg_transactions_${u.id}`);
        }
      }
    } catch {}
    if (!saved) {
      saved = localStorage.getItem('lg_transactions');
    }
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return sanitizeAndDeduplicateTransactions(parsed);
      } catch {}
    }
    return [];
  });

  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>(() => {
    const saved = localStorage.getItem('lg_withdrawals');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.filter((w: WithdrawalRequest) => w.id !== 'wd_101');
      } catch {}
    }
    return [];
  });

  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>(() => {
    const saved = localStorage.getItem('lg_deposits');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  const [shops, setShops] = useState<Shop[]>(() => {
    return safeGetItem<Shop[]>('lg_shops', []);
  });

  const [activeShopId, setActiveShopIdState] = useState<string>(() => {
    return safeGetItem<string>('lg_active_shop_id', 'shop_main');
  });

  const [viewingShopId, setViewingShopId] = useState<string | null>(null);

  const setActiveShopId = useCallback((id: string) => {
    setActiveShopIdState(id);
    safeSetItem('lg_active_shop_id', id);
  }, []);

  const [vendors, setVendors] = useState<ShopVendor[]>(() => {
    return safeGetItem<ShopVendor[]>('lg_vendors', []);
  });

  const activeShop = useMemo<Shop | null>(() => {
    if (!shops || shops.length === 0) return null;
    const found = shops.find(s => s.id === activeShopId && s.status === 'active');
    if (found) return found;
    const firstActive = shops.find(s => s.status === 'active');
    return firstActive || shops[0] || null;
  }, [shops, activeShopId]);

  const [products, setProducts] = useState<Product[]>(() => {
    return safeGetItem<Product[]>('lg_products', INITIAL_FEATURED_PRODUCTS);
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    return safeGetItem<CartItem[]>('lg_cart', []);
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const list = safeGetItem<Order[]>('lg_orders', []);
    return Array.isArray(list) ? list.filter((o: Order) => o && o.id !== 'ORD-89412') : [];
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    return safeGetItem<string[]>('lg_wishlist', []);
  });

  const [jobs, setJobs] = useState<MicroJob[]>(() => {
    const list = safeGetItem<MicroJob[]>('lg_jobs', INITIAL_MICRO_JOBS);
    return Array.isArray(list) ? list : INITIAL_MICRO_JOBS;
  });

  const [jobSubmissions, setJobSubmissions] = useState<JobSubmission[]>(() => {
    const list = safeGetItem<JobSubmission[]>('lg_job_submissions', []);
    return Array.isArray(list) ? list.filter((s: JobSubmission) => s && s.id !== 'sub_001') : [];
  });

  const [adMarketingSubmissions, setAdMarketingSubmissions] = useState<AdMarketingSubmission[]>(() => {
    const list = safeGetItem<AdMarketingSubmission[]>('lg_ad_marketing_submissions', []);
    return Array.isArray(list) ? list : [];
  });

  const [bonuses, setBonuses] = useState<TargetBonus[]>(() => {
    return safeGetItem<TargetBonus[]>('lg_bonuses', INITIAL_TARGET_BONUSES);
  });

  const [reels, setReels] = useState<ReelItem[]>(() => {
    return safeGetItem<ReelItem[]>('lg_reels', INITIAL_REELS);
  });

  const [groupLinks, setGroupLinks] = useState<GroupLink[]>(() => {
    const saved = safeGetItem<GroupLink[]>('lg_group_links', INITIAL_GROUP_LINKS);
    if (!Array.isArray(saved) || saved.length === 0) return INITIAL_GROUP_LINKS;
    // Ensure the official Good Life Telegram, Support bot, and Admin links are properly reflected
    return saved.map(g => {
      if (g.id === 'grp_01' || (g.url && g.url.includes('kilagbe'))) {
        return { ...g, name: 'টেলিগ্রাম', title: 'অফিসিয়াল টেলিগ্রাম চ্যানেল', url: 'https://t.me/goodlifeofficialbd', badgeColor: '#0088cc' };
      }
      if (g.id === 'grp_02' || (g.url && g.url.includes('meet.kilagbe')) || (g.name && g.name.includes('বট'))) {
        return { ...g, name: '২৪/৭ সাপোর্ট', title: '২৪/৭ হেল্প ও সাপোর্ট', url: 'https://t.me/goodlifeadmin_bot', badgeColor: '#0284c7' };
      }
      if (g.id === 'grp_03' && (g.url && g.url.includes('kilagbebd'))) {
        return { ...g, name: 'অ্যাডমিন', title: 'সরাসরি অ্যাডমিন আইডি', url: 'https://t.me/goodlifeadmin', badgeColor: '#0ea5e9' };
      }
      return g;
    });
  });

  // Isolated Master Notifications Store - REAL DATA ONLY, NO DUMMY/MOCK NOTIFICATIONS
  const [allNotifications, setAllNotifications] = useState<AppNotification[]>(() => {
    try {
      localStorage.removeItem('lg_notifications'); // Purge legacy mock notifications storage
      const savedAll = safeGetItem<AppNotification[]>('lg_all_notifications', []);
      if (Array.isArray(savedAll) && savedAll.length > 0) {
        const clean = savedAll.filter(n => !isFakeOrDummyNotification(n));
        safeSetItem('lg_all_notifications', JSON.stringify(clean));
        return clean;
      }
    } catch {}
    return [];
  });

  // STRICT USER ISOLATION & DEDUPLICATION FILTER:
  // User A can ONLY see:
  // 1. System-wide broadcasts with userId === 'all'
  // 2. Notifications targeted to User A's unique UID/id
  // 3. (If Admin) Notifications targeted to 'admin'
  // User A will NEVER see User B's notifications under any circumstances!
  const notifications = useMemo(() => {
    const currentUid = user?.id || '';
    const currentPhone = user?.phone ? normalizePhoneNumber(user.phone) : '';
    const isCurrentAdmin = Boolean(
      user?.role === 'admin' || 
      user?.role === 'super_admin' || 
      isAuthorizedAdminPhone(user?.phone)
    );

    const seenIds = new Set<string>();

    return allNotifications.filter(n => {
      if (!n || !n.id || isFakeOrDummyNotification(n)) return false;
      if (seenIds.has(n.id)) return false;
      seenIds.add(n.id);

      // 1. Broadcast to all users
      if (n.userId === 'all') return true;

      // 2. Staff admin alerts (only if logged-in user is an admin)
      if (n.userId === 'admin') return isCurrentAdmin;

      // 3. Strict User-specific targeting: MUST match current logged-in user's UID
      if (currentUid && n.userId === currentUid) return true;

      // 4. Match by verified user phone number
      if (currentPhone && n.userPhone && normalizePhoneNumber(n.userPhone) === currentPhone) {
        return true;
      }

      return false;
    });
  }, [allNotifications, user?.id, user?.phone, user?.role]);

  const unreadNotificationCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const setNotifications = useCallback((updater: React.SetStateAction<AppNotification[]>) => {
    setAllNotifications(prev => {
      if (typeof updater === 'function') {
        const res = updater(prev);
        return res.filter(n => !isFakeOrDummyNotification(n));
      }
      return updater.filter(n => !isFakeOrDummyNotification(n));
    });
  }, []);

  // Global helper to create, store, and dispatch strictly targeted real notifications
  const createAndSendNotification = useCallback(async (notifData: {
    id?: string;
    userId: string;
    userPhone?: string;
    title: string;
    message: string;
    type: AppNotification['type'];
    time?: string;
    actionUrl?: string;
  }) => {
    if (!notifData || !notifData.userId || !notifData.title) return;
    if (isFakeOrDummyNotification(notifData)) return;

    const notif: AppNotification = {
      id: notifData.id || `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: notifData.userId,
      userPhone: notifData.userPhone || '',
      title: notifData.title,
      message: notifData.message,
      type: notifData.type,
      time: notifData.time || 'এইমাত্র',
      read: false,
      actionUrl: notifData.actionUrl,
      createdAt: new Date().toISOString()
    };

    setAllNotifications(prev => {
      const without = prev.filter(n => n.id !== notif.id && !isFakeOrDummyNotification(n));
      const updated = [notif, ...without];
      safeSetItem('lg_all_notifications', JSON.stringify(updated));
      return updated;
    });

    if (notif.userId !== 'all' && notif.userId !== 'admin') {
      try {
        const uKey = `lg_notifications_${notif.userId}`;
        const saved = localStorage.getItem(uKey);
        let list: AppNotification[] = saved ? JSON.parse(saved) : [];
        list = [notif, ...list.filter(n => n.id !== notif.id && !isFakeOrDummyNotification(n))];
        localStorage.setItem(uKey, JSON.stringify(list));
      } catch {}
    }

    try {
      fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notif)
      }).catch(() => {});
    } catch {}

    syncNotificationWithFirestore(notif).catch(() => {});
    return notif;
  }, []);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = safeGetItem<AuditLog[]>('lg_audit_logs', []);
    if (saved && saved.length > 0) return saved;
    return [
      {
        id: 'audit_init_1',
        type: 'deposit',
        targetId: 'dep_sample_1',
        action: 'Approved',
        status: 'approved',
        actorId: 'admin_master',
        actorName: 'Super Admin',
        targetUserName: 'মো. আরিফুল ইসলাম',
        targetUserPhone: '01712345678',
        amount: 500,
        timestamp: '০৭/০৩/২০২৬, দুপুর ০২:১৫',
        details: 'ইউজার মো. আরিফুল ইসলাম এর ৳৫০০ বিকাশ ডিপোজিট (TrxID: BK92817A) যাচাই করে ওয়ালেটে ক্রেডিট করা হয়েছে।'
      },
      {
        id: 'audit_init_2',
        type: 'deposit',
        targetId: 'dep_sample_2',
        action: 'Rejected',
        status: 'rejected',
        rejectionReason: 'ভুল ও অবাস্তব ট্রানজেকশন আইডি (TrxID নট ফাউন্ড)',
        actorId: 'admin_master',
        actorName: 'Super Admin',
        targetUserName: 'হাসিবুর রহমান',
        targetUserPhone: '01899887766',
        amount: 1000,
        timestamp: '০৭/০৩/২০২৬, দুপুর ০৩:৪০',
        details: 'ইউজার হাসিবুর রহমান এর ৳১০০০ ডিপোজিট আবেদন বাতিল করা হয়েছে।'
      },
      {
        id: 'audit_init_3',
        type: 'order',
        targetId: 'ORD-98214',
        action: 'Payment Verified',
        status: 'verified',
        actorId: 'admin_master',
        actorName: 'Super Admin',
        targetUserName: 'সুমাইয়া বেগম',
        targetUserPhone: '01611223344',
        amount: 1450,
        timestamp: '০৭/০৩/২০২৬, বিকাল ০৪:১০',
        details: 'অর্ডার #ORD-98214 এর বিকাশ অগ্রিম ডেলিভারি ফি ও পেমেন্ট সফলভাবে যাচাই করা হয়েছে।'
      },
      {
        id: 'audit_init_4',
        type: 'order',
        targetId: 'ORD-87123',
        action: 'Approved',
        status: 'approved',
        actorId: 'admin_master',
        actorName: 'Super Admin',
        targetUserName: 'কামরুল হাসান',
        targetUserPhone: '01511224455',
        amount: 320,
        timestamp: '০৭/০৩/২০২৬, বিকাল ০৪:৫০',
        details: 'অর্ডার #ORD-87123 সফলভাবে ডেলিভারি সম্পন্ন হয়েছে। রিসেলার লভ্যাংশ ৳৩২০ ওয়ালেটে রিলিজ করা হয়েছে।'
      },
      {
        id: 'audit_init_5',
        type: 'verification',
        targetId: 'usr_rahim_12',
        action: 'Approved',
        status: 'approved',
        actorId: 'admin_master',
        actorName: 'Super Admin',
        targetUserName: 'আব্দুর রহিম',
        targetUserPhone: '01755667788',
        amount: 100,
        timestamp: '০৭/০৩/২০২৬, বিকাল ০৫:০৫',
        details: 'ইউজার আব্দুর রহিম এর এনআইডি ও পেমেন্ট যাচাই করে ভেরিফাইড করা হয়েছে এবং রেফারারকে ৳২৫ বোনাস প্রদান করা হয়েছে।'
      }
    ];
  });

  useEffect(() => {
    safeSetItem('lg_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>(() => {
    const saved = safeGetItem<VerificationRequest[]>('lg_verification_requests', []);
    if (saved && saved.length > 0) return saved;
    return [
      {
        id: 'ver_init_101',
        userId: 'usr_shamim_99',
        userName: 'শামীম রেজা',
        userPhone: '01711223344',
        method: 'bKash',
        senderNumber: '01711223344',
        trxId: 'BKL8892147A',
        amount: 100,
        nidNumber: '19952671829012',
        submittedAt: '০৭/০৩/২০২৬, সন্ধ্যা ০৭:১৫',
        status: 'pending'
      },
      {
        id: 'ver_init_102',
        userId: 'usr_tanjila_44',
        userName: 'তানজিলা আক্তার',
        userPhone: '01988776655',
        method: 'Nagad',
        senderNumber: '01988776655',
        trxId: 'NG99182372',
        amount: 100,
        nidNumber: '20014567891234',
        submittedAt: '০৭/০৩/২০২৬, বিকাল ০৫:৩০',
        status: 'pending'
      }
    ];
  });

  useEffect(() => {
    safeSetItem('lg_verification_requests', JSON.stringify(verificationRequests));
  }, [verificationRequests]);

  const [reports, setReports] = useState<ReportItem[]>(() => {
    return safeGetItem<ReportItem[]>('lg_reports', []);
  });

  const [courseApplications, setCourseApplications] = useState<CourseFreelanceApplication[]>(() => {
    const list = safeGetItem<CourseFreelanceApplication[]>('lg_service_applications', []);
    return Array.isArray(list) ? list : [];
  });

  useEffect(() => {
    safeSetItem('lg_service_applications', JSON.stringify(courseApplications));
  }, [courseApplications]);

  const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => {
    const parsed = safeGetItem<SystemSettings | null>('lg_system_settings', null);
    if (parsed) {
      return {
        ...INITIAL_SYSTEM_SETTINGS,
        ...parsed,
        supportTelegramBot: parsed.supportTelegramBot || 'https://t.me/goodlifeadmin_bot',
        officialTelegramChannel: parsed.officialTelegramChannel || 'https://t.me/goodlifeofficialbd',
        adminTelegram: parsed.adminTelegram || 'https://t.me/goodlifeadmin',
        featureToggles: {
          ...INITIAL_SYSTEM_SETTINGS.featureToggles,
          ...(parsed.featureToggles || {})
        },
        featureRewards: {
          ...INITIAL_SYSTEM_SETTINGS.featureRewards,
          ...(parsed.featureRewards || {})
        },
        pageBannerAds: {
          ...INITIAL_SYSTEM_SETTINGS.pageBannerAds,
          ...(parsed.pageBannerAds || {}),
          pages: {
            ...INITIAL_SYSTEM_SETTINGS.pageBannerAds?.pages,
            ...(parsed.pageBannerAds?.pages || {})
          }
        },
        specialSocialConfig: {
          ...INITIAL_SYSTEM_SETTINGS.specialSocialConfig,
          ...(parsed.specialSocialConfig || {})
        }
      };
    }
    return INITIAL_SYSTEM_SETTINGS;
  });

  const [banners, setBanners] = useState<AppBanner[]>(() => {
    return safeGetItem<AppBanner[]>('lg_banners', INITIAL_BANNERS);
  });

  const [language, setLanguage] = useState<'bn' | 'en'>(() => {
    const savedLang = localStorage.getItem('lg_lang');
    return savedLang === 'en' || savedLang === 'bn' ? savedLang : 'bn';
  });
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isDeviceFrameActive, setIsDeviceFrameActive] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Profile viewing & targeting state
  const [viewingProfileUser, setViewingProfileUser] = useState<UserProfile | null>(null);
  const [targetProfilePostId, setTargetProfilePostId] = useState<string | null>(null);

  // Translation helper
  const t = getTranslation(language);

  // Clean and sanitize any past duplicate records in localStorage
  useEffect(() => {
    sanitizeRegisteredUsersStore();
    
    // Sync banner ads config from backend
    fetch('/api/banner-ads')
      .then(res => res.json())
      .then(data => {
        if (data && data.success && data.config) {
          setSystemSettings(prev => ({
            ...prev,
            pageBannerAds: {
              ...(prev.pageBannerAds || INITIAL_SYSTEM_SETTINGS.pageBannerAds || {
                enabled: true,
                adKey: 'b87ae65b2057f8d1935a8a65f245a61e',
                scriptUrl: 'https://www.highrevenueformat.com/b87ae65b2057f8d1935a8a65f245a61e/invoke.js',
                width: 728,
                height: 90,
                showTopBanner: true,
                showBottomBanner: true,
                pages: { ads_view: true, quiz_job: true, typing_job: true, ad_marketing: true }
              }),
              ...data.config,
              pages: {
                ...((prev.pageBannerAds || INITIAL_SYSTEM_SETTINGS.pageBannerAds)?.pages || {
                  ads_view: true, quiz_job: true, typing_job: true, ad_marketing: true
                }),
                ...(data.config.pages || {})
              }
            }
          }));
        }
      })
      .catch(() => {});
  }, []);

  // Sync to local storage & Firestore
  useEffect(() => {
    localStorage.setItem('lg_lang', language);
  }, [language]);

  // Strict Security Watchdog: Under no circumstances can non-01877722819 have admin/super_admin role
  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'super_admin') && !isAuthorizedAdminPhone(user.phone)) {
      setUser(prev => ({ ...prev, role: 'user' }));
    }
  }, [user?.phone, user?.role]);

  // Guaranteed 4-digit referral code watchdog
  useEffect(() => {
    if (user?.referralCode) {
      const strict4 = formatStrict4DigitReferral(user.referralCode);
      if (user.referralCode !== strict4) {
        setUser(prev => ({ ...prev, referralCode: strict4 }));
      }
    }
  }, [user?.referralCode]);
  useEffect(() => { 
    safeSetItem('lg_user', JSON.stringify(user)); 
    if (user?.id) {
      safeSetItem(`lg_user_${user.id}`, JSON.stringify(user));
      try {
        const saved = localStorage.getItem('lg_registered_users');
        if (saved) {
          const list: Array<{ user: UserProfile; password: string; wallet?: WalletState }> = JSON.parse(saved);
          const idx = list.findIndex(item => (item.user?.id || (item as any).id) === user.id);
          if (idx >= 0) {
            if (list[idx].user) {
              list[idx].user = user;
            } else {
              list[idx] = { user, password: (list[idx] as any).password, wallet: (list[idx] as any).wallet };
            }
            safeSetItem('lg_registered_users', JSON.stringify(list));
          }
        }
      } catch {}
    }
    syncUserWithFirestore(user, wallet);
  }, [user, wallet]);
  useEffect(() => { safeSetItem('lg_logged_in', String(isLoggedIn)); }, [isLoggedIn]);
  useEffect(() => { safeSetItem('lg_onboarding', String(hasSeenOnboarding)); }, [hasSeenOnboarding]);
  useEffect(() => { 
    safeSetItem('lg_wallet', JSON.stringify(wallet)); 
    if (user?.id) {
      safeSetItem(`lg_wallet_${user.id}`, JSON.stringify(wallet));
      try {
        const saved = localStorage.getItem('lg_registered_users');
        if (saved) {
          const list: Array<{ user: UserProfile; password: string; wallet?: WalletState }> = JSON.parse(saved);
          const idx = list.findIndex(item => (item.user?.id || (item as any).id) === user.id);
          if (idx >= 0) {
            if (list[idx].user) {
              list[idx].wallet = wallet;
            } else {
              list[idx] = { user: (list[idx] as any).user || (list[idx] as any), password: (list[idx] as any).password, wallet };
            }
            safeSetItem('lg_registered_users', JSON.stringify(list));
          }
        }
      } catch {}
    }
  }, [wallet, user?.id]);
  useEffect(() => { 
    safeSetItem('lg_transactions', JSON.stringify(transactions)); 
    if (user?.id) {
      safeSetItem(`lg_transactions_${user.id}`, JSON.stringify(transactions));
    }
  }, [transactions, user?.id]);
  useEffect(() => { safeSetItem('lg_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { safeSetItem('lg_cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { safeSetItem('lg_orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { safeSetItem('lg_wishlist', JSON.stringify(wishlist)); }, [wishlist]);
  useEffect(() => { safeSetItem('lg_jobs', JSON.stringify(jobs)); }, [jobs]);
  useEffect(() => { 
    // Compact and sanitize job submissions to never exceed storage limits
    const sanitizedSubs = (Array.isArray(jobSubmissions) ? jobSubmissions : []).slice(0, 30).map(s => {
      if (s.proofImage && s.proofImage.startsWith('data:image/') && s.proofImage.length > 25000) {
        return {
          ...s,
          proofImage: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=300&auto=format&fit=crop&q=80'
        };
      }
      return s;
    });
    safeSetItem('lg_job_submissions', JSON.stringify(sanitizedSubs)); 
  }, [jobSubmissions]);
  useEffect(() => {
    const sanitizedSubs = (adMarketingSubmissions || []).map(s => {
      if (s.proofImage && s.proofImage.startsWith('data:image/') && s.proofImage.length > 25000) {
        return {
          ...s,
          proofImage: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=300&auto=format&fit=crop&q=80'
        };
      }
      return s;
    });
    safeSetItem('lg_ad_marketing_submissions', JSON.stringify(sanitizedSubs));
  }, [adMarketingSubmissions]);
  useEffect(() => { safeSetItem('lg_bonuses', JSON.stringify(bonuses)); }, [bonuses]);
  useEffect(() => { safeSetItem('lg_withdrawals', JSON.stringify(withdrawalRequests)); }, [withdrawalRequests]);
  useEffect(() => { safeSetItem('lg_deposits', JSON.stringify(depositRequests)); }, [depositRequests]);
  useEffect(() => {
    safeSetItem('lg_all_notifications', JSON.stringify(allNotifications));
    if (user?.id && user.id !== 'usr_default_01') {
      safeSetItem(`lg_notifications_${user.id}`, JSON.stringify(notifications));
    }
  }, [allNotifications, notifications, user?.id]);
  useEffect(() => { safeSetItem('lg_audit_logs', JSON.stringify(auditLogs)); }, [auditLogs]);
  useEffect(() => { safeSetItem('lg_reels', JSON.stringify(reels)); }, [reels]);
  useEffect(() => { safeSetItem('lg_system_settings', JSON.stringify(systemSettings)); }, [systemSettings]);
  useEffect(() => { safeSetItem('lg_banners', JSON.stringify(banners)); }, [banners]);
  useEffect(() => { safeSetItem('lg_group_links', JSON.stringify(groupLinks)); }, [groupLinks]);

  // Permanent flag to prevent any old demo purge from ever running again
  useEffect(() => {
    localStorage.setItem('lg_demo_purged_v9', 'true');
    localStorage.setItem('lg_notifs_isolated_v2', 'true');
  }, []);

  // Cloud Firestore Hydration: Guarantees user & admin data (orders, deposits, verifications, users, logs)
  // is NEVER lost across page reloads, cache clears, or device switching
  useEffect(() => {
    let isMounted = true;

    fetchInitialFirestoreData().then((cloudData) => {
      if (!isMounted) return;

      // 1. Hydrate registered users
      if (cloudData.users && cloudData.users.length > 0) {
        setRegisteredUsers(prev => {
          const map = new Map<string, UserProfile>();
          prev.forEach(u => { if (u && u.id) map.set(u.id, u); });
          cloudData.users!.forEach(item => {
            if (item.user && item.user.id) {
              const existing = map.get(item.user.id);
              map.set(item.user.id, {
                ...existing,
                ...item.user,
                balance: item.wallet?.balance ?? item.user.balance ?? existing?.balance ?? 0
              });
            }
          });
          return Array.from(map.values());
        });

        // Update local storage backup of registered users
        try {
          const localList = getStoredRegisteredUsers();
          const userMap = new Map<string, { user: UserProfile; password?: string; wallet?: WalletState }>();
          localList.forEach(item => { if (item.user?.id) userMap.set(item.user.id, item); });
          cloudData.users.forEach(item => {
            if (item.user?.id) {
              const existing = userMap.get(item.user.id);
              userMap.set(item.user.id, {
                ...existing,
                user: { ...(existing?.user || {}), ...item.user },
                password: item.password || existing?.password,
                wallet: item.wallet || existing?.wallet
              });
            }
          });
          persistRegisteredUsers(Array.from(userMap.values()));
        } catch {}

        // If current active user exists in cloud, sync their profile and wallet
        setUser(currentActiveUser => {
          if (!currentActiveUser || !currentActiveUser.id) return currentActiveUser;
          const cloudMatch = cloudData.users!.find(u => 
            u.user.id === currentActiveUser.id || 
            (u.user.phone && normalizePhoneNumber(u.user.phone) === normalizePhoneNumber(currentActiveUser.phone))
          );
          if (cloudMatch) {
            if (cloudMatch.wallet) {
              setWallet(currentWallet => ({ ...currentWallet, ...cloudMatch.wallet }));
            }
            return { ...currentActiveUser, ...cloudMatch.user };
          }
          return currentActiveUser;
        });
      }

      // 2. Hydrate Deposit Requests
      if (cloudData.depositRequests && cloudData.depositRequests.length > 0) {
        setDepositRequests(prev => {
          const map = new Map<string, DepositRequest>();
          prev.forEach(d => { if (d.id) map.set(d.id, d); });
          cloudData.depositRequests!.forEach(d => { if (d.id) map.set(d.id, { ...(map.get(d.id) || {}), ...d }); });
          return Array.from(map.values());
        });
      }

      // 3. Hydrate Reselling Orders
      if (cloudData.orders && cloudData.orders.length > 0) {
        setOrders(prev => {
          const map = new Map<string, Order>();
          prev.forEach(o => { if (o.id) map.set(o.id, o); });
          cloudData.orders!.forEach(o => { if (o.id) map.set(o.id, { ...(map.get(o.id) || {}), ...o }); });
          return Array.from(map.values());
        });
      }

      // 4. Hydrate Withdrawals
      if (cloudData.withdrawals && cloudData.withdrawals.length > 0) {
        setWithdrawalRequests(prev => {
          const map = new Map<string, WithdrawalRequest>();
          prev.forEach(w => { if (w.id) map.set(w.id, w); });
          cloudData.withdrawals!.forEach(w => { if (w.id) map.set(w.id, { ...(map.get(w.id) || {}), ...w }); });
          return Array.from(map.values());
        });
      }

      // 5. Hydrate Verification Requests
      if (cloudData.verificationRequests && cloudData.verificationRequests.length > 0) {
        setVerificationRequests(prev => {
          const map = new Map<string, VerificationRequest>();
          prev.forEach(v => { if (v.id) map.set(v.id, v); });
          cloudData.verificationRequests!.forEach(v => { if (v.id) map.set(v.id, { ...(map.get(v.id) || {}), ...v }); });
          return Array.from(map.values());
        });
      }

      // 6. Hydrate Audit Logs
      if (cloudData.auditLogs && cloudData.auditLogs.length > 0) {
        setAuditLogs(prev => {
          const map = new Map<string, AuditLog>();
          prev.forEach(a => { if (a.id) map.set(a.id, a); });
          cloudData.auditLogs!.forEach(a => { if (a.id) map.set(a.id, { ...(map.get(a.id) || {}), ...a }); });
          return Array.from(map.values());
        });
      }

      // 7. Hydrate Course/Freelance Applications
      if (cloudData.applications && cloudData.applications.length > 0) {
        setCourseApplications(prev => {
          const map = new Map<string, CourseFreelanceApplication>();
          prev.forEach(a => { if (a.id) map.set(a.id, a); });
          cloudData.applications!.forEach(a => { if (a.id) map.set(a.id, { ...(map.get(a.id) || {}), ...a }); });
          return Array.from(map.values());
        });
      }

      // 8. Hydrate Reports
      if (cloudData.reports && cloudData.reports.length > 0) {
        setReports(prev => {
          const map = new Map<string, ReportItem>();
          prev.forEach(r => { if (r.id) map.set(r.id, r); });
          cloudData.reports!.forEach(r => { if (r.id) map.set(r.id, { ...(map.get(r.id) || {}), ...r }); });
          return Array.from(map.values());
        });
      }
    }).catch(err => {
      console.warn('Firestore initial hydration failed (using local storage cache):', err);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Real-time Firestore document subscription & wallet_updated listener for current logged-in user
  useEffect(() => {
    if (!user?.id || user.id === 'usr_default_01' || !isLoggedIn) return;

    // Immediately fetch freshest user data & balance from Firestore
    fetchFreshestUserData(user.id, user.phone).then(({ user: cloudUser, wallet: cloudWallet }) => {
      if (cloudWallet && typeof cloudWallet.balance === 'number') {
        setWallet(prev => {
          if (cloudWallet.balance === 0 && Number(prev.balance) > 0) return prev;
          return {
            ...prev,
            ...cloudWallet,
            balance: cloudWallet.balance
          };
        });
      }
      if (cloudUser) {
        setUser(prev => ({
          ...prev,
          ...cloudUser,
          balance: cloudWallet?.balance ?? cloudUser.balance ?? prev.balance
        }));
      }
    });

    // Real-time snapshot subscription to Firestore users/{uid}
    const unsubscribe = subscribeToUserRealtime(user.id, ({ user: cloudUser, wallet: cloudWallet }) => {
      if (cloudWallet && typeof cloudWallet.balance === 'number') {
        setWallet(prev => {
          if (cloudWallet.balance === 0 && Number(prev.balance) > 0) return prev;
          return {
            ...prev,
            ...cloudWallet,
            balance: cloudWallet.balance
          };
        });
      }
      if (cloudUser) {
        setUser(prev => ({
          ...prev,
          ...cloudUser,
          balance: cloudWallet?.balance ?? cloudUser.balance ?? prev.balance
        }));
      }
    });

    return () => {
      unsubscribe();
    };
  }, [user?.id, isLoggedIn]);

  // Window event listener for wallet updates (rewards, deposits, transactions)
  useEffect(() => {
    const handleWalletUpdated = (e: any) => {
      if (e?.detail?.wallet && typeof e.detail.wallet.balance === 'number') {
        const newBal = Number(e.detail.wallet.balance);
        setWallet(prev => ({
          ...prev,
          ...e.detail.wallet,
          balance: newBal
        }));
        setUser(prev => ({
          ...prev,
          balance: newBal
        }));
      }
      if (e?.detail?.transaction) {
        setTransactions(prev => [e.detail.transaction, ...prev.filter(t => t.id !== e.detail.transaction.id)]);
      }
    };

    window.addEventListener('goodlife:wallet_updated', handleWalletUpdated);
    return () => window.removeEventListener('goodlife:wallet_updated', handleWalletUpdated);
  }, []);

  // Real-time Firestore subscription, Backend API sync & SSE real-time sync for deposit requests & wallet
  useEffect(() => {
    // 0. Initial & periodic API sync from backend database
    const syncFromBackend = async () => {
      try {
        const res = await fetch('/api/deposits');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.deposits)) {
            const cleanDeposits = json.deposits.filter((d: DepositRequest) => !isDemoDepositRecord(d));
            setDepositRequests(prev => {
              const map = new Map<string, DepositRequest>();
              prev.forEach(d => { if (d && d.id && !isDemoDepositRecord(d)) map.set(d.id, d); });
              cleanDeposits.forEach((d: DepositRequest) => {
                if (d && d.id && !isDemoDepositRecord(d)) {
                  const existing = map.get(d.id);
                  map.set(d.id, { ...(existing || {}), ...d });
                }
              });
              const merged = Array.from(map.values()).sort((a, b) => {
                const timeA = a.timestamp || (a.createdAt ? Date.parse(a.createdAt) : 0) || 0;
                const timeB = b.timestamp || (b.createdAt ? Date.parse(b.createdAt) : 0) || 0;
                return timeB - timeA;
              });
              safeSetItem('lg_deposits', JSON.stringify(merged));
              return merged;
            });
          }
        }
      } catch (err) {
        // quiet fallback
      }

      // Sync registered users from backend database
      try {
        const uRes = await fetch('/api/users');
        if (uRes.ok) {
          const uJson = await uRes.json();
          if (uJson.success && Array.isArray(uJson.users)) {
            setRegisteredUsers(prev => {
              const uMap = new Map<string, UserProfile>();
              prev.forEach(u => { if (u && u.id) uMap.set(u.id, u); });
              uJson.users.forEach((u: UserProfile) => {
                if (u && u.id) {
                  const existing = uMap.get(u.id);
                  uMap.set(u.id, { ...(existing || {}), ...u });
                }
              });
              const mergedUsers = Array.from(uMap.values());
              persistRegisteredUsers(mergedUsers);
              return mergedUsers;
            });
          }
        }
      } catch {}

      // Sync shops from backend database
      try {
        const sRes = await fetch('/api/shops');
        if (sRes.ok) {
          const sJson = await sRes.json();
          if (sJson.success && Array.isArray(sJson.shops)) {
            setShops(sJson.shops);
            safeSetItem('lg_shops', JSON.stringify(sJson.shops));
          }
        }
      } catch {}

      // Sync vendors from backend database
      try {
        const vRes = await fetch('/api/vendors');
        if (vRes.ok) {
          const vJson = await vRes.json();
          if (vJson.success && Array.isArray(vJson.vendors)) {
            setVendors(vJson.vendors);
            safeSetItem('lg_vendors', JSON.stringify(vJson.vendors));
          }
        }
      } catch {}

      // Sync user wallet balance from backend if user is logged in
      if (user?.id && user.id !== 'usr_default_01') {
        try {
          const wRes = await fetch(`/api/wallet/${user.id}?phone=${encodeURIComponent(user.phone || '')}`);
          if (wRes.ok) {
            const wData = await wRes.json();
            if (wData.success && wData.wallet) {
              setWallet(prev => {
                const sBal = Number(wData.wallet.balance);
                if (typeof sBal === 'number' && !isNaN(sBal)) {
                  const sTime = wData.wallet.updatedAt ? new Date(wData.wallet.updatedAt).getTime() : 0;
                  const pTime = prev.updatedAt ? new Date(prev.updatedAt).getTime() : 0;
                  const curBal = Number(prev.balance) || 0;

                  // CRITICAL: Never overwrite a valid balance (> 0) with 0!
                  if (sBal === 0 && curBal > 0) {
                    fetch(`/api/wallet/${encodeURIComponent(user.id)}/sync`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ wallet: prev, phone: user.phone || '' })
                    }).catch(() => {});
                    return prev;
                  }

                  if (sBal > 0 && curBal === 0) {
                    return {
                      ...prev,
                      balance: sBal,
                      totalEarned: typeof wData.wallet.totalEarned === 'number' ? Math.max(Number(prev.totalEarned) || 0, wData.wallet.totalEarned) : prev.totalEarned,
                      totalWithdrawn: typeof wData.wallet.totalWithdrawn === 'number' ? Math.max(Number(prev.totalWithdrawn) || 0, wData.wallet.totalWithdrawn) : prev.totalWithdrawn,
                      updatedAt: wData.wallet.updatedAt || prev.updatedAt
                    };
                  }

                  if (sTime >= pTime || !prev.updatedAt) {
                    return {
                      ...prev,
                      balance: sBal,
                      totalEarned: typeof wData.wallet.totalEarned === 'number' ? Math.max(Number(prev.totalEarned) || 0, wData.wallet.totalEarned) : prev.totalEarned,
                      totalWithdrawn: typeof wData.wallet.totalWithdrawn === 'number' ? Math.max(Number(prev.totalWithdrawn) || 0, wData.wallet.totalWithdrawn) : prev.totalWithdrawn,
                      updatedAt: wData.wallet.updatedAt || prev.updatedAt
                    };
                  }
                }
                return prev;
              });
            } else if (wData.success && !wData.wallet && wallet) {
              fetch(`/api/wallet/${encodeURIComponent(user.id)}/sync`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ wallet, phone: user.phone || '' })
              }).catch(() => {});
            }
          }
        } catch {}
      }
    };

    syncFromBackend();
    const pollInterval = setInterval(syncFromBackend, 3000);

    // 1. Connect to SSE stream for zero-latency deposit events
    let sseSource: EventSource | null = null;
    try {
      if (typeof window !== 'undefined' && 'EventSource' in window) {
        sseSource = new EventSource('/api/realtime/events');
        sseSource.onmessage = (e) => {
          try {
            if (!e.data || e.data.startsWith(':')) return;
            const payload = JSON.parse(e.data);
            if (payload.type === 'new_deposit' && payload.deposit) {
              const d = payload.deposit;
              setDepositRequests(prev => {
                const map = new Map<string, DepositRequest>();
                map.set(d.id, d);
                prev.forEach(item => { if (!map.has(item.id)) map.set(item.id, item); });
                const merged = Array.from(map.values()).sort((a, b) => {
                  const timeA = a.timestamp || (a.createdAt ? Date.parse(a.createdAt) : 0) || 0;
                  const timeB = b.timestamp || (b.createdAt ? Date.parse(b.createdAt) : 0) || 0;
                  return timeB - timeA;
                });
                safeSetItem('lg_deposits', JSON.stringify(merged));
                return merged;
              });

              // Admin Real-Time Notification & Alert Trigger
              const currentUser = userRef.current;
              const isCurrentAdmin = Boolean(
                currentUser?.role === 'admin' || 
                currentUser?.role === 'super_admin' || 
                isAuthorizedAdminPhone(currentUser?.phone)
              );

              if (isCurrentAdmin) {
                try {
                  playAdminNotificationSound();
                } catch {}

                createAndSendNotification({
                  id: `notif_dep_${d.id}`,
                  userId: 'admin',
                  title: 'নতুন ডিপোজিট রিকোয়েস্ট!',
                  message: `${d.userName || 'গ্রাহক'} ৳${d.amount} ডিপোজিট রিকোয়েস্ট জমা দিয়েছেন (${d.paymentMethod} TrxID: ${d.trxId})`,
                  time: 'এইমাত্র',
                  type: 'wallet'
                });

                triggerPendingRequestAlert({
                  type: 'deposit',
                  id: d.id,
                  title: 'নতুন ডিপোজিট রিকোয়েস্ট!',
                  message: `ইউজার ${d.userName || 'গ্রাহক'} ৳${d.amount || 0} ডিপোজিট জমা দিয়েছেন (${d.paymentMethod})`,
                  amount: d.amount,
                  userName: d.userName,
                  userPhone: d.userPhone || d.senderPhone
                });
              }
            } else if (payload.type === 'deposit_approved' && payload.deposit) {
              const d = payload.deposit;
              setDepositRequests(prev => {
                const updated = prev.map(item => item.id === d.id ? { ...item, ...d } : item);
                safeSetItem('lg_deposits', JSON.stringify(updated));
                return updated;
              });

              // Check if deposit belongs to current user
              const curPhoneNorm = user?.phone ? normalizePhoneNumber(user.phone) : '';
              const depPhoneNorm = d.userPhone ? normalizePhoneNumber(d.userPhone) : (d.senderPhone ? normalizePhoneNumber(d.senderPhone) : '');
              const isMine = Boolean(
                (user?.id && user.id !== 'usr_default_01' && user.id === d.userId) ||
                (curPhoneNorm && depPhoneNorm && curPhoneNorm === depPhoneNorm)
              );

              if (isMine) {
                const depCreditKey = `lg_dep_credited_${d.id}`;
                if (localStorage.getItem(depCreditKey) !== 'true') {
                  try { localStorage.setItem(depCreditKey, 'true'); } catch {}
                  if (payload.wallet && typeof payload.wallet.balance === 'number') {
                    setWallet(prev => ({
                      ...prev,
                      balance: payload.wallet.balance,
                      updatedAt: payload.wallet.updatedAt || new Date().toISOString()
                    }));
                  } else {
                    setWallet(prev => ({
                      ...prev,
                      balance: Math.round(((Number(prev.balance) || 0) + Number(d.amount)) * 100) / 100,
                      updatedAt: new Date().toISOString()
                    }));
                  }

                  setTransactions(prev => prev.map(t => {
                    if (t.type === 'deposit' && (t.referenceId === d.trxId || t.id === `tx_${d.id}`)) {
                      return { ...t, status: 'completed' as const };
                    }
                    return t;
                  }));

                  try {
                    confetti({ particleCount: 60, spread: 55, origin: { y: 0.6 } });
                  } catch {}
                  setToastMessage(`আপনার ৳${d.amount} ডিপোজিট সফলভাবে অ্যাপ্রুভ হয়েছে এবং ব্যালেন্সে যুক্ত হয়েছে!`);
                }
              }
            } else if (payload.type === 'deposit_rejected' && payload.deposit) {
              const d = payload.deposit;
              setDepositRequests(prev => {
                const updated = prev.map(item => item.id === d.id ? { ...item, ...d } : item);
                safeSetItem('lg_deposits', JSON.stringify(updated));
                return updated;
              });
              setTransactions(prev => prev.map(t => {
                if (t.type === 'deposit' && (t.referenceId === d.trxId || t.id === `tx_${d.id}`)) {
                  return { ...t, status: 'rejected' as const };
                }
                return t;
              }));
            } else if (payload.type === 'withdrawal_submitted' && payload.withdrawal) {
              const w = payload.withdrawal;
              const curPhoneNorm = user?.phone ? normalizePhoneNumber(user.phone) : '';
              const wPhoneNorm = w.userPhone ? normalizePhoneNumber(w.userPhone) : (w.accountNumber ? normalizePhoneNumber(w.accountNumber) : '');
              const isMine = Boolean(
                (user?.id && user.id !== 'usr_default_01' && user.id === w.userId) ||
                (curPhoneNorm && wPhoneNorm && curPhoneNorm === wPhoneNorm)
              );
              if (isMine && payload.wallet && typeof payload.wallet.balance === 'number') {
                setWallet(prev => ({
                  ...prev,
                  balance: payload.wallet.balance,
                  updatedAt: payload.wallet.updatedAt || prev.updatedAt
                }));
              }
            } else if (payload.type === 'withdrawal_approved' && payload.withdrawal) {
              const w = payload.withdrawal;
              setWithdrawalRequests(prev => prev.map(item => item.id === w.id ? { ...item, status: 'approved' } : item));
              const curPhoneNorm = user?.phone ? normalizePhoneNumber(user.phone) : '';
              const wPhoneNorm = w.userPhone ? normalizePhoneNumber(w.userPhone) : (w.accountNumber ? normalizePhoneNumber(w.accountNumber) : '');
              const isMine = Boolean(
                (user?.id && user.id !== 'usr_default_01' && user.id === w.userId) ||
                (curPhoneNorm && wPhoneNorm && curPhoneNorm === wPhoneNorm)
              );
              if (isMine) {
                if (payload.wallet && typeof payload.wallet.balance === 'number') {
                  setWallet(prev => ({
                    ...prev,
                    balance: payload.wallet.balance,
                    totalWithdrawn: typeof payload.wallet.totalWithdrawn === 'number' ? payload.wallet.totalWithdrawn : prev.totalWithdrawn,
                    updatedAt: payload.wallet.updatedAt || prev.updatedAt
                  }));
                } else {
                  setWallet(prev => ({
                    ...prev,
                    totalWithdrawn: Math.round(((Number(prev.totalWithdrawn) || 0) + Number(w.amount)) * 100) / 100
                  }));
                }
                setTransactions(prev => prev.map(t => {
                  if (t.type === 'withdrawal' && (t.referenceId === w.id || t.id === `tx_${w.id}`)) {
                    return { ...t, status: 'completed' as const };
                  }
                  return t;
                }));
              }
            } else if (payload.type === 'withdrawal_rejected' && payload.withdrawal) {
              const w = payload.withdrawal;
              setWithdrawalRequests(prev => prev.map(item => item.id === w.id ? { ...item, status: 'rejected', rejectionReason: w.rejectionReason } : item));
              const curPhoneNorm = user?.phone ? normalizePhoneNumber(user.phone) : '';
              const wPhoneNorm = w.userPhone ? normalizePhoneNumber(w.userPhone) : (w.accountNumber ? normalizePhoneNumber(w.accountNumber) : '');
              const isMine = Boolean(
                (user?.id && user.id !== 'usr_default_01' && user.id === w.userId) ||
                (curPhoneNorm && wPhoneNorm && curPhoneNorm === wPhoneNorm)
              );
              if (isMine) {
                const refundKey = `lg_wd_refunded_${w.id}`;
                if (localStorage.getItem(refundKey) !== 'true') {
                  try { localStorage.setItem(refundKey, 'true'); } catch {}
                  if (payload.wallet && typeof payload.wallet.balance === 'number') {
                    setWallet(prev => ({
                      ...prev,
                      balance: payload.wallet.balance,
                      updatedAt: payload.wallet.updatedAt || new Date().toISOString()
                    }));
                  } else {
                    setWallet(prev => ({
                      ...prev,
                      balance: Math.round(((Number(prev.balance) || 0) + Number(w.amount)) * 100) / 100,
                      updatedAt: new Date().toISOString()
                    }));
                  }
                  setTransactions(prev => prev.map(t => {
                    if (t.type === 'withdrawal' && (t.referenceId === w.id || t.id === `tx_${w.id}`)) {
                      return { ...t, status: 'rejected' as const };
                    }
                    return t;
                  }));
                }
              }
            } else if (payload.type === 'new_notification' && payload.notification) {
              const notif = payload.notification;
              const currentUser = userRef.current;
              const currentUid = currentUser?.id || '';
              const currentPhone = currentUser?.phone ? normalizePhoneNumber(currentUser.phone) : '';
              const isCurAdmin = Boolean(
                currentUser?.role === 'admin' || 
                currentUser?.role === 'super_admin' || 
                isAuthorizedAdminPhone(currentUser?.phone)
              );

              const isForMe = 
                notif.userId === 'all' ||
                (notif.userId === 'admin' && isCurAdmin) ||
                (currentUid && notif.userId === currentUid) ||
                (currentPhone && notif.userPhone && normalizePhoneNumber(notif.userPhone) === currentPhone);

              if (isForMe) {
                setAllNotifications(prev => {
                  if (prev.some(n => n.id === notif.id)) return prev;
                  return [notif, ...prev];
                });
                if (notif.userId === currentUid && !notif.read) {
                  showToast(notif.title);
                }
              }
            } else if (payload.type === 'user_status_changed' && payload.userId) {
              const { userId, status, reason } = payload;
              setRegisteredUsers(prev => prev.map(u => {
                if (u.id === userId || u.phone === userId) {
                  return { ...u, status, statusReason: reason };
                }
                return u;
              }));
              const cur = userRef.current;
              if (cur && (cur.id === userId || cur.phone === userId)) {
                setUser(prev => ({ ...prev, status, statusReason: reason }));
                if (status === 'blocked') {
                  showToast('আপনার অ্যাকাউন্ট ব্লক করা হয়েছে!');
                } else if (status === 'suspended') {
                  showToast('আপনার অ্যাকাউন্ট সাময়িক স্থগিত করা হয়েছে!');
                }
              }
            } else if (payload.type === 'user_verified_changed' && payload.userId) {
              const { userId, isVerified, verificationStatus } = payload;
              setRegisteredUsers(prev => prev.map(u => {
                if (u.id === userId || u.phone === userId) {
                  return { ...u, isVerified, verificationStatus };
                }
                return u;
              }));
              const cur = userRef.current;
              if (cur && (cur.id === userId || cur.phone === userId)) {
                setUser(prev => ({ ...prev, isVerified, verificationStatus }));
              }
              if (isVerified) {
                creditReferralRewardRef.current(userId);
              }
            } else if (payload.type === 'user_role_changed' && payload.userId) {
              const { userId, role } = payload;
              setRegisteredUsers(prev => prev.map(u => {
                if (u.id === userId || u.phone === userId) {
                  return { ...u, role };
                }
                return u;
              }));
              const cur = userRef.current;
              if (cur && (cur.id === userId || cur.phone === userId)) {
                setUser(prev => ({ ...prev, role }));
              }
            } else if (payload.type === 'user_deleted' && payload.userId) {
              const { userId } = payload;
              setRegisteredUsers(prev => prev.filter(u => u.id !== userId && u.phone !== userId));
            } else if (payload.type === 'wallet_adjusted' && payload.userId) {
              const { userId, balance, totalEarned } = payload;
              setRegisteredUsers(prev => prev.map(u => {
                if (u.id === userId || u.phone === userId) {
                  return { ...u, balance };
                }
                return u;
              }));
              const cur = userRef.current;
              if (cur && (cur.id === userId || cur.phone === userId)) {
                setWallet(prev => ({
                  ...prev,
                  balance: typeof balance === 'number' ? balance : prev.balance,
                  totalEarned: typeof totalEarned === 'number' ? totalEarned : prev.totalEarned
                }));
              }
            } else if (payload.type === 'reward_claimed' && payload.userId) {
              const { userId, wallet: cloudWallet, transaction: cloudTx } = payload;
              const cur = userRef.current;
              if (cur && (cur.id === userId || cur.phone === userId)) {
                if (cloudWallet && typeof cloudWallet.balance === 'number') {
                  setWallet(prev => ({
                    ...prev,
                    ...cloudWallet,
                    balance: cloudWallet.balance
                  }));
                  setUser(prev => ({ ...prev, balance: cloudWallet.balance }));
                }
                if (cloudTx) {
                  setTransactions(prev => [cloudTx, ...prev.filter(t => t.id !== cloudTx.id)]);
                }
              }
            } else if (payload.type === 'shop_created' && payload.shop) {
              setShops(prev => {
                const exists = prev.some(s => s.id === payload.shop.id);
                const updated = exists ? prev.map(s => s.id === payload.shop.id ? payload.shop : s) : [...prev, payload.shop];
                safeSetItem('lg_shops', JSON.stringify(updated));
                return updated;
              });
            } else if (payload.type === 'shop_updated' && payload.shop) {
              setShops(prev => {
                const updated = prev.map(s => s.id === payload.shop.id ? payload.shop : s);
                safeSetItem('lg_shops', JSON.stringify(updated));
                return updated;
              });
            } else if (payload.type === 'shop_deleted' && payload.shopId) {
              setShops(prev => {
                const updated = prev.filter(s => s.id !== payload.shopId);
                safeSetItem('lg_shops', JSON.stringify(updated));
                return updated;
              });
            } else if (payload.type === 'vendor_created' && payload.vendor) {
              setVendors(prev => {
                const exists = prev.some(v => v.id === payload.vendor.id);
                const updated = exists ? prev.map(v => v.id === payload.vendor.id ? payload.vendor : v) : [...prev, payload.vendor];
                safeSetItem('lg_vendors', JSON.stringify(updated));
                return updated;
              });
            } else if (payload.type === 'vendor_updated' && payload.vendor) {
              setVendors(prev => {
                const updated = prev.map(v => v.id === payload.vendor.id ? payload.vendor : v);
                safeSetItem('lg_vendors', JSON.stringify(updated));
                return updated;
              });
            } else if (payload.type === 'vendor_deleted' && payload.vendorId) {
              setVendors(prev => {
                const updated = prev.filter(v => v.id !== payload.vendorId);
                safeSetItem('lg_vendors', JSON.stringify(updated));
                return updated;
              });
            }
          } catch {}
        };
      }
    } catch {}

    // 2. Subscribe to Firestore deposit_requests collection
    const unsubscribeFirestore = subscribeToDepositRequests((cloudDeposits) => {
      if (!cloudDeposits || cloudDeposits.length === 0) return;
      setDepositRequests(prev => {
        const map = new Map<string, DepositRequest>();
        prev.forEach(d => { if (d && d.id) map.set(d.id, d); });
        cloudDeposits.forEach(d => {
          if (d && d.id) {
            const existing = map.get(d.id);
            map.set(d.id, { ...(existing || {}), ...d });
          }
        });
        const merged = Array.from(map.values()).sort((a, b) => {
          const timeA = a.timestamp || (a.createdAt ? Date.parse(a.createdAt) : 0) || 0;
          const timeB = b.timestamp || (b.createdAt ? Date.parse(b.createdAt) : 0) || 0;
          return timeB - timeA;
        });
        safeSetItem('lg_deposits', JSON.stringify(merged));
        return merged;
      });
    });

    // 3. Cross-tab storage sync
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'lg_deposits' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setDepositRequests(parsed);
          }
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);

    // 4. Same-window custom event listener
    const handleDepositCustomEvent = (e: any) => {
      const newDep = e?.detail as DepositRequest | undefined;
      if (newDep && newDep.id) {
        setDepositRequests(prev => {
          const map = new Map<string, DepositRequest>();
          map.set(newDep.id, newDep);
          prev.forEach(d => { if (d && d.id && !map.has(d.id)) map.set(d.id, d); });
          const merged = Array.from(map.values()).sort((a, b) => {
            const timeA = a.timestamp || (a.createdAt ? Date.parse(a.createdAt) : 0) || 0;
            const timeB = b.timestamp || (b.createdAt ? Date.parse(b.createdAt) : 0) || 0;
            return timeB - timeA;
          });
          safeSetItem('lg_deposits', JSON.stringify(merged));
          return merged;
        });
      }
    };
    window.addEventListener('goodlife:deposit_updated', handleDepositCustomEvent);

    return () => {
      clearInterval(pollInterval);
      if (sseSource) {
        try { sseSource.close(); } catch {}
      }
      unsubscribeFirestore();
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('goodlife:deposit_updated', handleDepositCustomEvent);
    };
  }, [user?.id, user?.phone]);

  // Real-time Firestore sync for Micro Jobs and Job Submissions
  useEffect(() => {
    const unsubJobs = subscribeToMicroJobs((cloudJobs) => {
      if (Array.isArray(cloudJobs) && cloudJobs.length > 0) {
        setJobs(prev => {
          const map = new Map<string, MicroJob>();
          (Array.isArray(prev) ? prev : []).forEach(j => { if (j && j.id) map.set(j.id, j); });
          cloudJobs.forEach(j => { if (j && j.id) map.set(j.id, { ...(map.get(j.id) || {}), ...j }); });
          const merged = Array.from(map.values());
          safeSetItem('lg_jobs', JSON.stringify(merged));
          return merged;
        });
      }
    });

    const unsubSubs = subscribeToJobSubmissions((cloudSubs) => {
      if (Array.isArray(cloudSubs) && cloudSubs.length > 0) {
        setJobSubmissions(prev => {
          const map = new Map<string, JobSubmission>();
          (Array.isArray(prev) ? prev : []).forEach(s => { if (s && s.id) map.set(s.id, s); });
          cloudSubs.forEach(s => { if (s && s.id) map.set(s.id, { ...(map.get(s.id) || {}), ...s }); });
          const merged = Array.from(map.values());
          safeSetItem('lg_job_submissions', JSON.stringify(merged));
          return merged;
        });
      }
    });

    return () => {
      unsubJobs();
      unsubSubs();
    };
  }, []);

  // Keep selectedJob in sync with latest jobs array
  useEffect(() => {
    if (selectedJob) {
      const fresh = jobs.find(j => j.id === selectedJob.id);
      if (fresh && JSON.stringify(fresh) !== JSON.stringify(selectedJob)) {
        setSelectedJob(fresh);
      }
    }
  }, [jobs, selectedJob]);

  // User-specific notification hydration from Backend API, Cloud Firestore & Isolated Storage
  useEffect(() => {
    let isMounted = true;
    const uid = user?.id;
    if (!uid) return;

    const loadUserNotifications = async () => {
      try {
        // 1. Fetch from backend API endpoint with strict user targeting
        const queryParams = new URLSearchParams({
          userId: uid,
          role: user.role || '',
          phone: user.phone || ''
        });
        const res = await fetch(`/api/notifications?${queryParams.toString()}`);
        let apiNotifs: AppNotification[] = [];
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.notifications)) {
            apiNotifs = data.notifications;
          }
        }

        // 2. Fetch from Cloud Firestore
        const isCurrentAdmin = Boolean(
          user?.role === 'admin' || 
          user?.role === 'super_admin' || 
          isAuthorizedAdminPhone(user?.phone)
        );
        const cloudNotifs = await fetchNotificationsForUserFromFirestore(uid, isCurrentAdmin);

        if (!isMounted) return;

        // 3. Read isolated local cache
        const localKey = `lg_notifications_${uid}`;
        const savedLocal = localStorage.getItem(localKey);
        let localNotifs: AppNotification[] = [];
        if (savedLocal) {
          try { 
            const parsed = JSON.parse(savedLocal);
            if (Array.isArray(parsed)) {
              localNotifs = parsed.filter(n => !isFakeOrDummyNotification(n));
            }
          } catch {}
        }

        setAllNotifications(prev => {
          const map = new Map<string, AppNotification>();
          // Only populate real, non-fake notifications
          prev.forEach(n => { if (n.id && !isFakeOrDummyNotification(n)) map.set(n.id, n); });
          localNotifs.forEach(n => { if (n.id && !isFakeOrDummyNotification(n)) map.set(n.id, n); });
          cloudNotifs.forEach(n => { if (n.id && !isFakeOrDummyNotification(n)) map.set(n.id, n); });
          apiNotifs.forEach(n => { if (n.id && !isFakeOrDummyNotification(n)) map.set(n.id, n); });

          const merged = Array.from(map.values()).sort((a, b) => {
            const timeA = a.createdAt ? Date.parse(a.createdAt) : 0;
            const timeB = b.createdAt ? Date.parse(b.createdAt) : 0;
            return timeB - timeA;
          });

          safeSetItem('lg_all_notifications', JSON.stringify(merged));
          return merged;
        });
      } catch (err) {
        console.warn('Error loading user-specific notifications:', err);
      }
    };

    loadUserNotifications();

    // 4. Real-time Firestore subscription for user notifications
    const isCurrentAdmin = Boolean(
      user?.role === 'admin' || 
      user?.role === 'super_admin' || 
      isAuthorizedAdminPhone(user?.phone)
    );
    const unsubscribeUserNotifs = subscribeToUserNotifications(uid, (snapNotifs) => {
      if (!isMounted || !snapNotifs || snapNotifs.length === 0) return;
      setAllNotifications(prev => {
        const map = new Map<string, AppNotification>();
        prev.forEach(n => { if (n.id && !isFakeOrDummyNotification(n)) map.set(n.id, n); });
        snapNotifs.forEach(n => { if (n.id && !isFakeOrDummyNotification(n)) map.set(n.id, n); });
        return Array.from(map.values()).sort((a, b) => {
          const timeA = a.createdAt ? Date.parse(a.createdAt) : 0;
          const timeB = b.createdAt ? Date.parse(b.createdAt) : 0;
          return timeB - timeA;
        });
      });
    }, isCurrentAdmin);

    return () => {
      isMounted = false;
      unsubscribeUserNotifs();
    };
  }, [user?.id, user?.phone, user?.role]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const addTransaction = (tx: Omit<Transaction, 'id' | 'date'>) => {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const newTx: Transaction = {
      ...tx,
      userId: tx.userId || user?.id,
      id: generateTxId('tx'),
      date: formattedDate,
      createdAt: (tx as any).createdAt || now.toISOString()
    };
    setTransactions(prev => [newTx, ...prev.filter(t => t.id !== newTx.id)]);
  };

  // Auth Operations
  const loginWithCredentials = async (phoneOrEmail: string, password: string): Promise<{ success: boolean; message?: string }> => {
    if (!phoneOrEmail || !password) {
      return { success: false, message: language === 'bn' ? 'মোবাইল নম্বর / জিমেইল ও পাসওয়ার্ড প্রদান করুন।' : 'Please provide phone/Gmail and password.' };
    }

    const cleanInput = phoneOrEmail.trim();
    const cleanPhone = normalizePhoneNumber(cleanInput);
    const cleanEmail = normalizeEmail(cleanInput);

    // Strict admin credentials check: Only 01877722819
    if (isAuthorizedAdminPhone(cleanInput)) {
      let customPasswordMatch = false;
      let hasCustomUser = false;
      try {
        const savedUsersJson = localStorage.getItem('lg_registered_users');
        if (savedUsersJson) {
          const registeredList: Array<{ user: UserProfile; password: string; wallet?: WalletState }> = JSON.parse(savedUsersJson);
          const match = registeredList.find(item => isAuthorizedAdminPhone(item.user.phone));
          if (match) {
            hasCustomUser = true;
            if (match.password === password) {
              customPasswordMatch = true;
            }
          }
        }
      } catch {}

      const isDefaultPin = password === '7788' || password === '1234' || password === 'admin123';
      if (hasCustomUser && !customPasswordMatch && !isDefaultPin) {
        return { success: false, message: language === 'bn' ? 'এডমিন পাসওয়ার্ড সঠিক নয়!' : 'Incorrect Admin password!' };
      }

      // Restore admin's saved wallet & transactions if available
      try {
        const savedAdminWallet = localStorage.getItem('lg_wallet_usr_admin_01877722819');
        if (savedAdminWallet) {
          const parsed = JSON.parse(savedAdminWallet);
          setWallet(parsed);
          localStorage.setItem('lg_wallet', JSON.stringify(parsed));
        }
        const savedAdminTx = localStorage.getItem('lg_transactions_usr_admin_01877722819');
        if (savedAdminTx) {
          const cleanedAdminTxs = sanitizeAndDeduplicateTransactions(JSON.parse(savedAdminTx));
          setTransactions(cleanedAdminTxs);
          localStorage.setItem('lg_transactions_usr_admin_01877722819', JSON.stringify(cleanedAdminTxs));
        }
      } catch {}

      const adminUser: UserProfile = {
        id: 'usr_admin_01877722819',
        name: 'সুপার এডমিন (Admin)',
        phone: '01877722819',
        email: 'admin@kilagbe.com',
        avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23D97706'%3E%3Ccircle cx='12' cy='8' r='4'/%3E%3Cpath d='M4 20c0-4 4-6 8-6s8 2 8 6'/%3E%3C/svg%3E",
        role: 'super_admin',
        isVerified: true,
        verificationStatus: 'verified',
        referralCode: '1001',
        activationCode: 'KL-ADMIN',
        joinedDate: new Date().toISOString().split('T')[0],
        bio: 'Good Life প্ল্যাটফর্ম সুপার এডমিন'
      };
      setUser(adminUser);
      setIsLoggedIn(true);
      safeSetItem('lg_logged_in', 'true');
      safeSetItem('lg_user', JSON.stringify(adminUser));
      setShowAuthModal(false);
      showToast(language === 'bn' ? 'সুপার এডমিন (01877722819) হিসেবে সফলভাবে লগইন হয়েছে!' : 'Logged in as Super Admin (01877722819)!');
      return { success: true };
    }

    // 1. Check backend database API for real user authentication
    try {
      const serverRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneOrEmail: cleanInput, password })
      });
      const serverJson = await serverRes.json();
      if (serverRes.ok && serverJson.success && serverJson.user) {
        const safeUser: UserProfile = ((serverJson.user.role === 'admin' || serverJson.user.role === 'super_admin') && !isAuthorizedAdminPhone(serverJson.user.phone))
          ? { ...serverJson.user, role: 'user' }
          : serverJson.user;
        
        setUser(safeUser);
        setIsLoggedIn(true);
        safeSetItem('lg_logged_in', 'true');
        safeSetItem('lg_user', JSON.stringify(safeUser));
        safeSetItem(`lg_user_${safeUser.id}`, JSON.stringify(safeUser));
        safeSetItem(`lg_password_${safeUser.id}`, password);
        if (cleanPhone) safeSetItem(`lg_password_${cleanPhone}`, password);

        // Restore personal wallet
        let userWallet = serverJson.wallet;
        try {
          const savedWalletJson = localStorage.getItem(`lg_wallet_${safeUser.id}`);
          if (savedWalletJson) {
            const parsedSaved = JSON.parse(savedWalletJson);
            const serverBal = Number(userWallet?.balance) || 0;
            const savedBal = Number(parsedSaved?.balance) || 0;
            // CRITICAL: Never overwrite a valid balance (> 0) with 0!
            const validBal = serverBal > 0 ? serverBal : (savedBal > 0 ? savedBal : 0);
            userWallet = {
              ...(userWallet || {}),
              ...parsedSaved,
              balance: validBal
            };
          }
        } catch {}

        if (userWallet) {
          setWallet(userWallet);
          localStorage.setItem('lg_wallet', JSON.stringify(userWallet));
          localStorage.setItem(`lg_wallet_${safeUser.id}`, JSON.stringify(userWallet));
        }

        // Restore user transactions
        try {
          const savedTx = localStorage.getItem(`lg_transactions_${safeUser.id}`);
          if (savedTx) {
            const parsedTx = JSON.parse(savedTx);
            if (Array.isArray(parsedTx)) {
              const cleaned = sanitizeAndDeduplicateTransactions(parsedTx);
              setTransactions(cleaned);
              localStorage.setItem('lg_transactions', JSON.stringify(cleaned));
            }
          }
        } catch {}

        // Cache in local registered users so future logins are instant
        try {
          const savedUsersJson = localStorage.getItem('lg_registered_users');
          const registeredList: Array<any> = savedUsersJson ? JSON.parse(savedUsersJson) : [];
          const existingIndex = registeredList.findIndex(u => (u.user?.id || u.id) === safeUser.id);
          if (existingIndex >= 0) {
            registeredList[existingIndex] = { user: safeUser, password, wallet: userWallet || wallet };
          } else {
            registeredList.push({ user: safeUser, password, wallet: userWallet || wallet });
          }
          safeSetItem('lg_registered_users', JSON.stringify(registeredList));
        } catch {}

        setShowAuthModal(false);
        syncUserWithFirestore(safeUser, userWallet || wallet, password);
        showToast(language === 'bn' ? `স্বাগতম ${safeUser.name}! লগইন সফল হয়েছে।` : `Welcome ${safeUser.name}! Login successful.`);
        return { success: true };
      } else if (serverRes.status === 401) {
        // Explicit wrong password from database
        return { success: false, message: serverJson.message || (language === 'bn' ? 'পাসওয়ার্ড সঠিক নয়! দয়া করে সঠিক পাসওয়ার্ড দিন।' : 'Incorrect password! Please check and try again.') };
      } else if (serverRes.status === 403) {
        // Account blocked / suspended
        return { success: false, message: serverJson.message || (language === 'bn' ? 'আপনার অ্যাকাউন্টটি স্থগিত বা ব্লক করা হয়েছে।' : 'Your account has been suspended or blocked.') };
      }
    } catch (serverErr) {
      console.warn('Backend server login attempt skipped or failed, falling back to local lookup:', serverErr);
    }

    // 2. Check user registered database in local storage & memory state
    try {
      const candidateList = getStoredRegisteredUsers();
      // Also merge from registeredUsers state if missing
      registeredUsers.forEach(ru => {
        if (ru && ru.id && !candidateList.some(c => c.user?.id === ru.id)) {
          const uphone = normalizePhoneNumber(ru.phone);
          const pass = localStorage.getItem(`lg_password_${ru.id}`) || (uphone ? localStorage.getItem(`lg_password_${uphone}`) : undefined);
          candidateList.push({ user: ru, password: pass, wallet: ru.wallet });
        }
      });

      const match = candidateList.find(item => {
        if (!item || !item.user) return false;
        const u = item.user;
        const itemPhone = normalizePhoneNumber(u.phone);
        const itemEmail = normalizeEmail(u.email);
        return (cleanPhone && itemPhone && (itemPhone === cleanPhone || itemPhone.endsWith(cleanPhone) || cleanPhone.endsWith(itemPhone))) ||
               (cleanEmail && itemEmail && itemEmail === cleanEmail) ||
               (u.phone && u.phone.trim() === cleanInput) ||
               (u.id === cleanInput);
      });

      if (match) {
        // Check account status
        if (match.user.status === 'blocked' || match.user.status === 'suspended') {
          return {
            success: false,
            message: language === 'bn' 
              ? `আপনার অ্যাকাউন্টটি সাময়িকভাবে ${match.user.status === 'suspended' ? 'স্থগিত (Suspended)' : 'ব্লক (Blocked)'} করা হয়েছে। কারণ: ${match.user.statusReason || 'অ্যাডমিন পলিসি লঙ্ঘন'}`
              : `Account is ${match.user.status}.`
          };
        }

        const storedPass = match.password || 
          (match.user as any).password || 
          localStorage.getItem(`lg_password_${match.user.id}`) || 
          (cleanPhone ? localStorage.getItem(`lg_password_${cleanPhone}`) : null) || 
          (match.user.phone ? localStorage.getItem(`lg_password_${normalizePhoneNumber(match.user.phone)}`) : null) || 
          localStorage.getItem(`lg_user_pass_${match.user.id}`);

        if (storedPass && storedPass !== password) {
          return { success: false, message: language === 'bn' ? 'পাসওয়ার্ড সঠিক নয়! দয়া করে সঠিক পাসওয়ার্ড দিন।' : 'Incorrect password! Please check and try again.' };
        }

        // Restore latest profile
        let latestProfile = match.user;
        try {
          const savedUserJson = localStorage.getItem(`lg_user_${match.user.id}`);
          if (savedUserJson) {
            latestProfile = JSON.parse(savedUserJson);
          }
        } catch {}

        const safeUser: UserProfile = ((latestProfile.role === 'admin' || latestProfile.role === 'super_admin') && !isAuthorizedAdminPhone(latestProfile.phone))
          ? { ...latestProfile, role: 'user' }
          : latestProfile;
        setUser(safeUser);

        // Restore user's personal wallet without losing memory
        let restoredWallet = match.wallet;
        try {
          const savedWalletJson = localStorage.getItem(`lg_wallet_${match.user.id}`);
          if (savedWalletJson) {
            restoredWallet = JSON.parse(savedWalletJson);
          }
        } catch {}

        if (restoredWallet) {
          setWallet(restoredWallet);
          localStorage.setItem('lg_wallet', JSON.stringify(restoredWallet));
        }

        // Restore user's transactions history
        try {
          const savedTxJson = localStorage.getItem(`lg_transactions_${match.user.id}`);
          if (savedTxJson) {
            const userTxs = JSON.parse(savedTxJson);
            if (Array.isArray(userTxs)) {
              const cleanedUserTxs = sanitizeAndDeduplicateTransactions(userTxs);
              setTransactions(cleanedUserTxs);
              localStorage.setItem('lg_transactions', JSON.stringify(cleanedUserTxs));
              localStorage.setItem(`lg_transactions_${match.user.id}`, JSON.stringify(cleanedUserTxs));
            }
          }
        } catch {}

        // Restore user's job submissions
        try {
          const allJobs = safeGetItem<JobSubmission[]>('lg_job_submissions', []);
          if (Array.isArray(allJobs) && allJobs.length > 0) {
            setJobSubmissions(allJobs);
          }
        } catch {}

        setIsLoggedIn(true);
        safeSetItem('lg_logged_in', 'true');
        safeSetItem('lg_user', JSON.stringify(safeUser));
        safeSetItem(`lg_password_${match.user.id}`, password);
        if (cleanPhone) safeSetItem(`lg_password_${cleanPhone}`, password);
        setShowAuthModal(false);
        syncUserWithFirestore(safeUser, restoredWallet || wallet, password);
        showToast(language === 'bn' ? `স্বাগতম ${safeUser.name}! লগইন সফল হয়েছে এবং আপনার পূর্বের সকল তথ্য ও ব্যালেন্স লোড হয়েছে।` : `Welcome ${safeUser.name}! Login successful and your data restored.`);
        return { success: true };
      }
    } catch (localErr) {
      console.warn('Local storage login lookup error:', localErr);
    }

    // 3. Check Cloud Firestore for users registered from other browsers/devices or before cache clear
    try {
      const cloudUserRecord = await fetchUserFromFirestore(cleanInput);
      if (cloudUserRecord && cloudUserRecord.user) {
        if (cloudUserRecord.password && cloudUserRecord.password !== password) {
          return { success: false, message: language === 'bn' ? 'পাসওয়ার্ড সঠিক নয়! দয়া করে সঠিক পাসওয়ার্ড দিন।' : 'Incorrect password! Please check and try again.' };
        }

        if (cloudUserRecord.user.status === 'blocked' || cloudUserRecord.user.status === 'suspended') {
          return {
            success: false,
            message: language === 'bn' 
              ? `আপনার অ্যাকাউন্টটি সাময়িকভাবে ${cloudUserRecord.user.status === 'suspended' ? 'স্থগিত' : 'ব্লক'} করা হয়েছে।` 
              : `Account is ${cloudUserRecord.user.status}.`
          };
        }

        const safeUser: UserProfile = ((cloudUserRecord.user.role === 'admin' || cloudUserRecord.user.role === 'super_admin') && !isAuthorizedAdminPhone(cloudUserRecord.user.phone))
          ? { ...cloudUserRecord.user, role: 'user' }
          : cloudUserRecord.user;

        setUser(safeUser);

        if (cloudUserRecord.wallet) {
          setWallet(cloudUserRecord.wallet);
          safeSetItem('lg_wallet', JSON.stringify(cloudUserRecord.wallet));
          safeSetItem(`lg_wallet_${safeUser.id}`, JSON.stringify(cloudUserRecord.wallet));
        }

        // Add to local registered users so future logins are instant
        try {
          const savedUsersJson = localStorage.getItem('lg_registered_users');
          const registeredList: Array<any> = savedUsersJson ? JSON.parse(savedUsersJson) : [];
          if (!registeredList.some(u => (u.user?.id || u.id) === safeUser.id)) {
            registeredList.push({ user: safeUser, password, wallet: cloudUserRecord.wallet });
            safeSetItem('lg_registered_users', JSON.stringify(registeredList));
          }
        } catch {}

        setIsLoggedIn(true);
        safeSetItem('lg_logged_in', 'true');
        safeSetItem('lg_user', JSON.stringify(safeUser));
        safeSetItem(`lg_password_${safeUser.id}`, password);
        if (cleanPhone) safeSetItem(`lg_password_${cleanPhone}`, password);
        setShowAuthModal(false);
        showToast(language === 'bn' ? `স্বাগতম ${safeUser.name}! ক্লাউড ডাটাবেজ থেকে আপনার একাউন্ট ও ব্যালেন্স সফলভাবে রিকভার করা হয়েছে।` : `Welcome ${safeUser.name}! Account and data restored from cloud.`);
        return { success: true };
      }
    } catch (err) {
      console.warn('Firestore fallback login lookup error:', err);
    }

    return { 
      success: false, 
      message: language === 'bn' 
        ? 'এই মোবাইল নম্বর অথবা জিমেইল দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি! অনুগ্রহ করে সঠিক তথ্য দিন অথবা রেজিস্ট্রেশন করুন।' 
        : 'No account found with this phone or Gmail! Please check or register.' 
    };
  };

  const registerUser = (data: { 
    name: string; 
    phone: string; 
    email?: string; 
    password: string; 
    referralCode?: string; 
    avatar?: string 
  }): { success: boolean; message?: string } => {
    if (!data.name || !data.phone || !data.password) {
      return { success: false, message: language === 'bn' ? 'নাম, মোবাইল নম্বর ও পাসওয়ার্ড পূরণ করুন।' : 'Please fill name, phone and password.' };
    }

    const cleanName = data.name.trim();
    const rawPhone = data.phone.trim();
    const rawEmail = data.email?.trim() || '';

    const cleanPhone = normalizePhoneNumber(rawPhone);
    const cleanEmail = rawEmail ? normalizeEmail(rawEmail) : `${cleanPhone}@kilagbe.com`;

    // Strict 11-digit Bangladeshi mobile number validation
    if (!cleanPhone || !isValidBangladeshiPhone(cleanPhone)) {
      return { 
        success: false, 
        message: language === 'bn' 
          ? 'সঠিক ১১-ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX, 018XXXXXXXX)' 
          : 'Enter a valid 11-digit Bangladeshi mobile number (e.g. 017XXXXXXXX).' 
      };
    }

    // Strict email/Gmail format validation if provided
    if (rawEmail && !isValidEmail(rawEmail)) {
      return { 
        success: false, 
        message: language === 'bn' 
          ? 'সঠিক জিমেইল / ইমেইল ঠিকানা দিন (যেমন: yourname@gmail.com)' 
          : 'Enter a valid Gmail or email address (e.g. yourname@gmail.com).' 
      };
    }

    // STRICT UNIQUENESS ENFORCEMENT: Under no circumstances can there be 2 accounts with the same phone or Gmail
    const uniqueness = checkAccountUniqueness(cleanPhone, rawEmail ? cleanEmail : undefined);
    if (!uniqueness.isUnique) {
      return {
        success: false,
        message: language === 'bn' ? uniqueness.messageBn : uniqueness.messageEn
      };
    }

    // Additional direct validation against localStorage array
    try {
      const savedUsersJson = localStorage.getItem('lg_registered_users');
      const existing: Array<{ user: UserProfile; password: string; wallet?: WalletState }> = savedUsersJson ? JSON.parse(savedUsersJson) : [];
      
      const phoneConflict = existing.find(u => normalizePhoneNumber(u.user.phone) === cleanPhone);
      if (phoneConflict) {
        return { 
          success: false, 
          message: language === 'bn' 
            ? `এই মোবাইল নম্বর (${cleanPhone}) দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি করা আছে! এক নম্বরে একটার বেশি অ্যাকাউন্ট করা যাবে না।` 
            : `An account with this phone (${cleanPhone}) already exists! Only 1 account is allowed per phone.` 
        };
      }

      if (rawEmail) {
        const emailConflict = existing.find(u => normalizeEmail(u.user.email) === cleanEmail);
        if (emailConflict) {
          return { 
            success: false, 
            message: language === 'bn' 
              ? `এই জিমেইল / ইমেইল (${cleanEmail}) দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট রয়েছে! এক জিমেইলে একটার বেশি অ্যাকাউন্ট করা যাবে না।` 
              : `An account with this Gmail (${cleanEmail}) already exists! Only 1 account is allowed per Gmail.` 
          };
        }
      }
    } catch {
      // ignore
    }

    const newUserId = `usr_${Date.now()}`;
    const generatedReferral = generateShortReferralCode(4); // strictly 4 numeric digits
    const signupBonusAmount = Number(systemSettings.signupBonus) || 10;
    const cleanReferral = (data.referralCode || localStorage.getItem('lg_pending_ref') || '').trim().toUpperCase();
    const referralExtraBonus = cleanReferral ? 5 : 0;
    const totalWelcomeBonus = signupBonusAmount + referralExtraBonus;

    const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23D97706'%3E%3Ccircle cx='12' cy='8' r='4'/%3E%3Cpath d='M4 20c0-4 4-6 8-6s8 2 8 6'/%3E%3C/svg%3E";
    const userAvatar = data.avatar?.trim() || defaultAvatar;

    const isThisAdmin = isAuthorizedAdminPhone(cleanPhone);

    // Strict referral matching helpers
    const strictCleanReferral = formatStrict4DigitReferral(cleanReferral);

    const isCodeMatch = (code?: string) => {
      if (!code || !cleanReferral) return false;
      const u = code.trim().toUpperCase();
      const s = formatStrict4DigitReferral(u);
      return u === cleanReferral || s === cleanReferral || s === strictCleanReferral;
    };

    let foundReferrerName = '';
    let savedUsersList: Array<{ user: UserProfile; password: string; wallet?: WalletState }> = [];
    try {
      const savedUsersJson = localStorage.getItem('lg_registered_users');
      if (savedUsersJson) {
        savedUsersList = JSON.parse(savedUsersJson);
      }
    } catch {}

    if (cleanReferral) {
      let referrerUser: UserProfile | null = null;
      let referrerWallet: WalletState | null = null;
      let referrerSavedIdx = -1;

      // 1. Check currently active user
      if (user?.referralCode && isCodeMatch(user.referralCode)) {
        referrerUser = user;
        referrerWallet = wallet;
      }

      // 2. Check savedUsersList
      if (!referrerUser) {
        const idx = savedUsersList.findIndex(u => u.user && isCodeMatch(u.user.referralCode));
        if (idx >= 0) {
          referrerSavedIdx = idx;
          referrerUser = savedUsersList[idx].user;
          referrerWallet = savedUsersList[idx].wallet || null;
        }
      }

      // 3. Check registeredUsers state
      if (!referrerUser) {
        const foundInReg = registeredUsers.find(u => isCodeMatch(u.referralCode));
        if (foundInReg) {
          referrerUser = foundInReg;
        }
      }

      // 4. Check initial default user
      if (!referrerUser && isCodeMatch(INITIAL_USER.referralCode)) {
        referrerUser = INITIAL_USER;
      }

      if (referrerUser) {
        foundReferrerName = referrerUser.name;
        // User is not verified at registration; referral reward will strictly be credited when the user becomes Verified.
        try {
          localStorage.removeItem('lg_pending_ref');
        } catch {}
      }
    }

    const newUserProfile: UserProfile = {
      id: newUserId,
      name: cleanName,
      phone: cleanPhone,
      email: cleanEmail,
      avatar: userAvatar,
      role: isThisAdmin ? 'super_admin' : 'user',
      isVerified: isThisAdmin,
      verificationStatus: isThisAdmin ? 'verified' : 'unverified',
      referralCode: generatedReferral,
      referredBy: cleanReferral || undefined,
      referredByName: foundReferrerName || undefined,
      activationCode: `KL-${generatedReferral}`,
      joinedDate: new Date().toISOString().split('T')[0],
      bio: isThisAdmin ? 'Good Life প্ল্যাটফর্ম সুপার এডমিন' : 'Good Life সদস্য'
    };

    const initialWallet: WalletState = {
      balance: totalWelcomeBonus,
      pendingBalance: 0,
      totalWithdrawn: 0,
      totalEarned: totalWelcomeBonus,
      incomeBreakdown: {
        jobIncome: 0,
        referralIncome: referralExtraBonus,
        resellingProfit: 0,
        bonusIncome: signupBonusAmount,
        affiliateIncome: 0,
        adsIncome: 0,
        otherIncome: 0
      }
    };

    // Save to registered database in localStorage
    try {
      savedUsersList.push({ user: newUserProfile, password: data.password, wallet: initialWallet });
      safeSetItem('lg_registered_users', JSON.stringify(savedUsersList));
      safeSetItem(`lg_wallet_${newUserId}`, JSON.stringify(initialWallet));
      safeSetItem(`lg_user_${newUserId}`, JSON.stringify(newUserProfile));
      safeSetItem(`lg_password_${newUserId}`, data.password);
      if (cleanPhone) {
        safeSetItem(`lg_password_${cleanPhone}`, data.password);
      }
    } catch {
      // ignore
    }

    // Persist to server backend database with password
    try {
      fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newUserProfile,
          password: data.password
        })
      }).catch(() => {});
    } catch {}

    setUser(newUserProfile);
    setWallet(initialWallet);
    setRegisteredUsers(prev => [...prev.filter(u => u.id !== newUserProfile.id), newUserProfile]);
    setIsLoggedIn(true);
    safeSetItem('lg_logged_in', 'true');
    safeSetItem('lg_user', JSON.stringify(newUserProfile));
    safeSetItem('lg_wallet', JSON.stringify(initialWallet));
    setShowAuthModal(false);

    // Save & sync to Firestore database
    syncUserWithFirestore(newUserProfile, initialWallet, data.password);

    // Add bonus transaction
    if (signupBonusAmount > 0) {
      addTransaction({
        type: 'bonus',
        amount: signupBonusAmount,
        status: 'completed',
        description: `নতুন একাউন্ট সাইন-আপ বোনাস (Welcome Bonus)`
      });
    }

    if (referralExtraBonus > 0) {
      addTransaction({
        type: 'bonus',
        amount: referralExtraBonus,
        status: 'completed',
        description: `রেফারেল কোড ব্যবহারের রিওয়ার্ড বোনাস (${cleanReferral})`
      });
    }

    try {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } catch {
      // fallback
    }

    showToast(
      language === 'bn' 
        ? `অভিনন্দন ${data.name}! অ্যাকাউন্ট তৈরি সফল এবং ৳${totalWelcomeBonus} ওয়েলকাম বোনাস যোগ হয়েছে।` 
        : `Congratulations ${data.name}! Registered & received ৳${totalWelcomeBonus} welcome bonus.`
    );

    return { success: true };
  };

  const loginAsRole = (role: UserProfile['role']) => {
    const updated: UserProfile = {
      ...user,
      role,
      name: role === 'super_admin' ? 'এডমিন ম্যানেজার (Admin)' : role === 'vendor' ? 'রয়েল শপ ভেন্ডর' : role === 'reseller' ? 'প্রো রিসেলার' : (user?.name && user?.name !== 'Nusaib' ? user.name : 'ব্যবহারকারী'),
      phone: role === 'super_admin' ? '01877722819' : role === 'vendor' ? '01912345678' : role === 'reseller' ? '01812345678' : '01712345678',
      isVerified: role === 'super_admin' || role === 'vendor' ? true : user.isVerified
    };
    setUser(updated);
    setIsLoggedIn(true);
    localStorage.setItem('lg_logged_in', 'true');
    setShowAuthModal(false);
    showToast(`স্বাগতম! আপনি ${role === 'super_admin' ? 'এডমিন' : role === 'vendor' ? 'ভেন্ডর' : role === 'reseller' ? 'রিসেলার' : 'ইউজার'} হিসেবে লগইন করেছেন।`);
  };

  const logout = () => {
    setIsLoggedIn(false);
    localStorage.setItem('lg_logged_in', 'false');
    setIsSideDrawerOpen(false);
    setIsAdminDashboardOpen(false);
    setIsSettingsOpen(false);
    setIsNotificationsOpen(false);
    setIsWalletOpen(false);
    setIsWithdrawOpen(false);
    setIsAddMoneyOpen(false);
    setIsCartOpen(false);
    setIsCheckoutOpen(false);
    setIsJobHistoryOpen(false);
    setActiveIncomeModal(null);
    setActiveTab('home');
    showToast(language === 'bn' ? 'সফলভাবে সাইন আউট করা হয়েছে।' : 'Signed out successfully.');
  };

  const verifyProfile = (nid: string, addressText: string) => {
    const reqId = `ver_${Date.now()}`;
    setUser(prev => ({
      ...prev,
      nidNumber: nid,
      isVerified: false,
      verificationStatus: 'pending',
      bio: prev.bio || addressText
    }));
    setIsVerificationModalOpen(false);

    const newReq: VerificationRequest = {
      id: reqId,
      userId: user.id,
      userName: user.name,
      userPhone: user.phone,
      method: 'NID KYC',
      senderNumber: user.phone,
      trxId: 'KYC-' + Math.floor(100000 + Math.random() * 900000),
      amount: 100,
      nidNumber: nid,
      submittedAt: new Date().toLocaleString('bn-BD'),
      status: 'pending'
    };

    setVerificationRequests(prev => [newReq, ...prev]);
    syncVerificationRequestWithFirestore(newReq);

    // Trigger Admin real-time chime and alert
    triggerPendingRequestAlert({
      type: 'verification',
      id: reqId,
      title: 'নতুন ভেরিফিকেশন আবেদন!',
      message: `${user.name} (${user.phone}) অ্যাকাউন্ট ভেরিফিকেশনের জন্য এনআইডি জমা দিয়েছেন।`,
      amount: 100,
      userName: user.name,
      userPhone: user.phone
    });

    // Notify admin
    createAndSendNotification({
      id: `notif_verify_${Date.now()}`,
      userId: 'admin',
      title: 'নতুন ভেরিফিকেশন রিকোয়েস্ট',
      message: `${user.name} (${user.phone}) ভেরিফিকেশনের জন্য রিকোয়েস্ট পাঠিয়েছেন।`,
      time: 'এইমাত্র',
      type: 'announcement'
    });

    // Add to audit trail
    addAuditLog({
      type: 'verification',
      targetId: reqId,
      action: 'Request Submitted',
      status: 'pending',
      actorId: user.id,
      actorName: user.name,
      targetUserName: user.name,
      targetUserPhone: user.phone,
      amount: 100,
      details: `ইউজার ${user.name} এনআইডি (${nid}) ভেরিফিকেশনের জন্য আবেদন করেছেন। স্ট্যাটাস: পেন্ডিং।`
    });

    showToast(language === 'bn' ? 'ভেরিফিকেশন রিকোয়েস্ট সফলভাবে জমা হয়েছে! এডমিন শীঘ্রই যাচাই করবে।' : 'Verification request submitted! Admin will verify soon.');
  };

  const updateUserProfile = (updatedFields: Partial<UserProfile>) => {
    if (updatedFields.phone || updatedFields.email) {
      const targetPhone = updatedFields.phone ? normalizePhoneNumber(updatedFields.phone) : undefined;
      const targetEmail = updatedFields.email ? normalizeEmail(updatedFields.email) : undefined;
      const uniqueness = checkAccountUniqueness(targetPhone, targetEmail, user.id);
      if (!uniqueness.isUnique) {
        showToast(language === 'bn' ? uniqueness.messageBn : uniqueness.messageEn);
        return;
      }
    }

    setUser(prev => {
      const updated: UserProfile = {
        ...prev,
        ...updatedFields,
        phone: updatedFields.phone ? normalizePhoneNumber(updatedFields.phone) : prev.phone,
        email: updatedFields.email ? normalizeEmail(updatedFields.email) : prev.email,
        address: updatedFields.address 
          ? { ...(prev.address || { division: '', district: '', area: '' }), ...updatedFields.address }
          : prev.address
      };
      try {
        safeSetItem('lg_user', JSON.stringify(updated));
        const savedUsersJson = localStorage.getItem('lg_registered_users');
        if (savedUsersJson) {
          const registeredUsers = JSON.parse(savedUsersJson);
          const idx = registeredUsers.findIndex((u: { user: UserProfile }) => u.user.id === updated.id || u.user.phone === updated.phone);
          if (idx !== -1) {
            registeredUsers[idx].user = updated;
            safeSetItem('lg_registered_users', JSON.stringify(registeredUsers));
          }
        }
        syncUserWithFirestore(updated, wallet);
      } catch (err) {
        console.error('Error saving updated profile:', err);
      }
      return updated;
    });
  };

  const refreshUserData = async () => {
    if (!user?.id && !user?.phone) return;
    try {
      const { user: cloudUser, wallet: cloudWallet } = await fetchFreshestUserData(user.id, user.phone);
      if (cloudUser) {
        setUser(prev => {
          const merged = { ...prev, ...cloudUser };
          safeSetItem('lg_user', JSON.stringify(merged));
          return merged;
        });
      }
      if (cloudWallet) {
        setWallet(prev => {
          const merged = { ...prev, ...cloudWallet };
          safeSetItem('lg_wallet', JSON.stringify(merged));
          return merged;
        });
      }
    } catch (err) {
      console.warn('refreshUserData error:', err);
    }
  };

  // Cart Operations
  const addToCart = (
    product: Product, 
    quantity = 1, 
    color?: string, 
    size?: string, 
    customSellingPrice?: number, 
    customResellerProfit?: number
  ) => {
    setCart(prev => {
      const existing = prev.find(item => 
        item.product.id === product.id && 
        item.selectedSize === size && 
        item.selectedColor === color &&
        item.customSellingPrice === customSellingPrice
      );
      if (existing) {
        return prev.map(item => item === existing ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...prev, { 
        product, 
        quantity, 
        selectedColor: color, 
        selectedSize: size,
        customSellingPrice,
        customResellerProfit
      }];
    });
    showToast(`"${product.name}" কার্টে যোগ করা হয়েছে!`);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
    showToast('পণ্যটি কার্ট থেকে সরানো হয়েছে।');
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => item.product.id === productId ? { ...item, quantity } : item));
  };

  const clearCart = () => setCart([]);

  const persistWishlistToFirestore = async (wishlist: string[]) => {
    if (user?.id) {
      try {
        const userRef = doc(db, 'users', user.id);
        await updateDoc(userRef, { wishlist });
        setUser(prev => ({ ...prev, wishlist }));
      } catch (error) {
        console.warn('Note: persisting wishlist to Firestore (saved locally):', error);
      }
    }
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const exists = prev.includes(productId);
      const newWishlist = exists 
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
      
      persistWishlistToFirestore(newWishlist);

      if (exists) {
        showToast('উইশলিস্ট থেকে বাদ দেওয়া হয়েছে');
      } else {
        showToast('উইশলিস্টে সেভ করা হয়েছে ❤️');
      }
      return newWishlist;
    });
  };

  // Orders
  const createOrder = (orderDetails: {
    customerName: string;
    phone: string;
    address: { division: string; district: string; upazila: string; area: string };
    paymentMethod: 'cod' | 'wallet' | 'bkash' | 'nagad' | 'rocket';
    deliveryAdvancePaid?: boolean;
    deliveryAdvanceMethod?: 'bkash' | 'nagad' | 'rocket' | 'wallet';
    deliveryAdvanceTrxId?: string;
    shopId?: string;
    shopName?: string;
  }) => {
    if (cart.length === 0) return null;

    const subtotal = cart.reduce((sum, item) => {
      const itemSellingPrice = item.customSellingPrice ?? item.product.sellingPrice;
      return sum + (itemSellingPrice * item.quantity);
    }, 0);
    const deliveryCharge = 60;
    const cashback = cart.reduce((sum, item) => sum + (item.product.cashback * item.quantity), 0);
    const resellerProfit = cart.reduce((sum, item) => {
      const adminPrice = item.product.supplierPrice || item.product.adminPrice || 0;
      const itemSellingPrice = item.customSellingPrice ?? item.product.sellingPrice;
      const profitPerPiece = item.customResellerProfit !== undefined
        ? item.customResellerProfit
        : (item.product.resellerProfit || Math.max(0, itemSellingPrice - adminPrice));
      return sum + (profitPerPiece * item.quantity);
    }, 0);
    const total = subtotal + deliveryCharge;

    if (orderDetails.paymentMethod === 'wallet') {
      if (wallet.balance < total) {
        showToast('ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই! বিকাশ অথবা নগদ সিলেক্ট করুন।');
        return null;
      }
      // Deduct wallet
      setWallet(prev => ({
        ...prev,
        balance: prev.balance - total
      }));
      addTransaction({
        type: 'adjustment',
        amount: total,
        status: 'completed',
        description: `অর্ডার পেমেন্ট (কার্ট থেকে ${cart.length} টি পণ্য)`
      });
    }

    const orderId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    const effectiveShopId = orderDetails.shopId || cart[0]?.product?.shopId || activeShopId || 'shop_main';
    const effectiveShop = shops.find(s => s.id === effectiveShopId);
    const effectiveShopName = orderDetails.shopName || effectiveShop?.name || 'মেইন শপ';

    const newOrder: Order = {
      id: orderId,
      userId: user.id,
      resellerId: user.id,
      shopId: effectiveShopId,
      shopName: effectiveShopName,
      customerName: orderDetails.customerName,
      phone: orderDetails.phone,
      address: orderDetails.address,
      items: [...cart],
      subtotal,
      discount: 0,
      deliveryCharge,
      deliveryAdvancePaid: true,
      deliveryAdvanceMethod: orderDetails.deliveryAdvanceMethod || (orderDetails.paymentMethod === 'cod' ? 'bkash' : (orderDetails.paymentMethod as any)),
      deliveryAdvanceTrxId: orderDetails.deliveryAdvanceTrxId,
      cashback,
      resellerProfit: resellerProfit || cashback,
      profit: resellerProfit || cashback,
      paymentVerified: false,
      earningsReleased: false,
      total,
      paymentMethod: orderDetails.paymentMethod,
      status: 'pending',
      createdAt: new Date().toLocaleString('bn-BD'),
      trackingNumber: `LG-EXP-${Math.floor(100000 + Math.random() * 900000)}`
    };

    setOrders(prev => [newOrder, ...prev]);
    clearCart();
    setIsCheckoutOpen(false);
    syncOrderWithFirestore(newOrder);

    // Trigger Admin Real-time chime and alert
    triggerPendingRequestAlert({
      type: 'order',
      id: orderId,
      title: 'নতুন শপ/রিসেলিং অর্ডার!',
      message: `অর্ডার #${orderId} (${orderDetails.customerName}) পেমেন্ট ও ট্রানজেকশন ভেরিফিকেশনের জন্য অপেক্ষমাণ।`,
      amount: total,
      userName: orderDetails.customerName,
      userPhone: orderDetails.phone
    });

    // Add Audit Log
    addAuditLog({
      type: 'order',
      targetId: orderId,
      action: 'Request Submitted',
      status: 'pending',
      actorId: user.id,
      actorName: user.name,
      targetUserName: orderDetails.customerName,
      targetUserPhone: orderDetails.phone,
      amount: total,
      details: `নতুন রিসেলিং অর্ডার #${orderId} সাবমিট হয়েছে (মোট: ৳${total}, সম্ভাব্য লভ্যাংশ: ৳${resellerProfit || cashback})। পেমেন্ট যাচাই অপেক্ষমাণ।`
    });

    // Notification
    createAndSendNotification({
      id: `notif_${Date.now()}`,
      userId: user.id,
      userPhone: user.phone,
      title: 'নতুন অর্ডার প্লেস হয়েছে',
      message: `আপনার অর্ডার #${orderId} সাবমিট হয়েছে। এডমিন ভেরিফাই করলে কনফার্ম হবে।`,
      time: 'এইমাত্র',
      type: 'order'
    });

    try {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } });
    } catch {
      // safe fallback
    }

    showToast(`অর্ডার সাবমিট হয়েছে! অর্ডার আইডি: ${orderId}`);
    return newOrder;
  };

  // Job Submission
  const submitJobProof = (
    job: MicroJob, 
    proofText: string, 
    proofImage?: string,
    proofLink?: string
  ) => {
    if (!job) return;
    try {
      const uid = user?.id || 'guest';
      const uName = user?.name || (user?.phone ? `ইউজার-${user.phone.slice(-4)}` : 'ইউজার');
      const uPhone = user?.phone || '';

      // Duplicate check: ensure user cannot submit more than the allowed perUserLimit (default 1)
      const existingUserSubmissions = jobSubmissions.filter(
        s => s.jobId === job.id && (s.userId === uid || (uPhone && s.userPhone === uPhone)) && s.status !== 'rejected'
      );
      const userLimit = job.perUserLimit || 1;
      if (existingUserSubmissions.length >= userLimit) {
        showToast('আপনি ইতিমধ্যেই এই জবের জন্য প্রুফ জমা দিয়েছেন!');
        return;
      }

      // Limit reached check
      if ((job.completedSlots || 0) >= (job.availableSlots || 100)) {
        showToast('এই জবের নির্ধারিত লিমিট পূর্ণ হয়ে গেছে!');
        return;
      }

      const newSub: JobSubmission = {
        id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        jobId: job.id || `job_${Date.now()}`,
        jobCode: String(job.jobCode || '0000'),
        jobTitle: job.title || 'মাইক্রো জব',
        reward: Number(job.reward) || 0,
        userId: uid,
        userName: uName,
        userPhone: uPhone,
        proofText: (proofText || '').trim(),
        proofImage: proofImage || undefined,
        proofLink: proofLink ? proofLink.trim() : undefined,
        proofType: job.proofType || 'screenshot_text',
        submittedAt: new Date().toLocaleString('bn-BD'),
        status: 'pending'
      };

      setJobSubmissions(prev => {
        const next = [newSub, ...(Array.isArray(prev) ? prev : [])];
        safeSetItem('lg_job_submissions', JSON.stringify(next));
        return next;
      });

      // Update completedSlots count on the job
      setJobs(prev => {
        const updated = (Array.isArray(prev) ? prev : []).map(j => {
          if (j.id === job.id) {
            const nextCompleted = (j.completedSlots || 0) + 1;
            const updatedJob: MicroJob = { 
              ...j, 
              completedSlots: nextCompleted,
              status: nextCompleted >= j.availableSlots ? 'completed' : j.status 
            };
            try { syncJobWithFirestore(updatedJob); } catch {}
            return updatedJob;
          }
          return j;
        });
        safeSetItem('lg_jobs', JSON.stringify(updated));
        return updated;
      });

      try {
        syncJobSubmissionWithFirestore(newSub);
      } catch (syncErr) {
        console.warn('Firestore job submission sync fallback:', syncErr);
      }
      showToast('কাজ সফলভাবে জমা দেওয়া হয়েছে! এডমিন ভেরিফাই করলে ওয়ালেটে টাকা যোগ হবে।');
    } catch (err) {
      console.error('Failed to submit job proof:', err);
      showToast('কাজ জমা দিতে সমস্যা হয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন।');
    }
  };

  const submitAdMarketingProof = (data: {
    campaignTitle?: string;
    rewardAmount?: number;
    postLink?: string;
    proofImage?: string;
    note?: string;
  }): boolean => {
    try {
      const cleanLink = (data.postLink || '').trim();
      const cleanImage = (data.proofImage || '').trim();
      const cleanNote = (data.note || '').trim();

      if (!cleanLink && !cleanImage) {
        showToast(language === 'bn' ? 'অনুগ্রহ করে শেয়ার করা পোস্টের লিংক অথবা স্ক্রিনশট প্রুফ দিন!' : 'Please provide post link or screenshot proof!');
        return false;
      }

      const reward = Number(data.rewardAmount) || Number(systemSettings?.featureRewards?.ad_marketing) || 2.00;
      const title = data.campaignTitle || (language === 'bn' ? 'অফিশিয়াল বিজ্ঞাপন ক্যাম্পেইন' : 'Official Ad Campaign');

      const newSub: AdMarketingSubmission = {
        id: `ad_sub_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        userId: user?.id || 'guest',
        userName: user?.name || 'ইউজার',
        userPhone: user?.phone || '',
        userEmail: user?.email || '',
        campaignTitle: title,
        rewardAmount: reward,
        postLink: cleanLink,
        proofImage: cleanImage,
        note: cleanNote,
        submittedAt: new Date().toLocaleString('bn-BD'),
        status: 'pending'
      };

      setAdMarketingSubmissions(prev => [newSub, ...(Array.isArray(prev) ? prev : [])]);

      // Notify user that submission is pending admin approval (no money added yet)
      createAndSendNotification({
        id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        userId: user?.id || 'guest',
        title: language === 'bn' ? 'বিজ্ঞাপন মার্কেটিং প্রুফ জমা হয়েছে' : 'Ad Proof Submitted',
        message: language === 'bn' 
          ? `আপনার বিজ্ঞাপন মার্কেটিং প্রুফ জমা হয়েছে। এডমিন ভেরিফাই করে অ্যাপ্রুভ করলে ৳${reward.toFixed(2)} ওয়ালেটে যোগ হবে।`
          : `Your ad marketing proof has been submitted. Reward ৳${reward.toFixed(2)} will be credited upon admin approval.`,
        type: 'announcement',
        time: 'এখনই'
      });

      showToast(language === 'bn' 
        ? `প্রুফ জমা হয়েছে! এডমিন অ্যাপ্রুভ করলে ৳${reward.toFixed(2)} ওয়ালেটে যোগ হবে।` 
        : `Proof submitted! Reward ৳${reward.toFixed(2)} will be credited upon admin approval.`);
      return true;
    } catch (err) {
      console.error('Failed to submit ad marketing proof:', err);
      showToast(language === 'bn' ? 'প্রুফ জমা দিতে সমস্যা হয়েছে, আবার চেষ্টা করুন।' : 'Failed to submit proof, please try again.');
      return false;
    }
  };

  // Bonus Claiming
  const claimBonus = (bonusId: string) => {
    const targetBonus = bonuses.find(b => b.id === bonusId);
    if (!targetBonus) return;
    if (targetBonus.isClaimed) {
      showToast('এই বোনাসটি ইতিমধ্যে ক্লেইম করা হয়েছে।');
      return;
    }
    if (targetBonus.currentAmount < targetBonus.targetAmount) {
      showToast(`টার্গেট এখনও বাকি আছে! টার্গেট: ৳${targetBonus.targetAmount}, বর্তমান: ৳${targetBonus.currentAmount}`);
      return;
    }

    if (!user.isVerified) {
      showToast('শুধুমাত্র ভেরিফাইড ইউজাররা বোনাস ক্লেইম করতে পারবেন।');
      return;
    }

    setBonuses(prev => prev.map(b => b.id === bonusId ? { ...b, isClaimed: true, claimedAt: new Date().toISOString() } : b));
    setWallet(prev => ({
      ...prev,
      balance: prev.balance + targetBonus.rewardAmount,
      totalEarned: prev.totalEarned + targetBonus.rewardAmount,
      incomeBreakdown: { ...prev.incomeBreakdown, bonusIncome: prev.incomeBreakdown.bonusIncome + targetBonus.rewardAmount }
    }));

    addTransaction({
      type: 'bonus',
      amount: targetBonus.rewardAmount,
      status: 'completed',
      description: `${targetBonus.title} ক্লেইম রিওয়ার্ড`
    });

    try {
      confetti({ particleCount: 90, spread: 60, origin: { y: 0.6 } });
    } catch {
      // safe fallback
    }

    showToast(`অভিনন্দন! ৳${targetBonus.rewardAmount} ${targetBonus.title} সফলভাবে ক্লেইম হয়েছে।`);
  };

  // Reels
  const toggleLikeReel = (reelId: string) => {
    setReels(prev => prev.map(r => {
      if (r.id === reelId) {
        const isLiked = !r.isLiked;
        return {
          ...r,
          isLiked,
          likesCount: isLiked ? r.likesCount + 1 : r.likesCount - 1
        };
      }
      return r;
    }));
  };

  const toggleSaveReel = (reelId: string) => {
    setReels(prev => prev.map(r => r.id === reelId ? { ...r, isSaved: !r.isSaved } : r));
    showToast('রিল সেভ তালিকায় আপডেট হয়েছে');
  };

  const toggleFollowCreator = (reelId: string) => {
    setReels(prev => prev.map(r => r.id === reelId ? { ...r, isFollowing: !r.isFollowing } : r));
    showToast('ক্রিয়েটর ফলো স্ট্যাটাস আপডেট হয়েছে');
  };

  const createUserPost = (postData: {
    caption: string;
    thumbnailUrl: string;
    videoUrl?: string;
    hashtags?: string[];
    productId?: string;
    productName?: string;
    productPrice?: number;
    productImage?: string;
    postType?: 'reel' | 'post' | 'proof';
  }) => {
    const isAdmin = user.role === 'admin' || user.role === 'super_admin';
    
    // Only admins can create posts
    if (!isAdmin) {
      showToast('শুধুমাত্র এডমিন পোস্ট করতে পারবেন।');
      return;
    }

    const newPost: ReelItem = {
      id: `post_${Date.now()}`,
      caption: postData.caption,
      thumbnailUrl: postData.thumbnailUrl || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600',
      videoUrl: postData.videoUrl || '',
      creatorName: user.name,
      creatorAvatar: user.avatar,
      creatorId: user.id,
      hashtags: postData.hashtags && postData.hashtags.length > 0 ? postData.hashtags : ['#লাইফগুড', '#ইনকাম'],
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      viewsCount: 0,
      isLiked: false,
      isSaved: false,
      productId: postData.productId,
      productName: postData.productName,
      productPrice: postData.productPrice,
      productImage: postData.productImage,
      createdAt: new Date().toISOString(),
      status: 'approved',
      postType: postData.postType || 'post'
    };

    setReels(prev => [newPost, ...prev]);

    if (isAdmin) {
      showToast('আপনার পোস্টটি তাৎক্ষণিকভাবে সবার জন্য পাবলিশ হয়েছে!');
    } else {
      showToast('পোস্টটি সাবমিট হয়েছে! এডমিন অনুমোদনের পর সবার জন্য পাবলিশ হবে। আপনি আপনার প্রোফাইলে দেখতে পাবেন।');
    }
  };

  const adminApprovePost = (postId: string) => {
    setReels(prev => prev.map(r => r.id === postId ? { ...r, status: 'approved' } : r));
    showToast('পোস্টটি সফলভাবে অনুমোদন করা হয়েছে!');
  };

  const adminRejectPost = (postId: string, reason?: string) => {
    setReels(prev => prev.map(r => r.id === postId ? { ...r, status: 'rejected', rejectionReason: reason || 'এডমিন কর্তৃক বাতিলকৃত' } : r));
    showToast('পোস্টটি বাতিল করা হয়েছে।');
  };

  const deleteUserPost = (postId: string) => {
    setReels(prev => prev.filter(r => r.id !== postId));
    showToast('পোস্টটি মুছে ফেলা হয়েছে।');
  };

  const updateUserCover = (coverUrl: string) => {
    updateUserProfile({ coverPhoto: coverUrl });
    showToast('কভার ফটো সফলভাবে আপডেট করা হয়েছে!');
  };

  const navigateToPosterProfile = (product: Product) => {
    // Prevent navigating to user profile; open ProductDetailModal instead as requested
    setSelectedProduct(product);
  };

  // Withdrawals
  const submitWithdrawal = (amount: number, method: 'bKash' | 'Nagad' | 'Bank', account: string, name: string) => {
    const minWithdrawal = systemSettings?.minWithdrawalAmount || 50;
    if (amount < minWithdrawal) {
      showToast(`সর্বনিম্ন উত্তোলনের পরিমাণ ৳${minWithdrawal}`);
      return false;
    }
    const curBal = Number(wallet.balance) || 0;
    if (amount > curBal) {
      showToast('পর্যাপ্ত ব্যালেন্স নেই!');
      return false;
    }

    const fee = Math.max(5, Math.round(amount * 0.015));
    const netAmount = Math.round((amount - fee) * 100) / 100;
    const withdrawalId = `wd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const nowIso = new Date().toISOString();
    const nextBalance = Math.max(0, Math.round((curBal - amount) * 100) / 100);

    const newReq: WithdrawalRequest = {
      id: withdrawalId,
      userId: user.id,
      userName: user.name,
      userPhone: user.phone,
      amount,
      fee,
      netAmount,
      paymentMethod: method,
      accountNumber: account,
      accountName: name,
      date: new Date().toLocaleString('bn-BD'),
      createdAt: nowIso,
      status: 'pending'
    };

    setWithdrawalRequests(prev => [newReq, ...prev.filter(w => w.id !== newReq.id)]);
    
    // Deduct exactly once and update timestamp
    setWallet(prev => {
      const updated: WalletState = {
        ...prev,
        balance: nextBalance,
        updatedAt: nowIso
      };
      safeSetItem('lg_wallet', JSON.stringify(updated));
      if (user?.id) {
        safeSetItem(`lg_wallet_${user.id}`, JSON.stringify(updated));
      }
      return updated;
    });

    try {
      localStorage.setItem(`lg_wd_debited_${withdrawalId}`, 'true');
    } catch {}

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const wdTx: Transaction = {
      id: `tx_${withdrawalId}`,
      userId: user.id,
      type: 'withdrawal',
      amount,
      status: 'pending',
      date: formattedDate,
      createdAt: nowIso,
      description: `${method} এর মাধ্যমে উইথড্র রিকোয়েস্ট (হিসাব: ${account})`,
      paymentMethod: method,
      accountNumber: account,
      referenceId: withdrawalId
    };
    setTransactions(prev => [wdTx, ...prev.filter(t => t.id !== wdTx.id && t.referenceId !== withdrawalId)]);

    // Transmit to authoritative database API
    fetch('/api/withdrawals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newReq,
        currentBalance: curBal
      })
    }).then(async res => {
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.wallet && typeof data.wallet.balance === 'number') {
          setWallet(prev => ({
            ...prev,
            balance: data.wallet.balance,
            updatedAt: data.wallet.updatedAt || prev.updatedAt
          }));
        }
      }
    }).catch(err => {
      console.warn('Backend withdrawal submit error:', err);
    });

    syncWithdrawalWithFirestore(newReq);

    setIsWithdrawOpen(false);
    showToast(`উইথড্র রিকোয়েস্ট সফল! ৳${amount} প্রসেসিং চলছে।`);
    return true;
  };

  const withdrawMoney = (amount: number, method: string, accountNumber: string, accountName?: string) => {
    const formattedMethod = method.toLowerCase() === 'bkash' ? 'bKash' : method.toLowerCase() === 'nagad' ? 'Nagad' : 'Bank';
    return submitWithdrawal(amount, formattedMethod as 'bKash' | 'Nagad' | 'Bank', accountNumber, accountName || user.name);
  };

  const isDemoDepositRecord = (d: any): boolean => {
    if (!d) return true;
    if (d.isDemo) return true;
    const uid = String(d.userId || '').toLowerCase();
    if (uid.includes('demo') || uid.includes('test_user')) return true;
    const id = String(d.id || '').toLowerCase();
    const knownDemos = ['dep_01', 'dep_02', 'dep_03', 'dep_zieas', 'dep_0pann', 'dep_ls3ac', 'dep_029vu'];
    if (knownDemos.includes(id)) return true;
    return false;
  };

  const fetchFreshDeposits = useCallback(async (): Promise<DepositRequest[]> => {
    try {
      // 1. Fetch from Backend API database (Primary source of truth)
      let apiList: DepositRequest[] = [];
      try {
        const res = await fetch('/api/deposits');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.deposits)) {
            apiList = json.deposits.filter(d => !isDemoDepositRecord(d));
          }
        }
      } catch (apiErr) {
        console.warn('GET /api/deposits error:', apiErr);
      }

      // 2. Local storage data - Strictly filter out demo deposits
      let localList: DepositRequest[] = [];
      const localSaved = localStorage.getItem('lg_deposits');
      if (localSaved) {
        try {
          const parsed = JSON.parse(localSaved);
          if (Array.isArray(parsed)) {
            localList = parsed.filter(d => !isDemoDepositRecord(d));
          }
        } catch {}
      }

      // 3. Merging: localList and apiList (API is authoritative)
      const map = new Map<string, DepositRequest>();
      localList.forEach(d => { if (d && d.id && !isDemoDepositRecord(d)) map.set(d.id, d); });
      apiList.forEach(d => { if (d && d.id && !isDemoDepositRecord(d)) map.set(d.id, d); });

      const merged = Array.from(map.values()).sort((a, b) => {
        const timeA = a.timestamp || (a.createdAt ? Date.parse(a.createdAt) : 0) || 0;
        const timeB = b.timestamp || (b.createdAt ? Date.parse(b.createdAt) : 0) || 0;
        return timeB - timeA;
      });

      setDepositRequests(merged);
      safeSetItem('lg_deposits', JSON.stringify(merged));
      return merged;
    } catch (err) {
      console.warn('fetchFreshDeposits error:', err);
      return [];
    }
  }, []);

  const fetchFreshUsers = useCallback(async (): Promise<UserProfile[]> => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.users)) {
          const serverUsers: UserProfile[] = json.users;
          setRegisteredUsers(prev => {
            const userMap = new Map<string, UserProfile>();
            prev.forEach(u => { if (u && u.id) userMap.set(u.id, u); });
            serverUsers.forEach(u => {
              if (u && u.id) {
                const existing = userMap.get(u.id);
                userMap.set(u.id, { ...(existing || {}), ...u });
              }
            });
            const merged = Array.from(userMap.values());
            persistRegisteredUsers(merged);
            return merged;
          });
          return serverUsers;
        }
      }
    } catch (err) {
      console.warn('fetchFreshUsers error:', err);
    }
    return registeredUsers;
  }, [registeredUsers]);

  const adminUpdateUserStatus = async (
    userId: string, 
    status: 'active' | 'suspended' | 'blocked', 
    reason?: string
  ): Promise<boolean> => {
    try {
      // 1. Call Backend API
      await fetch(`/api/users/${encodeURIComponent(userId)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reason })
      });

      // 2. Update local state
      setRegisteredUsers(prev => prev.map(u => {
        if (u.id === userId || u.phone === userId) {
          return { ...u, status, statusReason: reason || (status === 'blocked' ? 'অ্যাকাউন্ট ব্লক করা হয়েছে' : status === 'suspended' ? 'সাময়িক স্থগিত' : '') };
        }
        return u;
      }));

      // If current user is modified
      if (user.id === userId || user.phone === userId) {
        setUser(prev => ({
          ...prev,
          status,
          statusReason: reason
        }));
      }

      // Update in localStorage
      try {
        const saved = localStorage.getItem('lg_registered_users');
        if (saved) {
          const list: any[] = JSON.parse(saved);
          const updated = list.map(item => {
            const u = item.user || item;
            if (u.id === userId || u.phone === userId) {
              const newU = { ...u, status, statusReason: reason };
              return item.user ? { ...item, user: newU } : newU;
            }
            return item;
          });
          localStorage.setItem('lg_registered_users', JSON.stringify(updated));
        }
      } catch {}

      showToast(
        status === 'blocked' ? 'ব্যবহারকারীকে ব্লক করা হয়েছে।' :
        status === 'suspended' ? 'ব্যবহারকারীকে সাময়িক স্থগিত করা হয়েছে।' :
        'ব্যবহারকারীকে সক্রিয় করা হয়েছে।'
      );
      return true;
    } catch (err) {
      console.error('adminUpdateUserStatus error:', err);
      showToast('স্ট্যাটাস আপডেট ব্যর্থ হয়েছে।');
      return false;
    }
  };

  const adminSuspendUser = (userId: string, reason?: string) => {
    return adminUpdateUserStatus(userId, 'suspended', reason || 'নিয়মভঙ্গের কারণে সাময়িক স্থগিত');
  };

  const adminBlockUser = (userId: string, reason?: string) => {
    return adminUpdateUserStatus(userId, 'blocked', reason || 'স্থায়ীভাবে অ্যাকাউন্ট ব্লক করা হয়েছে');
  };

  const adminActivateUser = (userId: string) => {
    return adminUpdateUserStatus(userId, 'active', '');
  };

  // Centralized Helper: Strictly credit Referral Reward ONLY when a referred user is Verified
  const creditReferralRewardForVerifiedUser = useCallback((verifiedUserId: string, verifiedUserName?: string, verifiedUserPhone?: string): boolean => {
    // 1. Locate the newly verified user in registeredUsers or current user state
    const targetUser = registeredUsers.find(u => u.id === verifiedUserId || (verifiedUserPhone && u.phone === verifiedUserPhone)) 
      || (user?.id === verifiedUserId ? user : null);
    
    if (!targetUser || !targetUser.referredBy) {
      return false;
    }

    const rawRefCode = (targetUser.referredBy || '').trim().toUpperCase();
    const strictRefCode = formatStrict4DigitReferral(rawRefCode);
    const refBonus = Number(systemSettings?.referralBonus) || 25;

    // 2. Prevent duplicate crediting for this specific verified user
    const paidKey = `lg_ref_reward_paid_${targetUser.id}`;
    if (localStorage.getItem(paidKey) === 'true') {
      return false;
    }

    // Matching helper for referral codes
    const isCodeMatch = (code?: string) => {
      if (!code) return false;
      const c = code.trim().toUpperCase();
      return c === rawRefCode || c === strictRefCode || formatStrict4DigitReferral(c) === strictRefCode;
    };

    // Find the referrer
    let referrerUser = registeredUsers.find(u => isCodeMatch(u.referralCode));
    if (!referrerUser && isCodeMatch(INITIAL_USER.referralCode)) {
      referrerUser = INITIAL_USER;
    }
    const isCurrentActiveReferrer = Boolean(user?.referralCode && isCodeMatch(user.referralCode));

    if (!referrerUser && !isCurrentActiveReferrer) {
      return false;
    }

    const referrerId = referrerUser?.id || user.id;
    const cleanReferredName = verifiedUserName || targetUser.name || 'সদস্য';
    const nowIso = new Date().toISOString();

    // Mark as paid in localStorage to prevent race conditions or duplicate execution
    try {
      localStorage.setItem(paidKey, 'true');
      if (referrerId) {
        localStorage.setItem(`lg_ref_reward_paid_${referrerId}_${targetUser.id}`, 'true');
      }
    } catch {}

    // 3. If currently logged in as the referrer, immediately credit live state
    if (isCurrentActiveReferrer) {
      setWallet(prev => {
        const updated: WalletState = {
          ...prev,
          balance: Math.round(((Number(prev.balance) || 0) + refBonus) * 100) / 100,
          totalEarned: Math.round(((Number(prev.totalEarned) || 0) + refBonus) * 100) / 100,
          updatedAt: nowIso,
          incomeBreakdown: {
            ...prev.incomeBreakdown,
            referralIncome: Math.round(((Number(prev.incomeBreakdown?.referralIncome) || 0) + refBonus) * 100) / 100
          }
        };
        safeSetItem('lg_wallet', JSON.stringify(updated));
        if (user?.id) {
          safeSetItem(`lg_wallet_${user.id}`, JSON.stringify(updated));
        }
        return updated;
      });

      const refTx: Transaction = {
        id: `trx_ref_ver_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        userId: user?.id,
        type: 'referral_bonus',
        amount: refBonus,
        description: `রেফারেল বোনাস (ইউজার ${cleanReferredName} ভেরিফাইড হয়েছেন)`,
        status: 'completed',
        date: new Date().toISOString(),
        createdAt: nowIso
      };
      setTransactions(prev => [refTx, ...prev.filter(t => t.id !== refTx.id)]);

      try {
        fireCelebrationConfetti();
        playCelebrationSound();
      } catch {}

      showToast(
        language === 'bn'
          ? `🎉 অভিনন্দন! আপনার রেফার করা সদস্য (${cleanReferredName}) ভেরিফাইড হওয়ায় ৳${refBonus} রেফার বোনাস ওয়ালেটে জমা হয়েছে!`
          : `🎉 Congratulations! ৳${refBonus} referral bonus credited as ${cleanReferredName} is verified!`
      );
    }

    // 4. Update the referrer in registeredUsers state & storage
    setRegisteredUsers(prev => prev.map(u => {
      if (isCodeMatch(u.referralCode) || (referrerId && u.id === referrerId)) {
        const curW = u.wallet || { balance: 0, totalEarned: 0, incomeBreakdown: { referralIncome: 0 } };
        const nextB = (Number(curW.balance) || 0) + refBonus;
        const nextE = (Number(curW.totalEarned) || 0) + refBonus;
        const nextR = (Number(curW.incomeBreakdown?.referralIncome) || 0) + refBonus;

        const updatedW = {
          ...curW,
          balance: nextB,
          totalEarned: nextE,
          incomeBreakdown: {
            ...curW.incomeBreakdown,
            referralIncome: nextR
          }
        };

        try {
          localStorage.setItem(`lg_wallet_${u.id}`, JSON.stringify(updatedW));
        } catch {}

        return {
          ...u,
          balance: nextB,
          wallet: updatedW
        };
      }
      return u;
    }));

    // Persist in lg_registered_users storage
    try {
      const savedStr = localStorage.getItem('lg_registered_users');
      if (savedStr) {
        const savedList: any[] = JSON.parse(savedStr);
        const updatedList = savedList.map(item => {
          const u = item.user || item;
          if (isCodeMatch(u.referralCode) || (referrerId && u.id === referrerId)) {
            const curW = item.wallet || u.wallet || { balance: 0, totalEarned: 0, incomeBreakdown: { referralIncome: 0 } };
            const nextB = (Number(curW.balance) || 0) + refBonus;
            const nextE = (Number(curW.totalEarned) || 0) + refBonus;
            const nextR = (Number(curW.incomeBreakdown?.referralIncome) || 0) + refBonus;
            const nextW = {
              ...curW,
              balance: nextB,
              totalEarned: nextE,
              incomeBreakdown: { ...curW.incomeBreakdown, referralIncome: nextR }
            };
            if (item.user) {
              return {
                ...item,
                user: { ...item.user, balance: nextB, wallet: nextW },
                wallet: nextW
              };
            }
            return { ...item, balance: nextB, wallet: nextW };
          }
          return item;
        });
        localStorage.setItem('lg_registered_users', JSON.stringify(updatedList));
      }
    } catch {}

    // Add transaction for referrer if not current user
    if (!isCurrentActiveReferrer && referrerId) {
      try {
        const txKey = `lg_transactions_${referrerId}`;
        const savedTx = localStorage.getItem(txKey);
        const txList = savedTx ? JSON.parse(savedTx) : [];
        const refTx: Transaction = {
          id: `trx_ref_ver_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          type: 'referral_bonus',
          amount: refBonus,
          description: `রেফারেল বোনাস (ইউজার ${cleanReferredName} ভেরিফাইড হয়েছেন)`,
          status: 'completed',
          date: new Date().toISOString()
        };
        txList.unshift(refTx);
        localStorage.setItem(txKey, JSON.stringify(txList));
      } catch {}
    }

    // 5. Send notification to the referrer
    createAndSendNotification({
      id: `notif_ref_reward_${targetUser.id}_${Date.now()}`,
      userId: referrerId,
      userPhone: referrerUser?.phone,
      title: language === 'bn' ? '🎉 রেফারেল বোনাস জমা হয়েছে!' : '🎉 Referral Bonus Credited!',
      message: language === 'bn'
        ? `আপনার রেফার করা সদস্য (${cleanReferredName}) একাউন্ট ভেরিফাই করেছেন! আপনার ওয়ালেটে ৳${refBonus} রেফার বোনাস জমা হয়েছে।`
        : `Your referred member (${cleanReferredName}) got verified! ৳${refBonus} referral bonus has been credited to your wallet.`,
      type: 'wallet',
      time: 'এখনই'
    });

    return true;
  }, [registeredUsers, user, systemSettings?.referralBonus, language, showToast, createAndSendNotification]);

  // Keep ref up to date for realtime events
  useEffect(() => {
    creditReferralRewardRef.current = creditReferralRewardForVerifiedUser;
  }, [creditReferralRewardForVerifiedUser]);

  const adminVerifyUser = async (userId: string): Promise<boolean> => {
    try {
      await fetch(`/api/users/${encodeURIComponent(userId)}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVerified: true, verificationStatus: 'verified' })
      });
      setRegisteredUsers(prev => prev.map(u => {
        if (u.id === userId || u.phone === userId) {
          return { ...u, isVerified: true, verificationStatus: 'verified' };
        }
        return u;
      }));
      if (user.id === userId || user.phone === userId) {
        setUser(prev => ({ ...prev, isVerified: true, verificationStatus: 'verified' }));
      }
      // Strictly credit referral bonus to referrer upon user verification!
      creditReferralRewardForVerifiedUser(userId);
      showToast('ইউজার সফলভাবে ভেরিফাইড করা হয়েছে!');
      return true;
    } catch (err) {
      showToast('ভেরিফিকেশন ব্যর্থ হয়েছে।');
      return false;
    }
  };

  const adminUnverifyUser = async (userId: string): Promise<boolean> => {
    try {
      await fetch(`/api/users/${encodeURIComponent(userId)}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVerified: false, verificationStatus: 'unverified' })
      });
      setRegisteredUsers(prev => prev.map(u => {
        if (u.id === userId || u.phone === userId) {
          return { ...u, isVerified: false, verificationStatus: 'unverified' };
        }
        return u;
      }));
      if (user.id === userId || user.phone === userId) {
        setUser(prev => ({ ...prev, isVerified: false, verificationStatus: 'unverified' }));
      }
      showToast('ইউজারের ভেরিফিকেশন প্রত্যাহার করা হয়েছে।');
      return true;
    } catch (err) {
      showToast('ভেরিফিকেশন প্রত্যাহার ব্যর্থ হয়েছে।');
      return false;
    }
  };

  const fetchUserFinancials = async (userId: string) => {
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(userId)}/financials`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.financials) {
          return json.financials;
        }
      }
    } catch (err) {
      console.warn('fetchUserFinancials error:', err);
    }
    return null;
  };

  const getUserTransactionReport = (userOverride?: UserProfile): AggregatedUserTransactionReport => {
    const targetUser = userOverride || user;
    return aggregateUserTransactions({
      transactions,
      user: targetUser,
      wallet
    });
  };

  const fetchAndAggregateUserTransactions = async (userId?: string): Promise<AggregatedUserTransactionReport> => {
    const targetUid = userId || user.id;
    const targetUser = registeredUsers.find(u => u.id === targetUid) || user;
    const freshTxs = await fetchUserTransactions(targetUid, targetUser?.phone);
    return aggregateUserTransactions({
      transactions: freshTxs.length > 0 ? freshTxs : transactions,
      user: targetUser,
      wallet
    });
  };

  const depositMoney = async (
    amount: number, 
    method: string, 
    trxId: string, 
    senderPhone?: string,
    options?: {
      isVerification?: boolean;
      purpose?: string;
      depositType?: 'verification' | 'standard' | 'special_social';
      nidNumber?: string;
    }
  ): Promise<{ success: boolean; message?: string; deposit?: DepositRequest }> => {
    const cleanMethod = method.toLowerCase() === 'bkash' ? 'bKash' : method.toLowerCase() === 'nagad' ? 'Nagad' : method.toUpperCase();
    const formattedTrxId = trxId.trim().toUpperCase();

    const isVerif = Boolean(
      options?.isVerification || 
      options?.depositType === 'verification' || 
      options?.purpose === 'Account Verification' ||
      (options?.purpose && options.purpose.toLowerCase().includes('verification'))
    );
    const isSpecialSocial = Boolean(
      options?.depositType === 'special_social' || 
      options?.purpose === 'বিশেষ সোশ্যাল ইনকাম এক্সেস' || 
      (options?.purpose && options.purpose.includes('বিশেষ সোশ্যাল'))
    );
    const purpose = isVerif 
      ? (options?.purpose || 'Account Verification') 
      : isSpecialSocial 
        ? (options?.purpose || 'বিশেষ সোশ্যাল ইনকাম এক্সেস') 
        : (options?.purpose || 'Deposit');
    const depositType: 'verification' | 'standard' | 'special_social' = isVerif 
      ? 'verification' 
      : isSpecialSocial 
        ? 'special_social' 
        : (options?.depositType || 'standard');
    const nidNumber = options?.nidNumber || user.nidNumber || '';

    // Identify user reliably
    const normalizedSender = senderPhone ? normalizePhoneNumber(senderPhone) : '';
    const normalizedCurrent = user.phone ? normalizePhoneNumber(user.phone) : '';
    
    const matchedUser = registeredUsers.find(u => {
      const uPhone = normalizePhoneNumber(u.phone || '');
      return (normalizedCurrent && uPhone === normalizedCurrent) || 
             (normalizedSender && uPhone === normalizedSender) || 
             (user.id && user.id !== 'usr_default_01' && u.id === user.id);
    });

    const effectiveUserId = (user && user.id && user.id !== 'usr_default_01') 
      ? user.id 
      : (user.phone ? `usr_${normalizePhoneNumber(user.phone)}` : (matchedUser?.id || (senderPhone ? `usr_${senderPhone.replace(/[^0-9]/g, '')}` : `usr_${Date.now()}`)));

    const effectiveUserName = (user && user.name && user.name !== 'নতুন সদস্য') 
      ? user.name 
      : (matchedUser?.name || 'গ্রাহক');

    const effectiveUserPhone = (user.phone && user.phone.trim()) 
      ? user.phone.trim() 
      : (matchedUser?.phone || senderPhone?.trim() || '');

    const effectiveSenderPhone = (senderPhone && senderPhone.trim()) 
      ? senderPhone.trim() 
      : effectiveUserPhone;

    console.log('[Deposit Client] [SUBMIT_INIT] Initiating deposit submission:', {
      amount,
      method: cleanMethod,
      trxId: formattedTrxId,
      senderPhone: effectiveSenderPhone,
      isVerification: isVerif,
      purpose,
      resolvedUser: {
        userId: effectiveUserId,
        userName: effectiveUserName,
        userPhone: effectiveUserPhone
      }
    });

    const newDeposit: DepositRequest = {
      id: `dep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: effectiveUserId,
      userName: effectiveUserName,
      userPhone: effectiveUserPhone,
      amount,
      paymentMethod: cleanMethod,
      trxId: formattedTrxId,
      senderPhone: effectiveSenderPhone,
      purpose,
      isVerification: isVerif,
      depositType,
      nidNumber: nidNumber || undefined,
      date: new Date().toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      status: 'pending',
      timestamp: Date.now(),
      createdAt: new Date().toISOString()
    };

    console.log('[Deposit Client] [RECORD_PREPARED] Deposit record ready with user metadata:', newDeposit);

    // 1. Send API request to backend to persist in real database
    console.log('[Deposit Client] [API_POST_START] Sending POST /api/deposits...');
    let persistedDeposit: DepositRequest = newDeposit;
    try {
      const res = await fetch('/api/deposits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDeposit)
      });
      const data = await res.json();
      console.log('[Deposit Client] [API_POST_RESPONSE] Response from /api/deposits:', data);

      if (!res.ok && !data?.success) {
        return {
          success: false,
          message: data?.message || (language === 'bn' ? 'সার্ভারে ডিপোজিট সংরক্ষণ ব্যর্থ হয়েছে।' : 'Failed to record deposit on server.')
        };
      }

      if (data?.success && data?.deposit) {
        persistedDeposit = data.deposit;
      }
    } catch (apiErr: any) {
      console.error('[Deposit Client] [API_POST_ERROR] API deposit submit error:', apiErr);
      return {
        success: false,
        message: apiErr?.message || (language === 'bn' ? 'নেটওয়ার্ক সমস্যার কারণে ডিপোজিট জমা হয়নি।' : 'Network error during deposit submission.')
      };
    }

    // If this is a verification deposit, immediately set user status to pending
    if (isVerif) {
      setUser(prev => {
        const u = {
          ...prev,
          verificationStatus: 'pending' as const,
          isVerified: false,
          nidNumber: nidNumber || prev.nidNumber
        };
        safeSetItem('lg_user', JSON.stringify(u));
        return u;
      });

      setRegisteredUsers(prev => prev.map(u => 
        (u.id === effectiveUserId || (effectiveUserPhone && u.phone === effectiveUserPhone))
          ? { ...u, verificationStatus: 'pending' as const, isVerified: false }
          : u
      ));

      const verReq: VerificationRequest = {
        id: `ver_${Date.now()}`,
        userId: effectiveUserId,
        userName: effectiveUserName,
        userPhone: effectiveUserPhone,
        method: cleanMethod,
        senderNumber: effectiveSenderPhone,
        trxId: formattedTrxId,
        amount,
        nidNumber: nidNumber || undefined,
        submittedAt: new Date().toLocaleString('bn-BD'),
        status: 'pending'
      };
      setVerificationRequests(prev => [verReq, ...prev.filter(r => r.trxId !== formattedTrxId)]);
      try {
        const localVer = JSON.parse(localStorage.getItem('lg_verification_requests') || '[]');
        const filteredVer = localVer.filter((r: any) => r.trxId !== formattedTrxId);
        safeSetItem('lg_verification_requests', JSON.stringify([verReq, ...filteredVer]));
      } catch {}
    }

    // If this is a special social income access deposit, immediately set user status to pending
    if (isSpecialSocial) {
      setUser(prev => {
        const u = {
          ...prev,
          specialSocialStatus: 'pending' as const,
          specialSocialAccess: false,
          specialSocialDepositTrxId: formattedTrxId
        };
        safeSetItem('lg_user', JSON.stringify(u));
        return u;
      });

      setRegisteredUsers(prev => prev.map(u => 
        (u.id === effectiveUserId || (effectiveUserPhone && u.phone === effectiveUserPhone))
          ? { ...u, specialSocialStatus: 'pending' as const, specialSocialAccess: false, specialSocialDepositTrxId: formattedTrxId }
          : u
      ));
    }

    // 2. Atomically update local State & Local Storage with persisted deposit
    setDepositRequests(prev => {
      const filtered = prev.filter(d => d.id !== persistedDeposit.id && d.trxId !== persistedDeposit.trxId);
      const updated = [persistedDeposit, ...filtered];
      safeSetItem('lg_deposits', JSON.stringify(updated));
      return updated;
    });

    try {
      const currentListStr = localStorage.getItem('lg_deposits');
      let currentList: DepositRequest[] = [];
      if (currentListStr) {
        try { currentList = JSON.parse(currentListStr); } catch {}
      }
      const mergedLocal = [persistedDeposit, ...currentList.filter(d => d.id !== persistedDeposit.id && d.trxId !== persistedDeposit.trxId)];
      localStorage.setItem('lg_deposits', JSON.stringify(mergedLocal));
    } catch {}

    // 3. Dispatch cross-tab & window event for instant Admin refresh
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('goodlife:deposit_updated', { detail: persistedDeposit }));
      window.dispatchEvent(new CustomEvent('goodlife:new_pending_request', {
        detail: {
          type: 'deposit',
          id: persistedDeposit.id,
          title: isVerif ? 'নতুন ভেরিফিকেশন ডিপোজিট!' : 'নতুন ডিপোজিট রিকোয়েস্ট!',
          message: isVerif 
            ? `${effectiveUserName} ভেরিফিকেশনের জন্য ৳${amount} ডিপোজিট করেছেন (${cleanMethod} TrxID: ${formattedTrxId})`
            : `${effectiveUserName} ৳${amount} ডিপোজিট করেছেন (${cleanMethod} TrxID: ${formattedTrxId})`,
          amount,
          userName: effectiveUserName,
          userPhone: effectiveUserPhone,
          isVerification: isVerif
        }
      }));
    }

    // 4. Non-blocking Firestore synchronization
    syncDepositRequestWithFirestore(persistedDeposit).catch((fErr) => {
      console.warn('[Firestore Sync] Optional cloud backup sync warning:', fErr);
    });

    // 5. Add to Audit Trail
    addAuditLog({
      type: isVerif ? 'verification' : 'deposit',
      targetId: persistedDeposit.id,
      action: 'Request Submitted',
      status: 'pending',
      actorId: effectiveUserId,
      actorName: effectiveUserName,
      targetUserName: effectiveUserName,
      targetUserPhone: effectiveUserPhone,
      amount,
      details: isVerif
        ? `ইউজার ${effectiveUserName} ভেরিফিকেশনের জন্য ৳${amount} ডিপোজিট রিকোয়েস্ট পাঠিয়েছেন (${cleanMethod} TrxID: ${formattedTrxId})`
        : `ইউজার ${effectiveUserName} ৳${amount} ডিপোজিট রিকোয়েস্ট পাঠিয়েছেন (${cleanMethod} TrxID: ${formattedTrxId})`
    });

    // 6. User notification in their notification feed
    createAndSendNotification({
      id: `notif_dep_user_${Date.now()}`,
      userId: effectiveUserId,
      userPhone: effectiveUserPhone,
      title: isVerif ? 'ভেরিফিকেশন আবেদন জমা হয়েছে' : 'ডিপোজিট আবেদন জমা হয়েছে',
      message: isVerif
        ? `আপনার ৳${amount} ভেরিফিকেশন ডিপোজিট আবেদন সফলভাবে জমা হয়েছে (${cleanMethod}, TrxID: ${formattedTrxId})। এডমিন পর্যালোচনা করছেন।`
        : `আপনার ৳${amount} ডিপোজিট আবেদন সফলভাবে জমা হয়েছে (${cleanMethod}, TrxID: ${formattedTrxId})। এডমিন পর্যালোচনা করছেন।`,
      time: 'এইমাত্র',
      type: 'wallet'
    });

    // 7. Record pending deposit transaction in user state and isolated storage
    const newTx: Omit<Transaction, 'id' | 'date'> = {
      type: 'deposit',
      amount,
      status: 'pending',
      description: isVerif
        ? `ভেরিফিকেশন ফি (${cleanMethod} TrxID: ${formattedTrxId}${senderPhone ? ` | প্রেরক: ${senderPhone}` : ''})`
        : `${cleanMethod} ডিপোজিট রিকোয়েস্ট (TrxID: ${formattedTrxId}${senderPhone ? ` | প্রেরক: ${senderPhone}` : ''})`,
      paymentMethod: cleanMethod,
      referenceId: formattedTrxId,
      accountNumber: effectiveSenderPhone
    };
    addTransaction(newTx);

    try {
      const userTxKey = `lg_transactions_${effectiveUserId}`;
      const existingUserTxStr = localStorage.getItem(userTxKey);
      let existingUserTxs: any[] = [];
      if (existingUserTxStr) {
        try { existingUserTxs = JSON.parse(existingUserTxStr); } catch {}
      }
      const fullTx = {
        id: generateTxId('tx_dep'),
        ...newTx,
        date: new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'short', day: 'numeric' })
      };
      existingUserTxs.unshift(fullTx);
      localStorage.setItem(userTxKey, JSON.stringify(existingUserTxs.slice(0, 100)));
      syncTransactionWithFirestore(effectiveUserId, fullTx as Transaction);
    } catch (err) {
      console.warn('Could not sync user isolated tx:', err);
    }

    setIsAddMoneyOpen(false);
    setDepositCelebration({
      type: 'submitted',
      amount,
      trxId: formattedTrxId,
      senderPhone: effectiveSenderPhone,
      paymentMethod: cleanMethod
    });
    showToast(language === 'bn' 
      ? 'ডিপোজিট আবেদন জমা হয়েছে! এডমিন যাচাই করে অ্যাপ্রুভ করলে ব্যালেন্সে টাকা যোগ হবে।' 
      : 'Deposit request submitted! Balance will be added after Admin approval.');

    return {
      success: true,
      deposit: persistedDeposit,
      message: 'ডিপোজিট আবেদন সফলভাবে জমা হয়েছে।'
    };
  };

  const addFundsToWallet = (amount: number, method: string, reference: string) => {
    const amt = Number(amount) || 0;
    if (amt <= 0) return;

    setWallet(prev => ({
      ...prev,
      balance: Math.round(((Number(prev.balance) || 0) + amt) * 100) / 100
    }));

    addTransaction({
      type: 'deposit',
      amount: amt,
      status: 'completed',
      description: `${method} থেকে ফান্ড ডিপোজিট (ট্র্যাক: ${reference})`,
      paymentMethod: method,
      referenceId: reference
    });

    setIsAddMoneyOpen(false);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('goodlife:wallet_updated'));
    }
    try {
      confetti({ particleCount: 70, spread: 50, origin: { y: 0.6 } });
    } catch {
      // safe fallback
    }
    showToast(`৳${amt} সফলভাবে ওয়ালেটে যুক্ত হয়েছে!`);
  };

  const addEarning = (
    amount: number, 
    descriptionOrType: string, 
    categoryOrDesc?: string
  ) => {
    const amt = Number(amount) || 0;
    if (amt <= 0) return;

    let desc = descriptionOrType;
    let cat: keyof WalletState['incomeBreakdown'] = 'otherIncome';

    const validCategories: (keyof WalletState['incomeBreakdown'])[] = [
      'jobIncome', 'referralIncome', 'resellingProfit', 'bonusIncome', 'affiliateIncome', 'adsIncome', 'otherIncome'
    ];

    if (categoryOrDesc && validCategories.includes(categoryOrDesc as any)) {
      cat = categoryOrDesc as any;
    } else if (categoryOrDesc) {
      desc = categoryOrDesc;
    }

    if (desc.includes('ভাউচার') || desc.toUpperCase().includes('VOUCHER') || descriptionOrType === 'bonus') {
      cat = 'bonusIncome';
    }

    setWallet(prev => ({
      ...prev,
      balance: Math.round(((Number(prev.balance) || 0) + amt) * 100) / 100,
      totalEarned: Math.round(((Number(prev.totalEarned) || 0) + amt) * 100) / 100,
      incomeBreakdown: {
        ...prev.incomeBreakdown,
        [cat]: (prev.incomeBreakdown[cat] || 0) + amt
      }
    }));

    addTransaction({
      type: 'bonus',
      amount: amt,
      status: 'completed',
      description: desc
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('goodlife:wallet_updated'));
    }

    try {
      confetti({ particleCount: 65, spread: 55, origin: { y: 0.6 } });
    } catch {
      // safe fallback
    }

    showToast(`৳${amt.toFixed(2)} ওয়ালেটে জমা হয়েছে! (${desc})`);
  };

  // Sync and credit any missing or pending referral earnings for the active user strictly once
  const syncReferralEarnings = useCallback(() => {
    if (!user?.referralCode || !user?.id) return { credited: 0, totalReferrals: 0, verifiedCount: 0, pendingCount: 0 };

    const myStrict = formatStrict4DigitReferral(user.referralCode);
    const myRaw = (user.referralCode || '').trim().toUpperCase();

    // Find all users who joined with this user's referral code
    const allMyReferred = registeredUsers.filter(u => {
      if (!u.referredBy || u.id === user.id) return false;
      const ref = (u.referredBy || '').trim().toUpperCase();
      const strict = formatStrict4DigitReferral(ref);
      return ref === myRaw || ref === myStrict || strict === myStrict;
    });

    const verifiedReferred = allMyReferred.filter(u => u.isVerified);
    const pendingReferred = allMyReferred.filter(u => !u.isVerified);

    // Strictly check each verified user against paid flag
    const unpaidVerified = verifiedReferred.filter(v => {
      const userPaidKey = `lg_ref_reward_paid_${user.id}_${v.id}`;
      const globalPaidKey = `lg_ref_reward_paid_${v.id}`;
      return localStorage.getItem(userPaidKey) !== 'true' && localStorage.getItem(globalPaidKey) !== 'true';
    });

    const rewardPerRef = Number(systemSettings?.referralBonus) || 25;
    const uncredited = unpaidVerified.length * rewardPerRef;

    if (uncredited > 0) {
      const nowIso = new Date().toISOString();
      setWallet(prev => {
        const updated: WalletState = {
          ...prev,
          balance: Math.round(((Number(prev.balance) || 0) + uncredited) * 100) / 100,
          totalEarned: Math.round(((Number(prev.totalEarned) || 0) + uncredited) * 100) / 100,
          updatedAt: nowIso,
          incomeBreakdown: {
            ...prev.incomeBreakdown,
            referralIncome: (Number(prev.incomeBreakdown?.referralIncome) || 0) + uncredited
          }
        };
        safeSetItem('lg_wallet', JSON.stringify(updated));
        if (user.id) {
          safeSetItem(`lg_wallet_${user.id}`, JSON.stringify(updated));
        }
        return updated;
      });

      const newTx: Transaction = {
        id: `trx_ref_sync_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        userId: user.id,
        type: 'referral_bonus',
        amount: uncredited,
        description: `রেফারেল বোনাস (${unpaidVerified.length} জন নতুন ভেরিফাইড সদস্য)`,
        status: 'completed',
        date: new Date().toISOString(),
        createdAt: nowIso
      };
      setTransactions(prev => [newTx, ...prev.filter(t => t.id !== newTx.id)]);

      // Mark verified users as paid both per-user and globally
      unpaidVerified.forEach(v => {
        try {
          localStorage.setItem(`lg_ref_reward_paid_${user.id}_${v.id}`, 'true');
          localStorage.setItem(`lg_ref_reward_paid_${v.id}`, 'true');
        } catch {}
      });

      try {
        confetti({ particleCount: 75, spread: 60, origin: { y: 0.6 } });
      } catch {}

      showToast(
        language === 'bn'
          ? `অভিনন্দন! আপনার রেফার করা ${unpaidVerified.length} জন নতুন সদস্য ভেরিফাইড হওয়ায় ৳${uncredited} বোনাস ওয়ালেটে জমা হয়েছে!`
          : `Congratulations! ৳${uncredited} referral bonus credited for ${unpaidVerified.length} new verified referral(s)!`
      );

      return { 
        credited: uncredited, 
        totalReferrals: allMyReferred.length,
        verifiedCount: verifiedReferred.length,
        pendingCount: pendingReferred.length 
      };
    }

    return { 
      credited: 0, 
      totalReferrals: allMyReferred.length,
      verifiedCount: verifiedReferred.length,
      pendingCount: pendingReferred.length 
    };
  }, [user?.referralCode, user?.id, registeredUsers, systemSettings?.referralBonus, language, showToast]);

  // One-time referral check when user logs in with referrals
  useEffect(() => {
    if (isLoggedIn && user?.referralCode && registeredUsers.length > 0) {
      syncReferralEarnings();
    }
  }, [isLoggedIn, user?.id]);

  const addJob = (newJobData: {
    title: string;
    category: string;
    reward: number;
    availableSlots: number;
    instructions: string[];
    targetUrl?: string;
    proofRequirement?: string;
  }) => {
    const newJob: MicroJob = {
      id: `job_${Date.now()}`,
      jobCode: String(Math.floor(1000 + Math.random() * 9000)),
      title: newJobData.title,
      category: newJobData.category,
      reward: newJobData.reward,
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
      availableSlots: newJobData.availableSlots,
      completedSlots: 0,
      deadline: '২৪ ঘণ্টা',
      instructions: newJobData.instructions,
      targetUrl: newJobData.targetUrl || 'https://facebook.com',
      proofRequirement: newJobData.proofRequirement || 'স্ক্রিনশট এবং আইডি লিঙ্ক',
      status: 'active',
      featured: true
    };
    setJobs(prev => [newJob, ...prev]);
    syncJobWithFirestore(newJob);
    showToast('নতুন মাইক্রো জব তৈরি ও লাইভ সম্পন্ন হয়েছে!');
  };

  const rechargeMobile = (operator: string, phone: string, amount: number) => {
    if (amount > wallet.balance) {
      showToast('ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই! দয়া করে ফান্ড ডিপোজিট করুন।');
      return false;
    }
    setWallet(prev => ({
      ...prev,
      balance: prev.balance - amount
    }));
    addTransaction({
      type: 'adjustment',
      amount,
      status: 'completed',
      description: `${operator} মোবাইল রিচার্জ (${phone})`,
      paymentMethod: operator,
      accountNumber: phone
    });
    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch {
      // safe
    }
    showToast(`৳${amount} ${operator} রিচার্জ (${phone}) সফল হয়েছে!`);
    return true;
  };

  // Admin Actions
  const adminApproveJobSubmission = (submissionId: string) => {
    const sub = jobSubmissions.find(s => s.id === submissionId);
    if (!sub) return;
    if (sub.status === 'approved') {
      showToast('এই সাবমিশনটি ইতিমধ্যে অনুমোদিত হয়েছে!');
      return;
    }

    const userProfile = registeredUsers.find(u => u.id === sub.userId);
    if (!userProfile?.isVerified) {
        showToast('এই ইউজারের প্রোফাইল ভেরিফাইড নয়, রিওয়ার্ড দেওয়া সম্ভব নয়!');
        return;
    }

    setJobSubmissions(prev => prev.map(s => s.id === submissionId ? { ...s, status: 'approved' } : s));

    const isCurrentUser = Boolean(
      user && (
        user.id === sub.userId || 
        (userProfile?.phone && user.phone && normalizePhoneNumber(user.phone) === normalizePhoneNumber(userProfile.phone))
      )
    );

    // Credit currently active user wallet ONLY if they own this submission
    if (isCurrentUser) {
      setWallet(prev => ({
        ...prev,
        balance: Math.round(((Number(prev.balance) || 0) + sub.reward) * 100) / 100,
        totalEarned: Math.round(((Number(prev.totalEarned) || 0) + sub.reward) * 100) / 100,
        updatedAt: new Date().toISOString(),
        incomeBreakdown: { 
          ...prev.incomeBreakdown, 
          jobIncome: Math.round(((Number(prev.incomeBreakdown?.jobIncome) || 0) + sub.reward) * 100) / 100 
        }
      }));

      addTransaction({
        type: 'job_reward',
        amount: sub.reward,
        status: 'completed',
        description: `জব #${sub.jobCode} অনুমোদিত রিওয়ার্ড`
      });
    }

    // Always update target applicant user's isolated storage
    try {
      const uKey = `lg_wallet_${sub.userId}`;
      const savedW = localStorage.getItem(uKey);
      if (savedW) {
        const parsedW = JSON.parse(savedW);
        parsedW.balance = Math.round(((Number(parsedW.balance) || 0) + sub.reward) * 100) / 100;
        parsedW.totalEarned = Math.round(((Number(parsedW.totalEarned) || 0) + sub.reward) * 100) / 100;
        if (!parsedW.incomeBreakdown) parsedW.incomeBreakdown = {};
        parsedW.incomeBreakdown.jobIncome = Math.round(((Number(parsedW.incomeBreakdown.jobIncome) || 0) + sub.reward) * 100) / 100;
        localStorage.setItem(uKey, JSON.stringify(parsedW));
      }
    } catch {}

    createAndSendNotification({
      id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      userId: sub.userId,
      title: language === 'bn' ? 'মাইক্রো জব অনুমোদিত!' : 'Job Approved!',
      message: language === 'bn'
        ? `আপনার কাজ "${sub.jobTitle}" (জব #${sub.jobCode}) অনুমোদিত হয়েছে এবং ৳${sub.reward} ওয়ালেটে যোগ হয়েছে!`
        : `Your submission for "${sub.jobTitle}" (#${sub.jobCode}) has been approved and ৳${sub.reward} credited to your wallet.`,
      type: 'job',
      time: 'এখনই'
    });

    showToast(`জব #${sub.jobCode} সাবমিশন অনুমোদিত হয়েছে এবং ৳${sub.reward} ওয়ালেটে যোগ হয়েছে!`);
  };

  const adminRejectJobSubmission = (submissionId: string, reason: string) => {
    const sub = jobSubmissions.find(s => s.id === submissionId);
    if (!sub) return;

    setJobSubmissions(prev => prev.map(s => s.id === submissionId ? { ...s, status: 'rejected', rejectionReason: reason } : s));

    createAndSendNotification({
      id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      userId: sub.userId,
      title: language === 'bn' ? 'মাইক্রো জব বাতিল হয়েছে' : 'Job Rejected',
      message: language === 'bn'
        ? `আপনার কাজ "${sub.jobTitle}" (জব #${sub.jobCode}) বাতিল করা হয়েছে। কারণ: ${reason}`
        : `Your submission for "${sub.jobTitle}" (#${sub.jobCode}) was rejected. Reason: ${reason}`,
      type: 'job',
      time: 'এখনই'
    });

    showToast('সাবমিশনটি বাতিল করা হয়েছে।');
  };

  const adminApproveAdMarketingSubmission = (submissionId: string) => {
    const sub = adMarketingSubmissions.find(s => s.id === submissionId);
    if (!sub) return;

    if (sub.status === 'approved') {
      showToast('এই সাবমিশনটি ইতিমধ্যে অনুমোদিত হয়েছে!');
      return;
    }

    setAdMarketingSubmissions(prev => prev.map(s => s.id === submissionId ? { 
      ...s, 
      status: 'approved',
      approvedAt: new Date().toLocaleString('bn-BD')
    } : s));

    const reward = Number(sub.rewardAmount) || 2.00;

    // Check if the submission belongs to the currently active logged-in user
    const isCurrentUser = user && (
      user.id === sub.userId || 
      (sub.userPhone && user.phone && normalizePhoneNumber(user.phone) === normalizePhoneNumber(sub.userPhone))
    );

    if (isCurrentUser) {
      setWallet(prev => ({
        ...prev,
        balance: prev.balance + reward,
        totalEarned: prev.totalEarned + reward,
        incomeBreakdown: {
          ...prev.incomeBreakdown,
          adsIncome: (prev.incomeBreakdown?.adsIncome || 0) + reward
        }
      }));

      addTransaction({
        type: 'bonus',
        amount: reward,
        status: 'completed',
        description: `বিজ্ঞাপন মার্কেটিং অনুমোদন (${sub.campaignTitle})`
      });
    }

    // Persist in registered users & target user storage
    try {
      const allUsers = safeGetItem<any[]>('lg_registered_users', []);
      const updatedUsers = allUsers.map(u => {
        const match = u.id === sub.userId || (sub.userPhone && u.phone && normalizePhoneNumber(u.phone) === normalizePhoneNumber(sub.userPhone));
        if (match) {
          const curW = u.wallet || { balance: 0, totalEarned: 0 };
          const newBal = (Number(curW.balance) || 0) + reward;
          const newEarn = (Number(curW.totalEarned) || 0) + reward;
          return {
            ...u,
            wallet: { ...curW, balance: newBal, totalEarned: newEarn }
          };
        }
        return u;
      });
      safeSetItem('lg_registered_users', JSON.stringify(updatedUsers));

      // Also persist to target user's local keys if not current user
      if (!isCurrentUser && sub.userId) {
        const uWalletKey = `lg_wallet_${sub.userId}`;
        const savedW = safeGetItem<any>(uWalletKey, null);
        if (savedW) {
          savedW.balance = (Number(savedW.balance) || 0) + reward;
          savedW.totalEarned = (Number(savedW.totalEarned) || 0) + reward;
          safeSetItem(uWalletKey, JSON.stringify(savedW));
        }
        const uTxKey = `lg_transactions_${sub.userId}`;
        const savedTx = safeGetItem<any[]>(uTxKey, []);
        savedTx.unshift({
          id: `trx_ad_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          type: 'bonus',
          amount: reward,
          status: 'completed',
          description: `বিজ্ঞাপন মার্কেটিং অনুমোদন (${sub.campaignTitle})`,
          date: new Date().toISOString()
        });
        safeSetItem(uTxKey, JSON.stringify(savedTx));
      }
    } catch (e) {
      console.error('Error persisting ad marketing reward:', e);
    }

    createAndSendNotification({
      id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      userId: sub.userId,
      userPhone: sub.userPhone,
      title: language === 'bn' ? 'বিজ্ঞাপন মার্কেটিং অনুমোদিত!' : 'Ad Marketing Approved!',
      message: language === 'bn'
        ? `আপনার "${sub.campaignTitle}" প্রুফ অনুমোদিত হয়েছে এবং ৳${reward.toFixed(2)} ওয়ালেটে যোগ হয়েছে!`
        : `Your ad proof for "${sub.campaignTitle}" has been approved and ৳${reward.toFixed(2)} credited to your wallet.`,
      type: 'bonus',
      time: 'এখনই'
    });

    showToast(language === 'bn' 
      ? `সাবমিশন অনুমোদিত হয়েছে এবং ৳${reward.toFixed(2)} ইউজারের ওয়ালেটে যোগ হয়েছে!` 
      : `Submission approved and ৳${reward.toFixed(2)} credited!`);
  };

  const adminRejectAdMarketingSubmission = (submissionId: string, reason: string) => {
    const sub = adMarketingSubmissions.find(s => s.id === submissionId);
    if (!sub) return;

    setAdMarketingSubmissions(prev => prev.map(s => s.id === submissionId ? {
      ...s,
      status: 'rejected',
      rejectionReason: reason
    } : s));

    createAndSendNotification({
      id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      userId: sub.userId,
      userPhone: sub.userPhone,
      title: language === 'bn' ? 'বিজ্ঞাপন মার্কেটিং প্রুফ বাতিল' : 'Ad Proof Rejected',
      message: language === 'bn'
        ? `আপনার "${sub.campaignTitle}" প্রুফ বাতিল করা হয়েছে। কারণ: ${reason}`
        : `Your ad proof for "${sub.campaignTitle}" was rejected. Reason: ${reason}`,
      type: 'announcement',
      time: 'এখনই'
    });

    showToast(language === 'bn' ? 'সাবমিশনটি বাতিল করা হয়েছে।' : 'Submission rejected.');
  };

  const adminApproveWithdrawal = (withdrawalId: string) => {
    const req = withdrawalRequests.find(w => w.id === withdrawalId);
    if (!req || req.status === 'approved') return;

    setWithdrawalRequests(prev => prev.map(w => w.id === withdrawalId ? { ...w, status: 'approved' } : w));
    
    // Call backend API to approve
    fetch(`/api/withdrawals/${encodeURIComponent(withdrawalId)}/approve`, {
      method: 'POST'
    }).catch(err => console.warn('Approve withdrawal API error:', err));

    // Check if current user is the owner
    const isCurrentUser = Boolean(
      (user?.id && user.id !== 'usr_default_01' && req.userId === user.id) || 
      (user?.phone && req.accountNumber && normalizePhoneNumber(req.accountNumber) === normalizePhoneNumber(user.phone)) ||
      (user?.phone && (req as any).account && normalizePhoneNumber((req as any).account) === normalizePhoneNumber(user.phone))
    );

    if (isCurrentUser) {
      setWallet(prev => ({
        ...prev,
        totalWithdrawn: Math.round(((Number(prev.totalWithdrawn) || 0) + req.amount) * 100) / 100,
        updatedAt: new Date().toISOString()
      }));

      setTransactions(prev => prev.map(t => 
        (t.type === 'withdrawal' && (t.referenceId === req.id || t.id === `tx_${req.id}` || t.status === 'pending')) 
          ? { ...t, status: 'completed' as const } 
          : t
      ));
    }

    // Always update isolated wallet storage for the withdrawal applicant
    try {
      const uKey = `lg_wallet_${req.userId}`;
      const savedW = localStorage.getItem(uKey);
      if (savedW) {
        const parsedW = JSON.parse(savedW);
        parsedW.totalWithdrawn = Math.round(((Number(parsedW.totalWithdrawn) || 0) + req.amount) * 100) / 100;
        localStorage.setItem(uKey, JSON.stringify(parsedW));
      }
    } catch {}

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('goodlife:wallet_updated'));
    }

    createAndSendNotification({
      id: `notif_wth_app_${Date.now()}`,
      userId: req.userId,
      userPhone: req.userPhone || req.accountNumber || (req as any).account,
      title: 'উইথড্রাল সম্পন্ন!',
      message: `আপনার ৳${req.amount} উইথড্রাল আবেদন (${req.paymentMethod || (req as any).method || 'ওয়ালেট'} একাউন্ট: ${req.accountNumber || (req as any).account}) সফলভাবে অনুমোদিত ও পেইড হয়েছে।`,
      type: 'wallet',
      time: 'এখনই'
    });

    showToast(`উইথড্রাল ৳${req.amount} অনুমোদন ও সম্পন্ন করা হয়েছে।`);
  };

  const adminRejectWithdrawal = (withdrawalId: string, reason: string) => {
    const req = withdrawalRequests.find(w => w.id === withdrawalId);
    if (!req || req.status !== 'pending') return;

    setWithdrawalRequests(prev => prev.map(w => w.id === withdrawalId ? { ...w, status: 'rejected', rejectionReason: reason } : w));
    
    // Call backend API to reject and refund
    fetch(`/api/withdrawals/${encodeURIComponent(withdrawalId)}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    }).catch(err => console.warn('Reject withdrawal API error:', err));

    // Check if current user is owner
    const isCurrentUser = Boolean(
      (user?.id && user.id !== 'usr_default_01' && req.userId === user.id) || 
      (user?.phone && req.accountNumber && normalizePhoneNumber(req.accountNumber) === normalizePhoneNumber(user.phone)) ||
      (user?.phone && (req as any).account && normalizePhoneNumber((req as any).account) === normalizePhoneNumber(user.phone))
    );

    // Refund money to current user if matches and not already refunded
    if (isCurrentUser) {
      const refundKey = `lg_wd_refunded_${req.id}`;
      if (localStorage.getItem(refundKey) !== 'true') {
        try { localStorage.setItem(refundKey, 'true'); } catch {}
        setWallet(prev => ({
          ...prev,
          balance: Math.round(((Number(prev.balance) || 0) + req.amount) * 100) / 100,
          updatedAt: new Date().toISOString()
        }));

        addTransaction({
          type: 'refund',
          amount: req.amount,
          status: 'completed',
          description: `উইথড্র বাতিলজনিত রিফান্ড (${reason})`
        });
      }
    }

    // Always refund to applicant user's isolated storage
    try {
      const uKey = `lg_wallet_${req.userId}`;
      const savedW = localStorage.getItem(uKey);
      if (savedW) {
        const parsedW = JSON.parse(savedW);
        parsedW.balance = Math.round(((Number(parsedW.balance) || 0) + req.amount) * 100) / 100;
        localStorage.setItem(uKey, JSON.stringify(parsedW));
      }

      const txKey = `lg_transactions_${req.userId}`;
      const savedTxs = localStorage.getItem(txKey);
      const txs: Transaction[] = savedTxs ? JSON.parse(savedTxs) : [];
      txs.unshift({
        id: generateTxId('tx_ref'),
        type: 'refund',
        amount: req.amount,
        date: new Date().toISOString().split('T')[0],
        status: 'completed',
        description: `উইথড্র বাতিলজনিত রিফান্ড (${reason})`
      });
      localStorage.setItem(txKey, JSON.stringify(txs));
    } catch {}

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('goodlife:wallet_updated'));
    }

    createAndSendNotification({
      id: `notif_wth_rej_${Date.now()}`,
      userId: req.userId,
      userPhone: (req as any).accountNumber || (req as any).account,
      title: 'উইথড্রাল বাতিল হয়েছে',
      message: `আপনার ৳${req.amount} উইথড্রাল আবেদন বাতিল করা হয়েছে এবং ৳${req.amount} ব্যালেন্সে রিফান্ড করা হয়েছে। কারণ: ${reason}`,
      type: 'wallet',
      time: 'এখনই'
    });

    showToast('উইথড্রাল বাতিল ও ব্যালেন্স রিফান্ড করা হয়েছে।');
  };

  const adminApproveDeposit = (depositId: string) => {
    const req = depositRequests.find(d => d.id === depositId);
    if (!req) return;
    if (req.status === 'approved') return;

    // Mark deposit as approved in state & local storage
    const updatedReq: DepositRequest = { 
      ...req, 
      status: 'approved',
      updatedAt: new Date().toISOString(),
      approvedAt: new Date().toISOString()
    };
    setDepositRequests(prev => {
      const updated = prev.map(d => d.id === depositId ? updatedReq : d);
      safeSetItem('lg_deposits', JSON.stringify(updated));
      return updated;
    });

    // Update backend API database
    fetch(`/api/deposits/${depositId}/approve`, { method: 'POST' }).catch(err => {
      console.warn('API deposit approve error:', err);
    });

    syncDepositRequestWithFirestore(updatedReq);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('goodlife:deposit_updated', { detail: updatedReq }));
      window.dispatchEvent(new CustomEvent('goodlife:wallet_updated'));
    }

    // 1. Update current logged-in user wallet if it matches
    const curPhoneNorm = user.phone ? normalizePhoneNumber(user.phone) : '';
    const reqUserPhoneNorm = req.userPhone ? normalizePhoneNumber(req.userPhone) : '';
    const reqSenderPhoneNorm = req.senderPhone ? normalizePhoneNumber(req.senderPhone) : '';

    const isCurrentUser = Boolean(
      (user.id && user.id !== 'usr_default_01' && req.userId === user.id) || 
      (curPhoneNorm && reqUserPhoneNorm && curPhoneNorm === reqUserPhoneNorm) ||
      (curPhoneNorm && reqSenderPhoneNorm && curPhoneNorm === reqSenderPhoneNorm)
    );

    if (isCurrentUser) {
      const depCreditKey = `lg_dep_credited_${req.id}`;
      if (localStorage.getItem(depCreditKey) !== 'true') {
        try { localStorage.setItem(depCreditKey, 'true'); } catch {}
        setWallet(prev => ({
          ...prev,
          balance: Math.round(((Number(prev.balance) || 0) + req.amount) * 100) / 100,
          updatedAt: new Date().toISOString()
        }));
      }

      // Update or add completed transaction in current transactions state
      setTransactions(prev => {
        let found = false;
        const updated = prev.map(t => {
          if (t.type === 'deposit' && (t.referenceId === req.trxId || t.id === `tx_${req.id}`)) {
            found = true;
            return { ...t, status: 'completed' as const };
          }
          return t;
        });
        if (!found) {
          updated.unshift({
            id: req.id ? `tx_${req.id}` : generateTxId('tx_dep'),
            userId: req.userId || user.id,
            type: 'deposit',
            amount: req.amount,
            date: new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString(),
            status: 'completed',
            description: `${(req.paymentMethod || req.method || 'Bkash').toUpperCase()} ডিপোজিট অনুমোদিত (Trx: ${req.trxId})`,
            paymentMethod: req.paymentMethod || req.method || 'Bkash',
            referenceId: req.trxId
          });
        }
        return updated;
      });
    }

    // 2. Always update the target user's isolated wallet storage
    try {
      const userWalletKey = `lg_wallet_${req.userId}`;
      const storedWalletStr = localStorage.getItem(userWalletKey);
      let targetWallet = storedWalletStr 
        ? JSON.parse(storedWalletStr) 
        : { 
            balance: 0, 
            totalEarned: 0, 
            totalWithdrawn: 0, 
            pendingBalance: 0,
            incomeBreakdown: { jobIncome: 0, referralIncome: 0, resellingProfit: 0, bonusIncome: 0, affiliateIncome: 0, adsIncome: 0, otherIncome: 0 } 
          };
      targetWallet.balance = Math.round(((Number(targetWallet.balance) || 0) + req.amount) * 100) / 100;
      // Note: Deposits never increment totalEarned
      localStorage.setItem(userWalletKey, JSON.stringify(targetWallet));
      
      // Add audit log
      addAuditLog({
        type: 'deposit',
        targetId: req.userId,
        action: 'Approved',
        actorId: user.id,
        actorName: user.name,
        details: `ইউজার ${req.userName} এর ${req.amount} টাকা ডিপোজিট অ্যাপ্রুভ হয়েছে। TrxID: ${req.trxId}`
      });
    } catch (err) {
      console.error('Failed updating user wallet storage:', err);
    }

    // 3. Update registeredUsers in state and in lg_registered_users & sync to Firestore
    let matchedRegUser: UserProfile | null = null;
    setRegisteredUsers(prev => prev.map(u => {
      if (u.id === req.userId || (req.userPhone && u.phone === req.userPhone)) {
        const nextBalance = Math.round(((Number(u.wallet?.balance) || 0) + req.amount) * 100) / 100;
        const currentEarned = Number(u.wallet?.totalEarned) || 0;
        const updatedUser = {
          ...u,
          wallet: {
            ...u.wallet,
            balance: nextBalance,
            totalEarned: currentEarned
          }
        };
        matchedRegUser = updatedUser;
        return updatedUser;
      }
      return u;
    }));

    // 4. Authoritative Firestore transaction credit (strictly isolated to User UID, duplicate-proof)
    creditUserDepositInFirestore(updatedReq).then(res => {
      if (res.success && typeof res.newBalance === 'number') {
        if (isCurrentUser) {
          setWallet(prev => ({
            ...prev,
            balance: res.newBalance,
            updatedAt: new Date().toISOString()
          }));
          setUser(prev => ({ ...prev, balance: res.newBalance }));
        }
      }
    });

    if (matchedRegUser) {
      syncUserWithFirestore(matchedRegUser, (matchedRegUser as any).wallet);
    }

    try {
      const saved = localStorage.getItem('lg_registered_users');
      if (saved) {
        const usersList: any[] = JSON.parse(saved);
        const updated = usersList.map(item => {
          const u = item.user || item;
          if (u.id === req.userId || (req.userPhone && u.phone === req.userPhone)) {
            const w = item.wallet || { balance: 0, totalEarned: 0 };
            const nextBalance = Math.round(((Number(w.balance) || 0) + req.amount) * 100) / 100;
            const currentEarned = Number(w.totalEarned) || 0;
            if (item.user) {
              return {
                ...item,
                user: {
                  ...item.user,
                  wallet: { ...(item.user.wallet || {}), balance: nextBalance, totalEarned: currentEarned }
                },
                wallet: { ...w, balance: nextBalance, totalEarned: currentEarned }
              };
            }
            return {
              ...item,
              wallet: { ...w, balance: nextBalance, totalEarned: currentEarned }
            };
          }
          return item;
        });
        localStorage.setItem('lg_registered_users', JSON.stringify(updated));
      }
    } catch (err) {
      console.error('Failed updating lg_registered_users:', err);
    }

    // 4. Mark matching pending deposit transaction as completed
    setTransactions(prev => prev.map(t => {
      if (t.type === 'deposit' && (t.referenceId === req.trxId || t.id === `tx_${req.id}`)) {
        return { ...t, status: 'completed' };
      }
      return t;
    }));

    try {
      const userTxKey = `lg_transactions_${req.userId}`;
      const storedTxStr = localStorage.getItem(userTxKey);
      if (storedTxStr) {
        const txs: Transaction[] = JSON.parse(storedTxStr);
        const updatedTxs = txs.map(t => {
          if (t.type === 'deposit' && (t.referenceId === req.trxId || t.id === `tx_${req.id}`)) {
            const updatedT = { ...t, status: 'completed' as const };
            syncTransactionWithFirestore(req.userId, updatedT);
            return updatedT;
          }
          return t;
        });
        localStorage.setItem(userTxKey, JSON.stringify(updatedTxs));
      }
    } catch {}

    // 5. Add user notification strictly isolated to applicant
    createAndSendNotification({
      id: `notif_dep_app_${req.id}_${Date.now()}`,
      userId: req.userId,
      userPhone: req.userPhone || req.senderPhone,
      title: language === 'bn' ? 'ডিপোজিট অনুমোদিত!' : 'Deposit Approved!',
      message: language === 'bn'
        ? `আপনার ৳${req.amount} ডিপোজিট (TrxID: ${req.trxId}) এডমিন দ্বারা অনুমোদিত হয়েছে এবং ওয়ালেটে যুক্ত হয়েছে।`
        : `Your deposit of ৳${req.amount} (TrxID: ${req.trxId}) has been approved and credited to your wallet balance.`,
      type: 'wallet',
      time: 'এখনই'
    });

    // If this is an account verification deposit, also verify user profile and synchronize
    const isVerifReq = Boolean(
      req.isVerification || 
      req.depositType === 'verification' || 
      req.purpose === 'Account Verification' ||
      (req.purpose && req.purpose.toLowerCase().includes('verification'))
    );

    if (isVerifReq) {
      if (isCurrentUser) {
        setUser(prev => {
          const u = { ...prev, isVerified: true, verificationStatus: 'verified' as const };
          safeSetItem('lg_user', JSON.stringify(u));
          return u;
        });
      }

      setRegisteredUsers(prev => prev.map(u => {
        if (u.id === req.userId || (req.userPhone && u.phone === req.userPhone)) {
          return { ...u, isVerified: true, verificationStatus: 'verified' as const };
        }
        return u;
      }));

      setVerificationRequests(prev => prev.map(v => {
        if (v.id === req.id || v.trxId === req.trxId || (req.userId && v.userId === req.userId)) {
          return { ...v, status: 'approved' as const };
        }
        return v;
      }));

      // Update backend user verification
      if (req.userId) {
        fetch(`/api/users/${req.userId}/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isVerified: true, status: 'verified' })
        }).catch(() => {});
      }

      // Referral reward strictly credited upon user verification
      if (isVerifReq) {
        creditReferralRewardForVerifiedUser(req.userId, req.userName, req.userPhone || req.senderPhone);
      }

      createAndSendNotification({
        id: `notif_ver_app_${req.id}_${Date.now()}`,
        userId: req.userId,
        userPhone: req.userPhone || req.senderPhone,
        title: language === 'bn' ? '🎉 অ্যাকাউন্ট ভেরিফাইড হয়েছে!' : '🎉 Account Verified!',
        message: language === 'bn'
          ? 'অভিনন্দন! আপনার ভেরিফিকেশন ডিপোজিট অনুমোদিত হয়েছে এবং অ্যাকাউন্ট সফলভাবে ভেরিফাই করা হয়েছে।'
          : 'Congratulations! Your verification deposit has been approved and your account is now verified.',
        type: 'announcement',
        time: 'এখনই'
      });
    }

    // If this is a Special Social Income access deposit, unlock feature exclusively for applicant
    const isSpecialSocialReq = Boolean(
      req.depositType === 'special_social' || 
      req.purpose === 'বিশেষ সোশ্যাল ইনকাম এক্সেস' ||
      (req.purpose && req.purpose.includes('বিশেষ সোশ্যাল'))
    );

    if (isSpecialSocialReq) {
      if (isCurrentUser) {
        setUser(prev => {
          const u = { 
            ...prev, 
            specialSocialAccess: true, 
            specialSocialStatus: 'approved' as const,
            specialSocialApprovedAt: new Date().toISOString()
          };
          safeSetItem('lg_user', JSON.stringify(u));
          return u;
        });
      }

      setRegisteredUsers(prev => prev.map(u => {
        if (u.id === req.userId || (req.userPhone && u.phone === req.userPhone)) {
          return { 
            ...u, 
            specialSocialAccess: true, 
            specialSocialStatus: 'approved' as const,
            specialSocialApprovedAt: new Date().toISOString()
          };
        }
        return u;
      }));

      // Update lg_registered_users in localStorage
      try {
        const saved = localStorage.getItem('lg_registered_users');
        if (saved) {
          const usersList: any[] = JSON.parse(saved);
          const updated = usersList.map(item => {
            const u = item.user || item;
            if (u.id === req.userId || (req.userPhone && u.phone === req.userPhone)) {
              if (item.user) {
                return {
                  ...item,
                  user: {
                    ...item.user,
                    specialSocialAccess: true,
                    specialSocialStatus: 'approved',
                    specialSocialApprovedAt: new Date().toISOString()
                  }
                };
              }
              return {
                ...item,
                specialSocialAccess: true,
                specialSocialStatus: 'approved',
                specialSocialApprovedAt: new Date().toISOString()
              };
            }
            return item;
          });
          localStorage.setItem('lg_registered_users', JSON.stringify(updated));
        }
      } catch {}

      createAndSendNotification({
        id: `notif_special_social_app_${req.id}_${Date.now()}`,
        userId: req.userId,
        userPhone: req.userPhone || req.senderPhone,
        title: language === 'bn' ? '⚡ বিশেষ সোশ্যাল ইনকাম আনলক হয়েছে!' : '⚡ Special Social Income Unlocked!',
        message: language === 'bn'
          ? `অভিনন্দন! আপনার ৳${req.amount} ডিপোজিট অনুমোদিত হয়েছে। আপনার একাউন্টে বিশেষ সোশ্যাল ইনকাম সফলভাবে সক্রিয় হয়েছে।`
          : `Congratulations! Your deposit of ৳${req.amount} has been approved. Special Social Income is now unlocked for your account.`,
        type: 'announcement',
        time: 'এখনই'
      });
    }

    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch {}

    showToast(language === 'bn' 
      ? (isVerifReq ? `৳${req.amount} ডিপোজিট ও ইউজার ভেরিফিকেশন অনুমোদিত হয়েছে!` : `৳${req.amount} ডিপোজিট অ্যাপ্রুভ হয়েছে এবং ইউজারের ব্যালেন্সে যুক্ত হয়েছে!`)
      : (isVerifReq ? `Deposit & verification approved!` : `Deposit of ৳${req.amount} approved and credited!`));
  };

  const adminRejectDeposit = (depositId: string, reason?: string) => {
    const req = depositRequests.find(d => d.id === depositId);
    if (!req) return;
    if (req.status === 'rejected') return;

    const actualReason = reason || 'ভুল বা অসত্য ট্রানজেকশন তথ্য';

    // Mark deposit as rejected (Balance is NEVER touched or added)
    const updatedReq: DepositRequest = { 
      ...req, 
      status: 'rejected', 
      rejectionReason: actualReason,
      updatedAt: new Date().toISOString()
    };
    setDepositRequests(prev => {
      const updated = prev.map(d => d.id === depositId ? updatedReq : d);
      safeSetItem('lg_deposits', JSON.stringify(updated));
      return updated;
    });

    // Update backend API database
    fetch(`/api/deposits/${depositId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: actualReason })
    }).catch(err => {
      console.warn('API deposit reject error:', err);
    });

    syncDepositRequestWithFirestore(updatedReq);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('goodlife:deposit_updated', { detail: updatedReq }));
    }

    // Mark matching transaction as rejected
    setTransactions(prev => prev.map(t => {
      if (t.type === 'deposit' && (t.referenceId === req.trxId || t.id === `tx_${req.id}`)) {
        return { ...t, status: 'rejected' };
      }
      return t;
    }));

    // Add Audit Log
    addAuditLog({
      type: 'deposit',
      targetId: req.id,
      action: 'Rejected',
      status: 'rejected',
      rejectionReason: actualReason,
      actorId: user.id,
      actorName: user.name,
      targetUserName: req.userName,
      targetUserPhone: req.userPhone || req.senderPhone,
      amount: req.amount,
      details: `ইউজার ${req.userName || 'গ্রাহক'} এর ৳${req.amount} ডিপোজিট আবেদন বাতিল করা হয়েছে। কারণ: ${actualReason}`
    });

    // Add user notification strictly isolated to applicant
    createAndSendNotification({
      id: `notif_dep_rej_${req.id}_${Date.now()}`,
      userId: req.userId,
      userPhone: req.userPhone || req.senderPhone,
      title: language === 'bn' ? 'ডিপোজিট বাতিল হয়েছে' : 'Deposit Rejected',
      message: language === 'bn'
        ? `আপনার ৳${req.amount} ডিপোজিট আবেদন (TrxID: ${req.trxId}) বাতিল করা হয়েছে। কারণ: ${actualReason}`
        : `Your deposit of ৳${req.amount} (TrxID: ${req.trxId}) was rejected. Reason: ${actualReason}`,
      type: 'wallet',
      time: 'এখনই'
    });

    // If this was an account verification deposit, also reject verification status
    const isVerifReq = Boolean(
      req.isVerification || 
      req.depositType === 'verification' || 
      req.purpose === 'Account Verification' ||
      (req.purpose && req.purpose.toLowerCase().includes('verification'))
    );

    if (isVerifReq) {
      if (user.id === req.userId || (user.phone && (req.userPhone === user.phone || req.senderPhone === user.phone))) {
        setUser(prev => {
          const u = { ...prev, isVerified: false, verificationStatus: 'rejected' as const };
          safeSetItem('lg_user', JSON.stringify(u));
          return u;
        });
      }

      setRegisteredUsers(prev => prev.map(u => {
        if (u.id === req.userId || (req.userPhone && u.phone === req.userPhone)) {
          return { ...u, isVerified: false, verificationStatus: 'rejected' as const };
        }
        return u;
      }));

      setVerificationRequests(prev => prev.map(v => {
        if (v.id === req.id || v.trxId === req.trxId || (req.userId && v.userId === req.userId)) {
          return { ...v, status: 'rejected' as const, rejectionReason: actualReason };
        }
        return v;
      }));

      if (req.userId) {
        fetch(`/api/users/${req.userId}/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isVerified: false, status: 'rejected', rejectionReason: actualReason })
        }).catch(() => {});
      }

      createAndSendNotification({
        id: `notif_ver_rej_${req.id}_${Date.now()}`,
        userId: req.userId,
        userPhone: req.userPhone || req.senderPhone,
        title: language === 'bn' ? 'ভেরিফিকেশন আবেদন বাতিল' : 'Verification Rejected',
        message: language === 'bn'
          ? `আপনার ভেরিফিকেশন ডিপোজিট আবেদন বাতিল করা হয়েছে। কারণ: ${actualReason}`
          : `Your verification deposit request was rejected. Reason: ${actualReason}`,
        type: 'announcement',
        time: 'এখনই'
      });
    }

    // If this was a special social income deposit, update status to rejected
    const isSpecialSocialReq = Boolean(
      req.depositType === 'special_social' || 
      req.purpose === 'বিশেষ সোশ্যাল ইনকাম এক্সেস' ||
      (req.purpose && req.purpose.includes('বিশেষ সোশ্যাল'))
    );

    if (isSpecialSocialReq) {
      if (user.id === req.userId || (user.phone && (req.userPhone === user.phone || req.senderPhone === user.phone))) {
        setUser(prev => {
          const u = { ...prev, specialSocialAccess: false, specialSocialStatus: 'rejected' as const };
          safeSetItem('lg_user', JSON.stringify(u));
          return u;
        });
      }

      setRegisteredUsers(prev => prev.map(u => {
        if (u.id === req.userId || (req.userPhone && u.phone === req.userPhone)) {
          return { ...u, specialSocialAccess: false, specialSocialStatus: 'rejected' as const };
        }
        return u;
      }));

      createAndSendNotification({
        id: `notif_special_social_rej_${req.id}_${Date.now()}`,
        userId: req.userId,
        userPhone: req.userPhone || req.senderPhone,
        title: language === 'bn' ? 'বিশেষ সোশ্যাল ইনকাম ডিপোজিট বাতিল' : 'Special Social Deposit Rejected',
        message: language === 'bn'
          ? `আপনার বিশেষ সোশ্যাল ইনকাম ডিপোজিট আবেদন বাতিল করা হয়েছে। কারণ: ${actualReason}`
          : `Your special social income deposit was rejected. Reason: ${actualReason}`,
        type: 'announcement',
        time: 'এখনই'
      });
    }

    showToast(language === 'bn' ? 'ডিপোজিট রিকোয়েস্টটি বাতিল করা হয়েছে।' : 'Deposit request rejected.');
  };

  const adminBulkApproveDeposits = (depositIds: string[]) => {
    if (!depositIds || depositIds.length === 0) return;
    let count = 0;
    depositIds.forEach(id => {
      adminApproveDeposit(id);
      count++;
    });
    showToast(`${count} টি ডিপোজিট সফলভাবে অনুমোদন করা হয়েছে!`);
  };

  const adminBulkRejectDeposits = (depositIds: string[], reason: string) => {
    if (!depositIds || depositIds.length === 0) return;
    depositIds.forEach(id => {
      adminRejectDeposit(id, reason);
    });
    showToast(`${depositIds.length} টি ডিপোজিট বাতিল করা হয়েছে।`);
  };

  // Reselling Order Two-Step Validation Workflow
  const adminVerifyOrderPayment = (orderId: string) => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return;

    const profit = Number(targetOrder.resellerProfit || targetOrder.profit || targetOrder.cashback || 0);

    // If profit exists and hasn't been released yet, immediately credit it to the user's account upon confirmation!
    if (profit > 0 && !targetOrder.earningsReleased) {
      // 1. If currently active logged-in user is the reseller
      if (targetOrder.userId === user.id) {
        setWallet(prev => ({
          ...prev,
          balance: prev.balance + profit,
          totalEarned: prev.totalEarned + profit,
          incomeBreakdown: {
            ...prev.incomeBreakdown,
            resellingProfit: (Number(prev.incomeBreakdown?.resellingProfit) || 0) + profit
          }
        }));
      }

      // 2. In isolated wallet storage for the target user
      try {
        const walletKey = `lg_wallet_${targetOrder.userId}`;
        const storedStr = localStorage.getItem(walletKey);
        if (storedStr) {
          const w = JSON.parse(storedStr);
          w.balance = (Number(w.balance) || 0) + profit;
          w.totalEarned = (Number(w.totalEarned) || 0) + profit;
          if (!w.incomeBreakdown) w.incomeBreakdown = {};
          w.incomeBreakdown.resellingProfit = (Number(w.incomeBreakdown.resellingProfit) || 0) + profit;
          localStorage.setItem(walletKey, JSON.stringify(w));
        }
      } catch {}

      // 3. In registeredUsers
      setRegisteredUsers(prev => prev.map(u => {
        if (u.id === targetOrder.userId || (targetOrder.phone && u.phone === targetOrder.phone)) {
          return {
            ...u,
            resellerSalesCount: (u.resellerSalesCount || 0) + 1,
            wallet: {
              ...u.wallet,
              balance: (Number(u.wallet?.balance) || 0) + profit,
              totalEarned: (Number(u.wallet?.totalEarned) || 0) + profit,
              incomeBreakdown: {
                ...u.wallet?.incomeBreakdown,
                resellingProfit: (Number(u.wallet?.incomeBreakdown?.resellingProfit) || 0) + profit
              }
            }
          };
        }
        return u;
      }));

      // 4. Add completed transaction record for reseller
      addTransaction({
        type: 'reselling_profit',
        amount: profit,
        status: 'completed',
        description: `রিসেলিং অর্ডার #${orderId} কনফার্মেশন লভ্যাংশ জমা`,
        referenceId: orderId
      });
    }

    const updatedOrder: Order = {
      ...targetOrder,
      paymentVerified: true,
      paymentVerifiedAt: new Date().toISOString(),
      earningsReleased: true,
      earningsReleasedAt: targetOrder.earningsReleasedAt || new Date().toISOString(),
      status: targetOrder.status === 'pending' ? 'confirmed' : targetOrder.status
    };

    setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
    syncOrderWithFirestore(updatedOrder);

    // Add Audit Log
    addAuditLog({
      type: 'order',
      targetId: orderId,
      action: 'Order Confirmed & Profit Credited',
      status: 'verified',
      actorId: user.id,
      actorName: user.name,
      targetUserName: targetOrder.customerName,
      targetUserPhone: targetOrder.phone,
      amount: targetOrder.total,
      details: `অর্ডার #${orderId} কনফার্ম করা হয়েছে এবং রিসেলিং অতিরিক্ত লাভ ৳${profit} ইউজারের একাউন্টে জমা করা হয়েছে।`
    });

    // Notify user
    createAndSendNotification({
      id: `notif_ord_ver_${Date.now()}`,
      userId: targetOrder.userId,
      userPhone: targetOrder.phone,
      title: 'অর্ডার কনফার্ম ও লাভ জমা হয়েছে!',
      message: `অভিনন্দন! আপনার অর্ডার #${orderId} কনফার্ম হয়েছে এবং রিসেলিং লাভ ৳${profit} আপনার অ্যাকাউন্টে জমা হয়েছে।`,
      time: 'এইমাত্র',
      type: 'order'
    });

    showToast(`অর্ডার #${orderId} কনফার্ম হয়েছে এবং রিসেলিং লাভ ৳${profit} ইউজারের ওয়ালেটে জমা হয়েছে।`);
  };

  const adminReleaseOrderEarnings = (orderId: string) => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return;
    if (targetOrder.earningsReleased) {
      showToast('এই অর্ডারের লভ্যাংশ ইতিমধ্যে প্রদান করা হয়েছে।');
      return;
    }

    const profit = Number(targetOrder.resellerProfit || targetOrder.cashback || 0);

    // 1. Credit reseller wallet
    if (profit > 0) {
      // If currently active user is the reseller
      if (targetOrder.userId === user.id) {
        setWallet(prev => ({
          ...prev,
          balance: prev.balance + profit,
          totalEarned: prev.totalEarned + profit,
          incomeBreakdown: {
            ...prev.incomeBreakdown,
            resellingProfit: (Number(prev.incomeBreakdown?.resellingProfit) || 0) + profit
          }
        }));
      }

      // In isolated wallet storage
      try {
        const walletKey = `lg_wallet_${targetOrder.userId}`;
        const storedStr = localStorage.getItem(walletKey);
        if (storedStr) {
          const w = JSON.parse(storedStr);
          w.balance = (Number(w.balance) || 0) + profit;
          w.totalEarned = (Number(w.totalEarned) || 0) + profit;
          if (!w.incomeBreakdown) w.incomeBreakdown = {};
          w.incomeBreakdown.resellingProfit = (Number(w.incomeBreakdown.resellingProfit) || 0) + profit;
          localStorage.setItem(walletKey, JSON.stringify(w));
        }
      } catch {}

      // In registeredUsers
      setRegisteredUsers(prev => prev.map(u => {
        if (u.id === targetOrder.userId || (targetOrder.phone && u.phone === targetOrder.phone)) {
          return {
            ...u,
            wallet: {
              ...u.wallet,
              balance: (Number(u.wallet?.balance) || 0) + profit,
              totalEarned: (Number(u.wallet?.totalEarned) || 0) + profit,
              incomeBreakdown: {
                ...u.wallet?.incomeBreakdown,
                resellingProfit: (Number(u.wallet?.incomeBreakdown?.resellingProfit) || 0) + profit
              }
            }
          };
        }
        return u;
      }));

      // Add transaction for reseller
      addTransaction({
        type: 'reselling_profit',
        amount: profit,
        status: 'completed',
        description: `রিসেলিং অর্ডার #${orderId} সফল ডেলিভারি বোনাস/লাভ`,
        referenceId: orderId
      });
    }

    // 2. Mark order status as delivered & earnings released
    const updatedOrder: Order = {
      ...targetOrder,
      status: 'delivered',
      earningsReleased: true,
      earningsReleasedAt: new Date().toISOString(),
      paymentVerified: true
    };

    setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
    syncOrderWithFirestore(updatedOrder);

    // 3. Add Audit Log
    addAuditLog({
      type: 'order',
      targetId: orderId,
      action: 'Approved',
      status: 'approved',
      actorId: user.id,
      actorName: user.name,
      targetUserName: targetOrder.customerName,
      targetUserPhone: targetOrder.phone,
      amount: profit,
      details: `অর্ডার #${orderId} সফলভাবে ডেলিভারি ও অনুমোদিত হয়েছে। রিসেলিং লাভ ৳${profit} ইউজারের ওয়ালেটে রিলিজ করা হয়েছে।`
    });

    // 4. Send notification
    createAndSendNotification({
      id: `notif_ord_app_${Date.now()}`,
      userId: targetOrder.userId,
      userPhone: targetOrder.phone,
      title: 'অর্ডার লাভ ওয়ালেটে যুক্ত হয়েছে!',
      message: `অর্ডার #${orderId} সফলভাবে ডেলিভারি হয়েছে এবং ৳${profit} আপনার মূল ব্যালেন্সে যুক্ত হয়েছে।`,
      time: 'এইমাত্র',
      type: 'order'
    });

    try {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    } catch {}

    showToast(`অর্ডার #${orderId} অনুমোদন সম্পন্ন এবং ৳${profit} ওয়ালেটে রিলিজ হয়েছে!`);
  };

  const adminRejectOrder = (orderId: string, reason: string) => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return;

    const updatedOrder: Order = {
      ...targetOrder,
      status: 'cancelled',
      rejectionReason: reason
    };

    // If paid via wallet, refund total amount to buyer's wallet
    if (targetOrder.paymentMethod === 'wallet' && targetOrder.total > 0) {
      if (targetOrder.userId === user.id) {
        setWallet(prev => ({
          ...prev,
          balance: prev.balance + targetOrder.total
        }));
      }

      setRegisteredUsers(prev => prev.map(u => {
        if (u.id === targetOrder.userId) {
          return {
            ...u,
            wallet: {
              ...u.wallet,
              balance: (Number(u.wallet?.balance) || 0) + targetOrder.total
            }
          };
        }
        return u;
      }));

      addTransaction({
        type: 'refund',
        amount: targetOrder.total,
        status: 'completed',
        description: `অর্ডার #${orderId} বাতিলজনিত রিফান্ড (${reason})`
      });
    }

    setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
    syncOrderWithFirestore(updatedOrder);

    // Add Audit Log
    addAuditLog({
      type: 'order',
      targetId: orderId,
      action: 'Rejected',
      status: 'rejected',
      rejectionReason: reason,
      actorId: user.id,
      actorName: user.name,
      targetUserName: targetOrder.customerName,
      targetUserPhone: targetOrder.phone,
      amount: targetOrder.total,
      details: `অর্ডার #${orderId} বাতিল করা হয়েছে। কারণ: ${reason}`
    });

    // Notify user
    createAndSendNotification({
      id: `notif_ord_rej_${Date.now()}`,
      userId: targetOrder.userId,
      userPhone: targetOrder.phone,
      title: 'অর্ডার বাতিল হয়েছে',
      message: `আপনার অর্ডার #${orderId} বাতিল করা হয়েছে। কারণ: ${reason}`,
      time: 'এখনই',
      type: 'order'
    });

    showToast(`অর্ডার #${orderId} বাতিল করা হয়েছে।`);
  };

  const adminBulkVerifyOrderPayments = (orderIds: string[]) => {
    if (!orderIds || orderIds.length === 0) return;
    orderIds.forEach(id => adminVerifyOrderPayment(id));
    showToast(`${orderIds.length} টি অর্ডারের পেমেন্ট ভেরিফাই করা হয়েছে!`);
  };

  const adminBulkReleaseOrderEarnings = (orderIds: string[]) => {
    if (!orderIds || orderIds.length === 0) return;
    orderIds.forEach(id => adminReleaseOrderEarnings(id));
    showToast(`${orderIds.length} টি অর্ডারের উপার্জন ওয়ালেটে রিলিজ করা হয়েছে!`);
  };

  const adminBulkRejectOrders = (orderIds: string[], reason: string) => {
    if (!orderIds || orderIds.length === 0) return;
    orderIds.forEach(id => adminRejectOrder(id, reason));
    showToast(`${orderIds.length} টি অর্ডার বাতিল করা হয়েছে।`);
  };

  const adminUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    if (status === 'delivered') {
      adminReleaseOrderEarnings(orderId);
      return;
    }

    if (status === 'confirmed') {
      adminVerifyOrderPayment(orderId);
      return;
    }

    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const isVerifying = status === 'processing' || status === 'shipped';
        const updated = { 
          ...o, 
          status,
          paymentVerified: isVerifying ? true : o.paymentVerified 
        };
        syncOrderWithFirestore(updated);
        return updated;
      }
      return o;
    }));
    showToast(`অর্ডার #${orderId} স্ট্যাটাস "${status}" এ আপডেট করা হয়েছে।`);
  };

  const adminAddProduct = (newProdData: Omit<Product, 'id'>) => {
    const newProd: Product = {
      ...newProdData,
      id: `prod_${Date.now()}`
    };
    setProducts(prev => [newProd, ...prev]);
    showToast('নতুন পণ্য সফলভাবে যুক্ত করা হয়েছে!');
  };

  const adminUpdateProduct = (productId: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, ...updates } : p));
    showToast(language === 'bn' ? 'পণ্যটি সফলভাবে আপডেট করা হয়েছে।' : 'Product updated successfully.');
  };

  const adminToggleOfferProduct = (productId: string, isOfferProduct?: boolean, offerTag?: string) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const nextState = isOfferProduct !== undefined ? isOfferProduct : !p.isOfferProduct;
        return {
          ...p,
          isOfferProduct: nextState,
          offerTag: offerTag !== undefined ? offerTag : (p.offerTag || 'ধামাকা অফার')
        };
      }
      return p;
    }));
    showToast(language === 'bn' ? 'অফার প্রোডাক্ট স্ট্যাটাস সফলভাবে আপডেট হয়েছে!' : 'Offer product status updated!');
  };

  const adminDeleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    showToast('পণ্যটি সফলভাবে ডিলিট করা হয়েছে।');
  };

  // Shop & Vendor Admin Management Functions
  const refreshShops = useCallback(async () => {
    try {
      const res = await fetch('/api/shops');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.shops)) {
          setShops(data.shops);
          safeSetItem('lg_shops', JSON.stringify(data.shops));
          if (!activeShopId && data.shops.length > 0) {
            setActiveShopId(data.shops[0].id);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load shops:', err);
    }
  }, [activeShopId, setActiveShopId]);

  const refreshVendors = useCallback(async () => {
    try {
      const res = await fetch('/api/vendors');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.vendors)) {
          setVendors(data.vendors);
          safeSetItem('lg_vendors', JSON.stringify(data.vendors));
        }
      }
    } catch (err) {
      console.error('Failed to load vendors:', err);
    }
  }, []);

  const adminCreateShop = useCallback(async (shopData: Partial<Shop>) => {
    try {
      const res = await fetch('/api/shops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shopData)
      });
      const data = await res.json();
      if (data.success && data.shop) {
        setShops(prev => {
          const updated = [...prev, data.shop];
          safeSetItem('lg_shops', JSON.stringify(updated));
          return updated;
        });
        showToast(`শপ "${data.shop.name}" সফলভাবে তৈরি হয়েছে!`);
        return { success: true, shop: data.shop };
      }
      showToast(data.message || 'শপ তৈরি ব্যর্থ হয়েছে।');
      return { success: false, message: data.message || 'শপ তৈরি ব্যর্থ হয়েছে।' };
    } catch (err: any) {
      const msg = err?.message || 'শপ তৈরি ব্যর্থ হয়েছে।';
      showToast(msg);
      return { success: false, message: msg };
    }
  }, [showToast]);

  const adminUpdateShop = useCallback(async (shopId: string, updates: Partial<Shop>) => {
    try {
      const res = await fetch(`/api/shops/${shopId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (data.success && data.shop) {
        setShops(prev => {
          const updated = prev.map(s => s.id === shopId ? data.shop : s);
          safeSetItem('lg_shops', JSON.stringify(updated));
          return updated;
        });
        showToast('শপ সেটিংস ও পেমেন্ট তথ্য সফলভাবে আপডেট হয়েছে!');
        return { success: true, shop: data.shop };
      }
      showToast(data.message || 'শপ আপডেট ব্যর্থ হয়েছে।');
      return { success: false, message: data.message || 'শপ আপডেট ব্যর্থ হয়েছে।' };
    } catch (err: any) {
      const msg = err?.message || 'শপ আপডেট ব্যর্থ হয়েছে।';
      showToast(msg);
      return { success: false, message: msg };
    }
  }, [showToast]);

  const adminDeleteShop = useCallback(async (shopId: string) => {
    try {
      const res = await fetch(`/api/shops/${shopId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setShops(prev => {
          const updated = prev.filter(s => s.id !== shopId);
          safeSetItem('lg_shops', JSON.stringify(updated));
          return updated;
        });
        showToast(data.message || 'শপ মুছে ফেলা হয়েছে!');
        return { success: true, message: data.message };
      }
      showToast(data.message || 'শপ ডিলিট ব্যর্থ হয়েছে।');
      return { success: false, message: data.message || 'শপ ডিলিট ব্যর্থ হয়েছে।' };
    } catch (err: any) {
      const msg = err?.message || 'শপ ডিলিট ব্যর্থ হয়েছে।';
      showToast(msg);
      return { success: false, message: msg };
    }
  }, [showToast]);

  const adminToggleShopStatus = useCallback(async (shopId: string) => {
    const target = shops.find(s => s.id === shopId);
    if (!target) return { success: false, message: 'শপ পাওয়া যায়নি' };
    const nextStatus = target.status === 'active' ? 'inactive' : 'active';
    return adminUpdateShop(shopId, { status: nextStatus });
  }, [shops, adminUpdateShop]);

  const adminCreateVendor = useCallback(async (vendorData: Partial<ShopVendor>) => {
    try {
      const res = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vendorData)
      });
      const data = await res.json();
      if (data.success && data.vendor) {
        setVendors(prev => {
          const updated = [...prev, data.vendor];
          safeSetItem('lg_vendors', JSON.stringify(updated));
          return updated;
        });
        showToast(`ভেন্ডর "${data.vendor.name}" সফলভাবে যুক্ত ও অনুমোদন করা হয়েছে!`);
        return { success: true, vendor: data.vendor };
      }
      showToast(data.message || 'ভেন্ডর যুক্ত করতে ব্যর্থ হয়েছে।');
      return { success: false, message: data.message || 'ভেন্ডর যুক্ত করতে ব্যর্থ হয়েছে।' };
    } catch (err: any) {
      const msg = err?.message || 'ভেন্ডর যুক্ত করতে ব্যর্থ হয়েছে।';
      showToast(msg);
      return { success: false, message: msg };
    }
  }, [showToast]);

  const adminUpdateVendor = useCallback(async (vendorId: string, updates: Partial<ShopVendor>) => {
    try {
      const res = await fetch(`/api/vendors/${vendorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (data.success && data.vendor) {
        setVendors(prev => {
          const updated = prev.map(v => v.id === vendorId ? data.vendor : v);
          safeSetItem('lg_vendors', JSON.stringify(updated));
          return updated;
        });
        showToast('ভেন্ডর তথ্য ও পারমিশন সফলভাবে আপডেট হয়েছে!');
        return { success: true, vendor: data.vendor };
      }
      showToast(data.message || 'ভেন্ডর আপডেট ব্যর্থ হয়েছে।');
      return { success: false, message: data.message || 'ভেন্ডর আপডেট ব্যর্থ হয়েছে।' };
    } catch (err: any) {
      const msg = err?.message || 'ভেন্ডর আপডেট ব্যর্থ হয়েছে।';
      showToast(msg);
      return { success: false, message: msg };
    }
  }, [showToast]);

  const adminDeleteVendor = useCallback(async (vendorId: string) => {
    try {
      const res = await fetch(`/api/vendors/${vendorId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setVendors(prev => {
          const updated = prev.filter(v => v.id !== vendorId);
          safeSetItem('lg_vendors', JSON.stringify(updated));
          return updated;
        });
        showToast(data.message || 'ভেন্ডর মুছে ফেলা হয়েছে!');
        return { success: true, message: data.message };
      }
      showToast(data.message || 'ভেন্ডর ডিলিট ব্যর্থ হয়েছে।');
      return { success: false, message: data.message || 'ভেন্ডর ডিলিট ব্যর্থ হয়েছে।' };
    } catch (err: any) {
      const msg = err?.message || 'ভেন্ডর ডিলিট ব্যর্থ হয়েছে।';
      showToast(msg);
      return { success: false, message: msg };
    }
  }, [showToast]);

  const adminToggleVendorStatus = useCallback(async (vendorId: string) => {
    const target = vendors.find(v => v.id === vendorId);
    if (!target) return { success: false, message: 'ভেন্ডর পাওয়া যায়নি' };
    const nextStatus = target.status === 'active' ? 'inactive' : 'active';
    return adminUpdateVendor(vendorId, { status: nextStatus });
  }, [vendors, adminUpdateVendor]);

  const userPostJob = (newJobData: Omit<MicroJob, 'id'>) => {
    const totalCost = Number(newJobData.reward) * Number(newJobData.availableSlots);
    const fee = totalCost * 0.05;
    const totalCharge = totalCost + fee;

    if ((wallet.balance || 0) < totalCharge) {
      showToast(language === 'bn' ? 'আপনার পর্যাপ্ত ব্যালেন্স নেই, দয়া করে আগে ডিপোজিট করুন।' : 'Insufficient balance, please deposit first.');
      return false;
    }

    // Deduct from wallet
    setWallet(prev => ({
      ...prev,
      balance: prev.balance - totalCharge,
      totalEarned: prev.totalEarned // Don't reduce totalEarned as it reflects total life-time earnings
    }));

    // Record transaction
    const tx: Transaction = {
      id: generateTxId('trx_job'),
      type: 'job_reward',
      amount: -totalCharge,
      description: `জব পোস্ট খরচ (বাজেট: ৳${totalCost.toFixed(2)} + ফি: ৳${fee.toFixed(2)})`,
      status: 'completed',
      date: new Date().toISOString()
    };
    
    // Add to transaction history
    setTransactions(prev => [tx, ...prev]);

    adminCreateJob(newJobData);
    showToast(language === 'bn' ? 'জব সফলভাবে পোস্ট হয়েছে এবং ফি কেটে নেওয়া হয়েছে!' : 'Job posted successfully and fee deducted!');
    return true;
  };


  const adminCreateJob = (newJobData: Omit<MicroJob, 'id'>) => {
    try {
      const instructions = Array.isArray(newJobData.instructions) && newJobData.instructions.length > 0
        ? newJobData.instructions.filter(i => typeof i === 'string' && i.trim() !== '')
        : ['লিংকে প্রবেশ করুন', 'নির্দেশনা অনুযায়ী কাজ সম্পন্ন করুন', 'সঠিক প্রমাণ জমা দিন'];

      const newJob: MicroJob = {
        id: `job_${Date.now()}`,
        jobCode: String(newJobData.jobCode || Math.floor(1000 + Math.random() * 9000)),
        title: (newJobData.title || 'নতুন মাইক্রো জব').trim(),
        category: newJobData.category || 'সোশ্যাল মিডিয়া',
        reward: Math.max(0.1, Number(newJobData.reward) || 0.5),
        image: newJobData.image || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&auto=format&fit=crop&q=80',
        videoUrl: newJobData.videoUrl || '',
        mediaType: newJobData.mediaType || (newJobData.videoUrl ? 'video' : 'image'),
        availableSlots: Math.max(1, Number(newJobData.availableSlots) || 100),
        completedSlots: Math.max(0, Number(newJobData.completedSlots) || 0),
        deadline: newJobData.deadline || '৩ দিন বাকি',
        taskDuration: (newJobData.taskDuration || '১min এর কাজ').trim(),
        instructions: instructions.length > 0 ? instructions : ['কাজ সম্পন্ন করুন এবং স্ক্রিনশট জমা দিন'],
        notes: (newJobData.notes || 'Go বাটনে ক্লিক করুন কি করে কাজ করবে ওয়েবসাইটে বলা হয়েছে সততার সাথে কাজ করবেন 🥰🥰').trim(),
        targetUrl: (newJobData.targetUrl || 'https://youtube.com').trim(),
        proofType: newJobData.proofType || 'screenshot_text',
        proofRequirement: (newJobData.proofRequirement || 'সঠিক স্ক্রিনশট ও ইউজারনেম জমা দিন').trim(),
        status: newJobData.status || 'active',
        featured: Boolean(newJobData.featured ?? true),
        startDate: newJobData.startDate || '',
        endDate: newJobData.endDate || '',
        perUserLimit: newJobData.perUserLimit || 1,
        createdAt: new Date().toISOString()
      };

      setJobs(prev => {
        const next = [newJob, ...(Array.isArray(prev) ? prev : [])];
        safeSetItem('lg_jobs', JSON.stringify(next));
        return next;
      });
      try {
        syncJobWithFirestore(newJob);
      } catch (syncErr) {
        console.warn('Firestore job sync fallback:', syncErr);
      }
      showToast('নতুন মাইক্রো জব তৈরি সম্পন্ন হয়েছে!');
    } catch (err) {
      console.error('Failed to create micro job:', err);
      showToast('জব তৈরি করতে সমস্যা হয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন।');
    }
  };

  const adminUpdateJob = (jobId: string, updates: Partial<MicroJob>) => {
    setJobs(prev => {
      const updated = (Array.isArray(prev) ? prev : []).map(j => {
        if (j.id === jobId) {
          const merged = { ...j, ...updates, updatedAt: new Date().toISOString() };
          try {
            syncJobWithFirestore(merged);
          } catch (syncErr) {
            console.warn('Firestore update job fallback:', syncErr);
          }
          return merged;
        }
        return j;
      });
      safeSetItem('lg_jobs', JSON.stringify(updated));
      return updated;
    });

    // Keep selectedJob updated in real-time if open
    setSelectedJob(prev => (prev?.id === jobId ? { ...prev, ...updates } : prev));
    showToast('মাইক্রো জব আপডেট করা হয়েছে।');
  };

  const adminDeleteJob = (jobId: string) => {
    setJobs(prev => {
      const updated = (Array.isArray(prev) ? prev : []).filter(j => j.id !== jobId);
      safeSetItem('lg_jobs', JSON.stringify(updated));
      return updated;
    });
    try {
      deleteJobFromFirestore(jobId);
    } catch (err) {
      console.warn('Firestore delete job fallback:', err);
    }
    setSelectedJob(prev => (prev?.id === jobId ? null : prev));
    showToast('মাইক্রো জব ডিলিট করা হয়েছে।');
  };

  const adminBroadcastNotification = (notif: { title: string; message: string; type: AppNotification['type'] }) => {
    createAndSendNotification({
      id: `notif_bcast_${Date.now()}`,
      userId: 'all',
      title: notif.title,
      message: notif.message,
      type: notif.type,
      time: 'এখনই'
    });
    showToast('নোটিফিকেশন সফলভাবে সকল ইউজারের জন্য ব্রডকাস্ট করা হয়েছে!');
  };

  const adminResolveReport = (reportId: string, status: 'resolved' | 'dismissed') => {
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, status } : r));
    showToast(`অভিযোগটি "${status === 'resolved' ? 'সমাধান' : 'বাতিল'}" হিসেবে চিহ্নিত করা হয়েছে।`);
  };

  const submitVerificationRequest = (data: { method: string; senderNumber: string; trxId: string; amount?: number; nidNumber?: string }) => {
    const reqId = `ver_${Date.now()}`;
    const newReq: VerificationRequest = {
      id: reqId,
      userId: user.id,
      userName: user.name,
      userPhone: user.phone,
      method: data.method,
      senderNumber: data.senderNumber,
      trxId: data.trxId.trim().toUpperCase(),
      amount: data.amount || 100,
      nidNumber: data.nidNumber || user.nidNumber,
      submittedAt: new Date().toLocaleString('bn-BD'),
      status: 'pending'
    };

    setVerificationRequests(prev => [newReq, ...prev]);
    syncVerificationRequestWithFirestore(newReq);

    // Update current user state to pending
    setUser(prev => {
      const u: UserProfile = {
        ...prev,
        verificationStatus: 'pending',
        isVerified: false,
        nidNumber: data.nidNumber || prev.nidNumber
      };
      safeSetItem('lg_user', JSON.stringify(u));
      syncUserWithFirestore(u, wallet);
      return u;
    });

    setRegisteredUsers(prev => prev.map(u => u.id === user.id ? { ...u, verificationStatus: 'pending' as const, isVerified: false } : u));

    // Real-time alert to Admin
    triggerPendingRequestAlert({
      type: 'verification',
      id: reqId,
      title: 'নতুন ভেরিফিকেশন আবেদন!',
      message: `${user.name} (${user.phone}) অ্যাকাউন্ট ভেরিফিকেশনের জন্য ৳${data.amount || 100} ফি (${data.method}) জমা দিয়েছেন।`,
      amount: data.amount || 100,
      userName: user.name,
      userPhone: user.phone
    });

    // Add to Audit Trail
    addAuditLog({
      type: 'verification',
      targetId: reqId,
      action: 'Request Submitted',
      status: 'pending',
      actorId: user.id,
      actorName: user.name,
      targetUserName: user.name,
      targetUserPhone: user.phone,
      amount: data.amount || 100,
      details: `ইউজার ${user.name} অ্যাকাউন্ট ভেরিফিকেশন ফি (${data.method} TrxID: ${data.trxId}) জমা দিয়েছেন। এডমিন অনুমোদন অপেক্ষমাণ।`
    });

    showToast('ভেরিফিকেশন আবেদন জমা হয়েছে! এডমিন যাচাই করে অনুমোদন করবেন।');
  };

  const adminApproveVerification = (userIdOrReqId: string) => {
    // 1. Identify target user and request
    let targetUser = registeredUsers.find(u => u.id === userIdOrReqId || u.phone === userIdOrReqId);
    let targetReq = verificationRequests.find(r => r.id === userIdOrReqId || r.userId === userIdOrReqId);

    if (!targetUser && targetReq) {
      targetUser = registeredUsers.find(u => u.id === targetReq?.userId || u.phone === targetReq?.userPhone);
    }
    if (!targetUser && user.id === userIdOrReqId) {
      targetUser = user;
    }

    const userId = targetUser ? targetUser.id : (targetReq ? targetReq.userId : userIdOrReqId);
    const userName = targetUser?.name || targetReq?.userName || 'ব্যবহারকারী';
    const userPhone = targetUser?.phone || targetReq?.userPhone || '';
    const referrerCode = targetUser?.referredBy;

    // 2. Update verificationRequests list
    setVerificationRequests(prev => prev.map(r => {
      if (r.id === userIdOrReqId || r.userId === userId) {
        const updated = { ...r, status: 'approved' as const };
        syncVerificationRequestWithFirestore(updated);
        return updated;
      }
      return r;
    }));

    // 3. Update currently logged-in user if match
    if (user.id === userId) {
      setUser(prev => {
        const u = { ...prev, isVerified: true, verificationStatus: 'verified' as const };
        safeSetItem('lg_user', JSON.stringify(u));
        syncUserWithFirestore(u, wallet);
        return u;
      });
    }

    // 4. Update registeredUsers state & trigger Referral Bonus Payouts
    setRegisteredUsers(prev => prev.map(u => {
      if (u.id === userId || (userPhone && u.phone === userPhone)) {
        return {
          ...u,
          isVerified: true,
          verificationStatus: 'verified'
        };
      }
      return u;
    }));

    // If active user is the one verified, update active user state
    if (user.id === userId || (userPhone && user.phone === userPhone)) {
      setUser(prev => ({
        ...prev,
        isVerified: true,
        verificationStatus: 'verified'
      }));
    }

    // 5. Strictly credit Referral Reward to referrer upon user verification
    const refBonus = Number(systemSettings?.referralBonus) || 25;
    const bonusPaid = creditReferralRewardForVerifiedUser(userId, userName, userPhone);

    // Persist registered users in localStorage
    try {
      const saved = localStorage.getItem('lg_registered_users');
      if (saved) {
        const list: any[] = JSON.parse(saved);
        const updated = list.map(item => {
          const u = item.user || item;
          if (u.id === userId || (userPhone && u.phone === userPhone)) {
            if (item.user) {
              return {
                ...item,
                user: { ...item.user, isVerified: true, verificationStatus: 'verified' }
              };
            }
            return { ...u, isVerified: true, verificationStatus: 'verified' };
          }
          return item;
        });
        localStorage.setItem('lg_registered_users', JSON.stringify(updated));
      }
    } catch {}

    // Add Audit Log
    addAuditLog({
      type: 'verification',
      targetId: userId,
      action: 'Approved',
      status: 'approved',
      actorId: user.id,
      actorName: user.name,
      targetUserName: userName,
      targetUserPhone: userPhone,
      amount: bonusPaid ? refBonus : 0,
      details: `ইউজার "${userName}" (${userPhone}) ভেরিফিকেশন আবেদন সফলভাবে অনুমোদিত হয়েছে। ${bonusPaid ? `রেফারার (${referrerCode || ''}) কে ৳${refBonus} রেফারেল বোনাস প্রদান করা হয়েছে।` : 'কোন রেফারেল বোনাস প্রযোজ্য ছিল না।'}`
    });

    // Notify approved user
    createAndSendNotification({
      id: `notif_ver_app_${Date.now()}`,
      userId,
      userPhone,
      title: 'প্রোফাইল ভেরিফিকেশন সফল! ✓',
      message: 'অভিনন্দন! আপনার অ্যাকাউন্ট সফলভাবে ভেরিফাইড হয়েছে এবং সকল প্রিমিয়াম সুবিধা আনলক হয়েছে।',
      time: 'এইমাত্র',
      type: 'announcement'
    });

    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch {}

    showToast(`ইউজার "${userName}" এর ভেরিফিকেশন অনুমোদিত হয়েছে!${bonusPaid ? ` রেফারারকে ৳${refBonus} বোনাস দেওয়া হয়েছে।` : ''}`);
  };

  const adminRejectVerification = (userIdOrReqId: string, reason?: string) => {
    const actualReason = reason || 'অসম্পূর্ণ বা অসত্য তথ্য / ভুল ট্রানজেকশন আইডি';

    let targetUser = registeredUsers.find(u => u.id === userIdOrReqId || u.phone === userIdOrReqId);
    let targetReq = verificationRequests.find(r => r.id === userIdOrReqId || r.userId === userIdOrReqId);

    if (!targetUser && targetReq) {
      targetUser = registeredUsers.find(u => u.id === targetReq?.userId || u.phone === targetReq?.userPhone);
    }
    if (!targetUser && user.id === userIdOrReqId) {
      targetUser = user;
    }

    const userId = targetUser ? targetUser.id : (targetReq ? targetReq.userId : userIdOrReqId);
    const userName = targetUser?.name || targetReq?.userName || 'ব্যবহারকারী';
    const userPhone = targetUser?.phone || targetReq?.userPhone || '';

    // Update verificationRequests list
    setVerificationRequests(prev => prev.map(r => {
      if (r.id === userIdOrReqId || r.userId === userId) {
        const updated = { ...r, status: 'rejected' as const, rejectionReason: actualReason };
        syncVerificationRequestWithFirestore(updated);
        return updated;
      }
      return r;
    }));

    // Update active user if match
    if (user.id === userId) {
      setUser(prev => {
        const u = { ...prev, isVerified: false, verificationStatus: 'rejected' as const };
        safeSetItem('lg_user', JSON.stringify(u));
        syncUserWithFirestore(u, wallet);
        return u;
      });
    }

    // Update registered users
    setRegisteredUsers(prev => prev.map(u => {
      if (u.id === userId || (userPhone && u.phone === userPhone)) {
        return {
          ...u,
          isVerified: false,
          verificationStatus: 'rejected'
        };
      }
      return u;
    }));

    // Persist in localStorage
    try {
      const saved = localStorage.getItem('lg_registered_users');
      if (saved) {
        const list: any[] = JSON.parse(saved);
        const updated = list.map(item => {
          const u = item.user || item;
          if (u.id === userId || (userPhone && u.phone === userPhone)) {
            if (item.user) {
              return { ...item, user: { ...item.user, isVerified: false, verificationStatus: 'rejected' } };
            }
            return { ...u, isVerified: false, verificationStatus: 'rejected' };
          }
          return item;
        });
        localStorage.setItem('lg_registered_users', JSON.stringify(updated));
      }
    } catch {}

    // Add Audit Log
    addAuditLog({
      type: 'verification',
      targetId: userId,
      action: 'Rejected',
      status: 'rejected',
      rejectionReason: actualReason,
      actorId: user.id,
      actorName: user.name,
      targetUserName: userName,
      targetUserPhone: userPhone,
      details: `ইউজার "${userName}" এর ভেরিফিকেশন আবেদন বাতিল করা হয়েছে। কারণ: ${actualReason}`
    });

    // Notify user
    createAndSendNotification({
      id: `notif_ver_rej_${Date.now()}`,
      userId,
      userPhone,
      title: 'ভেরিফিকেশন আবেদন বাতিল',
      message: `আপনার অ্যাকাউন্ট ভেরিফিকেশন আবেদন বাতিল করা হয়েছে। কারণ: ${actualReason}। দয়া করে সঠিক তথ্য দিয়ে পুনরায় আবেদন করুন।`,
      time: 'এখনই',
      type: 'announcement'
    });

    showToast(`ইউজার "${userName}" এর ভেরিফিকেশন আবেদন বাতিল করা হয়েছে।`);
  };

  const adminBulkApproveVerifications = (ids: string[]) => {
    if (!ids || ids.length === 0) return;
    ids.forEach(id => adminApproveVerification(id));
    showToast(`${ids.length} টি ভেরিফিকেশন সফলভাবে অনুমোদন করা হয়েছে!`);
  };

  const adminBulkRejectVerifications = (ids: string[], reason: string) => {
    if (!ids || ids.length === 0) return;
    ids.forEach(id => adminRejectVerification(id, reason));
    showToast(`${ids.length} টি ভেরিফিকেশন বাতিল করা হয়েছে।`);
  };

  const adminToggleUserVerification = (userId: string) => {
    const userToVerify = registeredUsers.find(u => u.id === userId) || (user.id === userId ? user : null);
    if (!userToVerify) return;

    if (userToVerify.isVerified) {
      showToast('ইউজার ইতিমধ্যে ভেরিফাইড রয়েছে।');
      return;
    }

    adminApproveVerification(userId);
  };

  const adminUpdateUserRole = (userId: string, role: UserRole) => {
    // Strictly restrict admin / super_admin role to 01877722819 only
    if (role === 'admin' || role === 'super_admin') {
      const target = registeredUsers.find(u => u.id === userId) || (user.id === userId ? user : null);
      if (!target || !isAuthorizedAdminPhone(target.phone)) {
        showToast(language === 'bn' ? 'অ্যাডমিন অধিকার শুধুমাত্র 01877722819 নম্বরের জন্য সংরক্ষিত!' : 'Admin role is restricted to 01877722819 only!');
        return;
      }
    }

    if (user.id === userId) {
      setUser(prev => ({
        ...prev,
        role
      }));
    }

    setRegisteredUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));

    try {
      const saved = localStorage.getItem('lg_registered_users');
      if (saved) {
        const usersList: any[] = JSON.parse(saved);
        const updated = usersList.map(item => {
          const u = item.user || item;
          if (u.id === userId) {
            if (item.user) {
              return { ...item, user: { ...item.user, role } };
            }
            return { ...u, role };
          }
          return item;
        });
        localStorage.setItem('lg_registered_users', JSON.stringify(updated));
      }
    } catch {}

    fetch(`/api/users/${encodeURIComponent(userId)}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    }).catch(err => console.warn('API update user role error:', err));

    showToast(`ইউজারের রোল "${role}" এ পরিবর্তন করা হয়েছে।`);
  };

  const adminDeleteUser = (userId: string) => {
    if (userId === user.id) {
      showToast('বর্তমান লগইন করা এডমিন অ্যাকাউন্ট ডিলিট করা সম্ভব নয়!');
      return;
    }
    setRegisteredUsers(prev => prev.filter(u => u.id !== userId));
    try {
      const saved = localStorage.getItem('lg_registered_users');
      if (saved) {
        const usersList: any[] = JSON.parse(saved);
        const updated = usersList.filter(item => (item.user?.id || item.id) !== userId);
        localStorage.setItem('lg_registered_users', JSON.stringify(updated));
      }
    } catch {}

    fetch(`/api/users/${encodeURIComponent(userId)}`, {
      method: 'DELETE'
    }).catch(err => console.warn('API delete user error:', err));

    showToast('ইউজার সফলভাবে ডিলিট করা হয়েছে।');
  };

  // Dynamic Master Admin Controls
  const updateSystemSettings = (updates: Partial<SystemSettings>) => {
    setSystemSettings(prev => ({
      ...prev,
      ...updates,
      featureToggles: {
        ...prev.featureToggles,
        ...(updates.featureToggles || {})
      },
      featureRewards: {
        ...prev.featureRewards,
        ...(updates.featureRewards || {})
      },
      autoAdsConfig: updates.autoAdsConfig ? {
        ...(prev.autoAdsConfig || {
          totalAdsPerSession: 3,
          durationPerAd: 10,
          rewardPerSession: 1.50,
          cooldownMinutes: 30,
          ads: []
        }),
        ...updates.autoAdsConfig
      } : prev.autoAdsConfig,
      pageBannerAds: updates.pageBannerAds ? {
        ...(prev.pageBannerAds || INITIAL_SYSTEM_SETTINGS.pageBannerAds || {
          enabled: true,
          adKey: 'b87ae65b2057f8d1935a8a65f245a61e',
          scriptUrl: 'https://www.highrevenueformat.com/b87ae65b2057f8d1935a8a65f245a61e/invoke.js',
          width: 728,
          height: 90,
          showTopBanner: true,
          showBottomBanner: true,
          pages: { ads_view: true, quiz_job: true, typing_job: true, ad_marketing: true }
        }),
        ...updates.pageBannerAds,
        pages: {
          ...((prev.pageBannerAds || INITIAL_SYSTEM_SETTINGS.pageBannerAds)?.pages || {
            ads_view: true, quiz_job: true, typing_job: true, ad_marketing: true
          }),
          ...(updates.pageBannerAds.pages || {})
        }
      } : prev.pageBannerAds
    }));

    // Optionally sync banner ads to server backend
    if (updates.pageBannerAds) {
      try {
        fetch('/api/banner-ads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates.pageBannerAds)
        }).catch(() => {});
      } catch (e) {}
    }

    showToast('সিস্টেম সেটিংস সফলভাবে আপডেট হয়েছে!');
  };

  const claimAutoAdsReward = (rewardAmount: number, totalAdsCount: number): boolean => {
    if (rewardAmount <= 0) return false;

    if (!user.isVerified) {
      showToast('শুধুমাত্র ভেরিফাইড ইউজাররা বিজ্ঞাপন দেখে ইনকাম করতে পারবেন।');
      return false;
    }

    setWallet(prev => {
      const nextBal = (prev.balance || 0) + rewardAmount;
      const nextTotalEarned = (prev.totalEarned || 0) + rewardAmount;
      const nextAdsIncome = (prev.incomeBreakdown?.adsIncome || 0) + rewardAmount;
      return {
        ...prev,
        balance: Math.round(nextBal * 100) / 100,
        totalEarned: Math.round(nextTotalEarned * 100) / 100,
        incomeBreakdown: {
          ...prev.incomeBreakdown,
          adsIncome: Math.round(nextAdsIncome * 100) / 100
        }
      };
    });

    const newTx: Transaction = {
      id: generateTxId('tx_ads'),
      type: 'bonus',
      amount: rewardAmount,
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      description: `বিজ্ঞাপন ভিউ রিওয়ার্ড (${totalAdsCount}টি বিজ্ঞাপন সম্পন্ন)`,
      paymentMethod: 'system'
    };

    setTransactions(prev => [newTx, ...prev.filter(t => t.id !== newTx.id)]);
    showToast(`অভিনন্দন! ৳${rewardAmount.toFixed(2)} পয়েন্ট আপনার ওয়ালেটে জমা হয়েছে।`);
    return true;
  };

  const creditUserReward = (amount: number, description: string, incomeType: 'job' | 'ads' | 'bonus' = 'job'): boolean => {
    if (amount <= 0) return false;

    setWallet(prev => {
      const nextBal = (prev.balance || 0) + amount;
      const nextTotalEarned = (prev.totalEarned || 0) + amount;
      const breakdown = {
        jobIncome: prev.incomeBreakdown?.jobIncome || 0,
        referralIncome: prev.incomeBreakdown?.referralIncome || 0,
        resellingProfit: prev.incomeBreakdown?.resellingProfit || 0,
        bonusIncome: prev.incomeBreakdown?.bonusIncome || 0,
        affiliateIncome: prev.incomeBreakdown?.affiliateIncome || 0,
        adsIncome: prev.incomeBreakdown?.adsIncome || 0,
        otherIncome: prev.incomeBreakdown?.otherIncome || 0
      };
      
      if (incomeType === 'ads') {
        breakdown.adsIncome = Math.round((breakdown.adsIncome + amount) * 100) / 100;
      } else {
        breakdown.jobIncome = Math.round((breakdown.jobIncome + amount) * 100) / 100;
      }

      return {
        ...prev,
        balance: Math.round(nextBal * 100) / 100,
        totalEarned: Math.round(nextTotalEarned * 100) / 100,
        incomeBreakdown: breakdown
      };
    });

    const newTx: Transaction = {
      id: generateTxId('tx_reward'),
      type: incomeType === 'job' ? 'job_reward' : 'bonus',
      amount: amount,
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      description,
      paymentMethod: 'system'
    };

    setTransactions(prev => [newTx, ...prev.filter(t => t.id !== newTx.id)]);
    return true;
  };

  const resetAdsCooldown = () => {
    try {
      localStorage.removeItem('lg_ads_cooldown_until');
      showToast('বিজ্ঞাপন সেশনের বিরতি রিসেট করা হয়েছে।');
    } catch {}
  };

  const toggleFeature = (featureKey: keyof SystemSettings['featureToggles']) => {
    setSystemSettings(prev => {
      const current = !!prev.featureToggles[featureKey];
      const next = !current;
      return {
        ...prev,
        featureToggles: {
          ...prev.featureToggles,
          [featureKey]: next
        }
      };
    });
    showToast(`অপশন স্ট্যাটাস পরিবর্তন করা হয়েছে।`);
  };

  const updateFeatureReward = (key: keyof SystemSettings['featureRewards'], amount: number) => {
    setSystemSettings(prev => ({
      ...prev,
      featureRewards: {
        ...prev.featureRewards,
        [key]: amount
      }
    }));
    showToast(`কাজের রিওয়ার্ড ৳${amount} এ সেট করা হয়েছে।`);
  };

  const adminAddBanner = (banner: Omit<AppBanner, 'id'>) => {
    const newBanner: AppBanner = {
      ...banner,
      id: `ban_${Date.now()}`
    };
    setBanners(prev => [newBanner, ...prev]);
    showToast('নতুন ব্যানার পোস্টার যোগ করা হয়েছে!');
  };

  const adminUpdateBanner = (bannerId: string, updates: Partial<AppBanner>) => {
    setBanners(prev => prev.map(b => b.id === bannerId ? { ...b, ...updates } : b));
    showToast('ব্যানার সফলভাবে আপডেট হয়েছে।');
  };

  const adminDeleteBanner = (bannerId: string) => {
    setBanners(prev => prev.filter(b => b.id !== bannerId));
    showToast('ব্যানার মুছে ফেলা হয়েছে।');
  };

  const adminAddReel = (reel: Omit<ReelItem, 'id' | 'likesCount' | 'commentsCount' | 'sharesCount' | 'viewsCount'>) => {
    const newReel: ReelItem = {
      ...reel,
      id: `reel_${Date.now()}`,
      likesCount: Math.floor(Math.random() * 200) + 50,
      commentsCount: Math.floor(Math.random() * 50) + 10,
      sharesCount: Math.floor(Math.random() * 30) + 5,
      viewsCount: Math.floor(Math.random() * 1000) + 200,
      isLiked: false,
      isSaved: false
    };
    setReels(prev => [newReel, ...prev]);
    showToast('নতুন রিল / পোস্ট সফলভাবে পাবলিশ হয়েছে!');
  };

  const adminUpdateReel = (reelId: string, updates: Partial<ReelItem>) => {
    setReels(prev => prev.map(r => r.id === reelId ? { ...r, ...updates } : r));
    showToast('পোস্ট / রিল আপডেট করা হয়েছে।');
  };

  const adminDeleteReel = (reelId: string) => {
    setReels(prev => prev.filter(r => r.id !== reelId));
    showToast('পোস্ট / রিল মুছে ফেলা হয়েছে।');
  };

  const adminAddBonus = (bonus: Omit<TargetBonus, 'id' | 'isClaimed'>) => {
    const newBonus: TargetBonus = {
      ...bonus,
      id: `bonus_${Date.now()}`,
      isClaimed: false
    };
    setBonuses(prev => [...prev, newBonus]);
    showToast('নতুন টার্গেট বোনাস যোগ করা হয়েছে!');
  };

  const adminUpdateBonus = (bonusId: string, updates: Partial<TargetBonus>) => {
    setBonuses(prev => prev.map(b => b.id === bonusId ? { ...b, ...updates } : b));
    showToast('টার্গেট বোনাস আপডেট করা হয়েছে।');
  };

  const adminDeleteBonus = (bonusId: string) => {
    setBonuses(prev => prev.filter(b => b.id !== bonusId));
    showToast('টার্গেট বোনাস মুছে ফেলা হয়েছে।');
  };

  const adminAdjustUserBalance = (
    userIdOrAmount: string | number,
    amountOrType?: any,
    typeOrReason?: any,
    reasonArg?: string
  ) => {
    let targetUserId = user.id;
    let amount = 0;
    let type: 'credit' | 'debit' = 'credit';
    let reason = '';

    if (typeof userIdOrAmount === 'string' && typeof amountOrType === 'number') {
      targetUserId = userIdOrAmount;
      amount = amountOrType;
      type = typeOrReason === 'debit' ? 'debit' : 'credit';
      reason = reasonArg || 'এডমিন ব্যালেন্স সমন্বয়';
    } else {
      amount = Number(userIdOrAmount) || 0;
      type = amountOrType === 'debit' ? 'debit' : 'credit';
      reason = typeOrReason || 'এডমিন ব্যালেন্স সমন্বয়';
    }

    if (amount <= 0) return;

    const isTargetCurrentUser = targetUserId === user.id || (targetUserId === 'usr_default_01' && user.id === 'usr_default_01');
    const isEarningCredit = type === 'credit' && Boolean(
      reason && (
        reason.includes('বোনাস') || 
        reason.includes('রিওয়ার্ড') || 
        reason.includes('ইনকাম') || 
        reason.toLowerCase().includes('bonus') || 
        reason.toLowerCase().includes('reward') ||
        reason.toLowerCase().includes('commission')
      )
    );

    if (isTargetCurrentUser) {
      if (type === 'credit') {
        setWallet(prev => ({ 
          ...prev, 
          balance: Math.round(((Number(prev.balance) || 0) + amount) * 100) / 100, 
          totalEarned: isEarningCredit ? Math.round(((Number(prev.totalEarned) || 0) + amount) * 100) / 100 : (prev.totalEarned || 0)
        }));
        addTransaction({
          type: 'adjustment',
          amount,
          status: 'completed',
          description: `এডমিন ক্রেডিট (+): ${reason}`
        });
        showToast(`৳${amount} ক্রেডিট যোগ করা সম্পন্ন হয়েছে।`);
      } else {
        if (amount > wallet.balance) {
          showToast('ব্যবহারকারীর ব্যালেন্সের চেয়ে বেশি ডেবিট করা সম্ভব নয়!');
          return;
        }
        setWallet(prev => ({ 
          ...prev, 
          balance: Math.max(0, Math.round(((Number(prev.balance) || 0) - amount) * 100) / 100)
        }));
        addTransaction({
          type: 'adjustment',
          amount,
          status: 'completed',
          description: `এডমিন ডেবিট (-): ${reason}`
        });
        showToast(`৳${amount} ডেবিট কর্তন সম্পন্ন হয়েছে।`);
      }
    }

    // Always update target user's isolated storage
    try {
      const userKey = `lg_wallet_${targetUserId}`;
      const savedW = localStorage.getItem(userKey);
      const w = savedW ? JSON.parse(savedW) : { balance: 0, totalEarned: 0, totalWithdrawn: 0, pendingBalance: 0 };
      const nextBalance = type === 'credit' 
        ? Math.round(((Number(w.balance) || 0) + amount) * 100) / 100
        : Math.max(0, Math.round(((Number(w.balance) || 0) - amount) * 100) / 100);
      const nextEarned = isEarningCredit 
        ? Math.round(((Number(w.totalEarned) || 0) + amount) * 100) / 100
        : (w.totalEarned || 0);
      localStorage.setItem(userKey, JSON.stringify({ ...w, balance: nextBalance, totalEarned: nextEarned }));

      const txKey = `lg_transactions_${targetUserId}`;
      const savedTxs = localStorage.getItem(txKey);
      const txs: Transaction[] = savedTxs ? JSON.parse(savedTxs) : [];
      txs.unshift({
        id: generateTxId('tx_adj'),
        userId: targetUserId,
        type: 'adjustment',
        amount,
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        status: 'completed',
        description: `এডমিন ${type === 'credit' ? 'ক্রেডিট (+)' : 'ডেবিট (-)'} সমন্বয়: ${reason}`
      });
      localStorage.setItem(txKey, JSON.stringify(txs));
    } catch {}

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('goodlife:wallet_updated'));
    }

    // Also update in registeredUsers state & lg_registered_users
    try {
      const saved = localStorage.getItem('lg_registered_users');
      if (saved) {
        const usersList: any[] = JSON.parse(saved);
        const updated = usersList.map(item => {
          const u = item.user || item;
          if (u.id === targetUserId) {
            const w = item.wallet || { balance: 0, totalEarned: 0 };
            const nextBalance = type === 'credit' ? (w.balance || 0) + amount : Math.max(0, (w.balance || 0) - amount);
            const nextEarned = isEarningCredit ? (w.totalEarned || 0) + amount : (w.totalEarned || 0);
            return {
              ...item,
              wallet: { ...w, balance: nextBalance, totalEarned: nextEarned }
            };
          }
          return item;
        });
        localStorage.setItem('lg_registered_users', JSON.stringify(updated));
      }
    } catch {}

    setRegisteredUsers(prev => prev.map(u => {
      if (u.id === targetUserId) {
        const curBal = (u as any).balance || 0;
        return {
          ...u,
          balance: type === 'credit' ? curBal + amount : Math.max(0, curBal - amount)
        };
      }
      return u;
    }));

    // Persist adjustment to backend database API
    fetch(`/api/users/${encodeURIComponent(targetUserId)}/adjust-balance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, amount, reason })
    }).catch(err => console.warn('API adjust balance error:', err));

    if (targetUserId !== user.id) {
      showToast(`ইউজারের ব্যালেন্স ${type === 'credit' ? '৳' + amount + ' যোগ' : '৳' + amount + ' কর্তন'} করা হয়েছে।`);
    }
  };

  const updateGroupLink = (id: string, url: string) => {
    setGroupLinks(prev => prev.map(g => g.id === id ? { ...g, url } : g));
    showToast('গ্রুপ লিংক আপডেট হয়েছে।');
  };

  const markNotificationRead = (id: string) => {
    setAllNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      safeSetItem('lg_all_notifications', JSON.stringify(updated));
      return updated;
    });
    if (user?.id) {
      try {
        const uKey = `lg_notifications_${user.id}`;
        const saved = localStorage.getItem(uKey);
        if (saved) {
          const parsed: AppNotification[] = JSON.parse(saved);
          const updated = parsed.map(n => n.id === id ? { ...n, read: true } : n);
          localStorage.setItem(uKey, JSON.stringify(updated));
        }
      } catch {}
    }
    // Real persistence: update Firebase Firestore & backend API
    markNotificationAsReadInFirestore(id);
    try {
      fetch(`/api/notifications/${id}/read`, { method: 'PATCH' }).catch(() => {});
    } catch {}
  };

  const addAuditLog = (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const newLog: AuditLog = {
      ...log,
      id: `audit_${Date.now()}`,
      timestamp: new Date().toLocaleString('bn-BD')
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const markAllNotificationsRead = () => {
    const currentUid = user?.id || '';
    const isCurrentAdmin = Boolean(
      user?.role === 'admin' || 
      user?.role === 'super_admin' || 
      isAuthorizedAdminPhone(user?.phone)
    );
    setAllNotifications(prev => {
      const updated = prev.map(n => {
        const isMine = (n.userId === currentUid) || (n.userId === 'all') || (isCurrentAdmin && n.userId === 'admin');
        if (isMine) {
          if (!n.read) {
            markNotificationAsReadInFirestore(n.id);
          }
          return { ...n, read: true };
        }
        return n;
      });
      safeSetItem('lg_all_notifications', JSON.stringify(updated));
      return updated;
    });
    if (currentUid) {
      try {
        const uKey = `lg_notifications_${currentUid}`;
        const saved = localStorage.getItem(uKey);
        if (saved) {
          const parsed: AppNotification[] = JSON.parse(saved);
          const updated = parsed.map(n => ({ ...n, read: true }));
          localStorage.setItem(uKey, JSON.stringify(updated));
        }
      } catch {}
      try {
        fetch('/api/notifications/mark-all-read', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUid })
        }).catch(() => {});
      } catch {}
    }
  };

  const clearNotifications = () => {
    const currentUid = user?.id || '';
    setAllNotifications(prev => {
      const remaining = prev.filter(n => {
        if (n.userId === currentUid) return false;
        return true;
      });
      safeSetItem('lg_all_notifications', JSON.stringify(remaining));
      return remaining;
    });
    if (currentUid) {
      localStorage.removeItem(`lg_notifications_${currentUid}`);
    }
  };

  const navigateToResellingAndOpenProduct = (product: Product) => {
    setSelectedProduct(product);
    setActiveTab('shop');
  };

  const submitReport = (reason: string, description: string) => {
    if (!reportTarget) return;
    const newReport: ReportItem = {
      id: `rep_${Date.now()}`,
      reporterId: user.id,
      targetType: reportTarget.type as any,
      targetId: reportTarget.id,
      targetName: reportTarget.name,
      reason,
      description,
      submittedAt: new Date().toLocaleString('bn-BD'),
      status: 'pending'
    };
    setReports(prev => [newReport, ...prev]);
    setIsReportModalOpen(false);
    setReportTarget(null);
    syncReportWithFirestore(newReport);
    showToast('আপনার অভিযোগটি জমা নেওয়া হয়েছে। এডমিন টিম শীঘ্রই খতিয়ে দেখবে।');
  };

  const submitCourseFreelanceApplication = async (appData: Omit<CourseFreelanceApplication, 'id' | 'submittedAt' | 'status'>): Promise<string> => {
    const newApp: CourseFreelanceApplication = {
      ...appData,
      id: `app_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      submittedAt: new Date().toLocaleString('bn-BD'),
      status: 'pending'
    };

    setCourseApplications(prev => [newApp, ...prev]);
    await syncApplicationWithFirestore(newApp);

    // Notify admin
    createAndSendNotification({
      id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      title: appData.type === 'skill_course' ? 'নতুন স্কিল কোর্স আবেদন' : 'নতুন ফ্রিল্যান্সিং আবেদন',
      message: `${appData.applicantName} (${appData.applicantPhone}) "${appData.itemTitle}" এর জন্য আবেদন জমা দিয়েছেন।`,
      type: 'announcement',
      time: 'এখনই',
      userId: 'admin'
    });

    return newApp.id;
  };

  const adminUpdateApplicationStatus = (appId: string, status: CourseFreelanceApplication['status'], adminNotes?: string) => {
    setCourseApplications(prev => prev.map(a => {
      if (a.id === appId) {
        const updated = { ...a, status, ...(adminNotes !== undefined ? { adminNotes } : {}) };
        syncApplicationWithFirestore(updated);
        return updated;
      }
      return a;
    }));
    showToast('আবেদনের স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে!');
  };

  const adminDeleteApplication = (appId: string) => {
    setCourseApplications(prev => prev.filter(a => a.id !== appId));
    showToast('আবেদনটি তালিকা থেকে মুছে ফেলা হয়েছে।');
  };

  // Dynamic Referral Metrics & Rank calculation based on real verified referrals
  const { verifiedReferralsCount, pendingReferralsCount, userReferralRank } = useMemo(() => {
    if (!user?.referralCode) {
      return {
        verifiedReferralsCount: 0,
        pendingReferralsCount: 0,
        userReferralRank: calculateReferralRank(0, 0)
      };
    }

    const myStrict = formatStrict4DigitReferral(user.referralCode);
    const myRaw = (user.referralCode || '').trim().toUpperCase();

    const myReferred = registeredUsers.filter(u => {
      if (!u.referredBy || u.id === user.id) return false;
      const ref = (u.referredBy || '').trim().toUpperCase();
      const strict = formatStrict4DigitReferral(ref);
      return ref === myRaw || ref === myStrict || strict === myStrict;
    });

    const vCount = myReferred.filter(u => u.isVerified).length;
    const pCount = myReferred.filter(u => !u.isVerified).length;

    return {
      verifiedReferralsCount: vCount,
      pendingReferralsCount: pCount,
      userReferralRank: calculateReferralRank(vCount, pCount)
    };
  }, [user?.referralCode, user?.id, registeredUsers]);

  return (
    <AppContext.Provider value={{
      activeTab,
      setActiveTab,
      isSideDrawerOpen,
      setIsSideDrawerOpen,
      user,
      setUser,
      isLoggedIn,
      setIsLoggedIn,
      isAuthorizedAdmin: isAuthorizedAdminPhone(user?.phone),
      adminPhoneNumber: ADMIN_PHONE_NUMBER,
      hasSeenOnboarding,
      setHasSeenOnboarding,
      showAuthModal,
      setShowAuthModal,
      authModalMode,
      setAuthModalMode,
      loginWithCredentials,
      registerUser,
      loginAsRole,
      logout,
      verifyProfile,
      updateUserProfile,
      refreshUserData,

      selectedProduct,
      setSelectedProduct,
      selectedJob,
      setSelectedJob,
      isNotificationsOpen,
      setIsNotificationsOpen,
      isCartOpen,
      setIsCartOpen,
      isCheckoutOpen,
      setIsCheckoutOpen,
      isJobHistoryOpen,
      setIsJobHistoryOpen,
      isWalletOpen,
      setIsWalletOpen,
      isWithdrawOpen,
      setIsWithdrawOpen,
      isAddMoneyOpen,
      setIsAddMoneyOpen,
      isVerificationModalOpen,
      setIsVerificationModalOpen,
      isNetworkModalOpen,
      setIsNetworkModalOpen,
      isAgencyModalOpen,
      setIsAgencyModalOpen,
      isLeaderboardOpen,
      setIsLeaderboardOpen,
      isRevenueOpen,
      setIsRevenueOpen,
      isSavedPostsOpen,
      setIsSavedPostsOpen,
      isSettingsOpen,
      setIsSettingsOpen,
      isPolicyModalOpen,
      setIsPolicyModalOpen,
      policyModalTab,
      setPolicyModalTab,
      openPolicyModal,
      isReportModalOpen,
      setIsReportModalOpen,
      reportTarget,
      setReportTarget,
      isAdminDashboardOpen,
      setIsAdminDashboardOpen,
      activeIncomeModal,
      setActiveIncomeModal,
      addEarning,
      addJob,
      rechargeMobile,

      wallet,
      setWallet,
      transactions,
      walletActiveTab,
      setWalletActiveTab,
      addTransaction,
      withdrawalRequests,
      submitWithdrawal,
      addFundsToWallet,
      depositMoney,
      withdrawMoney,
      depositRequests,
      fetchFreshDeposits,
      adminApproveDeposit,
      adminRejectDeposit,
      depositCelebration,
      setDepositCelebration,
      closeDepositCelebration,
      syncReferralEarnings,
      userReferralRank,
      verifiedReferralsCount,
      pendingReferralsCount,

      products,
      categories: INITIAL_CATEGORIES,
      cart,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      orders,
      createOrder,
      wishlist,
      toggleWishlist,
      persistWishlistToFirestore,
      navigateToResellingAndOpenProduct,

      // Shops & Vendors (Admin Controlled Multi-Shop System)
      shops,
      activeShopId,
      setActiveShopId,
      viewingShopId,
      setViewingShopId,
      activeShop,
      vendors,
      refreshShops,
      refreshVendors,
      adminCreateShop,
      adminUpdateShop,
      adminDeleteShop,
      adminToggleShopStatus,
      adminCreateVendor,
      adminUpdateVendor,
      adminDeleteVendor,
      adminToggleVendorStatus,

      jobs,
      jobSubmissions,
      submitJobProof,
      adMarketingSubmissions,
      submitAdMarketingProof,

      bonuses,
      claimBonus,

      reels,
      toggleLikeReel,
      toggleSaveReel,
      toggleFollowCreator,
      createUserPost,
      adminApprovePost,
      adminRejectPost,
      deleteUserPost,
      updateUserCover,

      viewingProfileUser,
      setViewingProfileUser,
      targetProfilePostId,
      setTargetProfilePostId,
      navigateToPosterProfile,

      adminApproveJobSubmission,
      adminRejectJobSubmission,
      adminApproveAdMarketingSubmission,
      adminRejectAdMarketingSubmission,
      adminApproveWithdrawal,
      adminRejectWithdrawal,
      adminUpdateOrderStatus,
      adminAddProduct,
      adminUpdateProduct,
      adminToggleOfferProduct,
      adminDeleteProduct,
      adminCreateJob,
      userPostJob,
      adminUpdateJob,
      adminDeleteJob,
      registeredUsers,
      fetchFreshUsers,
      adminSuspendUser,
      adminBlockUser,
      adminActivateUser,
      adminVerifyUser,
      adminUnverifyUser,
      adminUpdateUserStatus,
      fetchUserFinancials,
      getUserTransactionReport,
      fetchAndAggregateUserTransactions,
      adminAdjustUserBalance,
      adminBroadcastNotification,
      adminResolveReport,
      adminToggleUserVerification,
      adminApproveVerification,
      adminRejectVerification,
      adminBulkApproveVerifications,
      adminBulkRejectVerifications,
      adminUpdateUserRole,
      adminDeleteUser,

      verificationRequests,
      submitVerificationRequest,

      adminVerifyOrderPayment,
      adminReleaseOrderEarnings,
      adminRejectOrder,
      adminBulkVerifyOrderPayments,
      adminBulkReleaseOrderEarnings,
      adminBulkRejectOrders,

      adminBulkApproveDeposits,
      adminBulkRejectDeposits,

      systemSettings,
      updateSystemSettings,
      claimAutoAdsReward,
      creditUserReward,
      resetAdsCooldown,
      toggleFeature,
      updateFeatureReward,
      banners,
      adminAddBanner,
      adminUpdateBanner,
      adminDeleteBanner,
      adminAddReel,
      adminUpdateReel,
      adminDeleteReel,
      adminAddBonus,
      adminUpdateBonus,
      adminDeleteBonus,

      groupLinks,
      updateGroupLink,

      networkUsers: INITIAL_NETWORK_USERS,
      leaderboard: INITIAL_LEADERBOARD,

      notifications,
      markNotificationRead,
      markAllNotificationsRead,
      clearNotifications,
      unreadNotificationCount,

      auditLogs,
      addAuditLog,

      reports,
      submitReport,

      courseApplications,
      submitCourseFreelanceApplication,
      adminUpdateApplicationStatus,
      adminDeleteApplication,

      language,
      isBn: language === 'bn',
      setLanguage,
      t,
      isDarkMode,
      setIsDarkMode,
      isDeviceFrameActive,
      setIsDeviceFrameActive,

      toastMessage,
      showToast
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
