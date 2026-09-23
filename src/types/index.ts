export type AppTab = 'home' | 'shop' | 'jobs' | 'profile' | 'wallet' | 'refer';

export type UserRole = 'user' | 'reseller' | 'vendor' | 'agency' | 'admin' | 'super_admin';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  role: UserRole;
  isVerified: boolean;
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
  status?: 'active' | 'suspended' | 'blocked';
  statusReason?: string;
  nidNumber?: string;
  referralCode: string;
  referredBy?: string;
  referredByName?: string;
  activationCode: string;
  joinedDate: string;
  bio?: string;
  coverPhoto?: string;
  resellerSalesCount?: number;
  ownSalesCount?: number;
  postedProductsCount?: number;
  address?: {
    division: string;
    district: string;
    upazila: string;
    area: string;
  };
  wishlist?: string[]; // Product IDs
  balance?: number;
  totalDeposit?: number;
  totalWithdraw?: number;
  wallet?: WalletState | ({ balance: number; totalEarned: number; incomeBreakdown?: Partial<WalletState['incomeBreakdown']> });
  specialSocialAccess?: boolean;
  specialSocialStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  specialSocialApprovedAt?: string;
  specialSocialDepositTrxId?: string;
}

export interface WalletState {
  balance: number;
  pendingBalance?: number;
  totalWithdrawn: number;
  totalEarned: number;
  incomeBreakdown: {
    jobIncome: number;
    referralIncome: number;
    resellingProfit: number;
    bonusIncome: number;
    affiliateIncome: number;
    adsIncome: number;
    otherIncome: number;
  };
  updatedAt?: string;
}

export type TransactionType = 
  | 'deposit' 
  | 'withdrawal' 
  | 'job_reward' 
  | 'referral_bonus' 
  | 'reselling_profit' 
  | 'bonus' 
  | 'refund' 
  | 'adjustment'
  | 'order_cashback'
  | 'job_payment';

export interface Transaction {
  id: string;
  userId?: string;
  type: TransactionType;
  amount: number;
  date: string;
  status: 'pending' | 'completed' | 'rejected' | 'processing';
  description: string;
  referenceId?: string;
  paymentMethod?: string;
  accountNumber?: string;
  balanceBefore?: number;
  balanceAfter?: number;
  createdAt?: string;
  timestamp?: number;
  processed?: boolean;
  credited?: boolean;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  amount: number;
  fee: number;
  netAmount: number;
  paymentMethod: 'bKash' | 'Nagad' | 'Bank';
  accountNumber: string;
  accountName: string;
  date: string;
  status: 'pending' | 'processing' | 'approved' | 'rejected';
  rejectionReason?: string;
  account?: string;
  createdAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  processed?: boolean;
}

export interface DepositRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  amount: number;
  paymentMethod: string;
  method?: string;
  trxId: string;
  senderPhone?: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  timestamp?: number;
  createdAt?: string;
  updatedAt?: string;
  approvedAt?: string;
  purpose?: string;
  isVerification?: boolean;
  depositType?: 'verification' | 'standard' | 'special_social';
  nidNumber?: string;
}

export interface DepositCelebrationData {
  id?: string;
  type: 'submitted' | 'confirmed';
  amount: number;
  paymentMethod: string;
  trxId: string;
  senderPhone?: string;
  userName?: string;
  timestamp?: string;
}

export interface Product {
  id: string;
  name: string;
  nameEn?: string;
  category: string;
  supplierPrice: number; // Admin Price (এডমিন প্রাইজ / পাইকারি মূল্য)
  adminPrice?: number; // Alias for Admin Price
  sellingPrice: number; // Reselling Price (রিসেলিং প্রাইজ / কাস্টমার মূল্য)
  resellingPrice?: number; // Alias for Reselling Price
  oldPrice: number;
  discountPercentage: number;
  resellerProfit: number; // Profit (লাভের টাকা = sellingPrice - supplierPrice)
  images: string[];
  rating: number;
  reviewCount: number;
  stock: number;
  sku: string;
  vendorName: string;
  vendorId: string;
  isFeatured?: boolean;
  isPopular?: boolean;
  isNew?: boolean;
  isOfferProduct?: boolean;
  offerTag?: string;
  description: string;
  specifications: Record<string, string>;
  deliveryCharge: number;
  cashback: number;
  returnPolicy: string;
  shopId?: string; // Associated Shop ID (Admin-controlled shops)
}

export interface ShopPaymentMethodConfig {
  number: string;
  enabled: boolean;
  type?: 'personal' | 'merchant' | 'agent';
  instructions?: string;
}

export interface CustomPaymentMethodConfig {
  id: string;
  name: string;
  number: string;
  enabled: boolean;
  type?: string;
  instructions?: string;
}

export interface ShopPaymentMethods {
  bkash?: ShopPaymentMethodConfig;
  nagad?: ShopPaymentMethodConfig;
  rocket?: ShopPaymentMethodConfig;
  custom?: CustomPaymentMethodConfig[];
}

export interface Shop {
  id: string; // shopId, e.g. 'shop_main'
  name: string;
  nameEn?: string;
  slug?: string;
  logo: string;
  banner?: string;
  description: string;
  category?: string;
  status: 'active' | 'inactive';
  displayOrder: number;
  showVendorInfo: boolean;
  paymentMethods: ShopPaymentMethods;
  contactPhone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VendorPermissions {
  canAddProducts: boolean;
  canAddProduct?: boolean;
  canManageOrders: boolean;
  canEditStock: boolean;
  canViewAnalytics: boolean;
}

export interface ShopVendor {
  id: string;
  userId: string; // Linked user ID / UID
  name: string;
  phone: string;
  email?: string;
  shopId: string; // Belongs to which shop
  shopName?: string;
  status: 'active' | 'inactive';
  permissions: VendorPermissions;
  avatar?: string;
  approvedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  customSellingPrice?: number;
  customResellerProfit?: number;
}

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled' 
  | 'returned';

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  phone: string;
  address: {
    division: string;
    district: string;
    upazila: string;
    area: string;
  };
  items: CartItem[];
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  deliveryAdvancePaid: boolean;
  deliveryAdvanceMethod?: 'bkash' | 'nagad' | 'rocket' | 'wallet';
  deliveryAdvanceTrxId?: string;
  cashback: number;
  total: number;
  paymentMethod: 'cod' | 'wallet' | 'bkash' | 'nagad' | 'rocket';
  status: OrderStatus;
  createdAt: string;
  trackingNumber?: string;
  resellerId?: string;
  resellerProfit?: number;
  shopId?: string;
  shopName?: string;
  profit?: number;
  paymentVerified?: boolean;
  paymentVerifiedAt?: string;
  earningsReleased?: boolean;
  earningsReleasedAt?: string;
  rejectionReason?: string;
}

export interface MicroJob {
  id: string;
  jobCode: string; // e.g. "10165" or "9762"
  title: string;
  category: string;
  reward: number; // e.g. 0.50
  image: string;
  videoUrl?: string;
  mediaType?: 'image' | 'video';
  availableSlots: number;
  completedSlots: number;
  deadline: string;
  taskDuration?: string; // e.g. "১min এর কাজ"
  instructions: string[];
  notes?: string; // Detailed task notice/instruction below buttons
  targetUrl: string;
  proofType?: 'screenshot' | 'text' | 'link' | 'screenshot_text' | 'all';
  proofRequirement: string;
  status: 'active' | 'paused' | 'completed';
  featured?: boolean;
  startDate?: string;
  endDate?: string;
  perUserLimit?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface JobSubmission {
  id: string;
  jobId: string;
  jobCode: string;
  jobTitle: string;
  reward: number;
  userId: string;
  userName: string;
  userPhone?: string;
  proofText: string;
  proofImage?: string;
  proofLink?: string;
  proofType?: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  reviewedAt?: string;
  updatedAt?: string;
}

export interface AdMarketingSubmission {
  id: string;
  userId: string;
  userName: string;
  userPhone?: string;
  userEmail?: string;
  campaignTitle: string;
  rewardAmount: number;
  postLink?: string;
  proofImage?: string;
  note?: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  approvedAt?: string;
}

export interface TargetBonus {
  id: string;
  title: string;
  type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'lifetime' | 'welcome' | 'leadership' | 'rank';
  targetAmount: number;
  currentAmount: number;
  rewardAmount: number;
  isClaimed: boolean;
  claimedAt?: string;
  iconName: string;
  color: string;
  description: string;
}

export interface ReelItem {
  id: string;
  videoUrl?: string;
  thumbnailUrl: string;
  creatorName: string;
  creatorAvatar: string;
  creatorId: string;
  caption: string;
  hashtags: string[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  viewsCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
  isFollowing?: boolean;
  productId?: string;
  productName?: string;
  productPrice?: number;
  productImage?: string;
  jobId?: string;
  jobTitle?: string;
  jobReward?: number;
  createdAt?: string;
  status?: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  postType?: 'reel' | 'post' | 'proof';
}

export interface GroupLink {
  id: string;
  name: string;
  type: 'telegram' | 'community' | 'facebook' | 'youtube';
  title: string;
  url: string;
  memberCount: string;
  isOnline: boolean;
  badgeColor: string;
}

export interface NetworkUser {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  level: 1 | 2 | 3;
  joinDate: string;
  status: 'active' | 'inactive';
  totalSales: number;
  commissionEarned: number;
}

export interface LeaderboardUser {
  id: string;
  rank: number;
  name: string;
  avatar: string;
  income: number;
  teamSize: number;
  isVerified: boolean;
  badge?: string;
  dailyIncome?: number;
  weeklyIncome?: number;
  tasksCompleted?: number;
  district?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'order' | 'job' | 'wallet' | 'bonus' | 'announcement';
  read: boolean;
  actionUrl?: string;
  userId?: string; // Explicit owner: 'all' for platform broadcasts, or specific user ID for 100% private notifications
  userPhone?: string; // Optional user phone for multi-session sync
  createdAt?: string;
}

export interface ReportItem {
  id: string;
  reporterId: string;
  targetType: 'product' | 'job' | 'user' | 'vendor' | 'reel';
  targetId: string;
  targetName: string;
  reason: string;
  description: string;
  submittedAt: string;
  status: 'pending' | 'resolved' | 'dismissed';
}

export interface AuditLog {
  id: string;
  type: 'deposit' | 'order' | 'verification' | 'withdrawal' | 'general';
  targetId: string;
  action: string;
  status?: 'approved' | 'rejected' | 'pending' | 'completed' | 'cancelled' | 'verified';
  rejectionReason?: string;
  actorId: string;
  actorName: string;
  targetUserName?: string;
  targetUserPhone?: string;
  amount?: number;
  timestamp: string;
  details: string;
}

export interface VerificationRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  method?: string;
  senderNumber?: string;
  trxId?: string;
  amount?: number;
  nidNumber?: string;
  nidOrDocNumber?: string;
  docType?: string;
  frontImage?: string;
  backImage?: string;
  referrerPhone?: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface AppBanner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  actionUrl?: string;
  actionTab?: AppTab;
  badge?: string;
  isActive: boolean;
  position?: 'all' | 'home' | 'shop' | 'jobs';
  targetId?: string;
}

export interface VoucherCode {
  id: string;
  code: string;
  amount: number;
  maxUses?: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface SpecialSocialSettings {
  isEnabled: boolean;
  depositRequired: boolean;
  depositAmount: number;
  notificationTitle: string;
  description: string;
  paymentMethod: string;
  paymentNumber: string;
  terms: string;
}

export interface SystemSettings {
  minWithdrawalAmount: number;
  referralBonus: number;
  signupBonus: number;
  dailyTaskTarget: number;
  noticeText: string;
  isNoticeActive: boolean;
  isMaintenanceMode: boolean;
  supportPhone: string;
  supportWhatsApp: string;
  supportTelegramBot?: string;
  officialTelegramChannel?: string;
  adminTelegram?: string;
  verificationFee?: number;
  verificationPaymentNumbers?: {
    bkash: string;
    nagad: string;
    upay?: string;
  };
  verificationInstructions?: string;

  // Deposit Configuration & Policies
  depositPaymentNumbers?: {
    bkash: string;
    nagad: string;
    rocket?: string;
    upay?: string;
  };
  minDepositAmount?: number;
  maxDepositAmount?: number;
  depositInstructions?: string;
  depositPolicyRules?: string;

  // Withdrawal Configuration & Policies
  maxDailyWithdrawalAmount?: number;
  withdrawalFeePercent?: number;
  withdrawalProcessingTime?: string;
  withdrawalInstructions?: string;
  withdrawalPolicyRules?: string;

  // Voucher Codes
  vouchers?: VoucherCode[];

  // Admin-controlled Reward Center Options Configuration
  rewardCenterOptions?: RewardCenterOptionConfig[];

  // Auto Ads Configuration & Cooldown Engine
  autoAdsConfig?: AutoAdsConfig;

  // Persistent Top & Bottom Page Banner Ads (Adsterra)
  pageBannerAds?: PageBannerAdsConfig;

  // Special Social Income Configuration
  specialSocialConfig?: SpecialSocialSettings;

  featureToggles: {
    ads_view: boolean;
    quiz_job: boolean;
    typing_job: boolean;
    ad_marketing: boolean;
    micro_job: boolean;
    job_post: boolean;
    skill_course: boolean;
    freelancing: boolean;
    special_income: boolean;
    recharge: boolean;
    reselling: boolean;
    target_bonus: boolean;
    leaderboard: boolean;
    agency: boolean;
    kyc_required: boolean;
    community_groups: boolean;
    reels: boolean;
    offer_products: boolean;
  };
  featureRewards: {
    ads_view: number;
    quiz_job: number;
    typing_job: number;
    ad_marketing: number;
    daily_bonus: number;
  };
}

export interface CourseFreelanceApplication {
  id: string;
  type: 'skill_course' | 'freelancing';
  itemId: number | string;
  itemTitle: string;
  category?: string;
  rateOrBadge?: string;
  applicantName: string;
  applicantPhone: string;
  whatsappNumber?: string;
  experienceLevel?: string;
  notes?: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'contacted' | 'rejected';
  adminNotes?: string;
}

export interface AutoAdItem {
  id: string;
  title: string;
  sponsorName: string;
  mediaType: 'video' | 'banner' | 'web' | 'adnetwork_direct' | 'adnetwork_script';
  mediaUrl: string; // YouTube embed / video / image URL / direct link
  targetUrl?: string; // Landing page or sponsor link
  description?: string;
  durationSeconds?: number;
  adNetworkProvider?: 'adsterra' | 'monetag' | 'propeller' | 'adsense' | 'custom';
  adNetworkDirectUrl?: string;
  adNetworkScriptCode?: string;
}

export interface RealPlayerConfig {
  enabled: boolean;
  contentType: 'video' | 'ad';
  videoUrl: string;
  adUrl: string;
  title: string;
  sponsorName: string;
  durationSeconds: number;
}

export interface AutoAdsConfig {
  totalAdsPerSession: number; // e.g. 3 or 4
  durationPerAd: number; // seconds, e.g. 10
  rewardPerSession: number; // ৳, e.g. 1.50
  cooldownMinutes: number; // minutes, e.g. 30
  ads: AutoAdItem[];
  realPlayerConfig?: RealPlayerConfig;
}

export interface QuizQuestionItem {
  id: string;
  order: number;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
}

export interface QuizAdItem {
  enabled: boolean;
  contentType: 'video' | 'ad';
  videoUrl: string;
  adUrl: string;
  title: string;
  sponsorName: string;
  durationSeconds: number;
}

export interface QuizSettings {
  id: string;
  enabled: boolean;
  title: string;
  description: string;
  totalQuestions: number;
  rewardPoints: number;
  timeLimitSeconds: number; // 0 = unlimited
  dailyAttemptLimit: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  adProvider?: 'adsterra' | 'monetag' | 'auto'; // Active Ad Network (Adsterra, Monetag, or Auto)
  adsterraKey?: string; // Adsterra Zone / Key (e.g. a5ea718688da962e97053af64e1de8f0)
  adsterraDirectUrl?: string; // Adsterra Direct Link / SmartLink (optional)
  beforeQuizAdEnabled: boolean; // Quiz-এর আগে Ad Network Ad Enable/Disable
  afterQuizAdEnabled: boolean;  // Quiz-এর পরে Ad Network Ad Enable/Disable
  firstAd?: QuizAdItem; // legacy support
  secondAd?: QuizAdItem; // legacy support
  updatedAt?: string;
}

export interface QuizAttemptRecord {
  id: string;
  attemptId: string;
  userId: string;
  userName: string;
  userPhone?: string;
  quizId: string;
  quizTitle: string;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  answers: Record<string, 'A' | 'B' | 'C' | 'D'>;
  reward: number;
  rewardClaimed: boolean;
  firstAdCompleted: boolean;
  secondAdCompleted: boolean;
  completionTime: string;
  timestamp: string;
  status: 'completed' | 'claimed';
}

export interface PageBannerAdsConfig {
  enabled: boolean;
  adKey: string;
  scriptUrl: string;
  width: number;
  height: number;
  showTopBanner: boolean;
  showBottomBanner: boolean;
  pages: {
    ads_view: boolean;
    quiz_job: boolean;
    typing_job: boolean;
    ad_marketing: boolean;
  };
}

export type TypingJobType = 
  | 'image_to_text'       // Image → Text
  | 'pdf_to_text'         // PDF → Text
  | 'question_to_text'    // প্রশ্নপত্র → Text
  | 'topic_to_text'       // নির্দিষ্ট Topic → Text
  | 'screenshot_to_text'  // Screenshot → Text
  | 'document_to_text'    // Document → Text
  | 'custom_typing';      // অন্যান্য Typing Task

export type TypingValidationMode = 'strict' | 'flexible' | 'manual_only';

export interface TypingJobItem {
  id: string;
  title: string;
  description: string;
  jobType: TypingJobType;
  estimatedMinutes: number; // আনুমানিক কাজের সময় (মিনিট)
  rewardAmount: number; // ৳Reward
  status: 'active' | 'inactive';
  referenceType: 'image' | 'pdf' | 'document' | 'text';
  referenceUrl?: string; // Image URL, PDF URL, or document link
  referenceContent?: string; // Preview/raw text or instructions
  instructions: string; // বিস্তারিত নির্দেশনা
  expectedText: string; // সঠিক উত্তর বা টাইপ করার লেখা
  validationMode: TypingValidationMode; // strict: 95%+, flexible: 75%+, manual_only
  minMatchPercentage: number; // e.g. 85
  maxCompletions?: number; // সর্বোচ্চ কতজন করতে পারবে (0 = আনলিমিটেড)
  currentCompletions: number;
  deadline?: string; // শেষ সময় (ঐচ্ছিক)
  allowMultipleSubmissionsPerUser: boolean; // ডিফল্ট false
  autoApproval: boolean; // true = validation + ad -> instant credit; false = manual admin review
  largeAdConfig?: {
    enabled: boolean;
    provider?: 'adsterra' | 'monetag' | 'auto';
    adKey?: string;
    durationSeconds?: number;
  };
  createdAt: string;
  updatedAt?: string;
}

export type TypingSubmissionStatus = 'submitted' | 'under_review' | 'approved' | 'rejected';

export interface TypingSubmissionRecord {
  id: string;
  submissionId: string;
  jobId: string;
  jobTitle: string;
  jobType: TypingJobType;
  userId: string;
  userName: string;
  userPhone?: string;
  submittedText: string;
  expectedText: string;
  matchPercentage: number;
  validationPassed: boolean;
  adCompleted: boolean;
  rewardAmount: number;
  rewardClaimed: boolean;
  status: TypingSubmissionStatus;
  adminNote?: string;
  trxId?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface TypingSettings {
  enabled: boolean;
  defaultReward: number;
  defaultAdDurationSeconds: number;
  adsterraKey?: string;
  adsterraDirectUrl?: string;
  noticeText?: string;
}

export interface RewardItem {
  id: string;
  title: string;
  titleEn?: string;
  description: string;
  descriptionEn?: string;
  category: 'gadget' | 'gift' | 'cash' | 'voucher';
  targetRequirement: string;
  targetRequirementEn?: string;
  value: string;
  pointsRequired?: number;
  referralsRequired?: number;
  jobsRequired?: number;
  status: 'active' | 'upcoming' | 'claimed' | 'locked';
  stockLimit?: number;
  claimedCount?: number;
}

/**
 * Admin-controlled configuration structure for Reward Center Option Cards
 */
export interface RewardCenterOptionConfig {
  id: string;
  title: string;
  titleEn?: string;
  icon: string;
  gradient?: string;
  badgeText?: string;
  badgeCount?: number;
  enabled: boolean;
  rewardAmount?: number;
  description?: string;
  descriptionEn?: string;
  rules?: string[];
  requiredConditions?: string;
  order: number;
}



