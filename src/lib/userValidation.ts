import { UserProfile } from '../types';
import { ADMIN_PHONE_NUMBER, isAuthorizedAdminPhone } from './firebase';
import { formatStrict4DigitReferral } from './referral';
import { safeSetItem } from './storageUtils';

/**
 * Converts Bengali digits [০-৯] to standard English digits [0-9]
 */
export const bengaliToEnglishDigits = (str?: string | null): string => {
  if (!str) return '';
  const bnDigits: { [key: string]: string } = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
  };
  return String(str).replace(/[০-৯]/g, d => bnDigits[d] || d);
};

/**
 * Normalizes any Bangladeshi phone number format into standard 11 digits: '01XXXXXXXXX'
 * Handles inputs like '+8801877722819', '8801877722819', '01877-722819', '01877 722 819', '০১৯৮৬৯২২৭৬১'
 */
export const normalizePhoneNumber = (phone?: string | null): string => {
  if (!phone) return '';
  const converted = bengaliToEnglishDigits(String(phone).trim());
  let digits = converted.replace(/\D/g, '');
  if (digits.startsWith('00880') && digits.length === 15) {
    digits = digits.slice(4);
  }
  if (digits.startsWith('880') && digits.length === 13) {
    digits = digits.slice(2);
  }
  if (digits.length === 10 && digits.startsWith('1')) {
    digits = '0' + digits;
  }
  return digits;
};

/**
 * Validates if the phone number is a standard 11-digit Bangladeshi mobile number
 * Starting with 013, 014, 015, 016, 017, 018, or 019
 */
export const isValidBangladeshiPhone = (phone?: string | null): boolean => {
  if (!phone) return false;
  const normalized = normalizePhoneNumber(phone);
  return /^01[3-9]\d{8}$/.test(normalized);
};

/**
 * Normalizes email address to lower case and removes surrounding whitespace
 */
export const normalizeEmail = (email?: string | null): string => {
  if (!email) return '';
  return email.trim().toLowerCase();
};

/**
 * Validates standard email address format
 */
export const isValidEmail = (email?: string | null): boolean => {
  if (!email) return false;
  const clean = normalizeEmail(email);
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(clean);
};

/**
 * Checks if the email is a Google/Gmail address
 */
export const isGmail = (email?: string | null): boolean => {
  if (!email) return false;
  const clean = normalizeEmail(email);
  return clean.endsWith('@gmail.com') || clean.endsWith('@googlemail.com');
};

export interface UniquenessCheckResult {
  isUnique: boolean;
  conflictField?: 'phone' | 'email';
  conflictingValue?: string;
  messageBn: string;
  messageEn: string;
}

/**
 * Reads all stored registered users from localStorage safely
 */
export const getStoredRegisteredUsers = (): Array<{ user: UserProfile; password?: string; wallet?: any }> => {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem('lg_registered_users');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.map(item => {
          if (!item) return null;
          const userObj: UserProfile = item.user || item;
          if (!userObj || !userObj.id) return null;
          const uid = userObj.id;
          const uphone = userObj.phone ? normalizePhoneNumber(userObj.phone) : '';
          const uemail = userObj.email ? normalizeEmail(userObj.email) : '';
          const savedPass = item.password || item.user?.password || 
            localStorage.getItem(`lg_password_${uid}`) || 
            (uphone ? localStorage.getItem(`lg_password_${uphone}`) : null) || 
            (uemail ? localStorage.getItem(`lg_password_${uemail}`) : null) ||
            localStorage.getItem(`lg_user_pass_${uid}`);
          return { 
            user: userObj,
            password: savedPass || undefined,
            wallet: item.wallet || userObj.wallet
          };
        }).filter(Boolean) as Array<{ user: UserProfile; password?: string; wallet?: any }>;
      }
    }
  } catch (err) {
    console.warn('Error reading lg_registered_users:', err);
  }
  return [];
};

/**
 * Ensures strict uniqueness for both Phone Number and Gmail/Email.
 * Under no circumstances can two accounts share the same phone number or Gmail/email.
 *
 * @param rawPhone Candidate phone number
 * @param rawEmail Candidate email/gmail address
 * @param excludeUserId ID of the current user when updating existing profile (optional)
 */
export const checkAccountUniqueness = (
  rawPhone?: string | null,
  rawEmail?: string | null,
  excludeUserId?: string
): UniquenessCheckResult => {
  const normPhone = normalizePhoneNumber(rawPhone);
  const normEmail = normalizeEmail(rawEmail);

  // 1. Check against designated Admin phone & email
  if (normPhone && isAuthorizedAdminPhone(normPhone) && excludeUserId !== 'usr_admin_01877722819') {
    // If registering as admin phone, must not be a duplicate normal account
    const existingList = getStoredRegisteredUsers();
    const existing = existingList.find(item => 
      item.user.id !== excludeUserId && normalizePhoneNumber(item.user.phone) === normPhone
    );
    if (existing) {
      return {
        isUnique: false,
        conflictField: 'phone',
        conflictingValue: normPhone,
        messageBn: `এই মোবাইল নম্বর (${normPhone}) দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট রয়েছে! একই নম্বরে একটার বেশি অ্যাকাউন্ট করা যাবে না।`,
        messageEn: `An account with this phone number (${normPhone}) already exists! Only one account is allowed per phone number.`
      };
    }
  }

  // 2. Check in localStorage registered list
  const storedList = getStoredRegisteredUsers();

  for (const item of storedList) {
    const u = item.user;
    if (!u) continue;
    if (excludeUserId && u.id === excludeUserId) continue;

    // Check Phone uniqueness
    if (normPhone) {
      const existingPhone = normalizePhoneNumber(u.phone);
      if (existingPhone && existingPhone === normPhone) {
        return {
          isUnique: false,
          conflictField: 'phone',
          conflictingValue: normPhone,
          messageBn: `এই মোবাইল নম্বর (${normPhone}) দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি করা আছে! একই নম্বরে একটার বেশি অ্যাকাউন্ট খোলা যাবে না। অনুগ্রহ করে লগইন করুন।`,
          messageEn: `An account with this phone number (${normPhone}) already exists! Only one account is allowed per phone number. Please log in.`
        };
      }
    }

    // Check Email / Gmail uniqueness
    if (normEmail) {
      const existingEmail = normalizeEmail(u.email);
      if (existingEmail && existingEmail === normEmail) {
        return {
          isUnique: false,
          conflictField: 'email',
          conflictingValue: normEmail,
          messageBn: `এই জিমেইল / ইমেইল (${normEmail}) দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি করা আছে! একই জিমেইলে একটার বেশি অ্যাকাউন্ট খোলা যাবে না। অনুগ্রহ করে লগইন করুন।`,
          messageEn: `An account with this Gmail/email (${normEmail}) already exists! Only one account is allowed per Gmail. Please log in.`
        };
      }
    }
  }

  // 3. Also check against current active session user if different
  try {
    const currentUserJson = localStorage.getItem('lg_user');
    if (currentUserJson) {
      const currentUser: UserProfile = JSON.parse(currentUserJson);
      if (currentUser && (!excludeUserId || currentUser.id !== excludeUserId)) {
        if (normPhone && normalizePhoneNumber(currentUser.phone) === normPhone) {
          return {
            isUnique: false,
            conflictField: 'phone',
            conflictingValue: normPhone,
            messageBn: `এই মোবাইল নম্বর (${normPhone}) দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট চালু রয়েছে! একই নম্বরে একটার বেশি অ্যাকাউন্ট খোলা যাবে না।`,
            messageEn: `An account with this phone number (${normPhone}) already exists! Only one account is allowed per phone number.`
          };
        }
        if (normEmail && normalizeEmail(currentUser.email) === normEmail) {
          return {
            isUnique: false,
            conflictField: 'email',
            conflictingValue: normEmail,
            messageBn: `এই জিমেইল / ইমেইল (${normEmail}) দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট চালু রয়েছে! একই জিমেইলে একটার বেশি অ্যাকাউন্ট খোলা যাবে না।`,
            messageEn: `An account with this Gmail/email (${normEmail}) already exists! Only one account is allowed per Gmail.`
          };
        }
      }
    }
  } catch {}

  return {
    isUnique: true,
    messageBn: 'তথ্য বৈধ ও অনুমোদিত',
    messageEn: 'Information is valid and unique'
  };
};

/**
 * Sanitizes the registered users list in localStorage to clean up any past duplicates,
 * keeping the latest record for each phone or email.
 */
export const sanitizeRegisteredUsersStore = (): void => {
  if (typeof window === 'undefined') return;
  try {
    const list = getStoredRegisteredUsers();
    if (!list || list.length === 0) return;

    const seenPhones = new Set<string>();
    const seenEmails = new Set<string>();
    const sanitized: typeof list = [];

    // Traverse from end to preserve the newest records
    for (let i = list.length - 1; i >= 0; i--) {
      const entry = list[i];
      const p = normalizePhoneNumber(entry.user?.phone);
      const e = normalizeEmail(entry.user?.email);

      let isDuplicate = false;
      if (p && seenPhones.has(p)) {
        isDuplicate = true;
      }
      if (e && seenEmails.has(e)) {
        isDuplicate = true;
      }

      if (!isDuplicate) {
        if (p) seenPhones.add(p);
        if (e) seenEmails.add(e);
        if (entry.user) {
          entry.user.referralCode = formatStrict4DigitReferral(entry.user.referralCode);
        }
        sanitized.unshift(entry);
      }
    }

    safeSetItem('lg_registered_users', JSON.stringify(sanitized));

    // Also sanitize lg_user in localStorage if present
    const userRaw = localStorage.getItem('lg_user');
    if (userRaw) {
      try {
        const u = JSON.parse(userRaw);
        if (u && u.referralCode) {
          const strictly4 = formatStrict4DigitReferral(u.referralCode);
          if (u.referralCode !== strictly4) {
            u.referralCode = strictly4;
            safeSetItem('lg_user', JSON.stringify(u));
          }
        }
      } catch {}
    }
  } catch (err) {
    console.warn('Sanitize registered users warning:', err);
  }
};
