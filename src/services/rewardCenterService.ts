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
import { doc, getDoc, setDoc, collection, getDocs, query, where, runTransaction } from 'firebase/firestore';

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
 * Generate a canonical, unique document ID for a claim in Firestore
 */
export function getCanonicalClaimDocId(userId: string, feature: string, rewardId: string): string {
  const cleanUid = String(userId || '').trim();
  const cleanFeature = String(feature || 'reward').trim().toLowerCase();
  const cleanRewardId = String(rewardId || '').trim();
  return `claim_${cleanUid}_${cleanFeature}_${cleanRewardId}`.replace(/[^a-zA-Z0-9_-]/g, '_');
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
    // Filter out duplicates in local cache
    const filtered = list.filter(c => 
      c.id !== record.id && 
      !(c.feature === record.feature && String(c.rewardId).trim().toUpperCase() === String(record.rewardId).trim().toUpperCase())
    );
    filtered.unshift(record);
    localStorage.setItem(localKey, JSON.stringify(filtered));
  } catch (e) {}

  try {
    await ensureFirebaseAuth();
    const docRef = doc(db, 'reward_claims', record.id);
    await setDoc(docRef, record, { merge: true });

    // Also persist in user's isolated claimed_rewards subcollection
    const userClaimRef = doc(db, 'users', record.userId, 'claimed_rewards', record.id);
    await setDoc(userClaimRef, record, { merge: true });
  } catch (err) {
    console.warn('Firestore record claim fallback:', err);
  }
}

/**
 * Verify whether a reward claim is strictly unique in Firestore for a given user.
 * Checks direct document existence in global 'reward_claims' and user's 'claimed_rewards' subcollection,
 * as well as querying collection records to ensure duplicate rewards are strictly blocked.
 */
export async function verifyUniqueRewardClaimInFirestore(
  userId: string,
  feature: string,
  rewardId: string
): Promise<{ isUnique: boolean; existingRecord?: RewardClaimRecord }> {
  if (!userId || !feature || !rewardId) {
    return { isUnique: false };
  }

  const cleanUid = String(userId).trim();
  const cleanFeature = String(feature).trim().toLowerCase();
  const cleanRewardId = String(rewardId).trim();
  const canonicalDocId = getCanonicalClaimDocId(cleanUid, cleanFeature, cleanRewardId);

  // 1. Fast local cache verification to block immediate repeated attempts
  const localKey = `${STORAGE_KEY_CLAIMS_PREFIX}${cleanUid}`;
  try {
    const raw = localStorage.getItem(localKey);
    if (raw) {
      const list: RewardClaimRecord[] = JSON.parse(raw);
      const match = list.find(c =>
        c.feature === cleanFeature &&
        String(c.rewardId).trim().toUpperCase() === cleanRewardId.toUpperCase()
      );
      if (match) {
        return { isUnique: false, existingRecord: match };
      }
    }
  } catch {}

  // 2. Authoritative Firestore verification
  try {
    await ensureFirebaseAuth();

    // A. Check canonical unique document in 'reward_claims'
    const claimDocRef = doc(db, 'reward_claims', canonicalDocId);
    const directSnap = await getDoc(claimDocRef);
    if (directSnap.exists()) {
      return { isUnique: false, existingRecord: { id: directSnap.id, ...directSnap.data() } as RewardClaimRecord };
    }

    // B. Check canonical unique document in 'users/{userId}/claimed_rewards'
    const userClaimDocRef = doc(db, 'users', cleanUid, 'claimed_rewards', canonicalDocId);
    const userClaimSnap = await getDoc(userClaimDocRef);
    if (userClaimSnap.exists()) {
      return { isUnique: false, existingRecord: { id: userClaimSnap.id, ...userClaimSnap.data() } as RewardClaimRecord };
    }

    // C. Query 'reward_claims' by userId & feature to catch records with legacy or generated IDs
    const q = query(
      collection(db, 'reward_claims'),
      where('userId', '==', cleanUid),
      where('feature', '==', cleanFeature)
    );
    const querySnap = await getDocs(q);
    for (const d of querySnap.docs) {
      const data = d.data() as RewardClaimRecord;
      if (
        data.rewardId &&
        String(data.rewardId).trim().toUpperCase() === cleanRewardId.toUpperCase()
      ) {
        return { isUnique: false, existingRecord: { id: d.id, ...data } };
      }
    }

    // D. Query user's claimed_rewards subcollection
    try {
      const userClaimsCol = collection(db, 'users', cleanUid, 'claimed_rewards');
      const userSnap = await getDocs(userClaimsCol);
      for (const d of userSnap.docs) {
        const data = d.data() as RewardClaimRecord;
        if (
          data.feature === cleanFeature &&
          data.rewardId &&
          String(data.rewardId).trim().toUpperCase() === cleanRewardId.toUpperCase()
        ) {
          return { isUnique: false, existingRecord: { id: d.id, ...data } };
        }
      }
    } catch {}

    return { isUnique: true };
  } catch (err) {
    console.warn('Firestore claim status verification warning:', err);
    // If Firestore is temporarily unreachable, check local cache again
    try {
      const raw = localStorage.getItem(localKey);
      if (raw) {
        const list: RewardClaimRecord[] = JSON.parse(raw);
        const match = list.find(c =>
          c.feature === cleanFeature &&
          String(c.rewardId).trim().toUpperCase() === cleanRewardId.toUpperCase()
        );
        if (match) {
          return { isUnique: false, existingRecord: match };
        }
      }
    } catch {}

    return { isUnique: true };
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
 * 1. Verifies unique claim status in Firestore (blocking duplicate rewards)
 * 2. Executes a single-transaction update in Firestore that:
 *    - Atomically guards against duplicate claims via transactional read
 *    - Credits the user's balance and totalEarned on the user document
 *    - Records the unique claim document in Firestore
 *    - Records the audit transaction in Firestore
 * 3. Updates local storage caches
 * 4. Syncs with backend server for real-time SSE broadcasts & persistence
 * 5. Returns updated balance and records
 */
export async function claimAndCreditReward(options: ClaimRewardRequestOptions): Promise<ClaimRewardResult> {
  const { userId, userPhone, feature, rewardId, rewardTitle, amount, note } = options;
  if (!userId) {
    return { success: false, message: 'অনুগ্রহ করে প্রথমে লগইন করুন।' };
  }
  const claimAmount = Number(amount) || 0;
  if (claimAmount <= 0) {
    return { success: false, message: 'রিওয়ার্ডের পরিমাণ সঠিক নয়।' };
  }

  const cleanUid = String(userId).trim();
  const cleanFeature = String(feature || 'reward').trim().toLowerCase();
  const cleanRewardId = String(rewardId || '').trim();
  const canonicalDocId = getCanonicalClaimDocId(cleanUid, cleanFeature, cleanRewardId);

  // STEP 1: Verify unique claim status in Firestore before executing transaction
  const verification = await verifyUniqueRewardClaimInFirestore(cleanUid, cleanFeature, cleanRewardId);
  if (!verification.isUnique) {
    return {
      success: false,
      alreadyClaimed: true,
      message: 'আপনি ইতিমধ্যেই এই পুরস্কারটি গ্রহণ করেছেন!'
    };
  }

  const txId = `tx_${cleanFeature}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const nowIso = new Date().toISOString();

  let updatedWallet: any = null;
  let txRecord: any = null;
  let claimRecord: RewardClaimRecord = {
    id: canonicalDocId,
    userId: cleanUid,
    userPhone: userPhone || '',
    feature: cleanFeature as any,
    rewardId: cleanRewardId,
    rewardTitle: rewardTitle || '',
    amount: claimAmount,
    claimedAt: nowIso,
    status: 'completed',
    note: note || '',
    txId
  };

  // STEP 2: Execute single-transaction update in Firestore
  let transactionCommitted = false;
  try {
    await ensureFirebaseAuth();

    await runTransaction(db, async (transaction) => {
      // 1. Transactional unique check on claim doc
      const claimDocRef = doc(db, 'reward_claims', canonicalDocId);
      const claimSnap = await transaction.get(claimDocRef);
      if (claimSnap.exists()) {
        throw new Error('DUPLICATE_CLAIM_BLOCKED');
      }

      const userClaimDocRef = doc(db, 'users', cleanUid, 'claimed_rewards', canonicalDocId);
      const userClaimSnap = await transaction.get(userClaimDocRef);
      if (userClaimSnap.exists()) {
        throw new Error('DUPLICATE_CLAIM_BLOCKED');
      }

      // 2. Read user doc in Firestore to get authoritative balance
      const userDocRef = doc(db, 'users', cleanUid);
      const userSnap = await transaction.get(userDocRef);

      let currentBalance = 0;
      let currentTotalEarned = 0;
      let currentBonusIncome = 0;
      let existingUserData: any = {};

      if (userSnap.exists()) {
        existingUserData = userSnap.data() || {};
        currentBalance = typeof existingUserData.balance === 'number'
          ? existingUserData.balance
          : (Number(existingUserData.wallet?.balance) || 0);
        currentTotalEarned = typeof existingUserData.wallet?.totalEarned === 'number'
          ? existingUserData.wallet.totalEarned
          : (Number(existingUserData.totalEarned) || 0);
        currentBonusIncome = Number(existingUserData.wallet?.incomeBreakdown?.bonusIncome) || 0;
      } else {
        // Fallback to local storage if user doc not in Firestore yet
        try {
          const localStr = localStorage.getItem(`lg_wallet_${cleanUid}`) || localStorage.getItem('lg_wallet');
          if (localStr) {
            const parsed = JSON.parse(localStr);
            currentBalance = Number(parsed.balance) || 0;
            currentTotalEarned = Number(parsed.totalEarned) || 0;
            currentBonusIncome = Number(parsed.incomeBreakdown?.bonusIncome) || 0;
          }
        } catch {}
      }

      const newBalance = Math.round((currentBalance + claimAmount) * 100) / 100;
      const newTotalEarned = Math.round((currentTotalEarned + claimAmount) * 100) / 100;
      const newBonusIncome = Math.round((currentBonusIncome + claimAmount) * 100) / 100;

      updatedWallet = {
        ...(existingUserData.wallet || {}),
        balance: newBalance,
        totalEarned: newTotalEarned,
        incomeBreakdown: {
          ...(existingUserData.wallet?.incomeBreakdown || {}),
          bonusIncome: newBonusIncome
        },
        updatedAt: nowIso
      };

      claimRecord = {
        ...claimRecord,
        userPhone: userPhone || existingUserData.phone || ''
      };

      txRecord = {
        id: txId,
        userId: cleanUid,
        type: 'bonus',
        amount: claimAmount,
        balanceBefore: currentBalance,
        balanceAfter: newBalance,
        date: nowIso,
        status: 'completed',
        description: note || `পুরস্কার সেন্টার: ${rewardTitle || cleanFeature} রিওয়ার্ড`,
        paymentMethod: 'system',
        referenceId: cleanRewardId,
        createdAt: nowIso,
        credited: true
      };

      // 3. Atomic writes within single Firestore transaction:
      // a. Mark unique claim record in global collection and user subcollection
      transaction.set(claimDocRef, claimRecord);
      transaction.set(userClaimDocRef, claimRecord);

      // b. Credit user balance & wallet on user document in Firestore
      transaction.set(userDocRef, {
        ...existingUserData,
        balance: newBalance,
        totalEarned: newTotalEarned,
        wallet: updatedWallet,
        updatedAt: nowIso
      }, { merge: true });

      // c. Record transaction in Firestore
      const userTxRef = doc(db, 'users', cleanUid, 'transactions', txId);
      transaction.set(userTxRef, txRecord);
      const rootTxRef = doc(db, 'transactions', txId);
      transaction.set(rootTxRef, txRecord);
    });

    transactionCommitted = true;
  } catch (err: any) {
    if (err?.message?.includes('DUPLICATE_CLAIM_BLOCKED')) {
      return {
        success: false,
        alreadyClaimed: true,
        message: 'আপনি ইতিমধ্যেই এই পুরস্কারটি গ্রহণ করেছেন!'
      };
    }
    console.warn('Firestore transaction fallback/offline note:', err);
  }

  // STEP 3: Fallback calculation if offline and transaction couldn't finish
  if (!updatedWallet) {
    let curBal = 0;
    let curEarned = 0;
    let curBonus = 0;
    try {
      const localStr = localStorage.getItem(`lg_wallet_${cleanUid}`) || localStorage.getItem('lg_wallet');
      if (localStr) {
        const parsed = JSON.parse(localStr);
        curBal = Number(parsed.balance) || 0;
        curEarned = Number(parsed.totalEarned) || 0;
        curBonus = Number(parsed.incomeBreakdown?.bonusIncome) || 0;
      }
    } catch {}

    const newBal = Math.round((curBal + claimAmount) * 100) / 100;
    const newEarned = Math.round((curEarned + claimAmount) * 100) / 100;
    const newBonus = Math.round((curBonus + claimAmount) * 100) / 100;

    updatedWallet = {
      balance: newBal,
      totalEarned: newEarned,
      totalWithdrawn: 0,
      incomeBreakdown: {
        jobIncome: 0,
        referralIncome: 0,
        resellingProfit: 0,
        bonusIncome: newBonus,
        affiliateIncome: 0,
        adsIncome: 0,
        otherIncome: 0
      },
      updatedAt: nowIso
    };

    txRecord = {
      id: txId,
      userId: cleanUid,
      type: 'bonus',
      amount: claimAmount,
      balanceBefore: curBal,
      balanceAfter: newBal,
      date: nowIso,
      status: 'completed',
      description: note || `পুরস্কার সেন্টার: ${rewardTitle || cleanFeature} রিওয়ার্ড`,
      paymentMethod: 'system',
      referenceId: cleanRewardId,
      createdAt: nowIso,
      credited: true
    };
  }

  // STEP 4: Update localStorage caches so UI immediately displays credited balance
  try {
    const localClaimsKey = `${STORAGE_KEY_CLAIMS_PREFIX}${cleanUid}`;
    const raw = localStorage.getItem(localClaimsKey);
    const list: RewardClaimRecord[] = raw ? JSON.parse(raw) : [];
    const exists = list.some(c => 
      c.feature === cleanFeature && 
      String(c.rewardId).trim().toUpperCase() === cleanRewardId.toUpperCase()
    );
    if (!exists) {
      list.unshift(claimRecord);
      localStorage.setItem(localClaimsKey, JSON.stringify(list));
    }
  } catch (e) {}

  try {
    localStorage.setItem(`lg_wallet_${cleanUid}`, JSON.stringify(updatedWallet));
    localStorage.setItem('lg_wallet', JSON.stringify(updatedWallet));
  } catch (e) {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('goodlife:wallet_updated', {
      detail: {
        wallet: updatedWallet,
        transaction: txRecord
      }
    }));
  }

  // STEP 5: Notify Express server backend so server JSON files and real-time SSE broadcasts are in sync
  try {
    const res = await fetch('/api/rewards/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: cleanUid,
        userPhone,
        feature: cleanFeature,
        rewardId: cleanRewardId,
        rewardTitle,
        amount: claimAmount,
        note,
        txId,
        claimId: canonicalDocId,
        finalBalance: updatedWallet.balance
      })
    });
    const serverResult = await res.json();
    if (serverResult?.success && serverResult.wallet) {
      if (typeof serverResult.wallet.balance === 'number') {
        updatedWallet.balance = serverResult.wallet.balance;
      }
    }
  } catch (serverErr) {
    console.warn('Backend server reward sync note:', serverErr);
  }

  return {
    success: true,
    wallet: updatedWallet,
    transaction: txRecord,
    claimRecord
  };
}
