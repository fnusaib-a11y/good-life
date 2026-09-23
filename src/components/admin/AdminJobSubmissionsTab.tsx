import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Search, 
  ExternalLink, 
  Eye, 
  Clock, 
  AlertCircle,
  User,
  Megaphone,
  Briefcase,
  Link2,
  FileText
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { JobSubmission, AdMarketingSubmission } from '../../types';

export const AdminJobSubmissionsTab: React.FC = () => {
  const { 
    jobSubmissions, 
    adMarketingSubmissions,
    adminApproveJobSubmission, 
    adminRejectJobSubmission, 
    adminApproveAdMarketingSubmission,
    adminRejectAdMarketingSubmission,
    language 
  } = useApp();

  const isBn = language === 'bn';

  const [activeSubTab, setActiveSubTab] = useState<'micro_jobs' | 'ad_marketing'>('micro_jobs');
  const [filterStatus, setFilterStatus] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string; user: string } | null>(null);
  const [rejectModal, setRejectModal] = useState<{
    type: 'job' | 'ad';
    id: string;
    title: string;
    userName: string;
  } | null>(null);
  const [rejectReasonText, setRejectReasonText] = useState('প্রমাণ বা স্ক্রিনশট অস্পষ্ট/ভুল');

  const pendingJobCount = jobSubmissions.filter(s => s.status === 'pending').length;
  const pendingAdCount = (adMarketingSubmissions || []).filter(s => s.status === 'pending').length;

  // Filtered Job Submissions
  const filteredJobs = jobSubmissions.filter(sub => {
    const matchesStatus = filterStatus === 'all' ? true : sub.status === filterStatus;
    const matchesSearch = sub.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          sub.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (sub.jobCode && sub.jobCode.includes(searchQuery));
    return matchesStatus && matchesSearch;
  });

  // Filtered Ad Marketing Submissions
  const filteredAds = (adMarketingSubmissions || []).filter(sub => {
    const matchesStatus = filterStatus === 'all' ? true : sub.status === filterStatus;
    const matchesSearch = sub.campaignTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          sub.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (sub.userPhone && sub.userPhone.includes(searchQuery)) ||
                          (sub.postLink && sub.postLink.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const presetJobReasons = [
    'স্ক্রিনশট বা প্রমাণ অস্পষ্ট/ভুল',
    'কাজের নিয়মাবলী মেনে টাস্ক সম্পন্ন করা হয়নি',
    'ডুপ্লিকেট বা পূর্বে ব্যবহৃত স্ক্রিনশট',
    'ইউটিউব/ফেসবুক সাবস্ক্রাইব বা ফলো করা হয়নি'
  ];

  const presetAdReasons = [
    'পোস্ট লিংকটি কাজ করছে না অথবা ইনভ্যালিড',
    'প্রমাণ স্ক্রিনশট অস্পষ্ট অথবা সঠিক নয়',
    'বিজ্ঞাপনের সম্পূর্ণ টেক্সট পোস্ট করা হয়নি',
    'পোস্টটি ইতিমধ্যে ডিলিট করা হয়েছে বা প্রাইভেট'
  ];

  const handleConfirmReject = () => {
    if (!rejectModal) return;
    if (rejectModal.type === 'job') {
      adminRejectJobSubmission(rejectModal.id, rejectReasonText);
    } else {
      adminRejectAdMarketingSubmission(rejectModal.id, rejectReasonText);
    }
    setRejectModal(null);
  };

  return (
    <div className="space-y-4">
      {/* Category Toggle: Micro Jobs vs Ad Marketing */}
      <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-2xl">
        <button
          type="button"
          onClick={() => {
            setActiveSubTab('micro_jobs');
            setFilterStatus('pending');
          }}
          className={`py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'micro_jobs'
              ? 'bg-white text-sky-700 shadow-xs'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Briefcase className="w-4 h-4 text-sky-600" />
          <span>{isBn ? 'মাইক্রো জব প্রুফ' : 'Micro Job Proofs'}</span>
          {pendingJobCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-black rounded-full bg-sky-500 text-white leading-none">
              {pendingJobCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveSubTab('ad_marketing');
            setFilterStatus('pending');
          }}
          className={`py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'ad_marketing'
              ? 'bg-white text-purple-700 shadow-xs'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Megaphone className="w-4 h-4 text-purple-600" />
          <span>{isBn ? 'বিজ্ঞাপন মার্কেটিং প্রুফ' : 'Ad Marketing Proofs'}</span>
          {pendingAdCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-black rounded-full bg-purple-600 text-white leading-none">
              {pendingAdCount}
            </span>
          )}
        </button>
      </div>

      {/* Search and Status Filters Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-100 shadow-xs space-y-2.5">
        <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeSubTab === 'micro_jobs'
                  ? (isBn ? 'জব কোড, টাইটেল বা ইউজার খুঁজুন...' : 'Search by code, title, user...')
                  : (isBn ? 'ক্যাম্পেইন, ফোন নম্বর বা ইউজার খুঁজুন...' : 'Search campaign, phone, user...')
              }
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-sky-400"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar">
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                filterStatus === 'pending'
                  ? activeSubTab === 'micro_jobs' ? 'bg-sky-500 text-white shadow-xs' : 'bg-purple-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isBn 
                ? `পেন্ডিং (${activeSubTab === 'micro_jobs' ? pendingJobCount : pendingAdCount})` 
                : `Pending (${activeSubTab === 'micro_jobs' ? pendingJobCount : pendingAdCount})`}
            </button>
            <button
              onClick={() => setFilterStatus('approved')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                filterStatus === 'approved'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isBn ? 'অনুমোদিত' : 'Approved'}
            </button>
            <button
              onClick={() => setFilterStatus('rejected')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                filterStatus === 'rejected'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isBn ? 'বাতিলকৃত' : 'Rejected'}
            </button>
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-gray-900 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isBn ? 'সব' : 'All'}
            </button>
          </div>
        </div>
      </div>

      {/* Content Rendering: Micro Jobs Submissions */}
      {activeSubTab === 'micro_jobs' && (
        <>
          {filteredJobs.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-gray-300 mx-auto" />
              <h4 className="text-sm font-bold text-gray-700">
                {isBn ? 'কোনো জব সাবমিশন পাওয়া যায়নি' : 'No job submissions found'}
              </h4>
              <p className="text-xs text-gray-400">
                {filterStatus === 'pending' ? 'সব পেন্ডিং কাজ রিভিউ সম্পন্ন হয়েছে!' : 'অন্য ফিল্টার চেষ্টা করুন।'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredJobs.map((sub) => (
                <div 
                  key={sub.id} 
                  className={`bg-white rounded-2xl p-4 border transition-all shadow-xs space-y-3 ${
                    sub.status === 'pending' ? 'border-sky-200/80 bg-sky-50/20' : 'border-gray-100'
                  }`}
                >
                  {/* Header Info */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-800 text-[10px] font-black rounded-md">
                          #{sub.jobCode || sub.jobId}
                        </span>
                        <span className={`px-2 py-0.5 text-[10px] font-black rounded-md uppercase ${
                          sub.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                          sub.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {sub.status}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-xs sm:text-sm text-gray-900 mt-1 line-clamp-1">
                        {sub.jobTitle}
                      </h4>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm sm:text-base font-black text-sky-600 block">
                        ৳{(sub.reward ?? 0.5).toFixed(2)}
                      </span>
                      <span className="text-[10px] text-gray-400 font-semibold">{sub.submittedAt}</span>
                    </div>
                  </div>

                  {/* User and Proof Box */}
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-gray-600">
                      <span className="font-semibold flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        {sub.userName}
                      </span>
                      <span className="text-[10px] text-gray-400">ID: {sub.userId}</span>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-gray-100">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
                        {isBn ? 'ইউজার প্রদত্ত প্রমাণ:' : 'User Submitted Proof:'}
                      </span>
                      <p className="text-xs text-gray-800 font-medium whitespace-pre-wrap">
                        {sub.proofText || (isBn ? 'কোনো টেক্সট প্রুফ দেওয়া হয়নি' : 'No text proof provided')}
                      </p>
                    </div>

                    {sub.proofImage && (
                      <div className="relative group">
                        <img 
                          src={sub.proofImage} 
                          alt="Proof Screenshot"
                          className="w-full h-28 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90"
                          onClick={() => setSelectedImage({ url: sub.proofImage!, title: sub.jobTitle, user: sub.userName })}
                        />
                        <button 
                          type="button"
                          onClick={() => setSelectedImage({ url: sub.proofImage!, title: sub.jobTitle, user: sub.userName })}
                          className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white rounded-md text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>{isBn ? 'বড় করে দেখুন' : 'Zoom Image'}</span>
                        </button>
                      </div>
                    )}

                    {sub.rejectionReason && (
                      <div className="p-2 bg-rose-50 text-rose-700 rounded-lg text-[11px] font-medium border border-rose-200">
                        <strong>বাতিলের কারণ:</strong> {sub.rejectionReason}
                      </div>
                    )}
                  </div>

                  {/* Actions if Pending */}
                  {sub.status === 'pending' && (
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => adminApproveJobSubmission(sub.id)}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isBn ? 'অনুমোদন (Approve)' : 'Approve'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setRejectModal({
                            type: 'job',
                            id: sub.id,
                            title: sub.jobTitle,
                            userName: sub.userName
                          });
                          setRejectReasonText(presetJobReasons[0]);
                        }}
                        className="flex-1 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>{isBn ? 'বাতিল (Reject)' : 'Reject'}</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Content Rendering: Ad Marketing Submissions */}
      {activeSubTab === 'ad_marketing' && (
        <>
          {filteredAds.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 space-y-2">
              <Megaphone className="w-10 h-10 text-purple-300 mx-auto" />
              <h4 className="text-sm font-bold text-gray-700">
                {isBn ? 'কোনো বিজ্ঞাপন মার্কেটিং প্রুফ পাওয়া যায়নি' : 'No ad marketing proofs found'}
              </h4>
              <p className="text-xs text-gray-400">
                {filterStatus === 'pending' ? 'সব পেন্ডিং বিজ্ঞাপন প্রুফ যাচাই সম্পন্ন হয়েছে!' : 'অন্য ফিল্টার নির্বাচন করুন।'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredAds.map((sub) => (
                <div 
                  key={sub.id} 
                  className={`bg-white rounded-2xl p-4 border transition-all shadow-xs space-y-3 ${
                    sub.status === 'pending' ? 'border-purple-200/90 bg-purple-50/20' : 'border-gray-100'
                  }`}
                >
                  {/* Header Info */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-black rounded-md flex items-center gap-1">
                          <Megaphone className="w-3 h-3" />
                          <span>বিজ্ঞাপন শেয়ার</span>
                        </span>
                        <span className={`px-2 py-0.5 text-[10px] font-black rounded-md uppercase ${
                          sub.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                          sub.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {sub.status}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-xs sm:text-sm text-gray-900 mt-1 line-clamp-1">
                        {sub.campaignTitle}
                      </h4>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm sm:text-base font-black text-purple-700 block">
                        ৳{sub.rewardAmount.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-gray-400 font-semibold">{sub.submittedAt}</span>
                    </div>
                  </div>

                  {/* User and Proof Box */}
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-gray-700 font-medium">
                      <span className="font-bold flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-purple-600" />
                        {sub.userName}
                      </span>
                      {sub.userPhone && (
                        <span className="text-[11px] font-mono text-gray-600">{sub.userPhone}</span>
                      )}
                    </div>

                    {/* Shared Post Link */}
                    {sub.postLink ? (
                      <div className="bg-white p-2.5 rounded-lg border border-purple-100 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                            {isBn ? 'শেয়ার করা পোস্টের লিংক:' : 'Shared Post URL:'}
                          </span>
                          <span className="text-xs text-purple-700 font-medium truncate block">
                            {sub.postLink}
                          </span>
                        </div>
                        <a
                          href={sub.postLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-lg shrink-0 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <span>লিংক খুলুন</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ) : (
                      <div className="bg-white p-2 rounded-lg border border-gray-100 text-[11px] text-gray-500">
                        কোনো পোস্ট লিংক দেওয়া হয়নি (শুধু স্ক্রিনশট)।
                      </div>
                    )}

                    {/* User Note */}
                    {sub.note && (
                      <div className="bg-white p-2 rounded-lg border border-gray-100 text-[11px]">
                        <span className="font-bold text-gray-500">মন্তব্য: </span>
                        <span className="text-gray-800">{sub.note}</span>
                      </div>
                    )}

                    {/* Screenshot Proof */}
                    {sub.proofImage && (
                      <div className="relative group">
                        <img 
                          src={sub.proofImage} 
                          alt="Ad Proof Screenshot"
                          className="w-full h-32 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90"
                          onClick={() => setSelectedImage({ url: sub.proofImage!, title: sub.campaignTitle, user: sub.userName })}
                        />
                        <button 
                          type="button"
                          onClick={() => setSelectedImage({ url: sub.proofImage!, title: sub.campaignTitle, user: sub.userName })}
                          className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white rounded-md text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>{isBn ? 'স্ক্রিনশট বড় করে দেখুন' : 'Zoom Screenshot'}</span>
                        </button>
                      </div>
                    )}

                    {sub.rejectionReason && (
                      <div className="p-2 bg-rose-50 text-rose-700 rounded-lg text-[11px] font-medium border border-rose-200">
                        <strong>বাতিলের কারণ:</strong> {sub.rejectionReason}
                      </div>
                    )}
                  </div>

                  {/* Actions if Pending */}
                  {sub.status === 'pending' && (
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => adminApproveAdMarketingSubmission(sub.id)}
                        className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isBn ? `অনুমোদন করুন (+৳${sub.rewardAmount.toFixed(2)})` : 'Approve'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setRejectModal({
                            type: 'ad',
                            id: sub.id,
                            title: sub.campaignTitle,
                            userName: sub.userName
                          });
                          setRejectReasonText(presetAdReasons[0]);
                        }}
                        className="flex-1 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>{isBn ? 'বাতিল (Reject)' : 'Reject'}</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Unified Reject Reason Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-rose-600">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <div>
                <h3 className="font-extrabold text-base text-gray-900">
                  {isBn ? 'প্রুফ বাতিলের কারণ' : 'Reason for Rejection'}
                </h3>
                <p className="text-[11px] text-gray-500">ইউজার: {rejectModal.userName}</p>
              </div>
            </div>

            <p className="text-xs text-gray-600">
              ইউজারের কাছে এই কারণটি অ্যাপ নোটিফিকেশন হিসেবে পৌঁছে যাবে।
            </p>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-gray-700">দ্রুত কারণ নির্বাচন করুন:</span>
              <div className="space-y-1">
                {(rejectModal.type === 'job' ? presetJobReasons : presetAdReasons).map((reason, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setRejectReasonText(reason)}
                    className={`w-full text-left text-xs p-2 rounded-xl border transition-all cursor-pointer ${
                      rejectReasonText === reason
                        ? 'bg-rose-50 border-rose-300 text-rose-900 font-bold'
                        : 'bg-gray-50 border-gray-100 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    • {reason}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-700 block mb-1">কাস্টম মন্তব্য লিখুন:</label>
              <textarea
                rows={2}
                value={rejectReasonText}
                onChange={(e) => setRejectReasonText(e.target.value)}
                className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectModal(null)}
                className="py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                {isBn ? 'ফিরে যান' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-xs cursor-pointer"
              >
                {isBn ? 'বাতিল নিশ্চিত করুন' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Screenshot Zoom Modal */}
      {selectedImage && (
        <div 
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-fade-in cursor-zoom-out"
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="bg-white max-w-xl w-full rounded-3xl p-4 shadow-2xl space-y-3 cursor-default"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-sm text-gray-900">{selectedImage.title}</h4>
                <p className="text-xs text-gray-500">ইউজার: {selectedImage.user}</p>
              </div>
              <button 
                type="button"
                onClick={() => setSelectedImage(null)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500 font-bold text-xs cursor-pointer"
              >
                ✕ বন্ধ
              </button>
            </div>
            <img 
              src={selectedImage.url} 
              alt="Proof full preview" 
              className="w-full max-h-[70vh] object-contain rounded-2xl bg-black/5 border border-gray-100"
            />
          </div>
        </div>
      )}
    </div>
  );
};

