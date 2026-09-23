import React, { useState } from 'react';
import { 
  ClipboardList, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  Filter, 
  User, 
  Phone, 
  Calendar, 
  ArrowDownLeft, 
  ShoppingBag, 
  Wallet, 
  Coins, 
  ChevronDown, 
  ChevronUp,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AuditLog } from '../../types';

export const AdminAuditTrailTab: React.FC = () => {
  const { auditLogs, language, showToast } = useApp();
  const isBn = language === 'bn';

  const [typeFilter, setTypeFilter] = useState<'all' | 'deposit' | 'order' | 'verification' | 'withdrawal'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'rejected' | 'pending' | 'verified'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Normalize and calculate stats
  const totalCount = auditLogs.length;
  const approvedCount = auditLogs.filter(l => 
    l.status === 'approved' || l.status === 'completed' || l.action?.toLowerCase().includes('approved')
  ).length;
  const rejectedCount = auditLogs.filter(l => 
    l.status === 'rejected' || l.status === 'cancelled' || l.action?.toLowerCase().includes('rejected')
  ).length;
  const pendingCount = auditLogs.filter(l => 
    l.status === 'pending' || l.action?.toLowerCase().includes('submitted')
  ).length;

  const filteredLogs = auditLogs.filter(log => {
    // Type matching
    const matchesType = typeFilter === 'all' || log.type === typeFilter;
    
    // Status matching
    let matchesStatus = true;
    if (statusFilter !== 'all') {
      const act = (log.action || '').toLowerCase();
      const st = (log.status || '').toLowerCase();
      if (statusFilter === 'approved') {
        matchesStatus = st === 'approved' || st === 'completed' || act.includes('approved') || act.includes('সম্পন্ন');
      } else if (statusFilter === 'rejected') {
        matchesStatus = st === 'rejected' || st === 'cancelled' || act.includes('rejected') || act.includes('বাতিল');
      } else if (statusFilter === 'pending') {
        matchesStatus = st === 'pending' || act.includes('submitted') || act.includes('আবেদন');
      } else if (statusFilter === 'verified') {
        matchesStatus = st === 'verified' || act.includes('verified') || act.includes('যাচাই');
      }
    }

    // Search query
    const q = searchQuery.toLowerCase().trim();
    let matchesSearch = true;
    if (q) {
      matchesSearch = 
        (log.details || '').toLowerCase().includes(q) ||
        (log.action || '').toLowerCase().includes(q) ||
        (log.actorName || '').toLowerCase().includes(q) ||
        (log.targetUserName || '').toLowerCase().includes(q) ||
        (log.targetUserPhone || '').includes(q) ||
        (log.targetId || '').toLowerCase().includes(q) ||
        (log.rejectionReason || '').toLowerCase().includes(q);
    }

    return matchesType && matchesStatus && matchesSearch;
  });

  const getStatusBadge = (log: AuditLog) => {
    const act = (log.action || '').toLowerCase();
    const st = (log.status || '').toLowerCase();

    if (st === 'approved' || st === 'completed' || act.includes('approved') || act.includes('সম্পন্ন')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>{isBn ? 'অনুমোদিত (Approved)' : 'Approved'}</span>
        </span>
      );
    }

    if (st === 'rejected' || st === 'cancelled' || act.includes('rejected') || act.includes('বাতিল')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          <span>{isBn ? 'বাতিলকৃত (Rejected)' : 'Rejected'}</span>
        </span>
      );
    }

    if (st === 'verified' || act.includes('verified') || act.includes('যাচাই')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
          <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
          <span>{isBn ? 'পেমেন্ট যাচাইকৃত (Verified)' : 'Payment Verified'}</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
        <Clock className="w-3.5 h-3.5 text-amber-600" />
        <span>{isBn ? 'অপেক্ষমাণ (Pending)' : 'Pending'}</span>
      </span>
    );
  };

  const getTypeIcon = (type: AuditLog['type']) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="w-4 h-4 text-emerald-600" />;
      case 'order':
        return <ShoppingBag className="w-4 h-4 text-blue-600" />;
      case 'verification':
        return <ShieldCheck className="w-4 h-4 text-sky-600" />;
      case 'withdrawal':
        return <Wallet className="w-4 h-4 text-rose-600" />;
      default:
        return <ClipboardList className="w-4 h-4 text-slate-600" />;
    }
  };

  const getTypeLabel = (type: AuditLog['type']) => {
    switch (type) {
      case 'deposit':
        return isBn ? 'ডিপোজিট' : 'Deposit';
      case 'order':
        return isBn ? 'শপ/রিসেলিং অর্ডার' : 'Order';
      case 'verification':
        return isBn ? 'প্রোফাইল ভেরিফিকেশন' : 'Verification';
      case 'withdrawal':
        return isBn ? 'উইথড্রয়াল' : 'Withdrawal';
      default:
        return isBn ? 'সিস্টেম' : 'System';
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-md border border-slate-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/10 text-white flex items-center justify-center shrink-0 border border-white/15">
            <ClipboardList className="w-6 h-6 text-sky-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-sm sm:text-base text-white">
                {isBn ? 'অডিট ট্রেইল ও স্বচ্ছতা লগ (Audit Trail)' : 'Audit Trail & Transparency Logs'}
              </h3>
              <span className="bg-sky-500/30 text-sky-200 border border-sky-400/30 text-[10px] font-black px-2 py-0.5 rounded-full">
                {totalCount} {isBn ? 'টি রেকর্ড' : 'Records'}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              {isBn 
                ? 'সকল ডিপোজিট অনুমোদন, অর্ডার ভেরিফিকেশন এবং বাতিলের কারণসহ পূর্ণাঙ্গ বিবরণ।' 
                : 'Complete records of deposit approvals, reselling order validations, and rejection reasons.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            showToast(isBn ? 'অডিট লগ রিফ্রেশ হয়েছে।' : 'Audit logs refreshed.');
          }}
          className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-white/20 active:scale-95 shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{isBn ? 'রিফ্রেশ করুন' : 'Refresh Logs'}</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] text-slate-500 font-bold block">
            {isBn ? 'মোট অডিট ইভেন্ট' : 'Total Logs'}
          </span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 block">
            {totalCount}
          </span>
          <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">
            {isBn ? 'সকল যাচাই ও পরিবর্তনের হিস্টোরি' : 'All tracked operations'}
          </span>
        </div>

        <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200/80 shadow-2xs">
          <span className="text-[11px] text-emerald-800 font-bold block flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isBn ? 'অনুমোদিত (Approved)' : 'Approved'}</span>
          </span>
          <span className="text-xl sm:text-2xl font-black text-emerald-950 mt-0.5 block">
            {approvedCount}
          </span>
          <span className="text-[10px] text-emerald-700 font-medium mt-0.5 block">
            {isBn ? 'সফলভাবে সম্পন্ন রেকর্ড' : 'Completed actions'}
          </span>
        </div>

        <div className="bg-rose-50/70 p-3.5 rounded-2xl border border-rose-200/80 shadow-2xs">
          <span className="text-[11px] text-rose-800 font-bold block flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>{isBn ? 'বাতিলকৃত (Rejected)' : 'Rejected'}</span>
          </span>
          <span className="text-xl sm:text-2xl font-black text-rose-950 mt-0.5 block">
            {rejectedCount}
          </span>
          <span className="text-[10px] text-rose-700 font-medium mt-0.5 block">
            {isBn ? 'কারণসহ প্রত্যাখ্যাত রেকর্ড' : 'With explicit rejection reasons'}
          </span>
        </div>

        <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200/80 shadow-2xs">
          <span className="text-[11px] text-amber-900 font-bold block flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>{isBn ? 'অপেক্ষমাণ (Pending)' : 'Pending'}</span>
          </span>
          <span className="text-xl sm:text-2xl font-black text-amber-950 mt-0.5 block">
            {pendingCount}
          </span>
          <span className="text-[10px] text-amber-800 font-medium mt-0.5 block">
            {isBn ? 'রিভিউ এর জন্য অপেক্ষমাণ' : 'Awaiting review or action'}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isBn ? 'অ্যাকশন, ব্যবহারকারী, ট্রানজেকশন বা কারণ খুঁজুন...' : 'Search action, user, TrxID, or reason...'}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          {/* Type filters */}
          <div className="flex gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar">
            {(['all', 'deposit', 'order', 'verification', 'withdrawal'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  typeFilter === t
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t === 'all' ? (isBn ? 'সকল ধরন' : 'All Types') : getTypeLabel(t)}
              </button>
            ))}
          </div>
        </div>

        {/* Status filters */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>{isBn ? 'স্ট্যাটাস ফিল্টার:' : 'Status:'}</span>
          </span>
          {(['all', 'approved', 'rejected', 'pending', 'verified'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 transition-all cursor-pointer ${
                statusFilter === s
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s === 'all' && (isBn ? 'সকল' : 'All')}
              {s === 'approved' && (isBn ? 'অনুমোদিত' : 'Approved')}
              {s === 'rejected' && (isBn ? 'বাতিল' : 'Rejected')}
              {s === 'pending' && (isBn ? 'পেন্ডিং' : 'Pending')}
              {s === 'verified' && (isBn ? 'যাচাইকৃত' : 'Verified')}
            </button>
          ))}
        </div>
      </div>

      {/* Logs List */}
      {filteredLogs.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-2">
          <ClipboardList className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="text-sm font-bold text-slate-700">
            {isBn ? 'কোনো অডিট লগ পাওয়া যায়নি' : 'No audit records found'}
          </h4>
          <p className="text-xs text-slate-400">
            {isBn ? 'ফিল্টার বা সার্চ কোয়েরি পরিবর্তন করে আবার চেষ্টা করুন।' : 'Try changing search keywords or active filters.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredLogs.map(log => {
            const isExpanded = expandedLogId === log.id;
            const hasRejection = Boolean(log.rejectionReason);

            return (
              <div 
                key={log.id}
                className={`bg-white rounded-2xl border transition-all shadow-2xs overflow-hidden ${
                  hasRejection ? 'border-rose-200 bg-rose-50/20' : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 border border-slate-200">
                      {getTypeIcon(log.type)}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-xs sm:text-sm text-slate-900">
                          {log.action}
                        </span>
                        {getStatusBadge(log)}
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md border border-slate-200">
                          {getTypeLabel(log.type)}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 font-medium mt-1 leading-relaxed">
                        {log.details}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-[11px] text-slate-500 font-medium">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{log.actorName || 'Admin'}</span>
                        </span>
                        {log.targetUserName && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{log.targetUserName} {log.targetUserPhone ? `(${log.targetUserPhone})` : ''}</span>
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{log.timestamp}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    {log.amount !== undefined && log.amount > 0 && (
                      <span className="font-black text-xs sm:text-sm text-slate-900 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200">
                        ৳{log.amount.toLocaleString()}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                      className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-200 cursor-pointer"
                    >
                      <span>{isExpanded ? (isBn ? 'সংক্ষেপ' : 'Less') : (isBn ? 'বিস্তারিত' : 'Details')}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Rejection Reason highlight */}
                {hasRejection && (
                  <div className="mx-3.5 sm:mx-4 mb-3 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-900">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-extrabold block">
                        {isBn ? 'বাতিলের সুনির্দিষ্ট কারণ:' : 'Rejection Reason:'}
                      </span>
                      <p className="mt-0.5 font-medium">{log.rejectionReason}</p>
                    </div>
                  </div>
                )}

                {/* Expanded metadata */}
                {isExpanded && (
                  <div className="px-3.5 sm:px-4 pb-3.5 pt-1 border-t border-slate-100 text-xs text-slate-600 space-y-1.5 bg-slate-50/50">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">লগ আইডি</span>
                        <span className="font-mono text-slate-700">{log.id}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">টার্গেট রেফারেন্স আইডি</span>
                        <span className="font-mono text-slate-700">{log.targetId}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">অডিটর / পারফর্মার</span>
                        <span className="text-slate-700">{log.actorName} (ID: {log.actorId})</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
