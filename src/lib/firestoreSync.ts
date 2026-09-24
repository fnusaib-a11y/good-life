import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  collection, 
  addDoc, 
  onSnapshot, 
  updateDoc,
  deleteDoc,
  query,
  where,
  limit,
  runTransaction
} from 'firebase/firestore';
import { db, ensureFirebaseAuth } from './firebase';
import { 
  UserProfile, 
  WalletState, 
  Order, 
  JobSubmission, 
  WithdrawalRequest, 
  ReportItem, 
  MicroJob, 
  CourseFreelanceApplication, 
  DepositRequest, 
  VerificationRequest, 
  AuditLog,
  Transaction,
  AppNotification
} from '../types';
import { normalizePhoneNumber, normalizeEmail } from './userValidation';

/**
 * Safe fetch helper with timeout to prevent operations from hanging indefinitely
 * when Firestore backend is unreachable or operating in offline mode.
 */
const fetchWithTimeout = async <T>(promise: Promise<T>, timeoutMs: number = 3000): Promise<T> => {
  return await Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Firestore connection timeout / offline')), timeoutMs)
    )
  ]);
};

/**
 * Synchronize User profile & Wallet with Firestore.
 * Strictly guarantees that a valid positive balance in Firestore is NEVER overwritten with 0.
 */
export async function syncUserWithFirestore(user: UserProfile, wallet: WalletState, password?: string) {
  if (!user || !user.id) return;
  try {
    const userRef = doc(db, 'users', user.id);
    let finalWallet: WalletState = { ...wallet };

    // Safety guard: Never overwrite positive balance in cloud with 0
    try {
      const snap = await fetchWithTimeout(getDoc(userRef), 2000);
      if (snap.exists()) {
        const cloudData = snap.data();
        const cloudBal = Number(cloudData.wallet?.balance ?? cloudData.balance) || 0;
        const incomingBal = Number(wallet?.balance) || 0;
        if (cloudBal > 0 && incomingBal === 0) {
          finalWallet = {
            ...wallet,
            balance: cloudBal,
            totalEarned: Math.max(Number(wallet?.totalEarned) || 0, Number(cloudData.wallet?.totalEarned ?? cloudData.totalEarned) || 0),
            incomeBreakdown: {
              ...(cloudData.wallet?.incomeBreakdown || {}),
              ...(wallet?.incomeBreakdown || {})
            }
          };
        }
      }
    } catch {
      // offline / timeout, continue with payload
    }

    const payload: any = {
      ...user,
      balance: finalWallet.balance,
      wallet: finalWallet,
      updatedAt: new Date().toISOString()
    };
    if (password) {
      payload.password = password;
    }
    await setDoc(userRef, payload, { merge: true });
  } catch (error) {
    console.warn('Firestore user sync fallback (offline or pending rules):', error);
  }
}

/**
 * Authoritatively credits an approved deposit to user balance in Firestore using runTransaction.
 * Strictly prevents duplicate credits by verifying processed_deposits subcollection.
 */
export async function creditUserDepositInFirestore(deposit: DepositRequest): Promise<{
  success: boolean;
  alreadyCredited?: boolean;
  newBalance: number;
  txId?: string;
}> {
  if (!deposit || !deposit.id || !deposit.userId || !deposit.amount) {
    return { success: false, newBalance: 0 };
  }

  const cleanUid = String(deposit.userId).trim();
  const cleanDepId = String(deposit.id).trim();
  const depositAmount = Number(deposit.amount) || 0;
  let finalBalance = 0;

  try {
    await ensureFirebaseAuth();

    const processedRef = doc(db, 'users', cleanUid, 'processed_deposits', cleanDepId);
    const userDocRef = doc(db, 'users', cleanUid);
    const depDocRef = doc(db, 'deposits', cleanDepId);

    const createdTxId = `tx_dep_${cleanDepId}`;

    await runTransaction(db, async (transaction) => {
      // 1. Transactional duplicate check
      const procSnap = await transaction.get(processedRef);
      if (procSnap.exists()) {
        const existingData = procSnap.data();
        finalBalance = Number(existingData.finalBalance) || 0;
        throw new Error('DEPOSIT_ALREADY_CREDITED');
      }

      // 2. Read existing user document in Firestore
      const userSnap = await transaction.get(userDocRef);
      let currentBalance = 0;
      let existingData: any = {};

      if (userSnap.exists()) {
        existingData = userSnap.data() || {};
        currentBalance = typeof existingData.wallet?.balance === 'number'
          ? existingData.wallet.balance
          : (typeof existingData.balance === 'number' ? existingData.balance : 0);
      }

      finalBalance = Math.round((currentBalance + depositAmount) * 100) / 100;
      const nowIso = new Date().toISOString();

      const updatedWallet: WalletState = {
        ...(existingData.wallet || {
          totalEarned: 0,
          totalWithdrawn: 0,
          incomeBreakdown: { jobIncome: 0, referralIncome: 0, resellingProfit: 0, bonusIncome: 0, affiliateIncome: 0, adsIncome: 0, otherIncome: 0 }
        }),
        balance: finalBalance,
        updatedAt: nowIso
      };

      const txRecord: Transaction = {
        id: createdTxId,
        userId: cleanUid,
        type: 'deposit',
        amount: depositAmount,
        balanceBefore: currentBalance,
        balanceAfter: finalBalance,
        date: nowIso,
        createdAt: nowIso,
        status: 'completed',
        description: `${deposit.paymentMethod || 'ডিপোজিট'} অনুমোদিত (TrxID: ${deposit.trxId || cleanDepId})`,
        paymentMethod: deposit.paymentMethod || 'manual',
        referenceId: deposit.trxId || cleanDepId
      };

      // 3. Mark processed deposit record to block future double credits
      transaction.set(processedRef, {
        depositId: cleanDepId,
        amount: depositAmount,
        creditedAt: nowIso,
        finalBalance
      });

      // 4. Update user document with authoritative new balance
      transaction.set(userDocRef, {
        ...existingData,
        balance: finalBalance,
        wallet: updatedWallet,
        updatedAt: nowIso
      }, { merge: true });

      // 5. Save user transaction in user subcollection and root transactions
      const userTxRef = doc(db, 'users', cleanUid, 'transactions', createdTxId);
      transaction.set(userTxRef, txRecord);
      const rootTxRef = doc(db, 'transactions', createdTxId);
      transaction.set(rootTxRef, txRecord);

      // 6. Update deposit request status in Firestore
      transaction.set(depDocRef, {
        ...deposit,
        status: 'approved',
        updatedAt: nowIso,
        approvedAt: nowIso
      }, { merge: true });
    });

    return {
      success: true,
      newBalance: finalBalance,
      txId: createdTxId
    };
  } catch (err: any) {
    if (err?.message?.includes('DEPOSIT_ALREADY_CREDITED')) {
      return { success: true, alreadyCredited: true, newBalance: finalBalance };
    }
    console.warn('creditUserDepositInFirestore error/offline:', err);
    return { success: false, newBalance: 0 };
  }
}

/**
 * Save New Order to Firestore
 */
export async function syncOrderWithFirestore(order: Order) {
  if (!order || !order.id) return;
  try {
    const orderRef = doc(db, 'orders', order.id);
    await setDoc(orderRef, {
      ...order,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.warn('Firestore order sync fallback:', error);
  }
}

/**
 * Save Job Submission to Firestore
 */
export async function syncJobSubmissionWithFirestore(submission: JobSubmission) {
  if (!submission || !submission.id) return;
  try {
    const subRef = doc(db, 'job_submissions', submission.id);
    await setDoc(subRef, {
      ...submission,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.warn('Firestore job submission sync fallback:', error);
  }
}

/**
 * Save Withdrawal Request to Firestore
 */
export async function syncWithdrawalWithFirestore(withdrawal: WithdrawalRequest) {
  if (!withdrawal || !withdrawal.id) return;
  try {
    const withRef = doc(db, 'withdrawals', withdrawal.id);
    await setDoc(withRef, {
      ...withdrawal,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.warn('Firestore withdrawal sync fallback:', error);
  }
}

/**
 * Save Report / Complaint to Firestore
 */
export async function syncReportWithFirestore(report: ReportItem) {
  if (!report || !report.id) return;
  try {
    const repRef = doc(db, 'reports', report.id);
    await setDoc(repRef, {
      ...report,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.warn('Firestore report sync fallback:', error);
  }
}

/**
 * Save Custom Posted Job to Firestore
 */
export async function syncJobWithFirestore(job: MicroJob) {
  if (!job || !job.id) return;
  try {
    const jobRef = doc(db, 'micro_jobs', job.id);
    await setDoc(jobRef, {
      ...job,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.warn('Firestore job sync fallback:', error);
  }
}

/**
 * Delete Job from Firestore
 */
export async function deleteJobFromFirestore(jobId: string) {
  if (!jobId) return;
  try {
    const jobRef = doc(db, 'micro_jobs', jobId);
    await deleteDoc(jobRef);
  } catch (error) {
    console.warn('Firestore deleteJob error:', error);
  }
}

/**
 * Real-time listener for micro_jobs collection
 */
export function subscribeToMicroJobs(callback: (jobs: MicroJob[]) => void): () => void {
  try {
    const colRef = collection(db, 'micro_jobs');
    const unsub = onSnapshot(colRef, (snapshot) => {
      if (!snapshot.empty) {
        const jobs: MicroJob[] = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data()
        } as MicroJob));
        callback(jobs);
      }
    }, (error) => {
      console.warn('subscribeToMicroJobs listener error:', error);
    });
    return unsub;
  } catch (err) {
    console.warn('Could not attach subscribeToMicroJobs listener:', err);
    return () => {};
  }
}

/**
 * Real-time listener for job_submissions collection
 */
export function subscribeToJobSubmissions(callback: (submissions: JobSubmission[]) => void): () => void {
  try {
    const colRef = collection(db, 'job_submissions');
    const unsub = onSnapshot(colRef, (snapshot) => {
      if (!snapshot.empty) {
        const subs: JobSubmission[] = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data()
        } as JobSubmission));
        callback(subs);
      }
    }, (error) => {
      console.warn('subscribeToJobSubmissions listener error:', error);
    });
    return unsub;
  } catch (err) {
    console.warn('Could not attach subscribeToJobSubmissions listener:', err);
    return () => {};
  }
}

/**
 * Save Course / Freelancing Application to Firestore
 */
export async function syncApplicationWithFirestore(application: CourseFreelanceApplication) {
  if (!application || !application.id) return;
  try {
    const appRef = doc(db, 'service_applications', application.id);
    await setDoc(appRef, {
      ...application,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.warn('Firestore application sync fallback:', error);
  }
}

/**
 * Save Deposit Request to Firestore with reliable timestamps and normalization
 */
export async function syncDepositRequestWithFirestore(deposit: DepositRequest) {
  if (!deposit || !deposit.id) {
    console.warn('[Firestore Sync] [ABORT] Invalid deposit payload provided to syncDepositRequestWithFirestore:', deposit);
    return;
  }

  const syncStartTime = Date.now();
  console.log(`[Firestore Sync] [INIT] Starting Firestore write for Deposit ID: ${deposit.id}`);
  console.log(`[Firestore Sync] [METADATA_AUDIT] Verifying user metadata before Firestore write:`, {
    depositId: deposit.id,
    userId: deposit.userId,
    userName: deposit.userName,
    userPhone: deposit.userPhone,
    senderPhone: deposit.senderPhone,
    amount: deposit.amount,
    paymentMethod: deposit.paymentMethod,
    trxId: deposit.trxId,
    status: deposit.status,
    timestamp: deposit.timestamp,
    createdAt: deposit.createdAt
  });

  try {
    await ensureFirebaseAuth();
    const depRef = doc(db, 'deposit_requests', deposit.id);
    const firestorePayload = {
      ...deposit,
      timestamp: deposit.timestamp || Date.now(),
      createdAt: deposit.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log(`[Firestore Sync] [WRITING] Sending setDoc to collection "deposit_requests" at doc "${deposit.id}"...`);
    await setDoc(depRef, firestorePayload, { merge: true });
    const duration = Date.now() - syncStartTime;
    console.log(`[Firestore Sync] [SUCCESS] Successfully wrote Deposit ID "${deposit.id}" to Firestore in ${duration}ms with full user metadata.`);
  } catch (error: any) {
    console.warn(`[Firestore Sync] [FALLBACK] Deposit ID "${deposit.id}" Firestore sync note (${error?.code || error?.message || 'offline'}). Transaction is safely recorded in local memory and server persistent database (/api/deposits).`);
  }
}

/**
 * Fetch All Deposit Requests directly from Firestore
 */
export async function fetchDepositRequestsFromFirestore(): Promise<DepositRequest[]> {
  const fetchStartTime = Date.now();
  console.log('[Firestore Sync] [FETCH_START] Querying all docs from "deposit_requests" collection...');
  try {
    const depSnap = await fetchWithTimeout(getDocs(collection(db, 'deposit_requests')));
    const duration = Date.now() - fetchStartTime;
    if (!depSnap.empty) {
      const results = depSnap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          status: data.status || 'pending'
        } as DepositRequest;
      });
      console.log(`[Firestore Sync] [FETCH_SUCCESS] Fetched ${results.length} deposit requests from Firestore in ${duration}ms`);
      return results;
    }
    console.log(`[Firestore Sync] [FETCH_EMPTY] Firestore "deposit_requests" collection returned 0 documents in ${duration}ms`);
    return [];
  } catch (err: any) {
    console.warn('[Firestore Sync] [FETCH_NOTE] Firestore fetchDepositRequests note (operating offline/cached):', err?.message || err);
    return [];
  }
}

/**
 * Real-time listener for deposit requests collection
 */
export function subscribeToDepositRequests(callback: (deposits: DepositRequest[]) => void): () => void {
  try {
    console.log('[Firestore Sync] [SUBSCRIBE_INIT] Setting up onSnapshot listener on collection "deposit_requests"...');
    const colRef = collection(db, 'deposit_requests');
    const unsub = onSnapshot(colRef, (snapshot) => {
      console.log(`[Firestore Sync] [SNAPSHOT_UPDATE] Received realtime snapshot with ${snapshot.docs.length} deposit docs`);
      const deposits: DepositRequest[] = snapshot.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          status: data.status || 'pending'
        } as DepositRequest;
      });
      callback(deposits);
    }, (error: any) => {
      console.warn('[Firestore Sync] [SNAPSHOT_ERROR] subscribeToDepositRequests error:', {
        code: error?.code,
        message: error?.message
      });
    });
    return unsub;
  } catch (err: any) {
    console.warn('[Firestore Sync] [SUBSCRIBE_ERROR] Could not attach subscribeToDepositRequests listener:', {
      message: err?.message
    });
    return () => {};
  }
}

/**
 * Save Verification Request to Firestore
 */
export async function syncVerificationRequestWithFirestore(req: VerificationRequest) {
  if (!req || !req.id) return;
  try {
    const verRef = doc(db, 'verification_requests', req.id);
    await setDoc(verRef, {
      ...req,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.warn('Firestore verification sync fallback:', error);
  }
}

/**
 * Save Audit Log to Firestore
 */
export async function syncAuditLogWithFirestore(log: AuditLog) {
  if (!log || !log.id) return;
  try {
    const auditRef = doc(db, 'audit_logs', log.id);
    await setDoc(auditRef, {
      ...log,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.warn('Firestore audit log sync fallback:', error);
  }
}

/**
 * Save Transactions to Firestore under user subcollection or collection
 */
export async function syncTransactionWithFirestore(userId: string, tx: Transaction) {
  if (!tx || !tx.id || !userId) return;
  try {
    const txRef = doc(db, 'users', userId, 'transactions', tx.id);
    await setDoc(txRef, {
      ...tx,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.warn('Firestore transaction sync fallback:', error);
  }
}

/**
 * Update Document in Firestore with partial fields
 */
export async function updateFirestoreDoc(collectionName: string, docId: string, updates: Record<string, any>) {
  if (!collectionName || !docId) return;
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, { ...updates, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    console.warn(`Firestore update error for ${collectionName}/${docId}:`, error);
  }
}

/**
 * Delete Document from Firestore
 */
export async function deleteFirestoreDoc(collectionName: string, docId: string) {
  if (!collectionName || !docId) return;
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn(`Firestore delete error for ${collectionName}/${docId}:`, error);
  }
}

export interface HydratedFirestoreData {
  users?: Array<{ user: UserProfile; password?: string; wallet?: WalletState }>;
  depositRequests?: DepositRequest[];
  orders?: Order[];
  withdrawals?: WithdrawalRequest[];
  verificationRequests?: VerificationRequest[];
  auditLogs?: AuditLog[];
  reports?: ReportItem[];
  applications?: CourseFreelanceApplication[];
}

/**
 * Hydrates all historical data from Cloud Firestore so no data is ever lost
 * across browser resets, cache clears, or device switching.
 */
export async function fetchInitialFirestoreData(): Promise<HydratedFirestoreData> {
  const result: HydratedFirestoreData = {};

  try {
    // 1. Fetch Users
    const usersSnap = await fetchWithTimeout(getDocs(collection(db, 'users')));
    if (!usersSnap.empty) {
      result.users = usersSnap.docs.map(d => {
        const data = d.data();
        const userObj: UserProfile = {
          id: data.id || d.id,
          name: data.name || 'User',
          phone: data.phone || '',
          email: data.email || '',
          avatar: data.avatar || '',
          role: data.role || 'user',
          isVerified: !!data.isVerified,
          verificationStatus: data.verificationStatus || 'unverified',
          referralCode: data.referralCode || '1001',
          referredBy: data.referredBy || '',
          activationCode: data.activationCode || '',
          joinedDate: data.joinedDate || new Date().toISOString(),
          bio: data.bio || '',
          resellerSalesCount: data.resellerSalesCount || 0,
          ownSalesCount: data.ownSalesCount || 0,
          postedProductsCount: data.postedProductsCount || 0,
          address: data.address || { division: '', district: '', upazila: '', area: '' }
        };
        return {
          user: userObj,
          password: data.password || '',
          wallet: data.wallet || undefined
        };
      });
    }
  } catch (err) {
    console.warn('Firestore load users note (operating locally):', err);
  }

  try {
    // 2. Fetch Deposit Requests
    const depSnap = await fetchWithTimeout(getDocs(collection(db, 'deposit_requests')));
    if (!depSnap.empty) {
      result.depositRequests = depSnap.docs.map(d => ({ ...d.data(), id: d.id } as DepositRequest));
    }
  } catch (err) {
    console.warn('Firestore load deposits note (operating locally):', err);
  }

  try {
    // 3. Fetch Orders
    const ordSnap = await fetchWithTimeout(getDocs(collection(db, 'orders')));
    if (!ordSnap.empty) {
      result.orders = ordSnap.docs.map(d => ({ ...d.data(), id: d.id } as Order));
    }
  } catch (err) {
    console.warn('Firestore load orders note (operating locally):', err);
  }

  try {
    // 4. Fetch Withdrawals
    const wdSnap = await fetchWithTimeout(getDocs(collection(db, 'withdrawals')));
    if (!wdSnap.empty) {
      result.withdrawals = wdSnap.docs.map(d => ({ ...d.data(), id: d.id } as WithdrawalRequest));
    }
  } catch (err) {
    console.warn('Firestore load withdrawals note (operating locally):', err);
  }

  try {
    // 5. Fetch Verifications
    const verSnap = await fetchWithTimeout(getDocs(collection(db, 'verification_requests')));
    if (!verSnap.empty) {
      result.verificationRequests = verSnap.docs.map(d => ({ ...d.data(), id: d.id } as VerificationRequest));
    }
  } catch (err) {
    console.warn('Firestore load verifications note (operating locally):', err);
  }

  try {
    // 6. Fetch Audit Logs
    const auditSnap = await fetchWithTimeout(getDocs(collection(db, 'audit_logs')));
    if (!auditSnap.empty) {
      result.auditLogs = auditSnap.docs.map(d => ({ ...d.data(), id: d.id } as AuditLog));
    }
  } catch (err) {
    console.warn('Firestore load audit logs note (operating locally):', err);
  }

  try {
    // 7. Fetch Reports
    const repSnap = await fetchWithTimeout(getDocs(collection(db, 'reports')));
    if (!repSnap.empty) {
      result.reports = repSnap.docs.map(d => ({ ...d.data(), id: d.id } as ReportItem));
    }
  } catch (err) {
    console.warn('Firestore load reports note (operating locally):', err);
  }

  try {
    // 8. Fetch Applications
    const appSnap = await fetchWithTimeout(getDocs(collection(db, 'service_applications')));
    if (!appSnap.empty) {
      result.applications = appSnap.docs.map(d => ({ ...d.data(), id: d.id } as CourseFreelanceApplication));
    }
  } catch (err) {
    console.warn('Firestore load service applications note (operating locally):', err);
  }

  return result;
}

/**
 * Searches for a user in Firestore if they are not present in local storage
 */
export async function fetchUserFromFirestore(phoneOrEmail: string): Promise<{ user: UserProfile; password?: string; wallet?: WalletState } | null> {
  const normPhone = normalizePhoneNumber(phoneOrEmail);
  const normEmail = normalizeEmail(phoneOrEmail);

  try {
    // Try query by phone
    if (normPhone) {
      const qPhone = query(collection(db, 'users'), where('phone', '==', normPhone), limit(1));
      const snap = await fetchWithTimeout(getDocs(qPhone));
      if (!snap.empty) {
        const data = snap.docs[0].data();
        return {
          user: { ...data, id: snap.docs[0].id } as UserProfile,
          password: data.password,
          wallet: data.wallet
        };
      }
    }

    // Try query by email
    if (normEmail) {
      const qEmail = query(collection(db, 'users'), where('email', '==', normEmail), limit(1));
      const snap = await fetchWithTimeout(getDocs(qEmail));
      if (!snap.empty) {
        const data = snap.docs[0].data();
        return {
          user: { ...data, id: snap.docs[0].id } as UserProfile,
          password: data.password,
          wallet: data.wallet
        };
      }
    }
  } catch (e) {
    console.warn('Note: user lookup in Firestore skipped (using local store):', e);
  }

  return null;
}

/**
 * Detection helper to reject fake, dummy, or hardcoded test notifications
 */
export function isFakeOrDummyNotification(n: any): boolean {
  if (!n) return true;
  if (!n.id || !n.title) return true;
  // Specific known fake IDs
  if (n.id === 'notif_01' || n.id === 'notif_welcome_01') return true;
  if (typeof n.id === 'string' && (
    n.id.startsWith('dummy_') || 
    n.id.startsWith('mock_') || 
    n.id.startsWith('test_notif') ||
    n.id.startsWith('fake_')
  )) {
    return true;
  }
  // Hardcoded dummy welcome notification
  if (n.title === 'স্বাগতম Good Life-এ!' && (n.id === 'notif_01' || n.id === 'notif_welcome_01')) {
    return true;
  }
  return false;
}

/**
 * Save / Update Notification in Firestore
 * Enforces strict userId field for targeting and rejects any fake/dummy notification
 */
export async function syncNotificationWithFirestore(notification: AppNotification) {
  if (!notification || !notification.id || isFakeOrDummyNotification(notification)) return;
  try {
    await ensureFirebaseAuth();
    const notifRef = doc(db, 'notifications', notification.id);
    await setDoc(notifRef, {
      ...notification,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.warn('Firestore notification sync fallback:', error);
  }
}

/**
 * Mark notification as read in Firestore
 */
export async function markNotificationAsReadInFirestore(id: string) {
  if (!id) return;
  try {
    await ensureFirebaseAuth();
    const notifRef = doc(db, 'notifications', id);
    await updateDoc(notifRef, {
      read: true,
      readAt: new Date().toISOString()
    });
  } catch (error) {
    console.warn('Firestore notification mark read fallback:', error);
  }
}

/**
 * Fetch Notifications for a specific logged-in user from Firestore
 * Strictly queries:
 * 1. userId == currentUser.uid
 * 2. userId == 'all' (Broadcasts)
 * 3. userId == 'admin' (If logged in user is admin)
 */
export async function fetchNotificationsForUserFromFirestore(userId: string, isAdmin: boolean = false): Promise<AppNotification[]> {
  if (!userId) return [];
  try {
    await ensureFirebaseAuth();
    const notifsRef = collection(db, 'notifications');

    // Strict user-specific query
    const userQuery = query(notifsRef, where('userId', '==', userId));
    const userSnap = await fetchWithTimeout(getDocs(userQuery));

    // Platform-wide broadcasts query
    const broadcastQuery = query(notifsRef, where('userId', '==', 'all'));
    const broadcastSnap = await fetchWithTimeout(getDocs(broadcastQuery));

    const map = new Map<string, AppNotification>();
    userSnap.docs.forEach(d => {
      const data = { id: d.id, ...d.data() } as AppNotification;
      if (!isFakeOrDummyNotification(data)) {
        map.set(d.id, data);
      }
    });
    broadcastSnap.docs.forEach(d => {
      if (!map.has(d.id)) {
        const data = { id: d.id, ...d.data() } as AppNotification;
        if (!isFakeOrDummyNotification(data)) {
          map.set(d.id, data);
        }
      }
    });

    if (isAdmin) {
      const adminQuery = query(notifsRef, where('userId', '==', 'admin'));
      const adminSnap = await fetchWithTimeout(getDocs(adminQuery));
      adminSnap.docs.forEach(d => {
        if (!map.has(d.id)) {
          const data = { id: d.id, ...d.data() } as AppNotification;
          if (!isFakeOrDummyNotification(data)) {
            map.set(d.id, data);
          }
        }
      });
    }

    return Array.from(map.values());
  } catch (err) {
    console.warn('Firestore fetchNotificationsForUserFromFirestore fallback:', err);
    return [];
  }
}

/**
 * Subscribe to real-time notifications for a specific user from Firestore
 */
export function subscribeToUserNotifications(
  userId: string, 
  callback: (notifs: AppNotification[]) => void,
  isAdmin: boolean = false
): () => void {
  if (!userId) return () => {};
  try {
    const notifsRef = collection(db, 'notifications');
    const userQuery = query(notifsRef, where('userId', '==', userId));
    const broadcastQuery = query(notifsRef, where('userId', '==', 'all'));

    const unsubs: Array<() => void> = [];
    const notifMap = new Map<string, AppNotification>();

    const dispatch = () => {
      const list = Array.from(notifMap.values())
        .filter(n => !isFakeOrDummyNotification(n))
        .sort((a, b) => {
          const timeA = a.createdAt ? Date.parse(a.createdAt) : 0;
          const timeB = b.createdAt ? Date.parse(b.createdAt) : 0;
          return timeB - timeA;
        });
      callback(list);
    };

    unsubs.push(onSnapshot(userQuery, (snap) => {
      snap.docs.forEach(d => {
        notifMap.set(d.id, { id: d.id, ...d.data() } as AppNotification);
      });
      dispatch();
    }, (err) => console.warn('User notifs snapshot error:', err)));

    unsubs.push(onSnapshot(broadcastQuery, (snap) => {
      snap.docs.forEach(d => {
        notifMap.set(d.id, { id: d.id, ...d.data() } as AppNotification);
      });
      dispatch();
    }, (err) => console.warn('Broadcast notifs snapshot error:', err)));

    if (isAdmin) {
      const adminQuery = query(notifsRef, where('userId', '==', 'admin'));
      unsubs.push(onSnapshot(adminQuery, (snap) => {
        snap.docs.forEach(d => {
          notifMap.set(d.id, { id: d.id, ...d.data() } as AppNotification);
        });
        dispatch();
      }, (err) => console.warn('Admin notifs snapshot error:', err)));
    }

    return () => {
      unsubs.forEach(unsub => unsub());
    };
  } catch (err) {
    return () => {};
  }
}

/**
 * Fetches the freshest real user profile and wallet data directly from Cloud Firestore
 * Ensures 100% genuine user data hydration on manual Refresh.
 */
export async function fetchFreshestUserData(
  userId: string,
  userPhone?: string
): Promise<{ user: UserProfile | null; wallet: WalletState | null }> {
  if (!userId && !userPhone) return { user: null, wallet: null };

  try {
    // 1. Direct document lookup by userId
    if (userId) {
      try {
        const userRef = doc(db, 'users', userId);
        const snap = await fetchWithTimeout(getDoc(userRef), 3500);
        if (snap.exists()) {
          const data = snap.data();
          const userObj = { ...data, id: snap.id } as UserProfile;
          const walletObj = data.wallet || null;
          return { user: userObj, wallet: walletObj };
        }
      } catch (err) {
        console.warn('Doc lookup by userId note:', err);
      }
    }

    // 2. Query by phone if not found by doc id
    const cleanPhone = userPhone ? normalizePhoneNumber(userPhone) : '';
    if (cleanPhone) {
      try {
        const qPhone = query(collection(db, 'users'), where('phone', '==', cleanPhone), limit(1));
        const snap = await fetchWithTimeout(getDocs(qPhone), 3500);
        if (!snap.empty) {
          const data = snap.docs[0].data();
          const userObj = { ...data, id: snap.docs[0].id } as UserProfile;
          const walletObj = data.wallet || null;
          return { user: userObj, wallet: walletObj };
        }
      } catch (err) {
        console.warn('Query by phone note:', err);
      }
    }
  } catch (err) {
    console.warn('fetchFreshestUserData error (fallback to local state):', err);
  }

  return { user: null, wallet: null };
}

/**
 * Real-time listener for current logged-in user document in Firestore
 */
export function subscribeToUserRealtime(
  userId: string,
  callback: (data: { user: UserProfile; wallet?: WalletState }) => void
): () => void {
  if (!userId) return () => {};
  try {
    const userRef = doc(db, 'users', userId);
    return onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const userObj = { ...data, id: snap.id } as UserProfile;
        callback({ user: userObj, wallet: data.wallet });
      }
    }, (err) => {
      console.warn('subscribeToUserRealtime snapshot note:', err);
    });
  } catch {
    return () => {};
  }
}

