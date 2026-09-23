import { TypingJobItem, TypingSubmissionRecord, TypingSettings } from '../types';

const STORAGE_KEY_TYPING_JOBS = 'gl_typing_jobs_v1';
const STORAGE_KEY_TYPING_SUBMISSIONS = 'gl_typing_submissions_v1';
const STORAGE_KEY_TYPING_SETTINGS = 'gl_typing_settings_v1';

export const DEFAULT_TYPING_SETTINGS: TypingSettings = {
  enabled: true,
  defaultReward: 20,
  defaultAdDurationSeconds: 15,
  adsterraKey: 'a5ea718688da962e97053af64e1de8f0',
  noticeText: 'সঠিক বানান ও যতিচিহ্ন বজায় রেখে টাইপ করুন। সাবমিটের পর বিজ্ঞাপন সম্পূর্ণ দেখলে রিওয়ার্ড সরাসরি অ্যাকাউন্টে যোগ হবে।'
};

export const INITIAL_TYPING_JOBS: TypingJobItem[] = [
  {
    id: 'job_madrasa_01',
    title: 'মাদ্রাসার বার্ষিক পরীক্ষার প্রশ্ন টাইপ করুন',
    description: 'সংযুক্ত প্রশ্নপত্রের ছবি দেখে প্রতিটি প্রশ্ন ও অপশন হুবহু নিচে টাইপ করে জমা দিন।',
    jobType: 'question_to_text',
    estimatedMinutes: 8,
    rewardAmount: 20,
    status: 'active',
    referenceType: 'image',
    referenceUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
    instructions: '১. প্রশ্নের ক্রমিক নম্বর ও বিরামচিহ্ন ঠিক রাখুন।\n২. বানান ভুলের দিকে সতর্ক থাকুন।\n৩. সম্পূর্ণ লেখা শেষ করে "কাজ যাচাই ও জমা দিন" বাটনে চাপুন।',
    expectedText: 'প্রশ্ন ১: ইসলামের স্তম্ভ কয়টি ও কি কি? উত্তর: ইসলামের মূল স্তম্ভ পাঁচটি— ১. ঈমান, ২. নামাজ, ৩. রোজা, ৪. হজ এবং ৫. যাকাত। প্রতিটি মুসলিমের জন্য এগুলোর প্রতি বিশ্বাস ও আমল করা আবশ্যক।',
    validationMode: 'flexible',
    minMatchPercentage: 85,
    maxCompletions: 50,
    currentCompletions: 14,
    allowMultipleSubmissionsPerUser: false,
    autoApproval: true,
    largeAdConfig: {
      enabled: true,
      provider: 'auto',
      durationSeconds: 15
    },
    createdAt: new Date(Date.now() - 3600 * 1000 * 24 * 2).toISOString()
  },
  {
    id: 'job_notice_02',
    title: 'জাতীয় পরিচয়পত্র সংক্রান্ত নোটিশ টাইপ',
    description: 'সরকারী অফিসিয়াল নোটিশের স্ক্যান কপি দেখে টেক্সট ফিল্ডে নির্ভুলভাবে লিপিবদ্ধ করুন।',
    jobType: 'document_to_text',
    estimatedMinutes: 6,
    rewardAmount: 18,
    status: 'active',
    referenceType: 'image',
    referenceUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
    instructions: 'তারিখ, স্মারক নম্বর এবং অনুচ্ছেদগুলো সঠিকভাবে লিখুন। কোন অতিরিক্ত শব্দ যোগ করবেন না।',
    expectedText: 'স্মারক নং: ৪২.০১.০০০.১২৩. তারিখ: ১৫ মার্চ ২০২৬। সংশ্লিষ্ট সকলের অবগতির জন্য জানানো যাচ্ছে যে, আগামী রবিবার হতে এনআইডি সংশোধন ও বায়োমেট্রিক আপডেট কার্যক্রম সকাল ১০ ঘটিকায় শুরু হবে।',
    validationMode: 'flexible',
    minMatchPercentage: 85,
    maxCompletions: 100,
    currentCompletions: 32,
    allowMultipleSubmissionsPerUser: false,
    autoApproval: true,
    largeAdConfig: {
      enabled: true,
      provider: 'auto',
      durationSeconds: 15
    },
    createdAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString()
  },
  {
    id: 'job_invoice_03',
    title: 'দোকানের ক্যাশ মেমো বিল ভাউচার টাইপ',
    description: 'ক্যাশ মেমোর পণ্যের বিবরণ, পরিমাণ ও মোট টাকার হিসাব নিচে টাইপ করুন।',
    jobType: 'screenshot_to_text',
    estimatedMinutes: 5,
    rewardAmount: 15,
    status: 'active',
    referenceType: 'image',
    referenceUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80',
    instructions: 'পণ্যের নাম ও দাম বাংলায় টাইপ করতে হবে। মোট টাকার পরিমাণ মিল থাকতে হবে।',
    expectedText: 'ক্যাশ মেমো নং: ৮৮৯২। খদ্দেরের নাম: তানভীর হাসান। পণ্যের বিবরণ: চাল ২৫ কেজি— ৳১৮৫০, সয়াবিন তেল ৫ লিটার— ৳৮৮০, ডাল ২ কেজি— ৳২৬০। সর্বমোট পরিশোধিত বিল: ৳২৯৯০ টাকা মাত্র।',
    validationMode: 'strict',
    minMatchPercentage: 92,
    maxCompletions: 40,
    currentCompletions: 8,
    allowMultipleSubmissionsPerUser: false,
    autoApproval: true,
    createdAt: new Date(Date.now() - 3600 * 1000 * 6).toISOString()
  }
];

function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeLocal<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`[TypingJobService] Failed to write localStorage key ${key}`, e);
  }
}

/**
 * Text Normalization for Bangla & English
 */
export function normalizeTypingText(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[“”"']/g, '"')
    .replace(/[—–]/g, '-')
    .trim();
}

/**
 * Calculate Levenshtein similarity distance between two strings
 */
function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  if (m === 0) return n;
  if (n === 0) return m;

  // Use rolling array to minimize memory footprint
  let v0 = new Int32Array(n + 1);
  let v1 = new Int32Array(n + 1);

  for (let i = 0; i <= n; i++) {
    v0[i] = i;
  }

  for (let i = 0; i < m; i++) {
    v1[0] = i + 1;
    const ch1 = s1.charCodeAt(i);
    for (let j = 0; j < n; j++) {
      const cost = ch1 === s2.charCodeAt(j) ? 0 : 1;
      v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost);
    }
    for (let j = 0; j <= n; j++) {
      v0[j] = v1[j];
    }
  }

  return v0[n];
}

/**
 * Detailed Typing Accuracy Result
 */
export interface TypingAccuracyResult {
  matchPercentage: number;
  isPassed: boolean;
  expectedWordCount: number;
  submittedWordCount: number;
  missingWords: string[];
  extraWords: string[];
  feedbackMessage: string;
}

/**
 * Validate User Typing against Expected Text
 */
export function validateTypingAccuracy(
  submitted: string,
  expected: string,
  mode: 'strict' | 'flexible' | 'manual_only' = 'flexible',
  customMinPercent = 85
): TypingAccuracyResult {
  const normSubmitted = normalizeTypingText(submitted);
  const normExpected = normalizeTypingText(expected);

  if (!normSubmitted) {
    return {
      matchPercentage: 0,
      isPassed: false,
      expectedWordCount: normExpected.split(' ').filter(Boolean).length,
      submittedWordCount: 0,
      missingWords: [],
      extraWords: [],
      feedbackMessage: 'কোনো লেখা দেওয়া হয়নি। অনুগ্রহ করে টাইপ করে জমা দিন।'
    };
  }

  const expectedWords = normExpected.split(' ').filter(Boolean);
  const submittedWords = normSubmitted.split(' ').filter(Boolean);

  // Levenshtein character-based similarity
  const maxLen = Math.max(normSubmitted.length, normExpected.length);
  const charDist = levenshteinDistance(normSubmitted, normExpected);
  const charSimilarity = maxLen === 0 ? 100 : Math.max(0, (1 - charDist / maxLen) * 100);

  // Word-based overlap similarity
  const expectedWordSet = new Map<string, number>();
  for (const w of expectedWords) {
    expectedWordSet.set(w, (expectedWordSet.get(w) || 0) + 1);
  }

  let matchedWordCount = 0;
  const submittedWordCountMap = new Map<string, number>();
  for (const w of submittedWords) {
    submittedWordCountMap.set(w, (submittedWordCountMap.get(w) || 0) + 1);
    const inExp = expectedWordSet.get(w) || 0;
    if (inExp > 0) {
      matchedWordCount++;
      expectedWordSet.set(w, inExp - 1);
    }
  }

  const wordSimilarity = expectedWords.length === 0 ? 100 : (matchedWordCount / expectedWords.length) * 100;
  
  // Weighted score: 60% character accuracy, 40% word accuracy
  const finalPercentage = Math.round((charSimilarity * 0.6 + wordSimilarity * 0.4) * 10) / 10;

  // Find missing and extra words for constructive feedback
  const missingWords: string[] = [];
  expectedWords.forEach(w => {
    if (!normSubmitted.includes(w) && !missingWords.includes(w)) {
      missingWords.push(w);
    }
  });

  const extraWords: string[] = [];
  submittedWords.forEach(w => {
    if (!normExpected.includes(w) && !extraWords.includes(w)) {
      extraWords.push(w);
    }
  });

  const requiredThreshold = mode === 'strict' ? 95 : mode === 'flexible' ? customMinPercent : 0;
  const isPassed = mode === 'manual_only' ? true : finalPercentage >= requiredThreshold;

  let feedbackMessage = '';
  if (isPassed) {
    feedbackMessage = `চমৎকার! আপনার টাইপিং নির্ভুলতা ${finalPercentage}%। নির্দেশিত থ্রেশহোল্ড অতিক্রম করেছে।`;
  } else {
    feedbackMessage = `টাইপিংয়ের নির্ভুলতা ${finalPercentage}%, যা প্রয়োজনের চেয়ে কম (প্রয়োজন ${requiredThreshold}%)। অনুগ্রহ করে বানান এবং শব্দ মিলিয়ে আবার চেষ্টা করুন।`;
  }

  return {
    matchPercentage: finalPercentage,
    isPassed,
    expectedWordCount: expectedWords.length,
    submittedWordCount: submittedWords.length,
    missingWords: missingWords.slice(0, 5),
    extraWords: extraWords.slice(0, 5),
    feedbackMessage
  };
}

/**
 * Fetch all typing jobs (tries Server API with localStorage fallback)
 */
export async function fetchTypingJobs(): Promise<TypingJobItem[]> {
  const localJobs = readLocal<TypingJobItem[]>(STORAGE_KEY_TYPING_JOBS, INITIAL_TYPING_JOBS);
  try {
    const res = await fetch('/api/typing/jobs');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.jobs) && data.jobs.length > 0) {
        writeLocal(STORAGE_KEY_TYPING_JOBS, data.jobs);
        return data.jobs;
      }
    }
  } catch {
    // offline/server error fallback
  }
  return localJobs;
}

/**
 * Save or Update a Typing Job
 */
export async function saveTypingJob(job: TypingJobItem): Promise<boolean> {
  const all = readLocal<TypingJobItem[]>(STORAGE_KEY_TYPING_JOBS, INITIAL_TYPING_JOBS);
  const idx = all.findIndex(j => j.id === job.id);
  if (idx >= 0) {
    all[idx] = { ...job, updatedAt: new Date().toISOString() };
  } else {
    all.unshift({ ...job, createdAt: new Date().toISOString() });
  }
  writeLocal(STORAGE_KEY_TYPING_JOBS, all);

  try {
    await fetch('/api/typing/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(job)
    });
  } catch (err) {
    console.warn('[TypingJobService] Server sync notice:', err);
  }

  return true;
}

/**
 * Delete a Typing Job
 */
export async function deleteTypingJob(jobId: string): Promise<boolean> {
  const all = readLocal<TypingJobItem[]>(STORAGE_KEY_TYPING_JOBS, INITIAL_TYPING_JOBS);
  const filtered = all.filter(j => j.id !== jobId);
  writeLocal(STORAGE_KEY_TYPING_JOBS, filtered);

  try {
    await fetch(`/api/typing/jobs/${jobId}`, { method: 'DELETE' });
  } catch {
    // continue
  }
  return true;
}

/**
 * Fetch Submissions (filtered by user if requested)
 */
export async function fetchTypingSubmissions(userId?: string): Promise<TypingSubmissionRecord[]> {
  const local = readLocal<TypingSubmissionRecord[]>(STORAGE_KEY_TYPING_SUBMISSIONS, []);
  try {
    const url = userId ? `/api/typing/submissions?userId=${encodeURIComponent(userId)}` : '/api/typing/submissions';
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.submissions)) {
        writeLocal(STORAGE_KEY_TYPING_SUBMISSIONS, data.submissions);
        return userId ? data.submissions.filter((s: any) => s.userId === userId) : data.submissions;
      }
    }
  } catch {
    // fallback
  }
  return userId ? local.filter(s => s.userId === userId) : local;
}

/**
 * Submit Typing Job
 */
export async function submitTypingJob(submission: TypingSubmissionRecord): Promise<{ success: boolean; message?: string }> {
  if (!submission || !submission.submissionId) {
    return { success: false, message: 'Invalid submission data' };
  }

  const all = readLocal<TypingSubmissionRecord[]>(STORAGE_KEY_TYPING_SUBMISSIONS, []);
  
  // Check if this exact submissionId was already processed to prevent double-rewards
  const existingIdx = all.findIndex(s => s.submissionId === submission.submissionId);
  if (existingIdx >= 0) {
    all[existingIdx] = submission;
  } else {
    all.unshift(submission);
  }
  writeLocal(STORAGE_KEY_TYPING_SUBMISSIONS, all);

  // Increment completion counter on the job
  const jobs = readLocal<TypingJobItem[]>(STORAGE_KEY_TYPING_JOBS, INITIAL_TYPING_JOBS);
  const targetJob = jobs.find(j => j.id === submission.jobId);
  if (targetJob) {
    targetJob.currentCompletions = (targetJob.currentCompletions || 0) + 1;
    writeLocal(STORAGE_KEY_TYPING_JOBS, jobs);
  }

  try {
    const res = await fetch('/api/typing/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submission)
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, message: data.message };
    }
  } catch (err) {
    console.warn('[TypingJobService] Server submission notice:', err);
  }

  return { success: true };
}

/**
 * Admin Review a Submission (Approve or Reject)
 */
export async function reviewTypingSubmission(
  submissionId: string,
  status: 'approved' | 'rejected',
  adminNote?: string,
  reviewerName?: string
): Promise<{ success: boolean; submission?: TypingSubmissionRecord }> {
  const all = readLocal<TypingSubmissionRecord[]>(STORAGE_KEY_TYPING_SUBMISSIONS, []);
  const sub = all.find(s => s.id === submissionId || s.submissionId === submissionId);
  if (!sub) return { success: false };

  sub.status = status;
  sub.adminNote = adminNote || sub.adminNote;
  sub.reviewedAt = new Date().toISOString();
  sub.reviewedBy = reviewerName || 'Admin';
  if (status === 'approved') {
    sub.rewardClaimed = true;
    if (!sub.trxId) {
      sub.trxId = `trx_type_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    }
  }

  writeLocal(STORAGE_KEY_TYPING_SUBMISSIONS, all);

  try {
    const res = await fetch(`/api/typing/submissions/${encodeURIComponent(submissionId)}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, adminNote, reviewerName })
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, submission: data.submission || sub };
    }
  } catch {
    // continue with local state
  }

  return { success: true, submission: sub };
}

/**
 * Fetch Settings
 */
export async function fetchTypingSettings(): Promise<TypingSettings> {
  const local = readLocal<TypingSettings>(STORAGE_KEY_TYPING_SETTINGS, DEFAULT_TYPING_SETTINGS);
  try {
    const res = await fetch('/api/typing/settings');
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.settings) {
        writeLocal(STORAGE_KEY_TYPING_SETTINGS, data.settings);
        return data.settings;
      }
    }
  } catch {
    // continue
  }
  return local;
}

/**
 * Save Settings
 */
export async function saveTypingSettings(settings: TypingSettings): Promise<boolean> {
  writeLocal(STORAGE_KEY_TYPING_SETTINGS, settings);
  try {
    await fetch('/api/typing/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
  } catch {
    // continue
  }
  return true;
}
