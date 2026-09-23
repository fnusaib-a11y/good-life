import React from 'react';
import { 
  History, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle, 
  Coins, 
  FileText, 
  Hash, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { TypingSubmissionRecord } from '../../types';

interface TypingHistoryTabProps {
  submissions: TypingSubmissionRecord[];
  isLoading: boolean;
}

export const TypingHistoryTab: React.FC<TypingHistoryTabProps> = ({
  submissions,
  isLoading
}) => {
  const getStatusBadge = (status: TypingSubmissionRecord['status']) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2.5 py-1 rounded-full text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            অনুমোদিত (Approved)
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200/80 px-2.5 py-1 rounded-full text-xs font-bold">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            বাতিল (Rejected)
          </span>
        );
      case 'under_review':
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200/80 px-2.5 py-1 rounded-full text-xs font-bold">
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
            রিভিউ চলছে (Under Review)
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="py-12 text-center text-slate-500">
        <Clock className="w-8 h-8 mx-auto mb-2 text-emerald-600 animate-spin" />
        <p className="text-xs">আপনার কাজের হিস্ট্রি লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!submissions || submissions.length === 0) {
    return (
      <div className="py-12 px-4 text-center bg-white rounded-2xl border border-slate-200/80 shadow-xs">
        <History className="w-12 h-12 mx-auto mb-3 text-slate-300" />
        <h3 className="text-sm font-bold text-slate-700 mb-1">কোনো কাজের হিস্ট্রি পাওয়া যায়নি</h3>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          আপনি এখনো কোনো টাইপিং কাজ সম্পন্ন করেননি। কাজ সম্পন্ন করলে এখানে আপনার উপার্জিত আয় ও স্ট্যাটাস দেখতে পাবেন।
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {submissions.map((sub) => (
        <div 
          key={sub.submissionId || sub.id}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:shadow-sm transition-all"
        >
          {/* Header Row: Title + Status */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="font-bold text-slate-800 text-sm leading-snug flex-1">
              {sub.jobTitle}
            </h4>
            <div>{getStatusBadge(sub.status)}</div>
          </div>

          {/* Reward & Match Info */}
          <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl text-xs text-slate-600 mb-2.5 border border-slate-100">
            <div className="flex items-center gap-1 text-emerald-700 font-bold">
              <Coins className="w-4 h-4 text-emerald-600" />
              <span>পুরস্কার: ৳{sub.rewardAmount}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-500 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>মিল: {sub.matchPercentage}%</span>
            </div>
          </div>

          {/* Metadata: TrxId + Date */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
            <div className="flex items-center gap-1 font-mono text-slate-500">
              <Hash className="w-3 h-3 text-slate-400" />
              <span>Trx: {sub.trxId || 'Processing...'}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>{new Date(sub.submittedAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          {/* Admin Note if any */}
          {sub.adminNote && (
            <div className="mt-2 text-xs bg-amber-50/80 border border-amber-100 p-2 rounded-lg text-amber-800">
              <strong>এডমিন নোট:</strong> {sub.adminNote}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
