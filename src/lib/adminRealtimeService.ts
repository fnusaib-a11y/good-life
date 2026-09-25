import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  Unsubscribe 
} from 'firebase/firestore';
import { db } from './firebase';
import { createSafeEventSource } from './apiConfig';

export type PendingRequestType = 'deposit' | 'verification' | 'order';

export interface PendingAlertPayload {
  type: PendingRequestType;
  title: string;
  message: string;
  id?: string;
  amount?: number;
  userName?: string;
  userPhone?: string;
}

/**
 * Check if admin notification sound is enabled in localStorage
 */
export function isAdminSoundEnabled(): boolean {
  try {
    return localStorage.getItem('lg_admin_sound_enabled') !== 'false';
  } catch {
    return true;
  }
}

/**
 * Toggle admin notification sound preference
 */
export function setAdminSoundEnabled(enabled: boolean): void {
  try {
    localStorage.setItem('lg_admin_sound_enabled', enabled ? 'true' : 'false');
  } catch {
    // ignore
  }
}

export const getAdminSoundEnabled = isAdminSoundEnabled;
export const playAdminAlertChime = playAdminNotificationSound;

/**
 * Play an elegant dual-tone chime notification sound using Web Audio API
 */
export function playAdminNotificationSound(): void {
  if (!isAdminSoundEnabled()) return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    const playChimeTone = (freq: number, start: number, duration: number, gainVal: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(gainVal, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + duration);
    };

    // First note: High harmonic (D5 ~ 587Hz)
    playChimeTone(587.33, now, 0.22, 0.18);
    // Second note: Bright resolution (A5 ~ 880Hz)
    playChimeTone(880.00, now + 0.10, 0.35, 0.22);
  } catch (err) {
    console.warn('Audio notification sound failed to play:', err);
  }
}

/**
 * Dispatch an in-app alert for a newly submitted pending request
 */
export function triggerPendingRequestAlert(payload: PendingAlertPayload): void {
  playAdminNotificationSound();

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('goodlife:new_pending_request', { detail: payload })
    );
  }
}

/**
 * Sets up Firestore real-time onSnapshot listeners with `query` filters for 'pending' statuses
 */
export function setupAdminFirestoreListeners(options: {
  onNewDeposit?: (data: any) => void;
  onDepositChange?: (data: any, type: 'added' | 'modified' | 'removed') => void;
  onNewOrder?: (data: any) => void;
  onNewVerification?: (data: any) => void;
  onAnyPendingAlert?: (alert: PendingAlertPayload) => void;
} = {}): () => void {
  const unsubs: Unsubscribe[] = [];

  let initialDepositsLoaded = false;
  let initialOrdersLoaded = false;
  let initialVerificationsLoaded = false;

  const knownDepositIds = new Set<string>();
  const knownOrderIds = new Set<string>();
  const knownVerificationIds = new Set<string>();

  // 0. Connect to Server-Sent Events (SSE) stream for real-time backend updates
  let eventSource: EventSource | null = null;
  try {
    if (typeof window !== 'undefined') {
      eventSource = createSafeEventSource('/api/realtime/events');
      if (eventSource) {
        eventSource.onmessage = (e) => {
          try {
            if (!e.data || e.data.startsWith(':')) return;
            const payload = JSON.parse(e.data);
            if (payload && payload.type === 'new_deposit' && payload.deposit) {
              const d = payload.deposit;
              if (!knownDepositIds.has(d.id)) {
                knownDepositIds.add(d.id);
                playAdminNotificationSound();
                const alertPayload: PendingAlertPayload = {
                  type: 'deposit',
                  id: d.id,
                  title: 'নতুন ডিপোজিট রিকোয়েস্ট!',
                  message: `ইউজার ${d.userName || 'গ্রাহক'} ৳${d.amount || 0} ডিপোজিট রিকোয়েস্ট জমা দিয়েছেন।`,
                  amount: d.amount,
                  userName: d.userName,
                  userPhone: d.userPhone || d.senderPhone
                };
                options.onAnyPendingAlert?.(alertPayload);
                options.onNewDeposit?.(d);
                window.dispatchEvent(new CustomEvent('goodlife:deposit_updated', { detail: d }));
              }
            } else if (payload && payload.type === 'deposit_approved' && payload.deposit) {
              window.dispatchEvent(new CustomEvent('goodlife:deposit_updated', { detail: payload.deposit }));
              window.dispatchEvent(new CustomEvent('goodlife:wallet_updated', { detail: payload }));
            } else if (payload && payload.type === 'deposit_rejected' && payload.deposit) {
              window.dispatchEvent(new CustomEvent('goodlife:deposit_updated', { detail: payload.deposit }));
            } else if (payload && (payload.type === 'user_updated' || payload.type === 'user_registered')) {
              window.dispatchEvent(new CustomEvent('goodlife:user_updated', { detail: payload.user }));
              window.dispatchEvent(new CustomEvent('goodlife:users_updated', { detail: payload.user }));
            }
          } catch (err) {
            // ignore parsing ping
          }
        };
      }
    }
  } catch (err) {
    console.warn('Could not establish SSE connection:', err);
  }

  // 1. Deposits Listener: query(collection(db, 'deposit_requests'), where('status', '==', 'pending'))
  try {
    const depQuery = query(
      collection(db, 'deposit_requests'),
      where('status', '==', 'pending')
    );

    const unsubDep = onSnapshot(depQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const id = change.doc.id;
        const data = { id, ...change.doc.data() } as any;

        if (change.type === 'added') {
          if (initialDepositsLoaded && !knownDepositIds.has(id)) {
            playAdminNotificationSound();
            const alertPayload: PendingAlertPayload = {
              type: 'deposit',
              id,
              title: 'নতুন ডিপোজিট রিকোয়েস্ট!',
              message: `ইউজার ${data.userName || 'গ্রাহক'} ৳${data.amount || 0} ডিপোজিট রিকোয়েস্ট জমা দিয়েছেন।`,
              amount: data.amount,
              userName: data.userName,
              userPhone: data.userPhone || data.senderPhone
            };
            options.onAnyPendingAlert?.(alertPayload);
            options.onNewDeposit?.(data);
          }
          knownDepositIds.add(id);
          options.onDepositChange?.(data, 'added');
        } else if (change.type === 'modified') {
          options.onDepositChange?.(data, 'modified');
        } else if (change.type === 'removed') {
          knownDepositIds.delete(id);
          options.onDepositChange?.(data, 'removed');
        }
      });
      initialDepositsLoaded = true;
    }, (error) => {
      console.warn('Firestore deposits onSnapshot fallback:', error.message);
    });

    unsubs.push(unsubDep);
  } catch (err) {
    console.warn('Could not attach Firestore deposits listener:', err);
  }

  // 2. Orders Listener: query(collection(db, 'orders'), where('status', '==', 'pending'))
  try {
    const ordQuery = query(
      collection(db, 'orders'),
      where('status', '==', 'pending')
    );

    const unsubOrd = onSnapshot(ordQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const id = change.doc.id;
        const data = { id, ...change.doc.data() } as any;

        if (change.type === 'added') {
          if (initialOrdersLoaded && !knownOrderIds.has(id)) {
            playAdminNotificationSound();
            const alertPayload: PendingAlertPayload = {
              type: 'order',
              id,
              title: 'নতুন রিসেলিং/শপ অর্ডার!',
              message: `অর্ডার #${id} পর্যালোচনা ও পেমেন্ট ভেরিফিকেশনের জন্য অপেক্ষমাণ।`,
              amount: data.total,
              userName: data.customerName,
              userPhone: data.phone
            };
            options.onAnyPendingAlert?.(alertPayload);
            options.onNewOrder?.(data);
          }
          knownOrderIds.add(id);
        } else if (change.type === 'removed') {
          knownOrderIds.delete(id);
        }
      });
      initialOrdersLoaded = true;
    }, (error) => {
      console.warn('Firestore orders onSnapshot fallback:', error.message);
    });

    unsubs.push(unsubOrd);
  } catch (err) {
    console.warn('Could not attach Firestore orders listener:', err);
  }

  // 3. Verifications Listener: query(collection(db, 'verification_requests'), where('status', '==', 'pending'))
  try {
    const verQuery = query(
      collection(db, 'verification_requests'),
      where('status', '==', 'pending')
    );

    const unsubVer = onSnapshot(verQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const id = change.doc.id;
        const data = { id, ...change.doc.data() } as any;

        if (change.type === 'added') {
          if (initialVerificationsLoaded && !knownVerificationIds.has(id)) {
            playAdminNotificationSound();
            const alertPayload: PendingAlertPayload = {
              type: 'verification',
              id,
              title: 'নতুন প্রোফাইল ভেরিফিকেশন আবেদন!',
              message: `ইউজার ${data.userName || data.userPhone || 'গ্রাহক'} ভেরিফিকেশন আবেদন পাঠিয়েছেন।`,
              userName: data.userName,
              userPhone: data.userPhone,
              amount: data.amount
            };
            options.onAnyPendingAlert?.(alertPayload);
            options.onNewVerification?.(data);
          }
          knownVerificationIds.add(id);
        } else if (change.type === 'removed') {
          knownVerificationIds.delete(id);
        }
      });
      initialVerificationsLoaded = true;
    }, (error) => {
      console.warn('Firestore verification onSnapshot fallback:', error.message);
    });

    unsubs.push(unsubVer);
  } catch (err) {
    console.warn('Could not attach Firestore verifications listener:', err);
  }

  // Also listen for local custom events for instant zero-latency feedback
  const handleLocalEvent = (e: Event) => {
    const custom = e as CustomEvent<PendingAlertPayload>;
    if (custom.detail) {
      options.onAnyPendingAlert?.(custom.detail);
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('goodlife:new_pending_request', handleLocalEvent);
  }

  return () => {
    if (eventSource) {
      try {
        eventSource.close();
      } catch {}
    }
    unsubs.forEach(u => {
      try {
        u();
      } catch {}
    });
    if (typeof window !== 'undefined') {
      window.removeEventListener('goodlife:new_pending_request', handleLocalEvent);
    }
  };
}
