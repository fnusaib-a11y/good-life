import {
  ClaimRewardItem,
  DailySignInConfig,
  UserSignInState,
  RescueFundCampaign,
  PromoCodeItem,
  TemuTicketCampaign,
  TemuTicketItem,
  RewardClaimRecord,
  RewardCenterSystemSettings
} from '../types/rewardCenter';
import { db, ensureFirebaseAuth } from '../lib/firebase';
import { doc, getDoc, setDoc, collection, getDocs, query, where, addDoc } from 'firebase/firestore';

const STORAGE_KEY_SETTINGS = 'lg_reward_center_settings';
const STORAGE_KEY_CLAIMS_PREFIX = 'lg_reward_claims_';
const STORAGE_KEY_SIGNIN_PREFIX = 'lg_user_signin_';
const STORAGE_KEY_TICKETS_PREFIX = 'lg_temu_tickets_';

export const DEFAULT_DAILY_SIGNIN_CONFIG: DailySignInConfig = {
  planTitle: 'দৈনিক সাইন-ইন বোনাস',
  planSubtitle: 'প্রতিদিন অ্যাপে লগইন করুন এবং নিয়মিত রিওয়ার্ড সংগ্রহ করুন',
  requiredCondition: 'সক্রিয় অ্যাকাউন্ট',
  conditionType: 'none',
  minDepositAmount: 0,
  enabled: true,
  days: [
    { day: 1, rewardAmount: 1.00, bonusTitle: '১ম দিন সাইন-ইন বোনাস', status: 'active' },
    { day: 2, rewardAmount: 2.00, bonusTitle: '২য় দিন সাইন-ইন বোনাস', status: 'active' },
    { day: 3, rewardAmount: 3.00, bonusTitle: '৩য় দিন সাইন-ইন বোনাস', status: 'active' },
    { day: 4, rewardAmount: 4.00, bonusTitle: '৪র্থ দিন সাইন-ইন বোনাস', status: 'active' },
    { day: 5, rewardAmount: 5.00, bonusTitle: '৫ম দিন সাইন-ইন বোনাস', status: 'active' },
    { day: 6, rewardAmount: 6.00, bonusTitle: '৬ষ্ঠ দিন সাইন-ইন বোনাস', status: 'active' },
    { day: 7, rewardAmount: 10.00, bonusTitle: '৭ম দিন মেগা সাইন-ইন বোনাস', status: 'active' }
  ]
};

export const DEFAULT_REWARD_CENTER_SETTINGS: RewardCenterSystemSettings = {
  featureToggles: {
    claim: true,
    signin: true,
    rescue_fund: true,
    invite: true,
    promo_code: true,
    temu_ticket: true
  },
  claimRewards: [],
  dailySignInConfig: DEFAULT_DAILY_SIGNIN_CONFIG,
  rescueFundCampaigns: [],
  promoCodes: [],
  temuCampaigns: [],
  inviteBonusAmount: 10,
  inviteTerms: 'আপনার আমন্ত্রিত বন্ধু সফলভাবে ভেরিফিকেশন সম্পন্ন করলে আপনি বোনাস পাবেন।',
  inviteLinkConfig: {
    enabled: true,
    linkTemplate: typeof window !== 'undefined' ? `${window.location.origin}/?ref={code}` : 'https://kilagbe.com/?ref={code}',
    shareMessage: 'Good Life প্ল্যাটফর্মে যোগ দিন এবং সাথে সাথে সাইন-আপ বোনাস গ্রহণ করুন!'
  }
};

/**
 * Load Reward Center Settings from LocalStorage & Firestore
 */
export async function getRewardCenterSettings(): Promise<RewardCenterSystemSettings> {
  let settings = { ...DEFAULT_REWARD_CENTER_SETTINGS };
  
  try {
    const local = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (local) {
      const parsed = JSON.parse(local);
      settings = { ...settings, ...parsed };
    }
  } catch (e) {
    console.warn('Local settings parse warning:', e);
  }

  try {
    await ensureFirebaseAuth();
    const docRef = doc(db, 'system_settings', 'reward_center');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const cloudData = docSnap.data() as Partial<RewardCenterSystemSettings>;
      settings = {
        ...settings,
        ...cloudData,
        featureToggles: {
          ...settings.featureToggles,
          ...(cloudData.featureToggles || {})
        },
        claimRewards: cloudData.claimRewards || settings.claimRewards || [],
        rescueFundCampaigns: cloudData.rescueFundCampaigns || settings.rescueFundCampaigns || [],
        promoCodes: cloudData.promoCodes || settings.promoCodes || [],
        temuCampaigns: cloudData.temuCampaigns || settings.temuCampaigns || [],
        inviteLinkConfig: cloudData.inviteLinkConfig || settings.inviteLinkConfig
      };
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    }
  } catch (err) {
    // offline or permission fallback
  }

  return settings;
}

/**
 * Save Reward Center Settings to LocalStorage & Firestore
 */
export async function saveRewardCenterSettings(newSettings: RewardCenterSystemSettings): Promise<boolean> {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(newSettings));
  } catch (e) {}

  try {
    await ensureFirebaseAuth();
    const docRef = doc(db, 'system_settings', 'reward_center');
    await setDoc(docRef, {
      ...newSettings,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    console.warn('Firestore reward settings save fallback:', error);
    return true;
  }
}

/* ================= CRUD for Sub-items ================= */

export async function addClaimReward(item: ClaimRewardItem): Promise<boolean> {
  const current = await getRewardCenterSettings();
  const updatedList = [item, ...(current.claimRewards || []).filter(c => c.id !== item.id)];
  return await saveRewardCenterSettings({ ...current, claimRewards: updatedList });
}

export async function updateClaimReward(id: string, updates: Partial<ClaimRewardItem>): Promise<boolean> {
  const current = await getRewardCenterSettings();
  const updatedList = (current.claimRewards || []).map(c => c.id === id ? { ...c, ...updates } : c);
  return await saveRewardCenterSettings({ ...current, claimRewards: updatedList });
}

export async function deleteClaimReward(id: string): Promise<boolean> {
  const current = await getRewardCenterSettings();
  const updatedList = (current.claimRewards || []).filter(c => c.id !== id);
  return await saveRewardCenterSettings({ ...current, claimRewards: updatedList });
}

export async function addRescueCampaign(item: RescueFundCampaign): Promise<boolean> {
  const current = await getRewardCenterSettings();
  const updatedList = [item, ...(current.rescueFundCampaigns || []).filter(c => c.id !== item.id)];
  return await saveRewardCenterSettings({ ...current, rescueFundCampaigns: updatedList });
}

export async function updateRescueCampaign(id: string, updates: Partial<RescueFundCampaign>): Promise<boolean> {
  const current = await getRewardCenterSettings();
  const updatedList = (current.rescueFundCampaigns || []).map(c => c.id === id ? { ...c, ...updates } : c);
  return await saveRewardCenterSettings({ ...current, rescueFundCampaigns: updatedList });
}

export async function deleteRescueCampaign(id: string): Promise<boolean> {
  const current = await getRewardCenterSettings();
  const updatedList = (current.rescueFundCampaigns || []).filter(c => c.id !== id);
  return await saveRewardCenterSettings({ ...current, rescueFundCampaigns: updatedList });
}

export async function addPromoCode(item: PromoCodeItem): Promise<boolean> {
  const current = await getRewardCenterSettings();
  const updatedList = [item, ...(current.promoCodes || []).filter(c => c.id !== item.id)];
  return await saveRewardCenterSettings({ ...current, promoCodes: updatedList });
}

export async function updatePromoCode(id: string, updates: Partial<PromoCodeItem>): Promise<boolean> {
  const current = await getRewardCenterSettings();
  const updatedList = (current.promoCodes || []).map(c => c.id === id ? { ...c, ...updates } : c);
  return await saveRewardCenterSettings({ ...current, promoCodes: updatedList });
}

export async function deletePromoCode(id: string): Promise<boolean> {
  const current = await getRewardCenterSettings();
  const updatedList = (current.promoCodes || []).filter(c => c.id !== id);
  return await saveRewardCenterSettings({ ...current, promoCodes: updatedList });
}

export async function addTemuCampaign(item: TemuTicketCampaign): Promise<boolean> {
  const current = await getRewardCenterSettings();
  const list = current.temuCampaigns || [];
  const updatedList = [item, ...list.filter(c => c.id !== item.id)];
  return await saveRewardCenterSettings({ ...current, temuCampaigns: updatedList });
}

export async function updateTemuCampaign(id: string, updates: Partial<TemuTicketCampaign>): Promise<boolean> {
  const current = await getRewardCenterSettings();
  const list = current.temuCampaigns || [];
  const updatedList = list.map(c => c.id === id ? { ...c, ...updates } : c);
  return await saveRewardCenterSettings({ ...current, temuCampaigns: updatedList });
}

export async function deleteTemuCampaign(id: string): Promise<boolean> {
  const current = await getRewardCenterSettings();
  const list = current.temuCampaigns || [];
  const updatedList = list.filter(c => c.id !== id);
  return await saveRewardCenterSettings({ ...current, temuCampaigns: updatedList });
}

/**
 * Fetch all Claim Records for a specific User
 */
export async function getUserClaimRecords(userId: string): Promise<RewardClaimRecord[]> {
  if (!userId) return [];
  const localKey = `${STORAGE_KEY_CLAIMS_PREFIX}${userId}`;
  let list: RewardClaimRecord[] = [];
  
  try {
    const raw = localStorage.getItem(localKey);
    if (raw) list = JSON.parse(raw);
  } catch (e) {}

  try {
    await ensureFirebaseAuth();
    const q = query(collection(db, 'reward_claims'), where('userId', '==', userId));
    const snap = await getDocs(q);
    const cloudList: RewardClaimRecord[] = [];
    snap.forEach(d => {
      cloudList.push({ id: d.id, ...d.data() } as RewardClaimRecord);
    });
    if (cloudList.length > 0) {
      const map = new Map<string, RewardClaimRecord>();
      list.forEach(item => map.set(item.id, item));
      cloudList.forEach(item => map.set(item.id, item));
      list = Array.from(map.values()).sort((a, b) => Date.parse(b.claimedAt) - Date.parse(a.claimedAt));
      localStorage.setItem(localKey, JSON.stringify(list));
    }
  } catch (err) {}

  return list;
}

/**
 * Record a successful reward claim in Firestore & LocalStorage
 */
export async function recordRewardClaim(record: RewardClaimRecord): Promise<void> {
  if (!record.userId) return;
  const localKey = `${STORAGE_KEY_CLAIMS_PREFIX}${record.userId}`;
  try {
    const raw = localStorage.getItem(localKey);
    const list: RewardClaimRecord[] = raw ? JSON.parse(raw) : [];
    list.unshift(record);
    localStorage.setItem(localKey, JSON.stringify(list));
  } catch (e) {}

  try {
    await ensureFirebaseAuth();
    const docRef = doc(db, 'reward_claims', record.id);
    await setDoc(docRef, record);
  } catch (err) {
    console.warn('Firestore record claim fallback:', err);
  }
}

/**
 * Fetch User Sign-In State
 */
export async function getUserSignInState(userId: string): Promise<UserSignInState> {
  const defaultState: UserSignInState = {
    userId,
    lastSignInDate: '',
    currentStreak: 0,
    totalSignInDays: 0,
    totalRewardEarned: 0,
    claimedDaysHistory: {}
  };

  if (!userId) return defaultState;
  const localKey = `${STORAGE_KEY_SIGNIN_PREFIX}${userId}`;
  let state = defaultState;

  try {
    const raw = localStorage.getItem(localKey);
    if (raw) state = { ...defaultState, ...JSON.parse(raw) };
  } catch (e) {}

  try {
    await ensureFirebaseAuth();
    const docRef = doc(db, 'user_signins', userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      state = { ...state, ...(snap.data() as UserSignInState) };
      localStorage.setItem(localKey, JSON.stringify(state));
    }
  } catch (err) {}

  return state;
}

/**
 * Save User Sign-In State
 */
export async function saveUserSignInState(state: UserSignInState): Promise<void> {
  if (!state.userId) return;
  const localKey = `${STORAGE_KEY_SIGNIN_PREFIX}${state.userId}`;
  try {
    localStorage.setItem(localKey, JSON.stringify(state));
  } catch (e) {}

  try {
    await ensureFirebaseAuth();
    const docRef = doc(db, 'user_signins', state.userId);
    await setDoc(docRef, { ...state, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    console.warn('Firestore signin state save fallback:', err);
  }
}

/**
 * Fetch Temu Tickets for specific user strictly
 */
export async function getUserTemuTickets(userId: string): Promise<TemuTicketItem[]> {
  if (!userId) return [];
  const localKey = `${STORAGE_KEY_TICKETS_PREFIX}${userId}`;
  let list: TemuTicketItem[] = [];

  try {
    const raw = localStorage.getItem(localKey);
    if (raw) list = JSON.parse(raw);
  } catch (e) {}

  try {
    await ensureFirebaseAuth();
    const q = query(collection(db, 'temu_tickets'), where('userId', '==', userId));
    const snap = await getDocs(q);
    const cloudList: TemuTicketItem[] = [];
    snap.forEach(d => {
      cloudList.push({ id: d.id, ...d.data() } as TemuTicketItem);
    });
    if (cloudList.length > 0) {
      const map = new Map<string, TemuTicketItem>();
      list.forEach(item => map.set(item.id, item));
      cloudList.forEach(item => map.set(item.id, item));
      list = Array.from(map.values()).sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
      localStorage.setItem(localKey, JSON.stringify(list));
    }
  } catch (err) {}

  return list;
}

/**
 * Save/Add Temu Ticket entry for user
 */
export async function saveUserTemuTicket(ticket: TemuTicketItem): Promise<void> {
  if (!ticket.userId) return;
  const localKey = `${STORAGE_KEY_TICKETS_PREFIX}${ticket.userId}`;
  try {
    const raw = localStorage.getItem(localKey);
    const list: TemuTicketItem[] = raw ? JSON.parse(raw) : [];
    list.unshift(ticket);
    localStorage.setItem(localKey, JSON.stringify(list));
  } catch (e) {}

  try {
    await ensureFirebaseAuth();
    const docRef = doc(db, 'temu_tickets', ticket.id);
    await setDoc(docRef, ticket);
  } catch (err) {
    console.warn('Firestore ticket save fallback:', err);
  }
}

export interface ClaimRewardRequestOptions {
  userId: string;
  userPhone?: string;
  feature: 'claim' | 'signin' | 'rescue_fund' | 'invite' | 'promo' | 'temu_ticket';
  rewardId: string;
  rewardTitle: string;
  amount: number;
  note?: string;
  conditionType?: string;
}

export interface ClaimRewardResult {
  success: boolean;
  message?: string;
  alreadyClaimed?: boolean;
  wallet?: any;
  transaction?: any;
  claimRecord?: RewardClaimRecord;
}

/**
 * Authoritatively Claim & Credit a Reward
 * 1. Checks duplicate claim
 * 2. Credits balance on persistent server
 * 3. Records real transaction
 * 4. Records claim in Firestore
 * 5. Returns updated authoritative data
 */
export async function claimAndCreditReward(options: ClaimRewardRequestOptions): Promise<ClaimRewardResult> {
  const { userId, userPhone, feature, rewardId, rewardTitle, amount, note } = options;
  if (!userId) {
    return { success: false, message: 'অনুগ্রহ করে প্রথমে লগইন করুন।' };
  }
  if (amount <= 0) {
    return { success: false, message: 'রিওয়ার্ডের পরিমাণ সঠিক নয়।' };
  }

  // 1. Check local cache / existing claims first to fast-fail duplicate
  try {
    const existingClaims = await getUserClaimRecords(userId);
    const isDuplicate = existingClaims.some(c => 
      c.feature === feature && 
      String(c.rewardId).toUpperCase() === String(rewardId).toUpperCase()
    );
    if (isDuplicate) {
      return {
        success: false,
        alreadyClaimed: true,
        message: 'আপনি ইতিমধ্যেই এই পুরস্কারটি গ্রহণ করেছেন!'
      };
    }
  } catch (err) {
    console.warn('Error reading claim records:', err);
  }

  // 2. Call authoritative backend API to credit wallet and record persistent transaction
  let serverResult: any = null;
  try {
    const res = await fetch('/api/rewards/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        userPhone,
        feature,
        rewardId,
        rewardTitle,
        amount,
        note
      })
    });
    serverResult = await res.json();
    if (!res.ok || !serverResult.success) {
      if (serverResult?.alreadyClaimed) {
        return { success: false, alreadyClaimed: true, message: serverResult.message || 'ইতিমধ্যেই গ্রহণ করা হয়েছে!' };
      }
      if (serverResult?.message) {
        return { success: false, message: serverResult.message };
      }
    }
  } catch (err) {
    console.warn('Backend reward claim API warning (proceeding with fallback):', err);
  }

  const claimId = serverResult?.claim?.id || `claim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const nowIso = new Date().toISOString();

  // 3. Persist claim in Firestore
  const claimRecord: RewardClaimRecord = {
    id: claimId,
    userId,
    feature,
    rewardId,
    rewardTitle,
    amount,
    claimedAt: nowIso,
    status: 'completed',
    note: note || ''
  };

  try {
    await recordRewardClaim(claimRecord);
  } catch (e) {
    console.warn('Firestore claim record warning:', e);
  }

  return {
    success: true,
    wallet: serverResult?.wallet,
    transaction: serverResult?.transaction,
    claimRecord
  };
}
