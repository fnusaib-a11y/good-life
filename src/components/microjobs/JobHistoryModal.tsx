import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  FileText, 
  Coins 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { JobSubmission } from '../../types';

export const JobHistoryModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { jobSubmissions } = useApp();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const filtered = jobSubmissions.filter(sub => {
    if (filter === 'all') return true;
    return sub.status === filter;
  });

  const totalEarned = jobSubmissions
    .filter(s => s.status === 'approved')
    .reduce((sum, s) => sum + s.reward, 0);

  const getStatusBadge = (status: JobSubmission['status']) => {
    switch (status) {
      case 'approved':
        return (
          <span className="flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-md">
            <CheckCircle2 className="w-3 h-3" />
            <span>অনুমোদিত</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center gap-1 bg-red-100 text-red-800 text-[10px] font-black px-2 py-0.5 rounded-md">
            <XCircle className="w-3 h-3" />
            <span>বাতিল</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-md">
            <Clock className="w-3 h-3" />
            <span>পেন্ডিং</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-scale-up">
        {/* Header */}
        <div className="bg-sky-500 px-4 py-3 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            <h3 className="font-extrabold text-base">জব সাবমিশন হিস্টোরি</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Strip */}
        <div className="p-3 bg-sky-50/90 border-b border-sky-200 flex items-center justify-between text-xs font-bold text-gray-800">
          <span>মোট অনুমোদিত আয়:</span>
          <span className="text-sm font-black text-sky-700">৳{(totalEarned ?? 0).toFixed(2)}</span>
        </div>

        {/* Filter Tabs */}
        <div className="flex p-2 gap-1.5 bg-gray-50 border-b border-gray-100 text-xs font-bold">
          {(['all', 'pending', 'approved', 'rejected'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`flex-1 py-1.5 rounded-xl transition-all capitalize cursor-pointer ${
                filter === tab 
                  ? 'bg-sky-500 text-white shadow-xs' 
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab === 'all' ? 'সকল' : tab === 'pending' ? 'পেন্ডিং' : tab === 'approved' ? 'অনুমোদিত' : 'বাতিল'}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-xs">
              এই ক্যাটাগরিতে কোনো কাজের হিস্টোরি পাওয়া যায়নি।
            </div>
          ) : (
            filtered.map((sub) => (
              <div
                key={sub.id}
                className="p-3 bg-gray-50 rounded-2xl border border-gray-100 shadow-2xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded">
                    জব #{sub.jobCode}
                  </span>
                  {getStatusBadge(sub.status)}
                </div>

                <div>
                  <h4 className="text-xs font-black text-gray-900 line-clamp-1">{sub.jobTitle}</h4>
                  <p className="text-[11px] text-gray-600 mt-1 line-clamp-2 bg-white p-2 rounded-lg border border-gray-100">
                    <strong className="text-gray-800">জমা দেওয়া প্রমাণ:</strong> {sub.proofText}
                  </p>
                </div>

                {sub.status === 'rejected' && sub.rejectionReason && (
                  <div className="p-2 bg-red-50 rounded-lg border border-red-200 text-[10px] text-red-700 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>বাতিলের কারণ: {sub.rejectionReason}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1 border-t border-gray-100">
                  <span>{sub.submittedAt}</span>
                  <span className="font-extrabold text-sky-700">+৳{(sub?.reward ?? 0).toFixed(2)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default JobHistoryModal;
