import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Search, 
  ShieldAlert, 
  ExternalLink,
  MessageSquare,
  Clock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ReportItem } from '../../types';

export const AdminReportsTab: React.FC = () => {
  const { 
    reports, 
    adminResolveReport, 
    showToast,
    language 
  } = useApp();

  const isBn = language === 'bn';

  const [filterStatus, setFilterStatus] = useState<'pending' | 'resolved' | 'dismissed' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = reports.filter(r => {
    const matchesStatus = filterStatus === 'all' ? true : r.status === filterStatus;
    const matchesSearch = r.targetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingReports = reports.filter(r => r.status === 'pending');

  return (
    <div className="space-y-3.5">
      {/* Top Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-100 shadow-xs space-y-2.5">
        <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isBn ? 'অভিযোগ বা কারণ খুঁজুন...' : 'Search reports...'}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-sky-400"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar">
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                filterStatus === 'pending'
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isBn ? `পেন্ডিং (${pendingReports.length})` : `Pending (${pendingReports.length})`}
            </button>
            <button
              onClick={() => setFilterStatus('resolved')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                filterStatus === 'resolved'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isBn ? 'সমাধানকৃত' : 'Resolved'}
            </button>
            <button
              onClick={() => setFilterStatus('dismissed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                filterStatus === 'dismissed'
                  ? 'bg-gray-900 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isBn ? 'বাতিলকৃত' : 'Dismissed'}
            </button>
          </div>
        </div>
      </div>

      {/* Reports List */}
      {filtered.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 space-y-2">
          <CheckCircle2 className="w-10 h-10 text-gray-300 mx-auto" />
          <h4 className="text-sm font-bold text-gray-700">
            {isBn ? 'কোনো অভিযোগ বা রিপোর্ট পাওয়া যায়নি' : 'No reports found'}
          </h4>
          <p className="text-xs text-gray-400">সকল রিপোর্ট সমাধান করা হয়েছে।</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(report => (
            <div 
              key={report.id}
              className={`bg-white p-4 rounded-2xl border transition-all shadow-xs space-y-3 ${
                report.status === 'pending' ? 'border-rose-200/80 bg-rose-50/10' : 'border-gray-100'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-rose-700 uppercase">
                      {report.targetType} রিপোর্ট: {report.targetName}
                    </span>
                    <h4 className="font-black text-xs sm:text-sm text-gray-900 mt-0.5">
                      কারণ: {report.reason}
                    </h4>
                  </div>
                </div>

                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                  report.status === 'pending' ? 'bg-sky-100 text-sky-800' :
                  report.status === 'resolved' ? 'bg-sky-50 text-sky-700' : 'bg-gray-100 text-gray-800'
                }`}>
                  {report.status}
                </span>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs space-y-1">
                <span className="text-[10px] text-gray-400 font-bold block">ইউজার কর্তৃক প্রদত্ত বিস্তারিত:</span>
                <p className="text-gray-700 font-medium whitespace-pre-wrap">{report.description}</p>
                <div className="text-[10px] text-gray-400 font-semibold pt-1">জমা দেওয়ার সময়: {report.submittedAt}</div>
              </div>

              {report.status === 'pending' && (
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => adminResolveReport(report.id, 'resolved')}
                    className="flex-1 py-2 bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1 shadow-xs active:scale-95 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isBn ? 'সমাধান সম্পন্ন (Resolve)' : 'Mark Resolved'}</span>
                  </button>

                  <button
                    onClick={() => adminResolveReport(report.id, 'dismissed')}
                    className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1 active:scale-95 transition-all"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>{isBn ? 'বাতিল করুন (Dismiss)' : 'Dismiss'}</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
