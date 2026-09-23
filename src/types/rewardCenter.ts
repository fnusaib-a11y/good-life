export type RewardBadgeColor = 'blue' | 'red' | 'magenta' | 'orange' | 'green' | 'purple';

export interface ClaimRewardItem {
  id: string;
  title: string;
  code: string;
  amount: number;
  description: string;
  imageUrl?: string;
  icon?: string;
  couponBadgeType: RewardBadgeColor;
  couponBadgeTitle: string;
  couponBadgeSubtitle?: string;
  startDate: string;
  endDate: string;
  requiredCondition: string;
  conditionType: 'free' | 'deposit' | 'verified' | 'referrals';
  minDepositAmount?: number;
  minReferrals?: number;
  status: 'active' | 'inactive';
  totalClaimLimit?: number;
  claimedCount?: number;
  createdAt?: string;
}

export interface DailySignInDayConfig {
  day: number;
  rewardAmount: number;
  bonusTitle: string;
  description?: string;
  icon?: string;
  requiredCondition?: string;
  minDepositAmount?: number;
  status?: 'active' | 'inactive';
}

export interface DailySignInConfig {
  planTitle: string;
  planSubtitle?: string;
  requiredCondition: string;
  conditionType: 'none' | 'deposit' | 'verified';
  minDepositAmount?: number;
  enabled: boolean;
  days: DailySignInDayConfig[];
}

export interface UserSignInState {
  userId: string;
  lastSignInDate: string; // YYYY-MM-DD
  currentStreak: number;
  totalSignInDays: number;
  totalRewardEarned: number;
  claimedDaysHistory: Record<number, string>; // day -> date string
}

export interface RescueFundCampaign {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  targetAmount: number;
  distributedAmount: number;
  rewardAmount: number; // per eligible user
  startDate: string;
  endDate: string;
  requiredCondition: string;
  conditionType: 'all_members' | 'verified' | 'deposit';
  minDeposit?: number;
  status: 'active' | 'inactive' | 'completed';
  createdAt?: string;
}

export interface PromoCodeItem {
  id: string;
  code: string;
  title: string;
  description: string;
  rewardAmount: number;
  startDate: string;
  expiryDate: string;
  totalUsageLimit: number;
  usedCount: number;
  perUserLimit: number;
  status: 'active' | 'inactive';
  requiredCondition?: string;
  createdAt?: string;
}

export interface TemuTicketCampaign {
  id: string;
  ticketName: string;
  title?: string;
  bannerImage?: string;
  description: string;
  condition: string;
  rewardAmount: number;
  amount?: number;
  category?: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive';
  createdAt?: string;
}

export interface TemuTicketItem {
  id: string;
  ticketName: string;
  condition: string;
  amount: number; // + or -
  date: string;
  status: 'completed' | 'expired' | 'pending';
  userId: string;
  trxId?: string;
  campaignId?: string;
}

export interface RewardClaimRecord {
  id: string; // unique transaction/claim ID
  userId: string;
  feature: 'claim' | 'signin' | 'rescue_fund' | 'invite' | 'promo' | 'temu_ticket';
  rewardId: string;
  rewardTitle: string;
  amount: number;
  claimedAt: string;
  status: 'completed';
  note?: string;
}

export interface InviteLinkConfig {
  enabled: boolean;
  linkTemplate: string; // e.g. "https://kilagbe.com/register?ref={code}"
  shareMessage?: string;
  updatedAt?: string;
}

export interface RewardCenterSystemSettings {
  featureToggles: {
    claim: boolean;
    signin: boolean;
    rescue_fund: boolean;
    invite: boolean;
    promo_code: boolean;
    temu_ticket: boolean;
  };
  claimRewards: ClaimRewardItem[];
  dailySignInConfig: DailySignInConfig;
  rescueFundCampaigns: RescueFundCampaign[];
  promoCodes: PromoCodeItem[];
  temuCampaigns?: TemuTicketCampaign[];
  inviteBonusAmount: number;
  inviteTerms: string;
  inviteLinkConfig?: InviteLinkConfig;
}
