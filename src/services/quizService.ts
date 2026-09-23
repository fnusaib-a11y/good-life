import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db, ensureFirebaseAuth } from '../lib/firebase';
import { QuizQuestionItem, QuizSettings, QuizAttemptRecord } from '../types';

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

const STORAGE_KEY_QUIZ_SETTINGS = 'gl_quiz_settings_v1';
const STORAGE_KEY_QUIZ_QUESTIONS = 'gl_quiz_questions_v1';
const STORAGE_KEY_QUIZ_ATTEMPTS = 'gl_quiz_attempts_v1';

export const DEFAULT_QUIZ_SETTINGS: QuizSettings = {
  id: 'main_config',
  enabled: true,
  title: 'আজকের কুইজ চ্যালেঞ্জ',
  description: 'সাধারণ জ্ঞান ও মেধা যাচাই কুইজে অংশ নিন এবং প্রতি কুইজে নিশ্চিত রিওয়ার্ড পয়েন্ট অর্জন করুন।',
  totalQuestions: 5,
  rewardPoints: 20,
  timeLimitSeconds: 30, // 30s per question or per session
  dailyAttemptLimit: 1,
  startDate: '',
  endDate: '',
  isActive: true,
  adProvider: 'adsterra', // 'adsterra' | 'monetag' | 'auto'
  adsterraKey: 'a5ea718688da962e97053af64e1de8f0',
  adsterraDirectUrl: '',
  beforeQuizAdEnabled: true, // Quiz-এর আগে Ad Network Ad Enable/Disable
  afterQuizAdEnabled: true,  // Quiz-এর পরে Ad Network Ad Enable/Disable
  firstAd: {
    enabled: true,
    contentType: 'ad',
    videoUrl: '',
    adUrl: '',
    title: 'Ad Network বিজ্ঞাপন ১ (কুইজ শুরু)',
    sponsorName: 'Monetag Ad Network',
    durationSeconds: 15
  },
  secondAd: {
    enabled: true,
    contentType: 'ad',
    videoUrl: '',
    adUrl: '',
    title: 'Ad Network বিজ্ঞাপন ২ (রিওয়ার্ড আনলক)',
    sponsorName: 'Monetag Ad Network',
    durationSeconds: 15
  }
};

export const INITIAL_QUIZ_QUESTIONS: QuizQuestionItem[] = [
  {
    id: 'q1',
    order: 1,
    question: 'বাংলাদেশের জাতীয় কবি কে?',
    options: {
      A: 'রবীন্দ্রনাথ ঠাকুর',
      B: 'কাজী নজরুল ইসলাম',
      C: 'জসীম উদ্দীন',
      D: 'জীবনানন্দ দাশ'
    },
    correctAnswer: 'B',
    explanation: 'কাজী নজরুল ইসলাম বাংলাদেশের জাতীয় কবি।'
  },
  {
    id: 'q2',
    order: 2,
    question: 'পদ্মা সেতু কবে আনুষ্ঠানিকভাবে উদ্বোধন করা হয়?',
    options: {
      A: '২৫ জুন ২০২২',
      B: '১৬ ডিসেম্বর ২০২১',
      C: '২৬ মার্চ ২০২৩',
      D: '১ জানুয়ারি ২০২২'
    },
    correctAnswer: 'A',
    explanation: 'মাননীয় প্রধানমন্ত্রী ২৫ জুন ২০২২ তারিখে পদ্মা সেতু উদ্বোধন করেন।'
  },
  {
    id: 'q3',
    order: 3,
    question: 'কম্পিউটারের মস্তিষ্ক (Brain of Computer) কাকে বলা হয়?',
    options: {
      A: 'RAM (Random Access Memory)',
      B: 'Hard Disk',
      C: 'CPU (Central Processing Unit)',
      D: 'Motherboard'
    },
    correctAnswer: 'C',
    explanation: 'CPU পুরো কম্পিউটারের যাবতীয় হিসাব ও কমান্ড নিয়ন্ত্রণ করে।'
  },
  {
    id: 'q4',
    order: 4,
    question: 'বিশ্বের দীর্ঘতম প্রাকৃতিক সমুদ্র সৈকত কোনটি?',
    options: {
      A: 'কুয়াকাটা সমুদ্র সৈকত',
      B: 'কক্সবাজার সমুদ্র সৈকত',
      C: 'সেন্টমার্টিন সৈকত',
      D: 'পতেঙ্গা সৈকত'
    },
    correctAnswer: 'B',
    explanation: 'কক্সবাজার সমুদ্র সৈকত বিশ্বের দীর্ঘতম অখণ্ডিত প্রাকৃতিক বালুকাময় সমুদ্র সৈকত (১২০ কিমি)।'
  },
  {
    id: 'q5',
    order: 5,
    question: 'ইসলামের প্রথম খলিফা কে ছিলেন?',
    options: {
      A: 'হযরত উমর (রা.)',
      B: 'হযরত আবু বকর সিদ্দিক (রা.)',
      C: 'হযরত উসমান (রা.)',
      D: 'হযরত আলী (রা.)'
    },
    correctAnswer: 'B',
    explanation: 'হযরত আবু বকর সিদ্দিক (রা.) ছিলেন ইসলামের প্রথম খলিফা।'
  },
  {
    id: 'q6',
    order: 6,
    question: 'সূর্যোদয়ের দেশ বলা হয় কোন দেশকে?',
    options: {
      A: 'চীন',
      B: 'নরওয়ে',
      C: 'জাপান',
      D: 'দক্ষিণ কোরিয়া'
    },
    correctAnswer: 'C',
    explanation: 'জাপানকে সূর্যোদয়ের দেশ (Land of the Rising Sun) বলা হয়।'
  },
  {
    id: 'q7',
    order: 7,
    question: 'বাংলাদেশের সাংবিধানিক নাম কী?',
    options: {
      A: 'গণপ্রজাতন্ত্রী বাংলাদেশ',
      B: 'বাংলাদেশ প্রজাতন্ত্র',
      C: 'ইসলামী প্রজাতন্ত্র বাংলাদেশ',
      D: 'যুক্তরাষ্ট্রীয় বাংলাদেশ'
    },
    correctAnswer: 'A',
    explanation: 'সংবিধান অনুযায়ী আমাদের দেশের রাষ্ট্রীয় নাম "গণপ্রজাতন্ত্রী বাংলাদেশ"।'
  },
  {
    id: 'q8',
    order: 8,
    question: 'সবচেয়ে দ্রুতগতির ইন্টারনেট সংযোগ প্রযুক্তি কোনটি?',
    options: {
      A: 'DSL কেবল',
      B: 'অপটিক্যাল ফাইবার (Optical Fiber)',
      C: 'ডায়াল আপ',
      D: 'কোক্সিয়াল কেবল'
    },
    correctAnswer: 'B',
    explanation: 'অপটিক্যাল ফাইবারে আলোর গতিতে ডাটা পরিবাহিত হয়।'
  }
];

// Helper for local storage read/write
function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn(`[QuizStorage] Failed to read ${key}:`, e);
  }
  return fallback;
}

function writeLocal(key: string, data: any) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`[QuizStorage] Failed to write ${key}:`, e);
  }
}

/**
 * Fetch Quiz Settings from Server API / Firestore with Local Storage cache
 */
export async function fetchQuizSettings(): Promise<QuizSettings> {
  const cached = readLocal<QuizSettings>(STORAGE_KEY_QUIZ_SETTINGS, DEFAULT_QUIZ_SETTINGS);

  // 1. Try server API first
  try {
    const res = await fetch('/api/quiz/settings');
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.settings) {
        const merged: QuizSettings = {
          ...DEFAULT_QUIZ_SETTINGS,
          ...json.settings,
          adProvider: json.settings.adProvider || 'adsterra',
          adsterraKey: json.settings.adsterraKey || DEFAULT_QUIZ_SETTINGS.adsterraKey || 'a5ea718688da962e97053af64e1de8f0',
          adsterraDirectUrl: json.settings.adsterraDirectUrl || '',
          beforeQuizAdEnabled: json.settings.beforeQuizAdEnabled ?? json.settings.firstAd?.enabled ?? true,
          afterQuizAdEnabled: json.settings.afterQuizAdEnabled ?? json.settings.secondAd?.enabled ?? true,
          firstAd: { ...DEFAULT_QUIZ_SETTINGS.firstAd, ...(json.settings.firstAd || {}) },
          secondAd: { ...DEFAULT_QUIZ_SETTINGS.secondAd, ...(json.settings.secondAd || {}) }
        };
        writeLocal(STORAGE_KEY_QUIZ_SETTINGS, merged);
        return merged;
      }
    }
  } catch {
    // continue to Firestore or cached
  }

  // 2. Try Firestore fallback
  try {
    const docRef = doc(db, 'quiz_settings', 'main_config');
    const snap = await fetchWithTimeout(getDoc(docRef), 2500);
    if (snap.exists()) {
      const data = snap.data() as QuizSettings;
      const merged: QuizSettings = {
        ...DEFAULT_QUIZ_SETTINGS,
        ...data,
        adProvider: data.adProvider || 'adsterra',
        adsterraKey: data.adsterraKey || DEFAULT_QUIZ_SETTINGS.adsterraKey || 'a5ea718688da962e97053af64e1de8f0',
        adsterraDirectUrl: data.adsterraDirectUrl || '',
        beforeQuizAdEnabled: data.beforeQuizAdEnabled ?? data.firstAd?.enabled ?? true,
        afterQuizAdEnabled: data.afterQuizAdEnabled ?? data.secondAd?.enabled ?? true,
        firstAd: { ...DEFAULT_QUIZ_SETTINGS.firstAd, ...(data.firstAd || {}) },
        secondAd: { ...DEFAULT_QUIZ_SETTINGS.secondAd, ...(data.secondAd || {}) }
      };
      writeLocal(STORAGE_KEY_QUIZ_SETTINGS, merged);
      return merged;
    }
  } catch (err: any) {
    console.warn('[QuizService] Firestore settings fetch notice, using local/default:', err?.message || err);
  }
  return cached;
}

/**
 * Save Quiz Settings (Admin)
 */
export async function saveQuizSettingsToDb(settings: QuizSettings): Promise<boolean> {
  const toSave = {
    ...settings,
    updatedAt: new Date().toISOString()
  };
  writeLocal(STORAGE_KEY_QUIZ_SETTINGS, toSave);

  // 1. Save to server API
  try {
    await fetch('/api/quiz/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toSave)
    });
  } catch {
    // continue
  }

  // 2. Safe sync to Firestore
  try {
    await ensureFirebaseAuth().catch(() => null);
    const docRef = doc(db, 'quiz_settings', 'main_config');
    await fetchWithTimeout(setDoc(docRef, toSave, { merge: true }), 2500);
  } catch (err: any) {
    console.warn('[QuizService] Firestore settings sync notice (saved locally/server):', err?.message || err);
  }
  return true;
}

/**
 * Fetch All Quiz Questions from Server API / Firestore
 */
export async function fetchQuizQuestions(): Promise<QuizQuestionItem[]> {
  const cached = readLocal<QuizQuestionItem[]>(STORAGE_KEY_QUIZ_QUESTIONS, INITIAL_QUIZ_QUESTIONS);

  // 1. Try server API first
  try {
    const res = await fetch('/api/quiz/questions');
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.questions) && json.questions.length > 0) {
        json.questions.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
        writeLocal(STORAGE_KEY_QUIZ_QUESTIONS, json.questions);
        return json.questions;
      }
    }
  } catch {
    // continue to Firestore or cached
  }

  // 2. Try Firestore fallback
  try {
    const colRef = collection(db, 'quiz_questions');
    const snap = await fetchWithTimeout(getDocs(colRef), 2500);
    if (!snap.empty) {
      const list: QuizQuestionItem[] = [];
      snap.forEach(d => {
        list.push({ id: d.id, ...d.data() } as QuizQuestionItem);
      });
      list.sort((a, b) => (a.order || 0) - (b.order || 0));
      writeLocal(STORAGE_KEY_QUIZ_QUESTIONS, list);
      return list;
    }
  } catch (err: any) {
    console.warn('[QuizService] Firestore questions fetch notice, using cached:', err?.message || err);
  }
  return cached;
}

/**
 * Save single Quiz Question (Create or Edit)
 */
export async function saveQuizQuestionToDb(question: QuizQuestionItem): Promise<boolean> {
  const current = readLocal<QuizQuestionItem[]>(STORAGE_KEY_QUIZ_QUESTIONS, INITIAL_QUIZ_QUESTIONS);
  const idx = current.findIndex(q => q.id === question.id);
  let next: QuizQuestionItem[];
  if (idx >= 0) {
    next = [...current];
    next[idx] = question;
  } else {
    next = [...current, question];
  }
  next.sort((a, b) => (a.order || 0) - (b.order || 0));
  writeLocal(STORAGE_KEY_QUIZ_QUESTIONS, next);

  // 1. Save to server API
  try {
    await fetch('/api/quiz/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(question)
    });
  } catch {
    // continue
  }

  // 2. Safe sync to Firestore
  try {
    await ensureFirebaseAuth().catch(() => null);
    const docRef = doc(db, 'quiz_questions', question.id);
    await fetchWithTimeout(setDoc(docRef, question, { merge: true }), 2500);
  } catch (err: any) {
    console.warn('[QuizService] Firestore question sync notice (saved locally/server):', err?.message || err);
  }
  return true;
}

/**
 * Delete Quiz Question
 */
export async function deleteQuizQuestionFromDb(questionId: string): Promise<boolean> {
  const current = readLocal<QuizQuestionItem[]>(STORAGE_KEY_QUIZ_QUESTIONS, INITIAL_QUIZ_QUESTIONS);
  const next = current.filter(q => q.id !== questionId);
  writeLocal(STORAGE_KEY_QUIZ_QUESTIONS, next);

  // 1. Delete on server API
  try {
    await fetch(`/api/quiz/questions/${encodeURIComponent(questionId)}`, {
      method: 'DELETE'
    });
  } catch {
    // continue
  }

  // 2. Safe delete from Firestore
  try {
    await ensureFirebaseAuth().catch(() => null);
    const docRef = doc(db, 'quiz_questions', questionId);
    await fetchWithTimeout(deleteDoc(docRef), 2500);
  } catch (err: any) {
    console.warn('[QuizService] Firestore question delete notice (removed locally/server):', err?.message || err);
  }
  return true;
}

/**
 * Batch reorder Quiz Questions
 */
export async function reorderQuizQuestionsInDb(questions: QuizQuestionItem[]): Promise<boolean> {
  const updated = questions.map((q, i) => ({ ...q, order: i + 1 }));
  writeLocal(STORAGE_KEY_QUIZ_QUESTIONS, updated);

  // 1. Save reorder to server API
  try {
    await fetch('/api/quiz/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });
  } catch {
    // continue
  }

  // 2. Safe sync to Firestore
  try {
    await ensureFirebaseAuth().catch(() => null);
    for (const q of updated) {
      await fetchWithTimeout(setDoc(doc(db, 'quiz_questions', q.id), { order: q.order }, { merge: true }), 2000);
    }
  } catch (err: any) {
    console.warn('[QuizService] Firestore reorder sync notice (reordered locally/server):', err?.message || err);
  }
  return true;
}

/**
 * Record a Quiz Attempt (with duplicate prevention by attemptId)
 */
export async function recordQuizAttemptToDb(attempt: QuizAttemptRecord): Promise<boolean> {
  if (!attempt || !attempt.attemptId) return false;

  // 1. Local storage check & save
  const allAttempts = readLocal<QuizAttemptRecord[]>(STORAGE_KEY_QUIZ_ATTEMPTS, []);
  const existingIdx = allAttempts.findIndex(a => a.attemptId === attempt.attemptId);
  if (existingIdx >= 0) {
    allAttempts[existingIdx] = attempt;
  } else {
    allAttempts.unshift(attempt);
  }
  writeLocal(STORAGE_KEY_QUIZ_ATTEMPTS, allAttempts);

  // 2. Save to backend server API
  try {
    await fetch('/api/quiz/attempts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(attempt)
    });
  } catch {
    // continue
  }

  // 3. Graceful sync to Firestore (using anonymous auth & timeout)
  try {
    await ensureFirebaseAuth().catch(() => null);
    const docRef = doc(db, 'quiz_attempts', attempt.attemptId);
    await fetchWithTimeout(setDoc(docRef, attempt, { merge: true }), 3000);
  } catch (err: any) {
    console.warn('[QuizService] Firestore attempt sync notice (operating in seamless local/server persistence mode):', err?.message || err);
  }

  return true;
}

/**
 * Fetch Quiz Attempts for a Specific User
 */
export async function fetchUserQuizAttempts(userId: string): Promise<QuizAttemptRecord[]> {
  if (!userId) return [];
  const localAll = readLocal<QuizAttemptRecord[]>(STORAGE_KEY_QUIZ_ATTEMPTS, []);
  const userLocal = localAll.filter(a => a.userId === userId);

  // 1. Try server API
  try {
    const res = await fetch(`/api/quiz/attempts?userId=${encodeURIComponent(userId)}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.attempts) && json.attempts.length > 0) {
        return json.attempts.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      }
    }
  } catch {
    // continue
  }

  // 2. Try Firestore
  try {
    const colRef = collection(db, 'quiz_attempts');
    const q = query(colRef, where('userId', '==', userId));
    const snap = await fetchWithTimeout(getDocs(q), 2500);
    if (!snap.empty) {
      const list: QuizAttemptRecord[] = [];
      snap.forEach(d => {
        list.push({ id: d.id, ...d.data() } as QuizAttemptRecord);
      });
      list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      return list;
    }
  } catch (err: any) {
    console.warn('[QuizService] Firestore fetch user attempts notice, using local:', err?.message || err);
  }
  return userLocal.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/**
 * Fetch All Quiz Attempts (Admin only)
 */
export async function fetchAllQuizAttempts(): Promise<QuizAttemptRecord[]> {
  const localAll = readLocal<QuizAttemptRecord[]>(STORAGE_KEY_QUIZ_ATTEMPTS, []);

  // 1. Try server API
  try {
    const res = await fetch('/api/quiz/attempts');
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.attempts) && json.attempts.length > 0) {
        return json.attempts.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      }
    }
  } catch {
    // continue
  }

  // 2. Try Firestore
  try {
    const colRef = collection(db, 'quiz_attempts');
    const snap = await fetchWithTimeout(getDocs(colRef), 2500);
    if (!snap.empty) {
      const list: QuizAttemptRecord[] = [];
      snap.forEach(d => {
        list.push({ id: d.id, ...d.data() } as QuizAttemptRecord);
      });
      list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      return list;
    }
  } catch (err: any) {
    console.warn('[QuizService] Firestore fetch all attempts notice, using local:', err?.message || err);
  }
  return localAll.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}
