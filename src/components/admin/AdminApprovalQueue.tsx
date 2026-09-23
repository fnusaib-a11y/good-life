import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { DepositRequest } from '../../types';
import { 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowDownLeft, 
  Copy, 
  Check, 
  AlertCircle, 
  ShieldCheck,
  Phone,
  Calendar,
  Hash,
  UserCheck,
  Settings,
  RefreshCw,
  Zap
} from 'lucide-react';

interface AdminApprovalQueueProps {
  onNavigateTab?: (tab: any) => void;
}

export const AdminApprovalQueue: React.FC<AdminApprovalQueueProps> = ({ onNavigateTab }) => {
  const { 
    depositRequests, 
    fetchFreshDeposits,
    adminApproveDeposit, 
    adminRejectDeposit,
    adminBulkApproveDeposits,
    adminBulkRejectDeposits,
    language, 
    showToast 
  } = useApp();

  const isBn = language === 'bn';
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'verification' | 'special_social'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<DepositRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('ভুল বা অসত্য ট্রানজেকশন আইডি (TrxID)');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkRejectModal, setBulkRejectModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (fetchFreshDeposits) {
      fetchFreshDeposits().catch(() => {});
    }
    const interval = setInterval(() => {
      if (fetchFreshDeposits) {
        fetchFreshDeposits().catch(() => {});
      }
    }, 3000);

    const handleRealtimeUpdate = () => {
      if (fetchFreshDeposits) {
        fetchFreshDeposits().catch(() => {});
      }
    };
    window.addEventListener('goodlife:deposit_updated', handleRealtimeUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('goodlife:deposit_updated', handleRealtimeUpdate);
    };
  }, [fetchFreshDeposits]);

  const handleManualRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      if (fetchFreshDeposits) {
        await fetchFreshDeposits();
      }
      showToast(isBn ? 'ডিপোজিট তালিকা সফলভাবে রিলোড করা হয়েছে!' : 'Deposit list refreshed successfully!');
    } catch {
      showToast(isBn ? 'রিলোড ব্যর্থ হয়েছে' : 'Refresh failed');
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const pendingList = depositRequests.filter(d => (d.status || 'pending').toLowerCase() === 'pending');
  const approvedList = depositRequests.filter(d => (d.status || '').toLowerCase() === 'approved');
  const rejectedList = depositRequests.filter(d => (d.status || '').toLowerCase() === 'rejected');
  const verificationList = depositRequests.filter(d => 
    Boolean(d.isVerification || d.depositType === 'verification' || d.purpose === 'Account Verification' || (d.purpose && d.purpose.toLowerCase().includes('verification')))
  );
  const specialSocialList = depositRequests.filter(d => 
    Boolean(d.depositType === 'special_social' || d.purpose === 'বিশেষ সোশ্যাল ইনকাম এক্সেস' || (d.purpose && d.purpose.includes('বিশেষ সোশ্যাল')))
  );

  const totalPendingAmount = pendingList.reduce((sum, d) => sum + (d.amount || 0), 0);
  const totalApprovedAmount = approvedList.reduce((sum, d) => sum + (d.amount || 0), 0);

  const filteredRequests = depositRequests.filter(req => {
    const status = (req.status || 'pending').toLowerCase();
    const isVerifReq = Boolean(req.isVerification || req.depositType === 'verification' || req.purpose === 'Account Verification' || (req.purpose && req.purpose.toLowerCase().includes('verification')));
    const isSpecialSocialReq = Boolean(req.depositType === 'special_social' || req.purpose === 'বিশেষ সোশ্যাল ইনকাম এক্সেস' || (req.purpose && req.purpose.includes('বিশেষ সোশ্যাল')));

    let matchesStatus = true;
    if (filterStatus === 'verification') {
      matchesStatus = isVerifReq;
    } else if (filterStatus === 'special_social') {
      matchesStatus = isSpecialSocialReq;
    } else if (filterStatus !== 'all') {
      matchesStatus = status === filterStatus.toLowerCase();
    }

    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesStatus;

    const matchesSearch = 
      (req.userName && req.userName.toLowerCase().includes(q)) ||
      (req.userId && req.userId.toLowerCase().includes(q)) ||
      (req.trxId && req.trxId.toLowerCase().includes(q)) ||
      (req.senderPhone && req.senderPhone.includes(q)) ||
      (req.userPhone && req.userPhone.includes(q)) ||
      (req.paymentMethod && req.paymentMethod.toLowerCase().includes(q)) ||
      (req.purpose && req.purpose.toLowerCase().includes(q)) ||
      (req.nidNumber && req.nidNumber.toLowerCase().includes(q));

    return matchesStatus && matchesSearch;
  }).sort((a, b) => {
    const timeA = a.timestamp || (a.createdAt ? Date.parse(a.createdAt) : 0) || 0;
    const timeB = b.timestamp || (b.createdAt ? Date.parse(b.createdAt) : 0) || 0;
    return timeB - timeA;
  });

  const handleCopy = (text: string, id: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(text).catch(() => {});
      }
    } catch {
      // fallback
    }
    setCopiedKey(id);
    showToast(`${text} ${isBn ? 'কপি করা হয়েছে!' : 'copied!'}`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleConfirmReject = () => {
    if (!rejectModal) return;
    adminRejectDeposit(rejectModal.id, rejectReason);
    setRejectModal(null);
  };

  return (
    <div id="admin-approval-queue" className="space-y-4">
      {/* Header Info Banner */}
      <div className="bg-gradient-to-r from-sky-500 via-sky-600 to-sky-700 text-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-md border border-sky-400/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/20 text-white flex items-center justify-center shrink-0 shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-sm sm:text-base text-white">
                {isBn ? 'ডিপোজিট অ্যাপ্রুভাল কিউ (Admin Approval Queue)' : 'Deposit Approval Queue'}
              </h3>
              {pendingList.length > 0 && (
                <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                  {pendingList.length} {isBn ? 'পেন্ডিং' : 'Pending'}
                </span>
              )}
            </div>
            <p className="text-xs text-sky-100 font-semibold mt-0.5">
              {isBn 
                ? 'ইউজারের ডিপোজিট রিকোয়েস্ট ভেরিফাই করে এখানে অ্যাপ্রুভ করলেই সরাসরি ইউজারের মেইন ব্যালেন্স বৃদ্ধি পাবে।' 
                : 'User balances are only credited after you review and approve their deposit request here.'}
            </p>
          </div>
        </div>

        {onNavigateTab && (
          <button
            type="button"
            onClick={() => onNavigateTab('settings')}
            className="px-3.5 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer border border-white/25 shrink-0 active:scale-95"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{isBn ? 'ডিপোজিট নম্বর ও সীমা পরিবর্তন' : 'Deposit Settings'}</span>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        <div className="bg-sky-50 p-3.5 rounded-2xl border border-sky-200">
          <span className="text-[10px] text-sky-800 font-bold block">
            {isBn ? 'পেন্ডিং ডিপোজিট' : 'Pending Deposits'}
          </span>
          <span className="text-base sm:text-xl font-black text-sky-950">
            ৳{totalPendingAmount.toLocaleString()}
          </span>
          <span className="text-[10px] text-sky-700 font-medium mt-0.5 block">
            {pendingList.length} {isBn ? 'টি আবেদন অপেক্ষমাণ' : 'requests waiting'}
          </span>
        </div>

        <div className="bg-sky-50/80 p-3.5 rounded-2xl border border-sky-200">
          <span className="text-[10px] text-sky-800 font-bold block">
            {isBn ? 'মোট অনুমোদিত ডিপোজিট' : 'Total Approved Deposits'}
          </span>
          <span className="text-base sm:text-xl font-black text-sky-950">
            ৳{totalApprovedAmount.toLocaleString()}
          </span>
          <span className="text-[10px] text-sky-700 font-medium mt-0.5 block">
            {approvedList.length} {isBn ? 'টি সফল লেনদেন' : 'successful deposits'}
          </span>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 col-span-2 sm:col-span-1">
          <span className="text-[10px] text-slate-700 font-bold block">
            {isBn ? 'মোট ডিপোজিট রেকর্ড' : 'Total Submissions'}
          </span>
          <span className="text-base sm:text-xl font-black text-slate-900">
            {depositRequests.length}
          </span>
          <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">
            {rejectedList.length} {isBn ? 'টি বাতিল' : 'rejected'}
          </span>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
          <div className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-md">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isBn ? 'TrxID, নম্বর বা নাম দিয়ে খুঁজুন...' : 'Search by TrxID, phone or name...'}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-sky-400"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            </div>

            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="px-3 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 active:scale-95 disabled:opacity-50"
              title={isBn ? 'ক্লাউড ও লোকাল স্টোরেজ থেকে রিলোড করুন' : 'Refresh from Cloud & Storage'}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-sky-600' : ''}`} />
              <span className="hidden sm:inline">{isRefreshing ? (isBn ? 'রিফ্রেশ হচ্ছে...' : 'Refreshing...') : (isBn ? 'রিলোড' : 'Refresh')}</span>
            </button>
          </div>

          <div className="flex gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar">
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                filterStatus === 'pending'
                  ? 'bg-sky-500 text-white shadow-xs font-black'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isBn ? `পেন্ডিং (${pendingList.length})` : `Pending (${pendingList.length})`}
            </button>
            <button
              onClick={() => setFilterStatus('verification')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1 ${
                filterStatus === 'verification'
                  ? 'bg-amber-600 text-white shadow-xs font-black'
                  : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isBn ? `ভেরিফিকেশন (${verificationList.length})` : `Verification (${verificationList.length})`}</span>
            </button>
            <button
              onClick={() => setFilterStatus('special_social')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1 ${
                filterStatus === 'special_social'
                  ? 'bg-amber-500 text-white shadow-xs font-black'
                  : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{isBn ? `বিশেষ সোশ্যাল (${specialSocialList.length})` : `Special Social (${specialSocialList.length})`}</span>
            </button>
            <button
              onClick={() => setFilterStatus('approved')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                filterStatus === 'approved'
                  ? 'bg-sky-600 text-white shadow-xs font-black'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isBn ? `অনুমোদিত (${approvedList.length})` : `Approved (${approvedList.length})`}
            </button>
            <button
              onClick={() => setFilterStatus('rejected')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                filterStatus === 'rejected'
                  ? 'bg-rose-600 text-white shadow-xs font-black'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isBn ? `বাতিল (${rejectedList.length})` : `Rejected (${rejectedList.length})`}
            </button>
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                filterStatus === 'all'
                  ? 'bg-gray-950 text-white shadow-xs font-black'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isBn ? `সকল (${depositRequests.length})` : `All (${depositRequests.length})`}
            </button>
          </div>
        </div>

        {/* Select All & Bulk Action Bar (when viewing pending items) */}
        {pendingList.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-sky-50/70 rounded-xl border border-sky-200/80 text-xs">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-sky-950 select-none">
              <input
                type="checkbox"
                checked={selectedIds.length > 0 && selectedIds.length === pendingList.length}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedIds(pendingList.map(p => p.id));
                  } else {
                    setSelectedIds([]);
                  }
                }}
                className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
              />
              <span>
                {selectedIds.length > 0 
                  ? `${selectedIds.length}টি পেন্ডিং নির্বাচিত` 
                  : `সকল পেন্ডিং ডিপোজিট সিলেক্ট করুন (${pendingList.length})`}
              </span>
            </label>

            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="px-2.5 py-1 text-slate-600 hover:text-slate-900 font-semibold text-[11px]"
                >
                  {isBn ? 'সিলেকশন বাতিল' : 'Clear'}
                </button>
                <button
                  type="button"
                  onClick={() => setBulkRejectModal(true)}
                  className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                >
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>{isBn ? 'একসাথে বাতিল' : 'Bulk Reject'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    adminBulkApproveDeposits(selectedIds);
                    setSelectedIds([]);
                  }}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  <span>{isBn ? 'একসাথে অনুমোদন করুন' : 'Bulk Approve'}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Requests List */}
        <div className="space-y-2.5">
          {filteredRequests.length === 0 ? (
            <div className="py-12 text-center text-gray-400 space-y-2 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
              <Clock className="w-8 h-8 mx-auto text-gray-300" />
              <p className="text-xs font-bold text-gray-500">
                {isBn ? 'কোনো ডিপোজিট রিকোয়েস্ট পাওয়া যায়নি।' : 'No deposit requests found.'}
              </p>
            </div>
          ) : (
            filteredRequests.map((req) => {
              const isBkash = req.paymentMethod.toLowerCase().includes('bkash');
              const isNagad = req.paymentMethod.toLowerCase().includes('nagad');
              const isVerifDeposit = Boolean(
                req.isVerification || 
                req.depositType === 'verification' || 
                req.purpose === 'Account Verification' ||
                (req.purpose && req.purpose.toLowerCase().includes('verification'))
              );
              const isSpecialSocialDeposit = Boolean(
                req.depositType === 'special_social' || 
                req.purpose === 'বিশেষ সোশ্যাল ইনকাম এক্সেস' ||
                (req.purpose && req.purpose.includes('বিশেষ সোশ্যাল'))
              );

              return (
                <div
                  key={req.id}
                  id={`deposit-row-${req.id}`}
                  className={`p-3.5 sm:p-4 bg-white rounded-2xl border ${isVerifDeposit ? 'border-amber-300 shadow-amber-500/5' : isSpecialSocialDeposit ? 'border-amber-400/80 shadow-amber-500/5 bg-gradient-to-b from-amber-50/20 to-white' : 'border-gray-200/90'} shadow-2xs hover:shadow-xs transition-all space-y-3`}
                >
                  {isSpecialSocialDeposit && (
                    <div className="flex flex-wrap items-center justify-between gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 rounded-xl text-xs font-black text-amber-950">
                      <div className="flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-amber-500 fill-amber-400 shrink-0" />
                        <span>{isBn ? '⚡ বিশেষ সোশ্যাল ইনকাম আনলক ডিপোজিট' : '⚡ Special Social Income Unlock Deposit'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {req.userId && (
                          <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded-md border border-amber-200 text-amber-950 font-bold">
                            UID: {req.userId}
                          </span>
                        )}
                        <span className="text-[10px] bg-amber-500 text-white font-bold px-2 py-0.5 rounded-md">
                          {isBn ? 'স্পেশাল ফিচার' : 'Special Feature'}
                        </span>
                      </div>
                    </div>
                  )}

                  {isVerifDeposit && (
                    <div className="flex flex-wrap items-center justify-between gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-xs font-black text-amber-900">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>{isBn ? 'অ্যাকাউন্ট ভেরিফিকেশন ডিপোজিট রিকোয়েস্ট' : 'Account Verification Deposit Request'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {req.userId && (
                          <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded-md border border-amber-200 text-amber-950 font-bold">
                            UID: {req.userId}
                          </span>
                        )}
                        {req.nidNumber && (
                          <span className="text-[10px] bg-white px-2 py-0.5 rounded-md border border-amber-200 text-amber-800 font-bold">
                            NID: {req.nidNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      {req.status === 'pending' && (
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(req.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIds(prev => [...prev, req.id]);
                            } else {
                              setSelectedIds(prev => prev.filter(id => id !== req.id));
                            }
                          }}
                          className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 cursor-pointer shrink-0"
                          title="Select for bulk action"
                        />
                      )}
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                        isBkash ? 'bg-pink-100 text-pink-700' : isNagad ? 'bg-orange-100 text-orange-700' : 'bg-sky-100 text-sky-700'
                      }`}>
                        <ArrowDownLeft className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-xs text-gray-900">{req.userName}</span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                            isBkash ? 'bg-pink-100 text-pink-700 border border-pink-200' :
                            isNagad ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                            'bg-gray-100 text-gray-700 border border-gray-200'
                          }`}>
                            {req.paymentMethod}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            {req.date}
                          </span>
                          {req.userPhone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-gray-400" />
                              {req.userPhone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-gray-400 font-bold block">{isBn ? 'ডিপোজিট পরিমাণ' : 'Amount'}</span>
                        <span className="text-base sm:text-lg font-black text-sky-700">
                          +৳{(req.amount || 0).toLocaleString()}
                        </span>
                      </div>

                      <div>
                        {req.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-sky-100 text-sky-800 border border-sky-200">
                            <Clock className="w-3 h-3" />
                            {isBn ? 'পেন্ডিং রিভিউ' : 'Pending'}
                          </span>
                        )}
                        {req.status === 'approved' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-sky-100 text-sky-800 border border-sky-200">
                            <CheckCircle2 className="w-3 h-3" />
                            {isBn ? 'ব্যালেন্সে যুক্ত হয়েছে' : 'Approved'}
                          </span>
                        )}
                        {req.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200">
                            <XCircle className="w-3 h-3" />
                            {isBn ? 'বাতিল' : 'Rejected'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Transaction Details Box */}
                  <div className="bg-gray-50/80 p-2.5 rounded-xl border border-gray-200/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {/* TrxID */}
                    <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <Hash className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="text-[11px] text-gray-500 font-bold shrink-0">TrxID:</span>
                        <span className="font-mono font-black text-gray-900 tracking-wider truncate uppercase text-[11px]">
                          {req.trxId}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(req.trxId, `trx_${req.id}`)}
                        className="p-1 hover:bg-gray-100 rounded text-gray-500 transition-colors ml-1 shrink-0 cursor-pointer"
                        title={isBn ? 'TrxID কপি করুন' : 'Copy TrxID'}
                      >
                        {copiedKey === `trx_${req.id}` ? (
                          <Check className="w-3.5 h-3.5 text-sky-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Sender Phone */}
                    <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="text-[11px] text-gray-500 font-bold shrink-0">{isBn ? 'প্রেরক:' : 'Sender:'}</span>
                        <span className="font-bold text-gray-900 tracking-wider truncate text-[11px]">
                          {req.senderPhone || req.userPhone || 'N/A'}
                        </span>
                      </div>
                      {(req.senderPhone || req.userPhone) && (
                        <button
                          onClick={() => handleCopy(req.senderPhone || req.userPhone, `phone_${req.id}`)}
                          className="p-1 hover:bg-gray-100 rounded text-gray-500 transition-colors ml-1 shrink-0 cursor-pointer"
                          title={isBn ? 'নম্বর কপি করুন' : 'Copy Number'}
                        >
                          {copiedKey === `phone_${req.id}` ? (
                            <Check className="w-3.5 h-3.5 text-sky-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {req.rejectionReason && (
                    <div className="text-[11px] text-rose-700 bg-rose-50 px-2.5 py-1.5 rounded-lg border border-rose-200 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{isBn ? 'বাতিলের কারণ:' : 'Reason:'} {req.rejectionReason}</span>
                    </div>
                  )}

                  {/* Actions for Pending Status */}
                  {req.status === 'pending' && (
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => setRejectModal(req)}
                        className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>{isBn ? 'বাতিল করুন' : 'Reject'}</span>
                      </button>

                      <button
                        onClick={() => adminApproveDeposit(req.id)}
                        className={`px-4 py-2 ${isSpecialSocialDeposit ? 'bg-amber-500 hover:bg-amber-600' : isVerifDeposit ? 'bg-amber-600 hover:bg-amber-700' : 'bg-sky-500 hover:bg-sky-600'} text-white font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all transform active:scale-95 cursor-pointer`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>
                          {isBn 
                            ? (isSpecialSocialDeposit ? 'স্পেশাল সোশ্যাল আনলক ও ডিপোজিট অ্যাপ্রুভ' : isVerifDeposit ? 'ভেরিফাই ও ডিপোজিট অ্যাপ্রুভ' : 'অ্যাপ্রুভ ও ব্যালেন্স যোগ করুন') 
                            : (isSpecialSocialDeposit ? 'Unlock Special Social & Approve' : isVerifDeposit ? 'Verify & Approve Deposit' : 'Approve & Credit Balance')}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-gray-100 space-y-4 animate-scale-up">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertCircle className="w-5 h-5" />
              <h4 className="font-black text-sm text-gray-900">
                {isBn ? 'ডিপোজিট রিকোয়েস্ট বাতিল করুন' : 'Reject Deposit Request'}
              </h4>
            </div>

            <p className="text-xs text-gray-600">
              {isBn 
                ? `${rejectModal.userName}-এর ৳${rejectModal.amount} ডিপোজিট রিকোয়েস্ট বাতিল করার কারণ নির্বাচন করুন:`
                : `Specify a reason to reject deposit of ৳${rejectModal.amount} by ${rejectModal.userName}:`}
            </p>

            <div className="space-y-1.5">
              {[
                'ভুল বা অসত্য ট্রানজেকশন আইডি (TrxID)',
                'আমাদের একাউন্টে টাকা জমা হয়নি / ব্যালেন্স পাওয়া যায়নি',
                'ভুল মেথড বা অপর্যাপ্ত টাকা পাঠানো হয়েছে',
                'ফেইক বা ডুপ্লিকেট সাবমিশন'
              ].map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setRejectReason(reason)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold border transition-all ${
                    rejectReason === reason 
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
                onClick={() => setRejectModal(null)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition-colors"
              >
                {isBn ? 'ফিরে যান' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {isBn ? 'নিশ্চিত বাতিল করুন' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Reject Modal */}
      {bulkRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-gray-100 space-y-4 animate-scale-up">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertCircle className="w-5 h-5" />
              <h4 className="font-black text-sm text-gray-900">
                {isBn ? 'নির্বাচিত ডিপোজিট একসাথে বাতিল' : 'Bulk Reject Deposits'}
              </h4>
            </div>

            <p className="text-xs text-gray-600">
              {isBn 
                ? `একসাথে ${selectedIds.length}টি নির্বাচিত ডিপোজিট রিকোয়েস্ট বাতিল করার সাধারণ কারণ নির্বাচন করুন:`
                : `Select reason to reject ${selectedIds.length} selected deposit requests:`}
            </p>

            <div className="space-y-1.5">
              {[
                'ভুল বা অসত্য ট্রানজেকশন আইডি (TrxID)',
                'আমাদের একাউন্টে টাকা জমা হয়নি / ব্যালেন্স পাওয়া যায়নি',
                'ভুল মেথড বা অপর্যাপ্ত টাকা পাঠানো হয়েছে',
                'ফেইক বা ডুপ্লিকেট সাবমিশন'
              ].map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setRejectReason(reason)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    rejectReason === reason 
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
                onClick={() => setBulkRejectModal(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                {isBn ? 'ফিরে যান' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  adminBulkRejectDeposits(selectedIds, rejectReason);
                  setSelectedIds([]);
                  setBulkRejectModal(false);
                }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {isBn ? 'একসাথে বাতিল করুন' : 'Confirm Bulk Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
