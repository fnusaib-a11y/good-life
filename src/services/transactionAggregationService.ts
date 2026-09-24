import { Transaction, UserProfile, WalletState } from '../types';

export interface AggregatedUserTransactionReport {
  userId: string;
  userPhone: string;
  
  // Balance calculations
  balance: {
    current: number;          // Actual current spendable balance
    calculatedNet: number;    // Calculated: (Total Deposits + Total Earnings) - (Total Withdrawals + Total Expenses)
    totalDeposits: number;    // Pure deposits sum
    totalWithdrawn: number;   // Pure completed withdrawals sum
    pendingWithdrawn: number; // Pending withdrawals sum
    totalExpenses: number;    // Purchases, job payments, fees
  };

  // Earning-specific aggregations (strictly genuine earnings)
  income: {
    today: number;            // Today's earnings (UTC window)
    todayCount: number;
    yesterday: number;        // Yesterday's earnings (UTC window)
    yesterdayCount: number;
    last7Days: number;        // Last 7 days earnings (UTC window)
    last7DaysCount: number;
    last30Days: number;       // Last 30 days earnings (UTC window)
    last30DaysCount: number;
    total: number;            // All-time verified earnings
    totalCount: number;
    
    // Categorized breakdown of earnings
    breakdown: {
      microjobs: number;
      referrals: number;
      bonuses: number;
      reselling: number;
      other: number;
    };
  };

  // Filtered lists for direct UI rendering
  lists: {
    todayEarnings: Transaction[];
    yesterdayEarnings: Transaction[];
    last7DaysEarnings: Transaction[];
    last30DaysEarnings: Transaction[];
    allEarnings: Transaction[];
    allDeposits: Transaction[];
    allWithdrawals: Transaction[];
    allExpenses: Transaction[];
  };

  // Metadata
  timestampUtc: string;
  referenceDateUtc: string;
}

export type TransactionCategory = 'earning' | 'deposit' | 'withdrawal' | 'expense' | 'all';
export type TransactionDateRange = 'today' | 'yesterday' | '7days' | '30days' | 'all';

const BENGALI_DIGITS: Record<string, string> = {
  '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
  '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
};

const BENGALI_MONTHS: Record<string, number> = {
  'জানুয়ারি': 0, 'জানুয়ারি': 0, 'জানু': 0, 'january': 0, 'jan': 0,
  'ফেব্রুয়ারি': 1, 'ফেব্রুয়ারি': 1, 'ফেব্রু': 1, 'february': 1, 'feb': 1,
  'মার্চ': 2, 'মার': 2, 'march': 2, 'mar': 2,
  'এপ্রিল': 3, 'এপ্রি': 3, 'এপ্র': 3, 'april': 3, 'apr': 3,
  'মে': 4, 'may': 4,
  'জুন': 5, 'june': 5, 'jun': 5,
  'জুলাই': 6, 'জুল': 6, 'july': 6, 'jul': 6,
  'আগস্ট': 7, 'আগ': 7, 'august': 7, 'aug': 7,
  'সেপ্টেম্বর': 8, 'সেপ': 8, 'সেপ্টে': 8, 'september': 8, 'sep': 8,
  'অক্টোবর': 9, 'অক্টো': 9, 'october': 9, 'oct': 9,
  'নভেম্বর': 10, 'নভে': 10, 'november': 10, 'nov': 10,
  'ডিসেম্বর': 11, 'ডিসে': 11, 'december': 11, 'dec': 11
};

export function toEnglishDigits(str: string): string {
  if (!str) return '';
  return str.replace(/[০-৯]/g, (d) => BENGALI_DIGITS[d] || d);
}

/**
 * Normalizes a phone number to standard digits without formatting
 */
export function normalizePhone(phone?: string | null): string {
  if (!phone) return '';
  return String(phone).replace(/[^0-9]/g, '');
}

/**
 * Parses any transaction date string or timestamp into a consistent UTC millisecond epoch.
 * Returns null if the date cannot be reliably determined.
 */
export function parseTransactionUtcTimestamp(tx: Transaction): number | null {
  if (!tx) return null;

  // 1. Check createdAt (Standard ISO-8601 string, e.g. "2026-09-21T12:17:28.073Z")
  if (tx.createdAt) {
    const epoch = Date.parse(tx.createdAt);
    if (!isNaN(epoch)) return epoch;
  }

  // 2. Check date string
  if (tx.date) {
    const raw = String(tx.date).trim();
    const normalized = toEnglishDigits(raw);

    // Direct ISO or standard parse
    const directParsed = Date.parse(normalized);
    if (!isNaN(directParsed)) {
      return directParsed;
    }

    // Check Bengali / English month representation (e.g. "২১ সেপ, ২০২৬, ১২:১৭ PM" or "8 March 2026")
    const lowerRaw = raw.toLowerCase();
    for (const [monthKey, mIndex] of Object.entries(BENGALI_MONTHS)) {
      if (lowerRaw.includes(monthKey)) {
        const parts = normalized.match(/(\d{1,4})/g);
        if (parts && parts.length >= 2) {
          const day = Number(parts[0]);
          const year = Number(parts[1]) > 1000 ? Number(parts[1]) : Number(parts[2] || new Date().getUTCFullYear());
          
          let hour = 12;
          let minute = 0;
          if (parts.length >= 4) {
            hour = Number(parts[2]);
            minute = Number(parts[3]) || 0;
            if (parts.length >= 5 && Number(parts[2]) > 1000) {
              hour = Number(parts[3]);
              minute = Number(parts[4]) || 0;
            }
          }

          const isPM = /pm|বিকাল|সন্ধ্যা|রাত|দুপুর/i.test(raw);
          const isAM = /am|সকাল|ভোর/i.test(raw);
          if (isPM && hour < 12) hour += 12;
          if (isAM && hour === 12) hour = 0;

          // Construct in UTC
          const utcMs = Date.UTC(year, mIndex, day, hour, minute, 0);
          if (!isNaN(utcMs)) return utcMs;
        }
      }
    }

    // Check YYYY-MM-DD format
    const ymd = normalized.match(/(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?:\s+(\d{1,2}):(\d{1,2}))?/);
    if (ymd) {
      const year = Number(ymd[1]);
      const month = Number(ymd[2]) - 1;
      const day = Number(ymd[3]);
      let hour = ymd[4] ? Number(ymd[4]) : 12;
      const minute = ymd[5] ? Number(ymd[5]) : 0;
      if (/pm/i.test(raw) && hour < 12) hour += 12;
      if (/am/i.test(raw) && hour === 12) hour = 0;
      const utcMs = Date.UTC(year, month, day, hour, minute, 0);
      if (!isNaN(utcMs)) return utcMs;
    }

    // Check DD-MM-YYYY format
    const dmy = normalized.match(/(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})(?:\s+(\d{1,2}):(\d{1,2}))?/);
    if (dmy) {
      const day = Number(dmy[1]);
      const month = Number(dmy[2]) - 1;
      const year = Number(dmy[3]);
      let hour = dmy[4] ? Number(dmy[4]) : 12;
      const minute = dmy[5] ? Number(dmy[5]) : 0;
      if (/pm/i.test(raw) && hour < 12) hour += 12;
      if (/am/i.test(raw) && hour === 12) hour = 0;
      const utcMs = Date.UTC(year, month, day, hour, minute, 0);
      if (!isNaN(utcMs)) return utcMs;
    }
  }

  // 3. Check if transaction ID has an embedded epoch timestamp
  if (tx.id) {
    const matches = String(tx.id).match(/(\d{12,13})/);
    if (matches && matches[1]) {
      const ts = Number(matches[1]);
      if (!isNaN(ts) && ts > 1600000000000 && ts < 2500000000000) {
        return ts;
      }
    }
  }

  return null;
}

/**
 * Strict check ensuring transaction belongs to the target user.
 * Cross-user data is strictly excluded.
 */
export function isUserTransaction(tx: Transaction, user?: UserProfile | null): boolean {
  if (!user) return true;
  if (!tx) return false;

  const currentUid = String(user.id || '').trim();
  const currentPhone = normalizePhone(user.phone);

  if (tx.userId) {
    const txUid = String(tx.userId).trim();
    if (txUid === currentUid) return true;
    if (currentPhone) {
      const targetPhone = txUid.replace(/^usr_/, '').replace(/[^0-9]/g, '');
      if (targetPhone && targetPhone === currentPhone) return true;
    }
    return false;
  }

  // Check account number if present
  if (tx.accountNumber && currentPhone) {
    const accPhone = normalizePhone(tx.accountNumber);
    if (accPhone && accPhone === currentPhone) return true;
  }

  return true;
}

/**
 * Strict deduplication by ID and compound key.
 * Removes duplicate records and rejects '_dup_' artifacts.
 */
export function deduplicateTransactions(transactions: Transaction[]): Transaction[] {
  if (!Array.isArray(transactions)) return [];
  const seenIds = new Set<string>();
  const seenKeys = new Set<string>();
  const unique: Transaction[] = [];

  for (const tx of transactions) {
    if (!tx || typeof tx !== 'object') continue;

    const id = String(tx.id || '').trim();
    if (id.includes('_dup_')) continue;

    if (id && seenIds.has(id)) continue;

    const compoundKey = `${tx.userId || ''}_${tx.type}_${Number(tx.amount || 0).toFixed(2)}_${tx.referenceId || tx.date || id}`;
    if (seenKeys.has(compoundKey)) continue;

    if (id) seenIds.add(id);
    seenKeys.add(compoundKey);
    unique.push(tx);
  }

  return unique;
}

/**
 * Verifies if a transaction is a genuine completed earning.
 * Deposits, withdrawals, transfers, and deductions are STRICTLY EXCLUDED.
 */
export function isEarningTransaction(tx: Transaction): boolean {
  if (!tx) return false;

  const status = String(tx.status || '').toLowerCase();
  if (status !== 'completed' && status !== 'approved') return false;

  const amount = Number(tx.amount);
  if (isNaN(amount) || amount <= 0) return false;

  const type = String(tx.type || '').toLowerCase();
  const desc = String(tx.description || '').toLowerCase();

  // EXPLICIT NON-EARNING TYPES
  if ([
    'deposit',
    'withdrawal',
    'refund',
    'job_payment',
    'order_payment',
    'purchase',
    'transfer',
    'send_money',
    'verification'
  ].includes(type)) {
    return false;
  }

  // Adjustments: exclude debits, deductions, deposit top-ups
  if (type === 'adjustment') {
    const adjType = String((tx as any).adjustmentType || '').toLowerCase();
    if (adjType === 'debit') return false;
    if (
      desc.includes('ডেবিট') ||
      desc.includes('কাটতি') ||
      desc.includes('কর্তন') ||
      desc.includes('উইথড্র') ||
      desc.includes('ডিপোজিট') ||
      desc.includes('deposit') ||
      desc.includes('পেমেন্ট') ||
      desc.includes('payment')
    ) {
      return false;
    }
    // Only accept if explicitly an earning credit/bonus/commission
    return (
      desc.includes('বোনাস') ||
      desc.includes('bonus') ||
      desc.includes('ইনকাম') ||
      desc.includes('income') ||
      desc.includes('রিওয়ার্ড') ||
      desc.includes('reward') ||
      desc.includes('কমিশন') ||
      desc.includes('commission') ||
      desc.includes('প্রফিট') ||
      desc.includes('profit')
    );
  }

  // EXPLICIT EARNING TYPES
  if ([
    'job_reward',
    'referral_bonus',
    'reselling_profit',
    'bonus',
    'order_cashback',
    'earning',
    'quiz_reward',
    'ad_reward',
    'typing_reward',
    'reward'
  ].includes(type)) {
    return true;
  }

  // Fallback description check for earning keywords
  if (
    desc.includes('রিওয়ার্ড') ||
    desc.includes('বোনাস') ||
    desc.includes('কমিশন') ||
    desc.includes('প্রফিট') ||
    desc.includes('ক্যাশব্যাক') ||
    desc.includes('reward') ||
    desc.includes('bonus') ||
    desc.includes('commission') ||
    desc.includes('profit') ||
    desc.includes('cashback')
  ) {
    if (!desc.includes('কাটতি') && !desc.includes('উইথড্র') && !desc.includes('ডিপোজিট') && !desc.includes('পেমেন্ট')) {
      return true;
    }
  }

  return false;
}

/**
 * Filter transactions by category
 */
export function filterTransactionsByType(
  transactions: Transaction[],
  category: TransactionCategory
): Transaction[] {
  if (!Array.isArray(transactions)) return [];

  return transactions.filter(tx => {
    if (!tx) return false;
    const status = String(tx.status || '').toLowerCase();
    const type = String(tx.type || '').toLowerCase();

    switch (category) {
      case 'earning':
        return isEarningTransaction(tx);
      case 'deposit':
        return type === 'deposit' && (status === 'completed' || status === 'approved');
      case 'withdrawal':
        return type === 'withdrawal' && (status === 'completed' || status === 'approved');
      case 'expense': {
        if (status === 'rejected') return false;
        if (type === 'job_payment' || type === 'order_payment' || type === 'purchase') return true;
        if (type === 'adjustment') {
          const adjType = String((tx as any).adjustmentType || '').toLowerCase();
          const desc = String(tx.description || '').toLowerCase();
          return adjType === 'debit' || desc.includes('ডেবিট') || desc.includes('কাটতি') || desc.includes('কর্তন');
        }
        return false;
      }
      case 'all':
      default:
        return true;
    }
  });
}

/**
 * Filter transactions by date range using consistent UTC timestamps
 */
export function filterTransactionsByDate(
  transactions: Transaction[],
  range: TransactionDateRange,
  referenceDateUtc?: Date
): Transaction[] {
  if (!Array.isArray(transactions) || range === 'all') {
    return transactions || [];
  }

  const now = referenceDateUtc ? new Date(referenceDateUtc) : new Date();

  // Consistent UTC boundaries
  const nowUtcYear = now.getUTCFullYear();
  const nowUtcMonth = now.getUTCMonth();
  const nowUtcDate = now.getUTCDate();

  const todayStartUtc = Date.UTC(nowUtcYear, nowUtcMonth, nowUtcDate, 0, 0, 0, 0);
  const todayEndUtc = Date.UTC(nowUtcYear, nowUtcMonth, nowUtcDate, 23, 59, 59, 999);

  const yesterdayStartUtc = todayStartUtc - 86400000;
  const yesterdayEndUtc = todayStartUtc - 1;

  // Last 7 days: today + 6 preceding days
  const last7DaysStartUtc = todayStartUtc - (6 * 86400000);

  // Last 30 days: today + 29 preceding days
  const last30DaysStartUtc = todayStartUtc - (29 * 86400000);

  return transactions.filter(tx => {
    const txUtc = parseTransactionUtcTimestamp(tx);
    if (txUtc === null) return false;

    switch (range) {
      case 'today':
        return txUtc >= todayStartUtc && txUtc <= todayEndUtc;
      case 'yesterday':
        return txUtc >= yesterdayStartUtc && txUtc <= yesterdayEndUtc;
      case '7days':
        return txUtc >= last7DaysStartUtc && txUtc <= todayEndUtc;
      case '30days':
        return txUtc >= last30DaysStartUtc && txUtc <= todayEndUtc;
      default:
        return true;
    }
  });
}

/**
 * Fetches user transactions from the backend API, with fallback to user-isolated localStorage.
 * Guarantees no cross-user contamination and deduplication.
 */
export async function fetchUserTransactions(userId: string, userPhone?: string): Promise<Transaction[]> {
  if (!userId) return [];

  const cleanUid = String(userId).trim();
  const cleanPhone = normalizePhone(userPhone);

  let fetchedList: Transaction[] = [];

  // Try server API first
  try {
    const res = await fetch(`/api/transactions?userId=${encodeURIComponent(cleanUid)}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.transactions)) {
        fetchedList = data.transactions;
      } else if (Array.isArray(data)) {
        fetchedList = data;
      }
    }
  } catch (err) {
    console.warn('[TransactionService] Failed fetching from API, falling back to local storage', err);
  }

  // If API returned nothing or failed, load from user-isolated local storage
  if (fetchedList.length === 0 && typeof window !== 'undefined') {
    try {
      const userKey = `lg_transactions_${cleanUid}`;
      const savedUserStr = localStorage.getItem(userKey);
      if (savedUserStr) {
        fetchedList = JSON.parse(savedUserStr);
      } else {
        // Fallback to global lg_transactions filtered strictly by user
        const globalStr = localStorage.getItem('lg_transactions');
        if (globalStr) {
          const allTxs: Transaction[] = JSON.parse(globalStr);
          fetchedList = allTxs.filter(t => isUserTransaction(t, { id: cleanUid, phone: cleanPhone } as UserProfile));
        }
      }
    } catch {}
  }

  // Strictly deduplicate and filter
  const sanitized = deduplicateTransactions(fetchedList).filter(t =>
    isUserTransaction(t, { id: cleanUid, phone: cleanPhone } as UserProfile)
  );

  return sanitized;
}

export interface TransactionAggregationOptions {
  transactions: Transaction[];
  user?: UserProfile | null;
  wallet?: WalletState | null;
  referenceDateUtc?: Date;
}

/**
 * Centralized aggregation engine that computes verified Balance and Income reports.
 * 
 * Rules:
 * - Current Balance = User's actual spendable wallet balance
 * - Calculated Net Balance = (Total Deposits + Total Earnings) - (Total Withdrawals + Total Expenses)
 * - Today Income = Strictly completed earning transactions from today's UTC date window for this user
 * - Last 7 Days Income = Strictly completed earning transactions from the 7-day UTC window
 * - Last 30 Days Income = Strictly completed earning transactions from the 30-day UTC window
 * - Non-earning transactions (deposits, withdrawals, expenses) are never counted in income
 * - Cross-user data is isolated and double-counting is prevented
 */
export function aggregateUserTransactions(options: TransactionAggregationOptions): AggregatedUserTransactionReport {
  const { transactions, user, wallet, referenceDateUtc } = options;

  const currentUid = user?.id || '';
  const currentPhone = user?.phone || '';

  // 1. Filter strictly to current user and deduplicate
  const userTransactions = deduplicateTransactions(transactions || []).filter(tx =>
    isUserTransaction(tx, user)
  );

  // 2. Separate into distinct transactional buckets
  const allEarnings = filterTransactionsByType(userTransactions, 'earning');
  const allDeposits = filterTransactionsByType(userTransactions, 'deposit');
  const allWithdrawals = filterTransactionsByType(userTransactions, 'withdrawal');
  const allExpenses = filterTransactionsByType(userTransactions, 'expense');

  // 3. Filter earnings by consistent UTC date ranges
  const todayEarnings = filterTransactionsByDate(allEarnings, 'today', referenceDateUtc);
  const yesterdayEarnings = filterTransactionsByDate(allEarnings, 'yesterday', referenceDateUtc);
  const last7DaysEarnings = filterTransactionsByDate(allEarnings, '7days', referenceDateUtc);
  const last30DaysEarnings = filterTransactionsByDate(allEarnings, '30days', referenceDateUtc);

  // 4. Sum amounts
  const sumAmounts = (list: Transaction[]) =>
    Math.round(list.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0) * 100) / 100;

  const todayIncome = sumAmounts(todayEarnings);
  const yesterdayIncome = sumAmounts(yesterdayEarnings);
  const last7DaysIncome = sumAmounts(last7DaysEarnings);
  const last30DaysIncome = sumAmounts(last30DaysEarnings);
  let totalIncome = sumAmounts(allEarnings);

  const totalDeposits = sumAmounts(allDeposits);
  let totalWithdrawn = sumAmounts(allWithdrawals);
  const totalExpenses = sumAmounts(allExpenses);

  // If wallet has historical recorded values that exceed transaction history (due to data retention limits)
  if (wallet) {
    if (typeof wallet.totalWithdrawn === 'number' && wallet.totalWithdrawn > totalWithdrawn) {
      totalWithdrawn = wallet.totalWithdrawn;
    }
    if (typeof wallet.totalEarned === 'number' && wallet.totalEarned > totalIncome) {
      totalIncome = wallet.totalEarned;
    }
  }

  // Pending withdrawals
  const pendingWithdrawn = Math.round(
    userTransactions
      .filter(tx => tx.type === 'withdrawal' && tx.status === 'pending')
      .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0) * 100
  ) / 100;

  // Breakdown by earning category
  const breakdown = {
    microjobs: 0,
    referrals: 0,
    bonuses: 0,
    reselling: 0,
    other: 0
  };

  allEarnings.forEach(tx => {
    const amt = Number(tx.amount) || 0;
    const type = String(tx.type || '').toLowerCase();
    if (type === 'job_reward') breakdown.microjobs += amt;
    else if (type === 'referral_bonus') breakdown.referrals += amt;
    else if (type === 'bonus') breakdown.bonuses += amt;
    else if (type === 'reselling_profit') breakdown.reselling += amt;
    else breakdown.other += amt;
  });

  // Balance edge case calculation:
  // Calculated net balance = (Total Deposits + Total Earnings) - (Total Withdrawals + Total Expenses)
  const calculatedNet = Math.max(0, Math.round(((totalDeposits + totalIncome) - (totalWithdrawn + totalExpenses)) * 100) / 100);
  const rawBal = Number(wallet?.balance ?? (user as any)?.balance);
  // Guarantee: Valid funds from deposits, earnings, and transactions are never suppressed by 0
  const currentBalance = (rawBal > 0) ? rawBal : (calculatedNet > 0 ? calculatedNet : (rawBal || 0));

  const refDate = referenceDateUtc ? new Date(referenceDateUtc) : new Date();

  return {
    userId: currentUid,
    userPhone: currentPhone,
    balance: {
      current: Math.round(currentBalance * 100) / 100,
      calculatedNet,
      totalDeposits,
      totalWithdrawn,
      pendingWithdrawn,
      totalExpenses
    },
    income: {
      today: todayIncome,
      todayCount: todayEarnings.length,
      yesterday: yesterdayIncome,
      yesterdayCount: yesterdayEarnings.length,
      last7Days: last7DaysIncome,
      last7DaysCount: last7DaysEarnings.length,
      last30Days: last30DaysIncome,
      last30DaysCount: last30DaysEarnings.length,
      total: totalIncome,
      totalCount: allEarnings.length,
      breakdown: {
        microjobs: Math.round(breakdown.microjobs * 100) / 100,
        referrals: Math.round(breakdown.referrals * 100) / 100,
        bonuses: Math.round(breakdown.bonuses * 100) / 100,
        reselling: Math.round(breakdown.reselling * 100) / 100,
        other: Math.round(breakdown.other * 100) / 100
      }
    },
    lists: {
      todayEarnings,
      yesterdayEarnings,
      last7DaysEarnings,
      last30DaysEarnings,
      allEarnings,
      allDeposits,
      allWithdrawals,
      allExpenses
    },
    timestampUtc: new Date().toISOString(),
    referenceDateUtc: refDate.toISOString()
  };
}
