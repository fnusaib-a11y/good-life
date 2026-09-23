import { Transaction, WalletState, UserProfile } from '../types';
import {
  aggregateUserTransactions,
  AggregatedUserTransactionReport,
  fetchUserTransactions,
  filterTransactionsByType,
  filterTransactionsByDate,
  parseTransactionUtcTimestamp,
  isUserTransaction as serviceIsUserTransaction,
  isEarningTransaction as serviceIsEarningTransaction,
  deduplicateTransactions as serviceDeduplicateTransactions,
  toEnglishDigits as serviceToEnglishDigits
} from '../services/transactionAggregationService';

export {
  aggregateUserTransactions,
  fetchUserTransactions,
  filterTransactionsByType,
  filterTransactionsByDate,
  parseTransactionUtcTimestamp
};
export type { AggregatedUserTransactionReport };

export interface RevenueStats {
  today: number;
  yesterday: number;
  week: number;
  month: number;
  total: number;
  withdrawn: number;
  todayCount: number;
  yesterdayCount: number;
  weekCount: number;
  monthCount: number;
  totalCount: number;
  withdrawnCount: number;
}

export interface PeriodDetail {
  key: 'today' | 'yesterday' | 'week' | 'month' | 'total' | 'withdrawn' | 'voucher';
  titleBn: string;
  titleEn: string;
  subtitleBn: string;
  subtitleEn: string;
  amount: number;
  count: number;
  breakdown: {
    jobs: number;
    referrals: number;
    bonuses: number;
    reselling: number;
    other: number;
  };
  transactions: Transaction[];
}

export const toEnglishDigits = serviceToEnglishDigits;
export const isEarningTransaction = serviceIsEarningTransaction;
export const isIncomeTx = serviceIsEarningTransaction;
export const isUserTransaction = serviceIsUserTransaction;
export const deduplicateTransactions = serviceDeduplicateTransactions;

/**
 * Safely parse any date string format from transactions using consistent UTC timestamps
 */
export function parseTxDate(dateStr?: string, createdAt?: string, txId?: string): Date | null {
  const dummyTx: Partial<Transaction> = {
    id: txId || '',
    date: dateStr || '',
    createdAt: createdAt || ''
  };
  const epoch = parseTransactionUtcTimestamp(dummyTx as Transaction);
  if (epoch === null) return null;
  return new Date(epoch);
}

/**
 * Check if a transaction is a debit / money deducted (e.g. withdrawal, purchase, fee deduction)
 */
export function isExpenseOrWithdrawalTx(tx: Transaction): boolean {
  if (!tx) return false;
  const status = String(tx.status || '').toLowerCase();
  if (status === 'rejected') return false;

  const type = String(tx.type || '').toLowerCase();
  const desc = String(tx.description || '').toLowerCase();

  if (type === 'withdrawal') return true;
  if (type === 'adjustment') {
    const adjType = String((tx as any).adjustmentType || '').toLowerCase();
    if (adjType === 'debit') return true;
    if (desc.includes('ডেবিট') || desc.includes('কাটতি') || desc.includes('কর্তন') || desc.includes('উইথড্র') || desc.includes('পেমেন্ট')) {
      return true;
    }
  }
  if (type === 'job_payment' || type === 'order_payment' || type === 'purchase') {
    return true;
  }
  return false;
}

/**
 * Filter transactions by period using consistent UTC timestamps
 */
export function filterTransactionsByPeriod(
  transactions: Transaction[],
  period: 'today' | 'yesterday' | 'week' | 'month' | 'total' | 'withdrawn' | 'voucher',
  user?: UserProfile | null
): Transaction[] {
  const safeTxs = deduplicateTransactions(transactions || []).filter(t => isUserTransaction(t, user));

  if (period === 'withdrawn') {
    return filterTransactionsByType(safeTxs, 'withdrawal');
  }

  if (period === 'voucher') {
    return safeTxs.filter(t => {
      if (!isEarningTransaction(t)) return false;
      const desc = String(t.description || '').toLowerCase();
      return desc.includes('ভাউচার') || desc.includes('voucher') || (t.type === 'bonus' && desc.includes('কোড'));
    });
  }

  const earnings = filterTransactionsByType(safeTxs, 'earning');

  if (period === 'total') return earnings;
  if (period === 'today') return filterTransactionsByDate(earnings, 'today');
  if (period === 'yesterday') return filterTransactionsByDate(earnings, 'yesterday');
  if (period === 'week') return filterTransactionsByDate(earnings, '7days');
  if (period === 'month') return filterTransactionsByDate(earnings, '30days');

  return earnings;
}

/**
 * Compute revenue statistics strictly adhering to user income reporting rules:
 * - Current Balance = User's actual current balance
 * - Today Income = Sum of successful earning transactions strictly from today's UTC window for this user
 * - Last 7 Days Income = Sum of earning transactions strictly within the last 7 days UTC window
 * - Last 30 Days Income = Sum of earning transactions strictly within the last 30 days UTC window
 * - Excludes deposits, withdrawals, transfers, deductions, purchases, and other non-earning transactions
 * - Strictly isolated by userId
 * - Strictly deduplicated
 */
export function calculateRevenueAnalytics(
  transactions: Transaction[],
  wallet?: WalletState,
  user?: UserProfile | null
): RevenueStats {
  const report = aggregateUserTransactions({
    transactions,
    user,
    wallet
  });

  return {
    today: report.income.today,
    yesterday: report.income.yesterday,
    week: report.income.last7Days,
    month: report.income.last30Days,
    total: report.income.total,
    withdrawn: report.balance.totalWithdrawn,
    todayCount: report.income.todayCount,
    yesterdayCount: report.income.yesterdayCount,
    weekCount: report.income.last7DaysCount,
    monthCount: report.income.last30DaysCount,
    totalCount: report.income.totalCount,
    withdrawnCount: report.lists.allWithdrawals.length
  };
}

/**
 * Get detailed period breakdown including category amounts strictly from real earning transactions
 */
export function getPeriodDetail(
  key: 'today' | 'yesterday' | 'week' | 'month' | 'total' | 'withdrawn' | 'voucher',
  transactions: Transaction[],
  wallet?: WalletState,
  user?: UserProfile | null
): PeriodDetail {
  const report = aggregateUserTransactions({
    transactions,
    user,
    wallet
  });
  const periodTxs = filterTransactionsByPeriod(transactions, key, user);

  const breakdown = {
    jobs: 0,
    referrals: 0,
    bonuses: 0,
    reselling: 0,
    other: 0
  };

  periodTxs.forEach(t => {
    const amt = Number(t.amount) || 0;
    const type = String(t.type || '').toLowerCase();
    if (type === 'job_reward') breakdown.jobs += amt;
    else if (type === 'referral_bonus') breakdown.referrals += amt;
    else if (type === 'bonus') breakdown.bonuses += amt;
    else if (type === 'reselling_profit') breakdown.reselling += amt;
    else breakdown.other += amt;
  });

  const titles: Record<string, { bn: string; en: string; subBn: string; subEn: string }> = {
    today: {
      bn: 'আজকের আয়',
      en: "Today's Income",
      subBn: 'আজকের সফলভাবে অর্জিত প্রকৃত আয় (UTC Window)',
      subEn: "Total Income Earned Today"
    },
    yesterday: {
      bn: 'গতকালের আয়',
      en: "Yesterday's Income",
      subBn: 'গতকাল অর্জিত সর্বমোট আয়',
      subEn: "Total Income Earned Yesterday"
    },
    week: {
      bn: 'গত ৭ দিনের আয়',
      en: 'Last 7 Days Income',
      subBn: 'গত ৭ দিনের সফলভাবে অর্জিত আয়',
      subEn: 'Total Income Earned in Last 7 Days'
    },
    month: {
      bn: 'গত ৩০ দিনের আয়',
      en: 'Last 30 Days Income',
      subBn: 'গত ৩০ দিনের সফলভাবে অর্জিত আয়',
      subEn: 'Total Income Earned in Last 30 Days'
    },
    total: {
      bn: 'সর্বমোট আয়',
      en: 'Total Income',
      subBn: 'প্ল্যাটফর্মে এখন পর্যন্ত সর্বমোট অর্জিত আয়',
      subEn: 'All-Time Total Earned Income'
    },
    withdrawn: {
      bn: 'মোট ইনকাম উইথড্র',
      en: 'Total Income Withdrawn',
      subBn: 'এখন পর্যন্ত সর্বমোট উত্তোলিত অর্থ',
      subEn: 'All-Time Total Withdrawn Amount'
    },
    voucher: {
      bn: 'ভাউচার ব্যালেন্স ও রিডিম',
      en: 'Voucher Balance & Redemption',
      subBn: 'রিডিম করা প্রোমো ভাউচার ও কোডের তালিকা',
      subEn: 'List of redeemed voucher bonuses'
    }
  };

  const voucherSum = periodTxs.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const amountMap: Record<string, number> = {
    today: report.income.today,
    yesterday: report.income.yesterday,
    week: report.income.last7Days,
    month: report.income.last30Days,
    total: report.income.total,
    withdrawn: report.balance.totalWithdrawn,
    voucher: voucherSum
  };

  const countMap: Record<string, number> = {
    today: report.income.todayCount,
    yesterday: report.income.yesterdayCount,
    week: report.income.last7DaysCount,
    month: report.income.last30DaysCount,
    total: report.income.totalCount,
    withdrawn: report.lists.allWithdrawals.length,
    voucher: periodTxs.length
  };

  const info = titles[key] || { bn: '', en: '', subBn: '', subEn: '' };

  return {
    key,
    titleBn: info.bn,
    titleEn: info.en,
    subtitleBn: info.subBn,
    subtitleEn: info.subEn,
    amount: amountMap[key] || 0,
    count: countMap[key] || 0,
    breakdown,
    transactions: periodTxs
  };
}
