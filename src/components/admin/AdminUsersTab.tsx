import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  UserCheck, 
  UserX, 
  PlusCircle, 
  MinusCircle, 
  Edit3, 
  Phone, 
  Mail, 
  Check, 
  Coins,
  Award,
  Crown,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  AlertCircle,
  History,
  RefreshCw,
  Ban,
  PauseCircle,
  PlayCircle,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole, UserProfile, VerificationRequest, Transaction } from '../../types';
import { isAuthorizedAdminPhone } from '../../lib/firebase';

export const AdminUsersTab: React.FC = () => {
  const { 
    user, 
    wallet, 
    registeredUsers, 
    isLoggedIn,
    verificationRequests,
    depositRequests,
    adminApproveVerification,
    adminRejectVerification,
    adminBulkApproveVerifications,
    adminBulkRejectVerifications,
    verifyProfile, 
    adminAdjustUserBalance, 
    adminToggleUserVerification,
    adminUpdateUserRole,
    adminDeleteUser,
    fetchFreshUsers,
    adminSuspendUser,
    adminBlockUser,
    adminActivateUser,
    adminVerifyUser,
    adminUnverifyUser,
    adminUpdateUserStatus,
    fetchUserFinancials,
    showToast,
    language 
  } = useApp();

  const isBn = language === 'bn';

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeSubView, setActiveSubView] = useState<'verifications' | 'all_users'>('verifications');
  const [adjustModalUser, setAdjustModalUser] = useState<any | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<string>('100');
  const [adjustType, setAdjustType] = useState<'credit' | 'debit'>('credit');
  const [adjustReason, setAdjustReason] = useState<string>('এডমিন ব্যালেন্স সমন্বয়');

  // Status Change Modal State
  const [statusModalUser, setStatusModalUser] = useState<any | null>(null);
  const [targetStatus, setTargetStatus] = useState<'active' | 'suspended' | 'blocked'>('suspended');
  const [customStatusReason, setCustomStatusReason] = useState<string>('');

  // Transaction History Modal State
  const [historyModalUser, setHistoryModalUser] = useState<any | null>(null);
  const [historyFinancials, setHistoryFinancials] = useState<any | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [isRefreshingUsers, setIsRefreshingUsers] = useState<boolean>(false);

  // Verification actions state
  const [selectedVerifIds, setSelectedVerifIds] = useState<string[]>([]);
  const [rejectVerifModal, setRejectVerifModal] = useState<VerificationRequest | null>(null);
  const [verifRejectReason, setVerifRejectReason] = useState<string>('অস্পষ্ট বা ভুল NID/ডকুমেন্ট ছবি');
  const [verifFilterStatus, setVerifFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  const mergedVerifications = React.useMemo(() => {
    const list: VerificationRequest[] = [...(verificationRequests || [])];
    const seenIds = new Set(list.map(v => v.id));
    const seenTrxIds = new Set(list.map(v => (v.trxId || '').toUpperCase()).filter(Boolean));

    // Also include verification deposits from real database (depositRequests)
    (depositRequests || []).forEach(d => {
      const isVerif = Boolean(
        d.isVerification || 
        d.depositType === 'verification' || 
        d.purpose === 'Account Verification' ||
        (d.purpose && d.purpose.toLowerCase().includes('verification'))
      );
      if (isVerif) {
        const trxUpper = (d.trxId || '').toUpperCase();
        if (!seenIds.has(d.id) && (!trxUpper || !seenTrxIds.has(trxUpper))) {
          seenIds.add(d.id);
          if (trxUpper) seenTrxIds.add(trxUpper);
          list.push({
            id: d.id,
            userId: d.userId,
            userName: d.userName,
            userPhone: d.userPhone || d.senderPhone,
            method: d.paymentMethod,
            senderNumber: d.senderPhone || d.userPhone,
            trxId: d.trxId,
            amount: d.amount,
            nidOrDocNumber: d.nidNumber || '',
            submittedAt: d.date || (d.createdAt ? new Date(d.createdAt).toLocaleString('bn-BD') : ''),
            status: (d.status === 'approved' ? 'approved' : d.status === 'rejected' ? 'rejected' : 'pending') as any
          });
        }
      }
    });

    return list;
  }, [verificationRequests, depositRequests]);

  const pendingVerifs = mergedVerifications.filter(v => v.status === 'pending');

  // Refresh users on mount
  useEffect(() => {
    fetchFreshUsers?.();
  }, [fetchFreshUsers]);

  // Real deposit calculator for user
  const getUserTotalDeposits = (targetUserId: string, targetPhone?: string) => {
    return (depositRequests || [])
      .filter(d => {
        if ((d.status || '').toLowerCase() !== 'approved') return false;
        const matchId = d.userId && targetUserId && d.userId === targetUserId;
        const matchPhone = targetPhone && (d.userPhone === targetPhone || d.senderPhone === targetPhone);
        return Boolean(matchId || matchPhone);
      })
      .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  };

  // Real users list: registered users plus current user if not in registeredUsers
  const userMap = new Map<string, any>();
  
  // Current logged in user (only if logged in and not a dummy placeholder)
  if (isLoggedIn && user && user.id && user.id !== 'usr_default_01' && user.phone && user.phone !== '01700000000') {
    const currentValidId = user.id || `usr_${(user.phone || '').replace(/\D/g, '')}` || 'usr_current';
    const depTotal = getUserTotalDeposits(currentValidId, user.phone);
    userMap.set(currentValidId, {
      id: currentValidId,
      name: user.name || 'সদস্য',
      phone: user.phone,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      status: user.status || 'active',
      statusReason: user.statusReason || '',
      isVerified: user.isVerified,
      verificationStatus: user.verificationStatus || (user.isVerified ? 'verified' : 'unverified'),
      referralCode: user.referralCode,
      joinedDate: user.joinedDate || new Date().toISOString().split('T')[0],
      balance: wallet.balance,
      totalDeposit: depTotal,
      totalWithdraw: (wallet as any).totalWithdrawn || 0,
      totalEarned: wallet.totalEarned || 0
    });
  }

  // Real registered users from context / localStorage
  registeredUsers.forEach((ru, idx) => {
    if (!ru) return;
    const validId = ru.id || (ru.phone ? `usr_${ru.phone.replace(/\D/g, '')}` : `user_${idx}`);
    if (validId !== 'usr_default_01' && ru.phone && ru.phone !== '01700000000' && ru.name !== 'Nusaib') {
      const calcDeposits = getUserTotalDeposits(validId, ru.phone);
      const existing = userMap.get(validId);
      userMap.set(validId, {
        id: validId,
        name: ru.name || existing?.name || 'সদস্য',
        phone: ru.phone,
        email: ru.email,
        avatar: ru.avatar || existing?.avatar,
        role: ru.role || existing?.role || 'user',
        status: ru.status || existing?.status || 'active',
        statusReason: ru.statusReason || existing?.statusReason || '',
        isVerified: ru.isVerified ?? existing?.isVerified ?? false,
        verificationStatus: ru.verificationStatus || (ru.isVerified ? 'verified' : 'unverified'),
        referralCode: ru.referralCode,
        joinedDate: ru.joinedDate || existing?.joinedDate || new Date().toISOString().split('T')[0],
        balance: (ru as any).balance ?? existing?.balance ?? 0,
        totalDeposit: calcDeposits || (ru as any).totalDeposit || existing?.totalDeposit || 0,
        totalWithdraw: (ru as any).totalWithdraw ?? existing?.totalWithdraw ?? 0,
        totalEarned: (ru as any).totalEarned ?? existing?.totalEarned ?? 0
      });
    }
  });

  const allUsersList = Array.from(userMap.values());

  const filteredUsers = allUsersList.filter(u => {
    const matchesRole = filterRole === 'all' ? true : u.role === filterRole;
    const matchesStatus = filterStatus === 'all' ? true : (u.status || 'active') === filterStatus;
    const matchesSearch = (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (u.phone || '').includes(searchQuery) ||
                          (u.referralCode || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesStatus && matchesSearch;
  });

  const handleManualRefresh = async () => {
    setIsRefreshingUsers(true);
    try {
      await fetchFreshUsers?.();
      showToast('ইউজার তালিকা রিফ্রেশ সম্পন্ন হয়েছে।');
    } catch {}
    setIsRefreshingUsers(false);
  };

  const handleOpenStatusModal = (u: any, desiredStatus: 'active' | 'suspended' | 'blocked') => {
    setStatusModalUser(u);
    setTargetStatus(desiredStatus);
    setCustomStatusReason(
      desiredStatus === 'blocked' ? 'অস্বাভাবিক কার্যকলাপের কারণে অ্যাকাউন্ট ব্লক' :
      desiredStatus === 'suspended' ? 'নীতিমালা লঙ্ঘনের কারণে সাময়িক স্থগিত' : ''
    );
  };

  const handleConfirmStatusChange = async () => {
    if (!statusModalUser) return;
    await adminUpdateUserStatus(statusModalUser.id, targetStatus, customStatusReason);
    setStatusModalUser(null);
  };

  const handleOpenHistory = async (u: any) => {
    setHistoryModalUser(u);
    setIsLoadingHistory(true);
    setHistoryFinancials(null);
    try {
      const data = await fetchUserFinancials(u.id);
      if (data) {
        setHistoryFinancials(data);
      } else {
        // Fallback local calculation
        setHistoryFinancials({
          currentBalance: u.balance || 0,
          totalDeposit: u.totalDeposit || 0,
          totalWithdraw: u.totalWithdraw || 0,
          totalEarned: u.totalEarned || 0,
          transactions: []
        });
      }
    } catch (err) {
      console.warn('Error fetching history:', err);
    }
    setIsLoadingHistory(false);
  };

  const handleAdjustBalance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustModalUser) return;
    const amountNum = parseFloat(adjustAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      showToast('সঠিক ব্যালেন্স পরিমাণ লিখুন!');
      return;
    }
    adminAdjustUserBalance(adjustModalUser.id, amountNum, adjustType, adjustReason);
    setAdjustModalUser(null);
  };

  const handleConfirmRejectVerif = () => {
    if (!rejectVerifModal) return;
    adminRejectVerification(rejectVerifModal.id, verifRejectReason);
    setRejectVerifModal(null);
  };

  const filteredVerifications = (mergedVerifications || []).filter(v => {
    const matchesStatus = verifFilterStatus === 'all' ? true : v.status === verifFilterStatus;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesStatus;
    const matchesQuery = 
      (v.userName || '').toLowerCase().includes(q) ||
      (v.userPhone || '').includes(q) ||
      (v.nidOrDocNumber || '').toLowerCase().includes(q) ||
      (v.referrerPhone || '').includes(q);
    return matchesStatus && matchesQuery;
  });

  return (
    <div className="space-y-3.5">
      {/* Top View Selector Strip */}
      <div className="flex items-center gap-2 p-1.5 bg-gray-100 rounded-2xl border border-gray-200">
        <button
          onClick={() => setActiveSubView('verifications')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeSubView === 'verifications'
              ? 'bg-white text-indigo-950 shadow-sm border border-gray-200'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <span>{isBn ? 'KYC ভেরিফিকেশন রিভিউ কিউ' : 'KYC Verification Queue'}</span>
          {pendingVerifs.length > 0 && (
            <span className="px-2 py-0.5 bg-rose-600 text-white text-[10px] font-black rounded-full animate-pulse">
              {pendingVerifs.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubView('all_users')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeSubView === 'all_users'
              ? 'bg-white text-slate-900 shadow-sm border border-gray-200'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Users className="w-4 h-4 text-sky-600" />
          <span>{isBn ? 'সকল নিবন্ধিত সদস্য' : 'All Users'}</span>
          <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-[10px] font-bold rounded-full">
            {allUsersList.length}
          </span>
        </button>
      </div>

      {activeSubView === 'verifications' ? (
        /* KYC Verification Review Queue */
        <div className="space-y-3">
          {/* Header Banner */}
          <div className="p-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-sky-900 text-white rounded-2xl border border-indigo-700 shadow-sm space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-300" />
              <h4 className="text-sm font-black">
                {isBn ? 'ইউজার একাউন্ট ভেরিফিকেশন ও রেফার বোনাস কন্ট্রোল' : 'User KYC & Referral Bonus Approval'}
              </h4>
            </div>
            <p className="text-xs text-indigo-200">
              {isBn 
                ? 'ইউজারের সাবমিট করা এনআইডি/ডকুমেন্ট যাচাই করে "অ্যাপ্রুভ" বাটনে ক্লিক করলে রেফারার তার প্রাপ্য বোনাস ওয়ালেটে পাবেন এবং ইউজারের ব্লু টিক চালু হবে।' 
                : 'User verification remains Pending until manually approved by admin. Approving automatically releases the referral bonus to the referrer.'}
            </p>
          </div>

          {/* Status Filters & Search */}
          <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row gap-2 items-center justify-between">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isBn ? 'নাম, ফোন বা NID নম্বর খুঁজুন...' : 'Search by name, phone, NID...'}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-400"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            </div>

            <div className="flex gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar">
              <button
                onClick={() => setVerifFilterStatus('pending')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  verifFilterStatus === 'pending'
                    ? 'bg-indigo-600 text-white shadow-xs font-black'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isBn ? `পেন্ডিং (${pendingVerifs.length})` : `Pending (${pendingVerifs.length})`}
              </button>
              <button
                onClick={() => setVerifFilterStatus('approved')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  verifFilterStatus === 'approved'
                    ? 'bg-emerald-600 text-white shadow-xs font-black'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isBn ? 'অনুমোদিত' : 'Approved'}
              </button>
              <button
                onClick={() => setVerifFilterStatus('rejected')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  verifFilterStatus === 'rejected'
                    ? 'bg-rose-600 text-white shadow-xs font-black'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isBn ? 'বাতিল' : 'Rejected'}
              </button>
              <button
                onClick={() => setVerifFilterStatus('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  verifFilterStatus === 'all'
                    ? 'bg-slate-900 text-white shadow-xs font-black'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isBn ? 'সকল' : 'All'}
              </button>
            </div>
          </div>

          {/* Bulk Action Strip for Pending Verifications */}
          {pendingVerifs.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-indigo-50/70 rounded-xl border border-indigo-200/80 text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-indigo-950 select-none">
                <input
                  type="checkbox"
                  checked={selectedVerifIds.length > 0 && selectedVerifIds.length === pendingVerifs.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedVerifIds(pendingVerifs.map(p => p.id));
                    } else {
                      setSelectedVerifIds([]);
                    }
                  }}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span>
                  {selectedVerifIds.length > 0 
                    ? `${selectedVerifIds.length}টি পেন্ডিং ভেরিফিকেশন নির্বাচিত` 
                    : `সকল পেন্ডিং ভেরিফিকেশন সিলেক্ট করুন (${pendingVerifs.length})`}
                </span>
              </label>

              {selectedVerifIds.length > 0 && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedVerifIds([])}
                    className="px-2.5 py-1 text-slate-600 hover:text-slate-900 font-semibold text-[11px]"
                  >
                    {isBn ? 'বাতিল' : 'Clear'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      adminBulkRejectVerifications(selectedVerifIds, 'ডকুমেন্ট অসম্পূর্ণ বা অস্পষ্ট');
                      setSelectedVerifIds([]);
                    }}
                    className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    <span>{isBn ? 'একসাথে বাতিল' : 'Bulk Reject'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      adminBulkApproveVerifications(selectedVerifIds);
                      setSelectedVerifIds([]);
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    <span>{isBn ? 'একসাথে অনুমোদন ও বোনাস প্রদান' : 'Bulk Approve'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Verification Requests List */}
          {filteredVerifications.length === 0 ? (
            <div className="py-12 text-center text-gray-400 space-y-2 bg-white rounded-2xl border border-dashed border-gray-200">
              <ShieldCheck className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="text-xs font-bold text-gray-500">
                {isBn ? 'কোনো ভেরিফিকেশন আবেদন পাওয়া যায়নি।' : 'No verification requests found.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredVerifications.map((req, idx) => (
                <div 
                  key={req.id || `verif_${req.userId || req.userPhone || idx}_${idx}`}
                  className="p-4 bg-white rounded-2xl border border-gray-200/90 shadow-2xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      {req.status === 'pending' && (
                        <input
                          type="checkbox"
                          checked={selectedVerifIds.includes(req.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedVerifIds(prev => [...prev, req.id]);
                            } else {
                              setSelectedVerifIds(prev => prev.filter(id => id !== req.id));
                            }
                          }}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0"
                        />
                      )}
                      <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xs shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-xs sm:text-sm text-gray-900">{req.userName}</span>
                          <span className="text-[10px] bg-gray-100 text-gray-700 font-mono px-2 py-0.5 rounded-md border border-gray-200">
                            {req.userPhone}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-medium">আবেদনের সময়: {req.submittedAt}</span>
                      </div>
                    </div>

                    <div>
                      {req.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" />
                          অপেক্ষমাণ (Pending Review)
                        </span>
                      )}
                      {req.status === 'approved' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          অনুমোদিত ও বোনাস পেইড
                        </span>
                      )}
                      {req.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200">
                          <XCircle className="w-3 h-3 text-rose-600" />
                          বাতিল
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Document & Referrer Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-gray-50/80 p-3 rounded-xl border border-gray-100 text-xs">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold block uppercase">
                        {req.docType || 'জাতীয় পরিচয়পত্র (NID)'} নম্বর:
                      </span>
                      <span className="font-mono font-black text-gray-900 text-sm">
                        {req.nidOrDocNumber || 'সাবমিট করা হয়নি'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-400 font-bold block uppercase">
                        রেফারার তথ্য ও বোনাস স্ট্যাটাস:
                      </span>
                      {req.referrerPhone ? (
                        <span className="font-bold text-indigo-700 flex items-center gap-1">
                          <Coins className="w-3.5 h-3.5 text-amber-500" />
                          রেফারার: {req.referrerPhone} (অনুমোদনে সরাসরি বোনাস পাবে)
                        </span>
                      ) : (
                        <span className="text-gray-500 font-medium">কোনো রেফারার নেই</span>
                      )}
                    </div>
                  </div>

                  {/* Document Image Previews if available */}
                  {(req.frontImage || req.backImage) && (
                    <div className="flex gap-2">
                      {req.frontImage && (
                        <div className="space-y-1">
                          <span className="text-[10px] text-gray-400 font-bold block">সামনের অংশ:</span>
                          <img 
                            src={req.frontImage} 
                            alt="Front document" 
                            className="w-28 h-20 object-cover rounded-lg border border-gray-200 shadow-2xs"
                          />
                        </div>
                      )}
                      {req.backImage && (
                        <div className="space-y-1">
                          <span className="text-[10px] text-gray-400 font-bold block">পেছনের অংশ:</span>
                          <img 
                            src={req.backImage} 
                            alt="Back document" 
                            className="w-28 h-20 object-cover rounded-lg border border-gray-200 shadow-2xs"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {req.rejectionReason && (
                    <div className="text-[11px] text-rose-700 bg-rose-50 px-2.5 py-1.5 rounded-lg border border-rose-200 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{isBn ? 'বাতিলের কারণ:' : 'Reason:'} {req.rejectionReason}</span>
                    </div>
                  )}

                  {/* Action Buttons for Pending Verifications */}
                  {req.status === 'pending' && (
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-gray-100">
                      <button
                        onClick={() => setRejectVerifModal(req)}
                        className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>{isBn ? 'বাতিল করুন' : 'Reject'}</span>
                      </button>

                      <button
                        onClick={() => adminApproveVerification(req.id)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all transform active:scale-95 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isBn ? 'অ্যাপ্রুভ ও রেফার বোনাস রিলিজ' : 'Approve & Release Referral Bonus'}</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* All Users Directory View */
        <div className="space-y-3.5">
          {/* Search, Filter & Refresh Bar */}
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-100 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isBn ? 'নাম, ফোন বা রেফার কোড খুঁজুন...' : 'Search by name, phone, referral...'}
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-sky-400"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                {/* Status Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-2 text-gray-700 focus:ring-2 focus:ring-sky-400"
                >
                  <option value="all">{isBn ? 'সকল স্ট্যাটাস' : 'All Status'}</option>
                  <option value="active">{isBn ? 'সক্রিয় (Active)' : 'Active'}</option>
                  <option value="suspended">{isBn ? 'স্থগিত (Suspended)' : 'Suspended'}</option>
                  <option value="blocked">{isBn ? 'ব্লকড (Blocked)' : 'Blocked'}</option>
                </select>

                {/* Refresh Button */}
                <button
                  type="button"
                  onClick={handleManualRefresh}
                  disabled={isRefreshingUsers}
                  className="px-3 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-xl text-xs font-bold border border-sky-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="ডাটাবেজ থেকে রিফ্রেশ করুন"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingUsers ? 'animate-spin' : ''}`} />
                  <span>{isBn ? 'রিফ্রেশ' : 'Refresh'}</span>
                </button>
              </div>
            </div>

            {/* Role Filter Pills */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pt-1 border-t border-gray-100">
              {['all', 'user', 'reseller', 'vendor', 'super_admin'].map(r => (
                <button
                  key={r}
                  onClick={() => setFilterRole(r)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all capitalize cursor-pointer ${
                    filterRole === r
                      ? 'bg-sky-500 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {r === 'all' ? (isBn ? 'সকল রোল' : 'All Roles') : r}
                </button>
              ))}
            </div>
          </div>

          {/* Users Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredUsers.length === 0 ? (
              <div className="col-span-full bg-white p-8 rounded-2xl border border-gray-100 text-center space-y-2">
                <Users className="w-10 h-10 text-gray-300 mx-auto" />
                <p className="text-sm font-bold text-gray-600">{isBn ? 'কোন ব্যবহারকারী পাওয়া যায়নি' : 'No users found'}</p>
              </div>
            ) : (
              filteredUsers.map((u, idx) => (
                <div 
                  key={u.id || u.phone || `user_${idx}`}
                  className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-3"
                >
                  {/* Header / Avatar / Info / Badges */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <img 
                        src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                        alt={u.name} 
                        className="w-11 h-11 rounded-2xl object-cover border border-gray-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-extrabold text-xs sm:text-sm text-gray-900 truncate">{u.name}</h4>
                          {u.isVerified ? (
                            <span className="p-0.5 bg-emerald-100 text-emerald-700 rounded-full shrink-0" title="KYC ভেরিফাইড">
                              <ShieldCheck className="w-3.5 h-3.5" />
                            </span>
                          ) : (
                            <span className="p-0.5 bg-gray-100 text-gray-400 rounded-full shrink-0" title="আনভেরিফাইড">
                              <ShieldAlert className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium">
                          <span>ফোন: <strong className="text-gray-700">{u.phone}</strong></span>
                          <span>•</span>
                          <span>রেফার: <strong className="text-gray-700">{u.referralCode}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {/* Status Badge */}
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                        u.status === 'blocked' ? 'bg-rose-100 text-rose-900 border border-rose-200' :
                        u.status === 'suspended' ? 'bg-amber-100 text-amber-900 border border-amber-200' :
                        'bg-emerald-100 text-emerald-900 border border-emerald-200'
                      }`}>
                        {u.status === 'blocked' ? '✕ ব্লকড' : u.status === 'suspended' ? '⏸ স্থগিত' : '● সক্রিয়'}
                      </span>

                      {/* Role Badge */}
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                        u.role === 'super_admin' ? 'bg-purple-100 text-purple-900 border border-purple-200' :
                        u.role === 'reseller' ? 'bg-sky-100 text-sky-900' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {u.role}
                      </span>
                    </div>
                  </div>

                  {/* Financial Statistics (Real Database Connected) */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-xs text-center">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-gray-400 font-bold block">মোট ডিপোজিট</span>
                      <span className="font-black text-emerald-600">৳{(u.totalDeposit || 0).toFixed(2)}</span>
                    </div>
                    <div className="space-y-0.5 border-x border-gray-200 px-1">
                      <span className="text-[10px] text-gray-400 font-bold block">বর্তমান ব্যালেন্স</span>
                      <span className="font-black text-sky-600">৳{(u.balance || 0).toFixed(2)}</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-gray-400 font-bold block">মোট উইথড্র</span>
                      <span className="font-black text-amber-600">৳{(u.totalWithdraw || 0).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Account Status Control Row */}
                  <div className="flex items-center gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-200/70 text-xs">
                    <span className="text-[11px] font-bold text-gray-600 shrink-0">স্ট্যাটাস পরিবর্তন:</span>
                    {u.status === 'blocked' ? (
                      <button
                        type="button"
                        onClick={() => adminActivateUser(u.id)}
                        className="flex-1 py-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] rounded-lg shadow-2xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>আনব্লক ও সক্রিয় করুন</span>
                      </button>
                    ) : u.status === 'suspended' ? (
                      <button
                        type="button"
                        onClick={() => adminActivateUser(u.id)}
                        className="flex-1 py-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] rounded-lg shadow-2xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>স্থগিতাদেশ তুলে সক্রিয় করুন</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5 flex-1">
                        <button
                          type="button"
                          onClick={() => handleOpenStatusModal(u, 'suspended')}
                          className="flex-1 py-1 px-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[11px] rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <PauseCircle className="w-3 h-3 text-amber-700" />
                          <span>স্থগিত</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenStatusModal(u, 'blocked')}
                          className="flex-1 py-1 px-2 bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-300 font-bold text-[11px] rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Ban className="w-3 h-3 text-rose-700" />
                          <span>ব্লক</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* KYC Verification, Transaction History & Adjust Balance Buttons */}
                  <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
                    {/* Verification Toggle */}
                    <button
                      type="button"
                      onClick={() => {
                        if (u.isVerified) {
                          adminUnverifyUser(u.id);
                        } else {
                          adminVerifyUser(u.id);
                        }
                      }}
                      className={`py-1.5 rounded-xl font-bold border flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        u.isVerified 
                          ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100' 
                          : 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                      }`}
                      title={u.isVerified ? 'আনভেরিফাই করুন' : 'ভেরিফাই করুন'}
                    >
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{u.isVerified ? 'আনভেরিফাই' : 'KYC ভেরিফাই'}</span>
                    </button>

                    {/* Transaction History Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenHistory(u)}
                      className="py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 rounded-xl font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                      title="ইউজারের বিস্তারিত লেনদেন ইতিহাস"
                    >
                      <History className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">লেনদেন হিস্ট্রি</span>
                    </button>

                    {/* Balance Adjust */}
                    <button
                      type="button"
                      onClick={() => setAdjustModalUser(u)}
                      className="py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-black flex items-center justify-center gap-1 shadow-2xs active:scale-95 transition-all cursor-pointer"
                      title="অ্যাডমিন ব্যালেন্স সমন্বয়"
                    >
                      <Coins className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">ব্যালেন্স সমন্বয়</span>
                    </button>
                  </div>

                  {/* Role Modifier and Delete */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-gray-500 font-bold">রোল:</span>
                      <select
                        value={u.role}
                        onChange={(e) => adminUpdateUserRole(u.id, e.target.value as UserRole)}
                        className="text-[11px] font-bold bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 focus:ring-1 focus:ring-sky-400 cursor-pointer"
                      >
                        <option value="user">User (ব্যবহারকারী)</option>
                        <option value="reseller">Reseller (রিসেলার)</option>
                        <option value="vendor">Vendor (ভেন্ডর)</option>
                        {isAuthorizedAdminPhone(u.phone) && (
                          <option value="admin">Admin (এডমিন)</option>
                        )}
                        {isAuthorizedAdminPhone(u.phone) && (
                          <option value="super_admin">Super Admin (সুপার এডমিন)</option>
                        )}
                      </select>
                    </div>

                    {u.id !== user.id && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`আপনি কি নিশ্চিত ইউজার "${u.name}" মুছে ফেলতে চান?`)) {
                            adminDeleteUser(u.id);
                          }
                        }}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="ইউজার ডিলিট করুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Adjust Balance Modal */}
      {adjustModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <form 
            onSubmit={handleAdjustBalance}
            className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-sky-100 text-sky-800 rounded-2xl">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-gray-900">ব্যালেন্স সমন্বয় (Audit)</h3>
                <p className="text-[11px] text-gray-500">গ্রাহক: {adjustModalUser.name}</p>
              </div>
            </div>

            {/* Type selector */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAdjustType('credit')}
                className={`py-2 rounded-xl font-extrabold text-xs border transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  adjustType === 'credit' 
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' 
                    : 'bg-gray-50 text-gray-700 border-gray-200'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ ক্রেডিট (টাকা যোগ)</span>
              </button>

              <button
                type="button"
                onClick={() => setAdjustType('debit')}
                className={`py-2 rounded-xl font-extrabold text-xs border transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  adjustType === 'debit' 
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs' 
                    : 'bg-gray-50 text-gray-700 border-gray-200'
                }`}
              >
                <MinusCircle className="w-3.5 h-3.5" />
                <span>- ডেবিট (টাকা কর্তন)</span>
              </button>
            </div>

            {/* Amount */}
            <div>
              <label className="text-[11px] font-bold text-gray-700 block mb-1">পরিমাণ (টাকা):</label>
              <input
                type="number"
                required
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
                className="w-full text-xs font-black p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-400"
              />
            </div>

            {/* Reason */}
            <div>
              <label className="text-[11px] font-bold text-gray-700 block mb-1">সমন্বয়ের কারণ (অডিট ট্রেইল):</label>
              <input
                type="text"
                required
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAdjustModalUser(null)}
                className="py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-black text-xs rounded-xl shadow-xs cursor-pointer"
              >
                নিশ্চিত করুন
              </button>
            </div>
          </form>
        </div>
      )}

      {/* User Status Change Modal (Suspend / Block) */}
      {statusModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <h4 className="font-black text-sm text-gray-900">
                {targetStatus === 'blocked' ? 'অ্যাকাউন্ট ব্লক করুন' : 'অ্যাকাউন্ট সাময়িক স্থগিত করুন'}
              </h4>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs space-y-1">
              <p className="font-bold text-gray-800">{statusModalUser.name}</p>
              <p className="text-gray-500 font-medium">মোবাইল: {statusModalUser.phone}</p>
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-700 block mb-1.5">কারণ নির্বাচন করুন বা লিখুন:</label>
              <div className="space-y-1.5 mb-2">
                {[
                  'অস্বাভাবিক বা সন্দেহজনক লেনদেন',
                  'প্ল্যাটফর্ম নীতিমালা লঙ্ঘন',
                  'ভুয়া বা নকল ডকুমেন্ট সাবমিশন',
                  'অন্যান্য প্রশাসনিক কারণ'
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setCustomStatusReason(preset)}
                    className={`w-full text-left p-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      customStatusReason === preset 
                        ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold ring-1 ring-amber-300' 
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={customStatusReason}
                onChange={(e) => setCustomStatusReason(e.target.value)}
                placeholder="নির্দিষ্ট কারণ লিখুন..."
                className="w-full text-xs font-semibold p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStatusModalUser(null)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleConfirmStatusChange}
                className={`flex-1 py-2.5 text-white font-black text-xs rounded-xl shadow-xs transition-colors cursor-pointer ${
                  targetStatus === 'blocked' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                নিশ্চিত করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Transaction History Modal */}
      {historyModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-fade-in">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col space-y-4 animate-scale-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-2xl">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-gray-900 flex items-center gap-2">
                    <span>{historyModalUser.name} - লেনদেন হিস্ট্রি</span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                      historyModalUser.status === 'blocked' ? 'bg-rose-100 text-rose-900' :
                      historyModalUser.status === 'suspended' ? 'bg-amber-100 text-amber-900' :
                      'bg-emerald-100 text-emerald-900'
                    }`}>
                      {historyModalUser.status || 'active'}
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">মোবাইল: {historyModalUser.phone} | ইউজার আইডি: {historyModalUser.id}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setHistoryModalUser(null)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 bg-sky-50 rounded-2xl border border-sky-100 text-center">
                <span className="text-[10px] font-bold text-sky-600 block">বর্তমান ব্যালেন্স</span>
                <span className="text-sm sm:text-base font-black text-sky-900">
                  ৳{(historyFinancials?.currentBalance ?? historyModalUser.balance ?? 0).toFixed(2)}
                </span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
                <span className="text-[10px] font-bold text-emerald-600 block">মোট ডিপোজিট</span>
                <span className="text-sm sm:text-base font-black text-emerald-900">
                  ৳{(historyFinancials?.totalDeposit ?? historyModalUser.totalDeposit ?? 0).toFixed(2)}
                </span>
              </div>
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100 text-center">
                <span className="text-[10px] font-bold text-amber-600 block">মোট উইথড্র</span>
                <span className="text-sm sm:text-base font-black text-amber-900">
                  ৳{(historyFinancials?.totalWithdraw ?? historyModalUser.totalWithdraw ?? 0).toFixed(2)}
                </span>
              </div>
              <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100 text-center">
                <span className="text-[10px] font-bold text-purple-600 block">মোট ট্রানজেকশন</span>
                <span className="text-sm sm:text-base font-black text-purple-900">
                  {historyFinancials?.transactionCount ?? historyFinancials?.transactions?.length ?? 0} টি
                </span>
              </div>
            </div>

            {/* Transactions List */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 max-h-96">
              <h4 className="text-xs font-extrabold text-gray-700 flex items-center justify-between">
                <span>লেনদেন বিবরণী (Timeline)</span>
                {isLoadingHistory && <span className="text-[11px] text-sky-600 font-bold flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" /> লোড হচ্ছে...</span>}
              </h4>

              {isLoadingHistory ? (
                <div className="py-12 text-center text-gray-400 space-y-2">
                  <RefreshCw className="w-8 h-8 mx-auto animate-spin text-sky-500" />
                  <p className="text-xs font-bold">ডাটাবেজ থেকে লেনদেন লোড করা হচ্ছে...</p>
                </div>
              ) : !historyFinancials?.transactions || historyFinancials.transactions.length === 0 ? (
                <div className="py-10 text-center bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                  <FileText className="w-8 h-8 text-gray-300 mx-auto" />
                  <p className="text-xs font-bold text-gray-600">কোন লেনদেন রেকর্ড পাওয়া যায়নি।</p>
                </div>
              ) : (
                historyFinancials.transactions.map((tx: any, tIdx: number) => {
                  const isCredit = tx.type === 'deposit' || tx.type === 'referral' || tx.type === 'bonus' || (tx.type === 'adjustment' && !String(tx.description || '').includes('ডেবিট'));
                  return (
                    <div 
                      key={tx.id ? `${tx.id}-${tIdx}` : `tx_${tIdx}`}
                      className="p-3 bg-gray-50 hover:bg-white rounded-xl border border-gray-100 shadow-2xs transition-all space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`p-1 rounded-lg ${isCredit ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                            {isCredit ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                          </span>
                          <div>
                            <span className="font-extrabold text-xs text-gray-900 block capitalize">
                              {tx.type === 'deposit' ? 'ডিপোজিট (Deposit)' :
                               tx.type === 'withdrawal' ? 'উইথড্র (Withdrawal)' :
                               tx.type === 'adjustment' ? 'অ্যাডমিন সমন্বয় (Adjustment)' :
                               tx.type === 'referral' ? 'রেফারেল বোনাস' :
                               tx.type === 'bonus' ? 'বোনাস' : tx.type}
                            </span>
                            <span className="text-[10px] text-gray-400">{tx.date || tx.createdAt}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className={`font-black text-xs sm:text-sm ${isCredit ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {isCredit ? '+' : '-'}৳{Math.abs(Number(tx.amount) || 0).toFixed(2)}
                          </span>
                          <span className={`block text-[9px] font-black uppercase ${
                            tx.status === 'completed' || tx.status === 'approved' ? 'text-emerald-600' :
                            tx.status === 'rejected' ? 'text-rose-600' : 'text-amber-600'
                          }`}>
                            {tx.status}
                          </span>
                        </div>
                      </div>

                      {/* Description & Balance Before/After */}
                      <div className="flex items-center justify-between pt-1 border-t border-gray-200/60 text-[10px]">
                        <span className="text-gray-600 font-medium truncate max-w-xs">{tx.description || tx.method || 'সিস্টেম লেনদেন'}</span>
                        <div className="flex items-center gap-2 font-mono text-gray-500 shrink-0">
                          {tx.balanceBefore !== undefined && <span>পূর্বে: ৳{Number(tx.balanceBefore).toFixed(2)}</span>}
                          {tx.balanceAfter !== undefined && <span className="text-sky-700 font-bold">বর্তমানে: ৳{Number(tx.balanceAfter).toFixed(2)}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-2 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setHistoryModalUser(null)}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Verification Modal */}
      {rejectVerifModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-gray-100 space-y-4 animate-scale-up">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertCircle className="w-5 h-5" />
              <h4 className="font-black text-sm text-gray-900">
                {isBn ? 'ভেরিফিকেশন আবেদন বাতিল' : 'Reject Verification Request'}
              </h4>
            </div>

            <p className="text-xs text-gray-600">
              {isBn 
                ? `${rejectVerifModal.userName} (${rejectVerifModal.userPhone})-এর ভেরিফিকেশন বাতিল করার কারণ নির্ধারণ করুন:`
                : `Select reason to reject verification for ${rejectVerifModal.userName}:`}
            </p>

            <div className="space-y-1.5">
              {[
                'অস্পষ্ট বা ঝাপসা NID/ডকুমেন্টের ছবি',
                'ভুল বা অস্তিত্বহীন NID নম্বর দেওয়া হয়েছে',
                'ডকুমেন্টের তথ্যের সাথে প্রোফাইল তথ্যের অসঙ্গতি',
                'ভুয়া বা নকল ডকুমেন্ট সাবমিশন'
              ].map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setVerifRejectReason(reason)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    verifRejectReason === reason 
                      ? 'bg-rose-50 border-rose-300 text-rose-900 font-bold ring-1 ring-rose-300' 
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectVerifModal(null)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                {isBn ? 'ফিরে যান' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmRejectVerif}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {isBn ? 'বাতিল নিশ্চিত করুন' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
