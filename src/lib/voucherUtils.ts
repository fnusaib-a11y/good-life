import { VoucherCode } from '../types';

const VOUCHER_STORAGE_KEY = 'lg_system_vouchers';

const DEFAULT_VOUCHERS: VoucherCode[] = [
  {
    id: 'vouch_welcome100',
    code: 'WELCOME100',
    amount: 100,
    maxUses: 1000,
    usedCount: 0,
    isActive: true,
    createdAt: new Date().toLocaleDateString('bn-BD')
  },
  {
    id: 'vouch_goodlife50',
    code: 'GOODLIFE50',
    amount: 50,
    maxUses: 2000,
    usedCount: 0,
    isActive: true,
    createdAt: new Date().toLocaleDateString('bn-BD')
  },
  {
    id: 'vouch_bonus20',
    code: 'BONUS20',
    amount: 20,
    maxUses: 5000,
    usedCount: 0,
    isActive: true,
    createdAt: new Date().toLocaleDateString('bn-BD')
  },
  {
    id: 'vouch_revenue500',
    code: 'REVENUE500',
    amount: 500,
    maxUses: 500,
    usedCount: 0,
    isActive: true,
    createdAt: new Date().toLocaleDateString('bn-BD')
  },
  {
    id: 'vouch_free10',
    code: 'FREE10',
    amount: 10,
    maxUses: 10000,
    usedCount: 0,
    isActive: true,
    createdAt: new Date().toLocaleDateString('bn-BD')
  }
];

export const getSystemVouchers = (): VoucherCode[] => {
  try {
    const raw = localStorage.getItem(VOUCHER_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  // Default system seed
  try {
    localStorage.setItem(VOUCHER_STORAGE_KEY, JSON.stringify(DEFAULT_VOUCHERS));
  } catch {}
  return DEFAULT_VOUCHERS;
};

export const saveSystemVouchers = (vouchers: VoucherCode[]) => {
  try {
    localStorage.setItem(VOUCHER_STORAGE_KEY, JSON.stringify(vouchers));
  } catch {}
};

export const addSystemVoucher = (voucher: Omit<VoucherCode, 'id' | 'createdAt' | 'usedCount'>): VoucherCode => {
  const vouchers = getSystemVouchers();
  const newVoucher: VoucherCode = {
    id: `vouch_${Date.now()}`,
    code: voucher.code.trim().toUpperCase(),
    amount: Number(voucher.amount) || 10,
    maxUses: voucher.maxUses,
    usedCount: 0,
    isActive: voucher.isActive !== false,
    createdAt: new Date().toLocaleDateString('bn-BD')
  };
  
  // replace or add
  const existingIdx = vouchers.findIndex(v => v.code === newVoucher.code);
  if (existingIdx >= 0) {
    vouchers[existingIdx] = newVoucher;
  } else {
    vouchers.unshift(newVoucher);
  }
  
  saveSystemVouchers(vouchers);
  return newVoucher;
};

export const deleteSystemVoucher = (id: string) => {
  const vouchers = getSystemVouchers().filter(v => v.id !== id);
  saveSystemVouchers(vouchers);
};

export const toggleSystemVoucher = (id: string) => {
  const vouchers = getSystemVouchers().map(v => {
    if (v.id === id) {
      return { ...v, isActive: !v.isActive };
    }
    return v;
  });
  saveSystemVouchers(vouchers);
};

export interface RedeemResult {
  success: boolean;
  amount?: number;
  message: string;
}

export interface VoucherPreviewResult {
  isValid: boolean;
  code: string;
  amount: number;
  message: string;
  status: 'empty' | 'valid' | 'not_found' | 'inactive' | 'exhausted' | 'already_redeemed';
}

export const previewVoucherCode = (code: string, userId: string = 'user'): VoucherPreviewResult => {
  const cleanCode = code.trim().toUpperCase();
  if (!cleanCode) {
    return {
      isValid: false,
      code: '',
      amount: 0,
      message: 'ভাউচার কোড টাইপ করুন',
      status: 'empty'
    };
  }

  const vouchers = getSystemVouchers();
  if (vouchers.length === 0) {
    return {
      isValid: false,
      code: cleanCode,
      amount: 0,
      message: 'এখনও কোনো ভাউচার কোড সক্রিয় নেই। এডমিন থেকে কোড যোগ করার পর রিডিম করতে পারবেন।',
      status: 'not_found'
    };
  }

  const match = vouchers.find(v => v.code === cleanCode);
  if (!match) {
    return {
      isValid: false,
      code: cleanCode,
      amount: 0,
      message: 'ভাউচার কোডটি পাওয়া যায়নি অথবা সঠিক নয়।',
      status: 'not_found'
    };
  }

  if (!match.isActive) {
    return {
      isValid: false,
      code: cleanCode,
      amount: match.amount,
      message: 'এই ভাউচার কোডটি বর্তমানে নিষ্ক্রিয় রয়েছে।',
      status: 'inactive'
    };
  }

  if (match.maxUses && match.usedCount >= match.maxUses) {
    return {
      isValid: false,
      code: cleanCode,
      amount: match.amount,
      message: 'এই ভাউচার কোডের ব্যবহারের সর্বোচ্চ সীমা শেষ হয়েছে।',
      status: 'exhausted'
    };
  }

  const userRedeemedKey = `lg_redeemed_voucher_${userId}_${cleanCode}`;
  if (localStorage.getItem(userRedeemedKey)) {
    return {
      isValid: false,
      code: cleanCode,
      amount: match.amount,
      message: 'আপনি ইতিমধ্যে এই ভাউচার কোডটি রিডিম করে নিয়েছেন!',
      status: 'already_redeemed'
    };
  }

  return {
    isValid: true,
    code: cleanCode,
    amount: match.amount,
    message: `বৈধ ভাউচার কোড! আপনি ৳${match.amount} বোনাস পাবেন।`,
    status: 'valid'
  };
};

export const redeemVoucherCode = (code: string, userId: string = 'user'): RedeemResult => {
  const cleanCode = code.trim().toUpperCase();
  if (!cleanCode) {
    return {
      success: false,
      message: 'অনুগ্রহ করে ভাউচার কোডটি লিখুন।'
    };
  }

  const vouchers = getSystemVouchers();
  if (vouchers.length === 0) {
    return {
      success: false,
      message: 'এখনও কোনো ভাউচার কোড সেট করা হয়নি। এডমিন থেকে কোড সক্রিয় করার পর রিডিম করতে পারবেন।'
    };
  }

  const match = vouchers.find(v => v.code === cleanCode);
  if (!match) {
    return {
      success: false,
      message: 'এই ভাউচার কোডটি সঠিক নয় অথবা সক্রিয় নেই।'
    };
  }

  if (!match.isActive) {
    return {
      success: false,
      message: 'এই ভাউচার কোডটি বর্তমানে নিষ্ক্রিয় রয়েছে।'
    };
  }

  if (match.maxUses && match.usedCount >= match.maxUses) {
    return {
      success: false,
      message: 'এই ভাউচার কোডের সর্বোচ্চ ব্যবহারের সীমা শেষ হয়ে গেছে।'
    };
  }

  // Check if user already redeemed this code
  const userRedeemedKey = `lg_redeemed_voucher_${userId}_${cleanCode}`;
  if (localStorage.getItem(userRedeemedKey)) {
    return {
      success: false,
      message: 'আপনি ইতিমধ্যে এই ভাউচার কোডটি রিডিম করে নিয়েছেন!'
    };
  }

  // Mark redeemed
  match.usedCount += 1;
  saveSystemVouchers(vouchers);
  localStorage.setItem(userRedeemedKey, 'true');

  return {
    success: true,
    amount: match.amount,
    message: `অভিনন্দন! ভাউচার কোড (${cleanCode}) সফলভাবে রিডিম হয়েছে এবং ৳${match.amount} ওয়ালেটে যুক্ত হয়েছে!`
  };
};
