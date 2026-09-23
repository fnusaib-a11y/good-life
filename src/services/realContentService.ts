import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db, ensureFirebaseAuth } from '../lib/firebase';
import {
  SkillCoursePost,
  FreelanceOpportunityItem,
  MarketingTaskItem,
  MarketingSubmissionItem
} from '../types/contentTypes';

const STORAGE_KEY_COURSES = 'lg_skill_courses_list';
const STORAGE_KEY_OPPORTUNITIES = 'lg_freelance_opportunities_list';
const STORAGE_KEY_MARKETING_TASKS = 'lg_marketing_tasks_list';
const STORAGE_KEY_MARKETING_SUBS = 'lg_marketing_subs_list';

// Helper for safe localStorage access
function getLocalItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setLocalItem(key: string, data: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

/* ==========================================================================
   1. কোর্স ও ফ্রিল্যান্সিং আবেদন (Skill Course Posts)
   ========================================================================== */

export async function getSkillCourses(activeOnly: boolean = false): Promise<SkillCoursePost[]> {
  let list = getLocalItem<SkillCoursePost[]>(STORAGE_KEY_COURSES, []);

  try {
    await ensureFirebaseAuth();
    const colRef = collection(db, 'skill_courses');
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const remoteList: SkillCoursePost[] = [];
      snap.forEach(d => {
        remoteList.push({ id: d.id, ...d.data() } as SkillCoursePost);
      });
      remoteList.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      list = remoteList;
      setLocalItem(STORAGE_KEY_COURSES, list);
    }
  } catch (err) {
    console.warn('Firestore fetch skill_courses fallback to cache:', err);
  }

  if (activeOnly) {
    return list.filter(item => item.status === 'active');
  }
  return list;
}

export async function saveSkillCourse(course: SkillCoursePost): Promise<boolean> {
  // Update local cache
  const list = getLocalItem<SkillCoursePost[]>(STORAGE_KEY_COURSES, []);
  const index = list.findIndex(c => c.id === course.id);
  if (index >= 0) {
    list[index] = course;
  } else {
    list.unshift(course);
  }
  setLocalItem(STORAGE_KEY_COURSES, list);

  // Sync to Firestore
  try {
    await ensureFirebaseAuth();
    const docRef = doc(db, 'skill_courses', course.id);
    await setDoc(docRef, {
      ...course,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn('Firestore save skill_course fallback:', err);
    return true;
  }
}

export async function deleteSkillCourse(courseId: string): Promise<boolean> {
  const list = getLocalItem<SkillCoursePost[]>(STORAGE_KEY_COURSES, []);
  const updated = list.filter(c => c.id !== courseId);
  setLocalItem(STORAGE_KEY_COURSES, updated);

  try {
    await ensureFirebaseAuth();
    const docRef = doc(db, 'skill_courses', courseId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.warn('Firestore delete skill_course fallback:', err);
    return true;
  }
}

export async function toggleSkillCourseStatus(courseId: string): Promise<SkillCoursePost | null> {
  const list = getLocalItem<SkillCoursePost[]>(STORAGE_KEY_COURSES, []);
  const target = list.find(c => c.id === courseId);
  if (!target) return null;

  const nextStatus = target.status === 'active' ? 'inactive' : 'active';
  const updated: SkillCoursePost = {
    ...target,
    status: nextStatus,
    updatedAt: new Date().toISOString()
  };
  await saveSkillCourse(updated);
  return updated;
}

export function subscribeSkillCourses(callback: (courses: SkillCoursePost[]) => void): () => void {
  try {
    const colRef = collection(db, 'skill_courses');
    return onSnapshot(colRef, (snapshot) => {
      const remoteList: SkillCoursePost[] = [];
      snapshot.forEach(d => {
        remoteList.push({ id: d.id, ...d.data() } as SkillCoursePost);
      });
      remoteList.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      setLocalItem(STORAGE_KEY_COURSES, remoteList);
      callback(remoteList);
    }, (err) => {
      console.warn('SkillCourses snapshot listener error:', err);
    });
  } catch (e) {
    return () => {};
  }
}

/* ==========================================================================
   2. ফ্রিল্যান্সিং অপরচুনিটি (Freelancing Opportunities)
   ========================================================================== */

export async function getFreelanceOpportunities(activeOnly: boolean = false): Promise<FreelanceOpportunityItem[]> {
  let list = getLocalItem<FreelanceOpportunityItem[]>(STORAGE_KEY_OPPORTUNITIES, []);

  try {
    await ensureFirebaseAuth();
    const colRef = collection(db, 'freelancing_opportunities');
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const remoteList: FreelanceOpportunityItem[] = [];
      snap.forEach(d => {
        remoteList.push({ id: d.id, ...d.data() } as FreelanceOpportunityItem);
      });
      remoteList.sort((a, b) => Date.parse(b.createdAt || '0') - Date.parse(a.createdAt || '0'));
      list = remoteList;
      setLocalItem(STORAGE_KEY_OPPORTUNITIES, list);
    }
  } catch (err) {
    console.warn('Firestore fetch freelancing_opportunities fallback to cache:', err);
  }

  if (activeOnly) {
    return list.filter(item => item.status === 'active');
  }
  return list;
}

export async function saveFreelanceOpportunity(opportunity: FreelanceOpportunityItem): Promise<boolean> {
  const list = getLocalItem<FreelanceOpportunityItem[]>(STORAGE_KEY_OPPORTUNITIES, []);
  const index = list.findIndex(o => o.id === opportunity.id);
  if (index >= 0) {
    list[index] = opportunity;
  } else {
    list.unshift(opportunity);
  }
  setLocalItem(STORAGE_KEY_OPPORTUNITIES, list);

  try {
    await ensureFirebaseAuth();
    const docRef = doc(db, 'freelancing_opportunities', opportunity.id);
    await setDoc(docRef, {
      ...opportunity,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn('Firestore save freelancing_opportunity fallback:', err);
    return true;
  }
}

export async function deleteFreelanceOpportunity(opportunityId: string): Promise<boolean> {
  const list = getLocalItem<FreelanceOpportunityItem[]>(STORAGE_KEY_OPPORTUNITIES, []);
  const updated = list.filter(o => o.id !== opportunityId);
  setLocalItem(STORAGE_KEY_OPPORTUNITIES, updated);

  try {
    await ensureFirebaseAuth();
    const docRef = doc(db, 'freelancing_opportunities', opportunityId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.warn('Firestore delete freelancing_opportunity fallback:', err);
    return true;
  }
}

export async function toggleFreelanceOpportunityStatus(opportunityId: string): Promise<FreelanceOpportunityItem | null> {
  const list = getLocalItem<FreelanceOpportunityItem[]>(STORAGE_KEY_OPPORTUNITIES, []);
  const target = list.find(o => o.id === opportunityId);
  if (!target) return null;

  const nextStatus = target.status === 'active' ? 'inactive' : 'active';
  const updated: FreelanceOpportunityItem = {
    ...target,
    status: nextStatus,
    updatedAt: new Date().toISOString()
  };
  await saveFreelanceOpportunity(updated);
  return updated;
}

export function subscribeFreelanceOpportunities(callback: (opportunities: FreelanceOpportunityItem[]) => void): () => void {
  try {
    const colRef = collection(db, 'freelancing_opportunities');
    return onSnapshot(colRef, (snapshot) => {
      const remoteList: FreelanceOpportunityItem[] = [];
      snapshot.forEach(d => {
        remoteList.push({ id: d.id, ...d.data() } as FreelanceOpportunityItem);
      });
      remoteList.sort((a, b) => Date.parse(b.createdAt || '0') - Date.parse(a.createdAt || '0'));
      setLocalItem(STORAGE_KEY_OPPORTUNITIES, remoteList);
      callback(remoteList);
    }, (err) => {
      console.warn('FreelanceOpportunities snapshot listener error:', err);
    });
  } catch (e) {
    return () => {};
  }
}

/* ==========================================================================
   3. বিজ্ঞাপন মার্কেটিং ও প্রুফ জমা (Marketing Tasks & Submissions)
   ========================================================================== */

export async function getMarketingTasks(activeOnly: boolean = false): Promise<MarketingTaskItem[]> {
  let list = getLocalItem<MarketingTaskItem[]>(STORAGE_KEY_MARKETING_TASKS, []);

  try {
    await ensureFirebaseAuth();
    const colRef = collection(db, 'marketing_tasks');
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const remoteList: MarketingTaskItem[] = [];
      snap.forEach(d => {
        remoteList.push({ id: d.id, ...d.data() } as MarketingTaskItem);
      });
      remoteList.sort((a, b) => Date.parse(b.createdAt || '0') - Date.parse(a.createdAt || '0'));
      list = remoteList;
      setLocalItem(STORAGE_KEY_MARKETING_TASKS, list);
    }
  } catch (err) {
    console.warn('Firestore fetch marketing_tasks fallback to cache:', err);
  }

  if (activeOnly) {
    return list.filter(item => item.status === 'active');
  }
  return list;
}

export async function saveMarketingTask(task: MarketingTaskItem): Promise<boolean> {
  const list = getLocalItem<MarketingTaskItem[]>(STORAGE_KEY_MARKETING_TASKS, []);
  const index = list.findIndex(t => t.id === task.id);
  if (index >= 0) {
    list[index] = task;
  } else {
    list.unshift(task);
  }
  setLocalItem(STORAGE_KEY_MARKETING_TASKS, list);

  try {
    await ensureFirebaseAuth();
    const docRef = doc(db, 'marketing_tasks', task.id);
    await setDoc(docRef, {
      ...task,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn('Firestore save marketing_task fallback:', err);
    return true;
  }
}

export async function deleteMarketingTask(taskId: string): Promise<boolean> {
  const list = getLocalItem<MarketingTaskItem[]>(STORAGE_KEY_MARKETING_TASKS, []);
  const updated = list.filter(t => t.id !== taskId);
  setLocalItem(STORAGE_KEY_MARKETING_TASKS, updated);

  try {
    await ensureFirebaseAuth();
    const docRef = doc(db, 'marketing_tasks', taskId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.warn('Firestore delete marketing_task fallback:', err);
    return true;
  }
}

export async function toggleMarketingTaskStatus(taskId: string): Promise<MarketingTaskItem | null> {
  const list = getLocalItem<MarketingTaskItem[]>(STORAGE_KEY_MARKETING_TASKS, []);
  const target = list.find(t => t.id === taskId);
  if (!target) return null;

  const nextStatus = target.status === 'active' ? 'inactive' : 'active';
  const updated: MarketingTaskItem = {
    ...target,
    status: nextStatus,
    updatedAt: new Date().toISOString()
  };
  await saveMarketingTask(updated);
  return updated;
}

export function subscribeMarketingTasks(callback: (tasks: MarketingTaskItem[]) => void): () => void {
  try {
    const colRef = collection(db, 'marketing_tasks');
    return onSnapshot(colRef, (snapshot) => {
      const remoteList: MarketingTaskItem[] = [];
      snapshot.forEach(d => {
        remoteList.push({ id: d.id, ...d.data() } as MarketingTaskItem);
      });
      remoteList.sort((a, b) => Date.parse(b.createdAt || '0') - Date.parse(a.createdAt || '0'));
      setLocalItem(STORAGE_KEY_MARKETING_TASKS, remoteList);
      callback(remoteList);
    }, (err) => {
      console.warn('MarketingTasks snapshot listener error:', err);
    });
  } catch (e) {
    return () => {};
  }
}

/* ==========================================================================
   Marketing Submissions (User submissions & Admin Review)
   ========================================================================== */

export async function getMarketingSubmissions(userId?: string): Promise<MarketingSubmissionItem[]> {
  let list = getLocalItem<MarketingSubmissionItem[]>(STORAGE_KEY_MARKETING_SUBS, []);

  try {
    await ensureFirebaseAuth();
    const colRef = collection(db, 'marketing_submissions');
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const remoteList: MarketingSubmissionItem[] = [];
      snap.forEach(d => {
        remoteList.push({ id: d.id, ...d.data() } as MarketingSubmissionItem);
      });
      remoteList.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      list = remoteList;
      setLocalItem(STORAGE_KEY_MARKETING_SUBS, list);
    }
  } catch (err) {
    console.warn('Firestore fetch marketing_submissions fallback to cache:', err);
  }

  if (userId) {
    return list.filter(s => s.userId === userId);
  }

  return list;
}

export async function getUserMarketingSubmissions(userId: string): Promise<MarketingSubmissionItem[]> {
  if (!userId) return [];
  const all = await getMarketingSubmissions();
  return all.filter(s => s.userId === userId);
}

export async function submitMarketingProof(submission: MarketingSubmissionItem): Promise<boolean> {
  const list = getLocalItem<MarketingSubmissionItem[]>(STORAGE_KEY_MARKETING_SUBS, []);
  list.unshift(submission);
  setLocalItem(STORAGE_KEY_MARKETING_SUBS, list);

  // Also save in user-specific key
  try {
    const uKey = `lg_user_mktg_subs_${submission.userId}`;
    const userSubs = getLocalItem<MarketingSubmissionItem[]>(uKey, []);
    userSubs.unshift(submission);
    setLocalItem(uKey, userSubs);
  } catch {}

  try {
    await ensureFirebaseAuth();
    const docRef = doc(db, 'marketing_submissions', submission.id);
    await setDoc(docRef, submission);
    return true;
  } catch (err) {
    console.warn('Firestore submit marketing proof fallback:', err);
    return true;
  }
}

export async function updateMarketingSubmissionStatus(
  submissionId: string,
  status: 'approved' | 'rejected',
  adminNotes?: string,
  creditedTxId?: string
): Promise<MarketingSubmissionItem | null> {
  const list = getLocalItem<MarketingSubmissionItem[]>(STORAGE_KEY_MARKETING_SUBS, []);
  const index = list.findIndex(s => s.id === submissionId);
  if (index < 0) return null;

  const current = list[index];
  if (current.status === 'approved' && status === 'approved') {
    // Already approved! Prevent double credit
    return current;
  }

  const updated: MarketingSubmissionItem = {
    ...current,
    status,
    reviewedAt: new Date().toISOString(),
    ...(status === 'rejected' ? { rejectionReason: adminNotes || 'যাচাইয়ে অসম্পূর্ণ তথ্য' } : {}),
    ...(creditedTxId ? { creditedTxId } : {})
  };

  list[index] = updated;
  setLocalItem(STORAGE_KEY_MARKETING_SUBS, list);

  try {
    await ensureFirebaseAuth();
    const docRef = doc(db, 'marketing_submissions', submissionId);
    await setDoc(docRef, updated, { merge: true });
  } catch (err) {
    console.warn('Firestore update marketing submission status fallback:', err);
  }

  return updated;
}

export function subscribeMarketingSubmissions(callback: (submissions: MarketingSubmissionItem[]) => void): () => void {
  try {
    const colRef = collection(db, 'marketing_submissions');
    return onSnapshot(colRef, (snapshot) => {
      const remoteList: MarketingSubmissionItem[] = [];
      snapshot.forEach(d => {
        remoteList.push({ id: d.id, ...d.data() } as MarketingSubmissionItem);
      });
      remoteList.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      setLocalItem(STORAGE_KEY_MARKETING_SUBS, remoteList);
      callback(remoteList);
    }, (err) => {
      console.warn('MarketingSubmissions snapshot listener error:', err);
    });
  } catch (e) {
    return () => {};
  }
}
