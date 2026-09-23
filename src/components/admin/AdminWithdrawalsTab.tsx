import React, { useState } from 'react';
import { 
  Wallet, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Copy, 
  Check, 
  Smartphone, 
  Building2, 
  AlertCircle,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WithdrawalRequest } from '../../types';

export const AdminWithdrawalsTab: React.FC = () => {
  const { 
    withdrawalRequests, 
    adminApproveWithdrawal, 
    adminRejectWithdrawal, 
    showToast,
    language 
  } = useApp();

  const isBn = language === 'bn';

  const [filterStatus, setFilterStatus] = useState<'pending' | 'approved' | 'rejected' | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<WithdrawalRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('ভুল বা নিষ্ক্রিয় মোবাইল ব্যাংকিং নম্বর');
  const [trxIdInput, setTrxIdInput] = useState<{ [id: string]: string }>({});

  const filtered = withdrawalRequests.filter(req => {
    const matchesStatus = filterStatus === 'all' ? true : req.status === filterStatus;
    const matchesSearch = req.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          req.accountNumber.includes(searchQuery) ||
                          (req.userPhone && req.userPhone.includes(searchQuery));
    return matchesStatus && matchesSearch;
  });

  const pendingList = withdrawalRequests.filter(w => w.status === 'pending');
  const approvedList = withdrawalRequests.filter(w => w.status === 'approved');
  const rejectedList = withdrawalRequests.filter(w => w.status === 'rejected');
  const totalPendingAmount = pendingList.reduce((sum, w) => sum + w.amount, 0);

  const handleCopyNumber = (accountNumber: string, id: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(accountNumber).catch(() => {});
      }
    } catch {
      // fallback
    }
    setCopiedId(id);
    showToast(`অ্যাকাউন্ট নম্বর (${accountNumber}) কপি হয়েছে!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleApprove = (req: WithdrawalRequest) => {
    adminApproveWithdrawal(req.id);
  };

  const handleConfirmReject = () => {
    if (!rejectModal) return;
    adminRejectWithdrawal(rejectModal.id, rejectReason);
    setRejectModal(null);
  };

  return (
    <div className="space-y-3.5">
      {/* Payout Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        <div className="bg-sky-50 p-3 rounded-2xl border border-sky-200">
          <span className="text-[10px] text-sky-800 font-bold block">মোট পেন্ডিং পে-আউট</span>
          <span className="text-base sm:text-lg font-black text-sky-950">৳{totalPendingAmount.toLocaleString()}</span>
          <span className="text-[10px] text-sky-700 font-medium mt-0.5 block">{pendingList.length} টি রিকোয়েস্ট</span>
        </div>
        <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200">
          <span className="text-[10px] text-emerald-800 font-bold block">পরিশোধিত উইথড্রাল</span>
          <span className="text-base sm:text-lg font-black text-emerald-950">
            ৳{withdrawalRequests.filter(w => w.status === 'approved').reduce((s, w) => s + w.amount, 0).toLocaleString()}
          </span>
          <span className="text-[10px] text-emerald-700 font-medium mt-0.5 block">সফল লেনদেন</span>
        </div>
        <div className="bg-blue-50 p-3 rounded-2xl border border-blue-200 col-span-2 sm:col-span-1">
          <span className="text-[10px] text-blue-800 font-bold block">পেমেন্ট গেটওয়ে</span>
          <span className="text-xs sm:text-sm font-black text-blue-950">bKash, Nagad</span>
          <span className="text-[10px] text-blue-700 font-medium mt-0.5 block">০% বিলম্ব রেট</span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-100 shadow-xs space-y-2.5">
        <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isBn ? 'নাম বা একাউন্ট নম্বর দিয়ে খুঁজুন...' : 'Search by name or number...'}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-sky-400"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-gray-900 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isBn ? `সকল (${withdrawalRequests.length})` : `All (${withdrawalRequests.length})`}
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                filterStatus === 'pending'
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isBn ? `পেন্ডিং (${pendingList.length})` : `Pending (${pendingList.length})`}
            </button>
            <button
              onClick={() => setFilterStatus('approved')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                filterStatus === 'approved'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isBn ? `অনুমোদিত (${approvedList.length})` : `Approved (${approvedList.length})`}
            </button>
            <button
              onClick={() => setFilterStatus('rejected')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                filterStatus === 'rejected'
                  ? 'bg-red-500 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isBn ? `বাতিলকৃত (${rejectedList.length})` : `Rejected (${rejectedList.length})`}
            </button>
          </div>
        </div>
      </div>

      {/* Requests List */}
      {filtered.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 space-y-2">
          <CheckCircle2 className="w-10 h-10 text-gray-300 mx-auto" />
          <h4 className="text-sm font-bold text-gray-700">
            {isBn ? 'কোনো উইথড্রয়াল রিকোয়েস্ট নেই' : 'No withdrawal requests found'}
          </h4>
          <p className="text-xs text-gray-400">
            {filterStatus === 'pending' ? 'সকল ইউজারের পেমেন্ট ক্লিয়ার আছে!' : 'অন্য ফিল্টার চেক করুন।'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((req) => (
            <div 
              key={req.id}
              className={`bg-white rounded-2xl p-4 border transition-all shadow-xs space-y-3 ${
                req.status === 'pending' ? 'border-sky-200 bg-sky-50/20' : 'border-gray-100'
              }`}
            >
              {/* Header Info */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${
                    req.paymentMethod === 'bKash' ? 'bg-[#df146e]/15 text-[#df146e]' :
                    req.paymentMethod === 'Nagad' ? 'bg-[#f7941d]/15 text-[#f7941d]' : 'bg-sky-100 text-sky-800'
                  }`}>
                    {req.paymentMethod === 'Bank' ? <Building2 className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs sm:text-sm text-gray-900">{req.userName}</h4>
                    <span className="text-[10px] text-gray-400">{req.date}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm sm:text-base font-black text-gray-900 block">৳{req.amount}</span>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                    req.status === 'pending' ? 'bg-sky-100 text-sky-800' :
                    req.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {req.status}
                  </span>
                </div>
              </div>

              {/* Account Number Box with 1-Click Copy */}
              <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-gray-500 font-bold block">{req.paymentMethod} নম্বর:</span>
                  <span className="font-black text-gray-900 text-xs sm:text-sm font-mono tracking-wider">{req.accountNumber}</span>
                </div>
                <button
                  onClick={() => handleCopyNumber(req.accountNumber, req.id)}
                  className="px-2.5 py-1 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-2xs active:scale-95 transition-all cursor-pointer"
                >
                  {copiedId === req.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" />
                      <span className="text-emerald-700">কপি হয়েছে</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>কপি করুন</span>
                    </>
                  )}
                </button>
              </div>

              {/* Rejection Note if any */}
              {req.rejectionReason && (
                <div className="p-2 bg-red-50 text-red-700 rounded-lg text-[11px] font-medium border border-red-200">
                  <strong>বাতিলের কারণ:</strong> {req.rejectionReason}
                </div>
              )}

              {/* Pending Action Controls */}
              {req.status === 'pending' && (
                <div className="space-y-2 pt-1">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="টাকা পাঠিয়ে ট্রানজেকশন TrxID দিন (ঐচ্ছিক)"
                      value={trxIdInput[req.id] || ''}
                      onChange={(e) => setTrxIdInput({ ...trxIdInput, [req.id]: e.target.value })}
                      className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-sky-400"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(req)}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isBn ? 'পেমেন্ট সম্পন্ন (Approve)' : 'Approve Payment'}</span>
                    </button>

                    <button
                      onClick={() => setRejectModal(req)}
                      className="flex-1 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl border border-red-200 flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>{isBn ? 'রিফান্ড ও বাতিল (Reject)' : 'Reject & Refund'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-red-600">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <div>
                <h3 className="font-extrabold text-base text-gray-900">
                  {isBn ? 'উইথড্রয়াল বাতিল ও রিফান্ড' : 'Reject Withdrawal'}
                </h3>
                <span className="text-xs text-gray-500">৳{rejectModal.amount} ইউজার একাউন্টে ব্যাক হবে</span>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-700 block mb-1">বাতিলের সুনির্দিষ্ট কারণ:</label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setRejectModal(null)}
                className="py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                {isBn ? 'ফিরে যান' : 'Cancel'}
              </button>
              <button
                onClick={handleConfirmReject}
                className="py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-xs cursor-pointer"
              >
                {isBn ? 'রিফান্ড নিশ্চিত করুন' : 'Confirm Refund'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
