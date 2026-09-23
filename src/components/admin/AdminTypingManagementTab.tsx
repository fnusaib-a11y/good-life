import React, { useState, useEffect } from 'react';
import { 
  Keyboard, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Coins, 
  Users, 
  FileText, 
  Image as ImageIcon, 
  Eye, 
  RefreshCw, 
  Settings, 
  AlertCircle, 
  Search,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Filter,
  Layers,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  TypingJobItem, 
  TypingSubmissionRecord, 
  TypingJobType, 
  TypingValidationMode,
  TypingSettings 
} from '../../types';
import { 
  fetchTypingJobs, 
  saveTypingJob, 
  deleteTypingJob, 
  fetchTypingSubmissions, 
  reviewTypingSubmission,
  fetchTypingSettings,
  saveTypingSettings
} from '../../services/typingJobService';

export const AdminTypingManagementTab: React.FC = () => {
  const { showToast, isBn } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'jobs' | 'submissions' | 'settings'>('jobs');
  const [jobs, setJobs] = useState<TypingJobItem[]>([]);
  const [submissions, setSubmissions] = useState<TypingSubmissionRecord[]>([]);
  const [settings, setSettings] = useState<TypingSettings>({
    enabled: true,
    defaultReward: 20,
    defaultAdDurationSeconds: 15,
    adsterraKey: 'a5ea718688da962e97053af64e1de8f0',
    noticeText: 'সঠিক বানান ও যতিচিহ্ন বজায় রেখে টাইপ করুন।'
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [submissionFilter, setSubmissionFilter] = useState<'all' | 'under_review' | 'approved' | 'rejected'>('all');

  // Job Modal (Create/Edit)
  const [isJobModalOpen, setIsJobModalOpen] = useState<boolean>(false);
  const [editingJob, setEditingJob] = useState<TypingJobItem | null>(null);

  // Submission Detail Modal
  const [selectedSubmission, setSelectedSubmission] = useState<TypingSubmissionRecord | null>(null);
  const [reviewNote, setReviewNote] = useState<string>('');
  const [isProcessingReview, setIsProcessingReview] = useState<boolean>(false);

  // Form State for Create/Edit Job
  const [formData, setFormData] = useState<{
    id?: string;
    title: string;
    description: string;
    jobType: TypingJobType;
    estimatedMinutes: number;
    rewardAmount: number;
    status: 'active' | 'inactive';
    referenceType: 'image' | 'pdf' | 'document' | 'text';
    referenceUrl: string;
    instructions: string;
    expectedText: string;
    validationMode: TypingValidationMode;
    minMatchPercentage: number;
    maxCompletions: number;
    allowMultipleSubmissionsPerUser: boolean;
    autoApproval: boolean;
    adKey: string;
    adDuration: number;
  }>({
    title: '',
    description: '',
    jobType: 'image_to_text',
    estimatedMinutes: 5,
    rewardAmount: 20,
    status: 'active',
    referenceType: 'image',
    referenceUrl: '',
    instructions: '',
    expectedText: '',
    validationMode: 'flexible',
    minMatchPercentage: 85,
    maxCompletions: 0,
    allowMultipleSubmissionsPerUser: false,
    autoApproval: true,
    adKey: 'a5ea718688da962e97053af64e1de8f0',
    adDuration: 15
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [jobsData, subsData, settingsData] = await Promise.all([
        fetchTypingJobs(),
        fetchTypingSubmissions(),
        fetchTypingSettings()
      ]);
      setJobs(jobsData);
      setSubmissions(subsData);
      setSettings(settingsData);
    } catch (err) {
      console.error('Failed to load typing management data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Stats Calculations
  const activeJobsCount = jobs.filter(j => j.status === 'active').length;
  const completedJobsCount = jobs.filter(j => j.maxCompletions && j.currentCompletions >= j.maxCompletions).length;
  const pendingSubmissionsCount = submissions.filter(s => s.status === 'under_review').length;
  const approvedSubmissionsCount = submissions.filter(s => s.status === 'approved').length;
  const rejectedSubmissionsCount = submissions.filter(s => s.status === 'rejected').length;
  const uniqueParticipants = new Set(submissions.map(s => s.userId)).size;
  const totalPaidReward = submissions
    .filter(s => s.status === 'approved' || s.rewardClaimed)
    .reduce((sum, s) => sum + (Number(s.rewardAmount) || 0), 0);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingJob(null);
    setFormData({
      title: '',
      description: '',
      jobType: 'image_to_text',
      estimatedMinutes: 5,
      rewardAmount: settings.defaultReward || 20,
      status: 'active',
      referenceType: 'image',
      referenceUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
      instructions: 'ছবির লেখা হুবহু নিচের টেক্সট বক্সে টাইপ করুন।',
      expectedText: '',
      validationMode: 'flexible',
      minMatchPercentage: 85,
      maxCompletions: 0,
      allowMultipleSubmissionsPerUser: false,
      autoApproval: true,
      adKey: settings.adsterraKey || 'a5ea718688da962e97053af64e1de8f0',
      adDuration: settings.defaultAdDurationSeconds || 15
    });
    setIsJobModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (job: TypingJobItem) => {
    setEditingJob(job);
    setFormData({
      id: job.id,
      title: job.title,
      description: job.description,
      jobType: job.jobType,
      estimatedMinutes: job.estimatedMinutes || 5,
      rewardAmount: job.rewardAmount || 20,
      status: job.status,
      referenceType: job.referenceType || 'image',
      referenceUrl: job.referenceUrl || '',
      instructions: job.instructions || '',
      expectedText: job.expectedText || '',
      validationMode: job.validationMode || 'flexible',
      minMatchPercentage: job.minMatchPercentage || 85,
      maxCompletions: job.maxCompletions || 0,
      allowMultipleSubmissionsPerUser: job.allowMultipleSubmissionsPerUser || false,
      autoApproval: job.autoApproval !== false,
      adKey: job.largeAdConfig?.adKey || settings.adsterraKey || '',
      adDuration: job.largeAdConfig?.durationSeconds || 15
    });
    setIsJobModalOpen(true);
  };

  // Save Job Submit
  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.expectedText) {
      showToast('কাজের শিরোনাম ও প্রত্যাশিত টেক্সট পূরণ করা আবশ্যক।');
      return;
    }

    const jobToSave: TypingJobItem = {
      id: editingJob ? editingJob.id : `job_type_${Date.now()}`,
      title: formData.title,
      description: formData.description,
      jobType: formData.jobType,
      estimatedMinutes: Number(formData.estimatedMinutes) || 5,
      rewardAmount: Number(formData.rewardAmount) || 20,
      status: formData.status,
      referenceType: formData.referenceType,
      referenceUrl: formData.referenceUrl,
      instructions: formData.instructions,
      expectedText: formData.expectedText,
      validationMode: formData.validationMode,
      minMatchPercentage: Number(formData.minMatchPercentage) || 85,
      maxCompletions: Number(formData.maxCompletions) || 0,
      currentCompletions: editingJob ? editingJob.currentCompletions : 0,
      allowMultipleSubmissionsPerUser: formData.allowMultipleSubmissionsPerUser,
      autoApproval: formData.autoApproval,
      largeAdConfig: {
        enabled: true,
        adKey: formData.adKey,
        durationSeconds: Number(formData.adDuration) || 15
      },
      createdAt: editingJob ? editingJob.createdAt : new Date().toISOString()
    };

    await saveTypingJob(jobToSave);
    await loadAllData();
    setIsJobModalOpen(false);
    showToast(editingJob ? 'কাজের বিবরণ আপডেট হয়েছে।' : 'নতুন টাইপিং জব তৈরি হয়েছে।');
  };

  // Toggle Job Status
  const handleToggleJobStatus = async (job: TypingJobItem) => {
    const updated: TypingJobItem = {
      ...job,
      status: job.status === 'active' ? 'inactive' : 'active'
    };
    await saveTypingJob(updated);
    await loadAllData();
    showToast(`কাজটি ${updated.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'} করা হয়েছে।`);
  };

  // Delete Job
  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই কাজটি মুছে ফেলতে চান?')) return;
    await deleteTypingJob(jobId);
    await loadAllData();
    showToast('কাজটি সফলভাবে মুছে ফেলা হয়েছে।');
  };

  // Review Submission (Approve / Reject)
  const handleReview = async (status: 'approved' | 'rejected') => {
    if (!selectedSubmission || isProcessingReview) return;
    setIsProcessingReview(true);
    try {
      await reviewTypingSubmission(
        selectedSubmission.submissionId || selectedSubmission.id,
        status,
        reviewNote,
        'Admin'
      );
      await loadAllData();
      showToast(status === 'approved' ? 'কাজটি অনুমোদিত হয়েছে এবং রিওয়ার্ড ক্রেডিট নিশ্চিত হয়েছে।' : 'কাজটি বাতিল করা হয়েছে।');
      setSelectedSubmission(null);
      setReviewNote('');
    } catch (err) {
      console.error('Failed to review submission:', err);
      showToast('রিভিউ সম্পন্ন করতে সমস্যা হয়েছে।');
    } finally {
      setIsProcessingReview(false);
    }
  };

  // Save Global Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveTypingSettings(settings);
    showToast('টাইপিং সেটিংস সংরক্ষণ করা হয়েছে।');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Keyboard className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">টাইপিং জব ম্যানেজমেন্ট</h2>
            <p className="text-xs text-slate-500">
              টাইপিং কাজ তৈরি, নির্দেশনা, রেফারেন্স ইমেজ, স্বয়ংক্রিয় যাচাই ও জমাকৃত কাজের অনুমোদন
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAllData}
            title="রিফ্রেশ করুন"
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            id="btn-admin-create-typing-job"
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন কাজ তৈরি করুন</span>
          </button>
        </div>
      </div>

      {/* Stats Cards (6 metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium mb-1">সক্রিয় কাজ</div>
          <div className="text-xl font-black text-emerald-600">{activeJobsCount}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium mb-1">সম্পন্ন কাজ</div>
          <div className="text-xl font-black text-slate-700">{completedJobsCount}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium mb-1">অপেক্ষমান রিভিউ</div>
          <div className="text-xl font-black text-amber-500">{pendingSubmissionsCount}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium mb-1">অনুমোদিত সাবমিশন</div>
          <div className="text-xl font-black text-teal-600">{approvedSubmissionsCount}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium mb-1">অংশগ্রহণকারী</div>
          <div className="text-xl font-black text-indigo-600">{uniqueParticipants}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium mb-1">মোট প্রদত্ত রিওয়ার্ড</div>
          <div className="text-xl font-black text-emerald-700">৳{totalPaidReward}</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-2xl px-4 pt-2">
        <button
          onClick={() => setActiveSubTab('jobs')}
          className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeSubTab === 'jobs' 
              ? 'border-emerald-600 text-emerald-700' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>কাজের তালিকা ({jobs.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('submissions')}
          className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeSubTab === 'submissions' 
              ? 'border-emerald-600 text-emerald-700' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>জমাকৃত কাজসমূহ ({submissions.length})</span>
          {pendingSubmissionsCount > 0 && (
            <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
              {pendingSubmissionsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('settings')}
          className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeSubTab === 'settings' 
              ? 'border-emerald-600 text-emerald-700' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>টাইপিং ও এড সেটিংস</span>
        </button>
      </div>

      {/* TAB 1: JOBS LIST */}
      {activeSubTab === 'jobs' && (
        <div className="bg-white rounded-b-2xl border border-t-0 border-slate-200/80 p-5 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="কাজের নাম দিয়ে খুঁজুন..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden"
              />
            </div>
            <span className="text-xs text-slate-500">
              মোট কাজ: <strong>{jobs.length}</strong> টি
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">কাজের নাম ও ধরন</th>
                  <th className="p-3">পুরস্কার (৳)</th>
                  <th className="p-3">যাচাইকরণ</th>
                  <th className="p-3">অংশগ্রহণ</th>
                  <th className="p-3">স্ট্যাটাস</th>
                  <th className="p-3 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs
                  .filter(j => !searchTerm || j.title.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((job) => (
                    <tr key={job.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-slate-800 text-sm mb-0.5">{job.title}</div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <span className="capitalize">{job.jobType.replace(/_/g, ' ')}</span>
                          <span>•</span>
                          <span>{job.estimatedMinutes} মিনিট</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                          ৳{job.rewardAmount}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="inline-block bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium text-slate-700">
                          {job.validationMode === 'strict' ? 'Strict (৯৫%)' : job.validationMode === 'flexible' ? `Flexible (${job.minMatchPercentage}%)` : 'Manual'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="font-mono text-slate-700">
                          {job.currentCompletions} {job.maxCompletions ? `/ ${job.maxCompletions}` : '(আনলিমিটেড)'}
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => handleToggleJobStatus(job)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                            job.status === 'active' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {job.status === 'active' ? (
                            <>
                              <ToggleRight className="w-4 h-4 text-emerald-600" />
                              <span>সক্রিয়</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-4 h-4 text-slate-400" />
                              <span>নিষ্ক্রিয়</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(job)}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="সম্পাদনা করুন"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteJob(job.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SUBMISSIONS QUEUE */}
      {activeSubTab === 'submissions' && (
        <div className="bg-white rounded-b-2xl border border-t-0 border-slate-200/80 p-5 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setSubmissionFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${submissionFilter === 'all' ? 'bg-white shadow-xs text-slate-800' : 'text-slate-500'}`}
              >
                সকল ({submissions.length})
              </button>
              <button
                onClick={() => setSubmissionFilter('under_review')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${submissionFilter === 'under_review' ? 'bg-white shadow-xs text-amber-600' : 'text-slate-500'}`}
              >
                অপেক্ষমান ({pendingSubmissionsCount})
              </button>
              <button
                onClick={() => setSubmissionFilter('approved')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${submissionFilter === 'approved' ? 'bg-white shadow-xs text-emerald-600' : 'text-slate-500'}`}
              >
                অনুমোদিত ({approvedSubmissionsCount})
              </button>
              <button
                onClick={() => setSubmissionFilter('rejected')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${submissionFilter === 'rejected' ? 'bg-white shadow-xs text-rose-600' : 'text-slate-500'}`}
              >
                বাতিল ({rejectedSubmissionsCount})
              </button>
            </div>

            <span className="text-xs text-slate-500">
              মোট জমাকৃত: <strong>{submissions.length}</strong> টি
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">ইউজার ও আইডি</th>
                  <th className="p-3">কাজের নাম</th>
                  <th className="p-3">নির্ভুলতা</th>
                  <th className="p-3">বিজ্ঞাপন</th>
                  <th className="p-3">পুরস্কার</th>
                  <th className="p-3">স্ট্যাটাস</th>
                  <th className="p-3 text-right">বিস্তারিত ও অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {submissions
                  .filter(s => submissionFilter === 'all' || s.status === submissionFilter)
                  .map((sub) => (
                    <tr key={sub.submissionId || sub.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-slate-800">{sub.userName || 'User'}</div>
                        <div className="font-mono text-[11px] text-slate-400">{sub.userId}</div>
                      </td>
                      <td className="p-3 max-w-xs">
                        <div className="font-semibold text-slate-800 truncate">{sub.jobTitle}</div>
                        <div className="text-[11px] text-slate-400">
                          {new Date(sub.submittedAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`font-bold ${sub.matchPercentage >= 85 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {sub.matchPercentage}%
                        </span>
                      </td>
                      <td className="p-3">
                        {sub.adCompleted ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            সম্পূর্ণ
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">অসম্পূর্ণ</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-slate-800">৳{sub.rewardAmount}</span>
                      </td>
                      <td className="p-3">
                        {sub.status === 'approved' ? (
                          <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[10px]">অনুমোদিত</span>
                        ) : sub.status === 'rejected' ? (
                          <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full text-[10px]">বাতিল</span>
                        ) : (
                          <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full text-[10px]">অপেক্ষমান</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedSubmission(sub);
                            setReviewNote(sub.adminNote || '');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-bold text-xs transition-colors"
                        >
                          দেখুন ও রিভিউ
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SETTINGS */}
      {activeSubTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-white rounded-b-2xl border border-t-0 border-slate-200/80 p-5 space-y-4 max-w-2xl">
          <h3 className="font-bold text-slate-800 text-sm">সাধারণ টাইপিং সেটিংস</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ডিফল্ট রিওয়ার্ড (৳)
              </label>
              <input
                type="number"
                value={settings.defaultReward}
                onChange={(e) => setSettings({ ...settings, defaultReward: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                সাবমিটের পর বিজ্ঞাপনের সময় (সেকেন্ড)
              </label>
              <input
                type="number"
                value={settings.defaultAdDurationSeconds}
                onChange={(e) => setSettings({ ...settings, defaultAdDurationSeconds: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Adsterra / Monetag Ad Key
            </label>
            <input
              type="text"
              value={settings.adsterraKey || ''}
              onChange={(e) => setSettings({ ...settings, adsterraKey: e.target.value })}
              placeholder="e.g. a5ea718688da962e97053af64e1de8f0"
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              টাইপিং জব পেজের নোটিশ
            </label>
            <textarea
              rows={3}
              value={settings.noticeText || ''}
              onChange={(e) => setSettings({ ...settings, noticeText: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20"
          >
            সেটিংস সেভ করুন
          </button>
        </form>
      )}

      {/* CREATE / EDIT JOB MODAL */}
      {isJobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl my-8 border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-base text-slate-800">
                {editingJob ? 'টাইপিং কাজ সম্পাদনা' : 'নতুন টাইপিং কাজ তৈরি করুন'}
              </h3>
              <button
                onClick={() => setIsJobModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveJob} className="space-y-4 text-xs">
              {/* Job Title */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">কাজের শিরোনাম (Title) *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="যেমন: মাদ্রাসার বার্ষিক পরীক্ষার প্রশ্ন টাইপ করুন"
                  className="w-full p-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Short Description */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">সংক্ষিপ্ত বিবরণ (Description)</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="যেমন: সংযুক্ত প্রশ্নপত্রের ছবি দেখে প্রতিটি প্রশ্ন হুবহু টাইপ করুন"
                  className="w-full p-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Job Type & Reward */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">কাজের ধরন (Job Type)</label>
                  <select
                    value={formData.jobType}
                    onChange={(e) => setFormData({ ...formData, jobType: e.target.value as TypingJobType })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-emerald-500"
                  >
                    <option value="image_to_text">Image → Text</option>
                    <option value="pdf_to_text">PDF → Text</option>
                    <option value="question_to_text">প্রশ্নপত্র → Text</option>
                    <option value="topic_to_text">নির্দিষ্ট Topic → Text</option>
                    <option value="screenshot_to_text">Screenshot → Text</option>
                    <option value="document_to_text">Document → Text</option>
                    <option value="custom_typing">অন্যান্য Typing Task</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">পুরস্কার / Reward (৳) *</label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    required
                    value={formData.rewardAmount}
                    onChange={(e) => setFormData({ ...formData, rewardAmount: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">আনুমানিক সময় (মিনিট)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.estimatedMinutes}
                    onChange={(e) => setFormData({ ...formData, estimatedMinutes: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Reference URL / Image / Document */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">রেফারেন্স ইমেজ বা ডকুমেন্টের লিঙ্ক (URL)</label>
                <input
                  type="url"
                  value={formData.referenceUrl}
                  onChange={(e) => setFormData({ ...formData, referenceUrl: e.target.value })}
                  placeholder="https://... (ছবি বা ডকুমেন্টের প্রিভিউ লিঙ্ক)"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 font-mono text-xs"
                />
              </div>

              {/* Instructions */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">ইউজারের জন্য বিস্তারিত নির্দেশনা</label>
                <textarea
                  rows={3}
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  placeholder="১. বানান ও যতিচিহ্ন খেয়াল রাখুন..."
                  className="w-full p-3 rounded-xl border border-slate-300 focus:border-emerald-500"
                />
              </div>

              {/* Expected / Required Text (Validation Target) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  প্রত্যাশিত সঠিক টেক্সট (Expected Text for Validation) *
                </label>
                <p className="text-[11px] text-slate-500 mb-1">
                  ইউজারের টাইপ করা লেখা এই লেখার সাথে স্বয়ংক্রিয়ভাবে যাচাই করা হবে।
                </p>
                <textarea
                  rows={5}
                  required
                  value={formData.expectedText}
                  onChange={(e) => setFormData({ ...formData, expectedText: e.target.value })}
                  placeholder="এখানে ছবির মূল সঠিক লেখাটি লিখুন যা দেখে মিলিয়ে নেওয়া হবে..."
                  className="w-full p-3 rounded-xl border border-slate-300 focus:border-emerald-500 font-sans"
                />
              </div>

              {/* Validation & Approval Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">যাচাইকরণের ধরন</label>
                  <select
                    value={formData.validationMode}
                    onChange={(e) => setFormData({ ...formData, validationMode: e.target.value as TypingValidationMode })}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  >
                    <option value="flexible">Flexible (প্রস্তাবিত)</option>
                    <option value="strict">Strict (৯৫%+ মিল)</option>
                    <option value="manual_only">শুধুমাত্র ম্যানুয়াল রিভিউ</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">ন্যূনতম মিল (%)</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={formData.minMatchPercentage}
                    onChange={(e) => setFormData({ ...formData, minMatchPercentage: Number(e.target.value) })}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">অনুমোদন পদ্ধতি</label>
                  <select
                    value={formData.autoApproval ? 'auto' : 'manual'}
                    onChange={(e) => setFormData({ ...formData, autoApproval: e.target.value === 'auto' })}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  >
                    <option value="auto">Auto Approve + Instant Reward</option>
                    <option value="manual">Manual Admin Review</option>
                  </select>
                </div>
              </div>

              {/* Max Completions limit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">সর্বোচ্চ কতজন করতে পারবে (০ = আনলিমিটেড)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.maxCompletions}
                    onChange={(e) => setFormData({ ...formData, maxCompletions: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">কাজের অবস্থা (Status)</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  >
                    <option value="active">Active (সক্রিয়)</option>
                    <option value="inactive">Inactive (নিষ্ক্রিয়)</option>
                  </select>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsJobModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20"
                >
                  {editingJob ? 'পরিবর্তন সংরক্ষণ করুন' : 'কাজ প্রকাশ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUBMISSION REVIEW MODAL */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl my-8 border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-800">জমাকৃত কাজ রিভিউ</h3>
                <p className="text-xs text-slate-400">Submission ID: {selectedSubmission.submissionId}</p>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* User and Job Info */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[11px]">ইউজারের নাম:</span>
                  <strong className="text-slate-800 text-sm">{selectedSubmission.userName}</strong>
                  <span className="text-slate-500 font-mono block text-[11px]">{selectedSubmission.userId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">কাজের নাম ও রিওয়ার্ড:</span>
                  <strong className="text-slate-800 block truncate">{selectedSubmission.jobTitle}</strong>
                  <span className="text-emerald-600 font-bold">৳{selectedSubmission.rewardAmount}</span>
                </div>
              </div>

              {/* Accuracy & Ad Status */}
              <div className="flex items-center gap-4 bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
                <div>
                  <span className="text-slate-500 block text-[11px]">টাইপিং নির্ভুলতা:</span>
                  <strong className="text-emerald-700 text-base font-black">{selectedSubmission.matchPercentage}%</strong>
                </div>
                <div className="border-l border-emerald-200 pl-4">
                  <span className="text-slate-500 block text-[11px]">বিজ্ঞাপন স্ট্যাটাস:</span>
                  <span className="font-bold text-slate-700">{selectedSubmission.adCompleted ? 'সম্পূর্ণ দেখা হয়েছে' : 'অসম্পূর্ণ'}</span>
                </div>
                <div className="border-l border-emerald-200 pl-4">
                  <span className="text-slate-500 block text-[11px]">বর্তমান স্ট্যাটাস:</span>
                  <span className="font-bold uppercase text-slate-700">{selectedSubmission.status}</span>
                </div>
              </div>

              {/* Submitted Text vs Expected Text */}
              <div className="space-y-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">ইউজারের দেওয়া লেখা (Submitted Text):</label>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 font-sans leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {selectedSubmission.submittedText}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">প্রত্যাশিত সঠিক লেখা (Expected Text):</label>
                  <div className="p-3 bg-slate-100/70 rounded-xl border border-slate-200 text-slate-700 font-sans leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {selectedSubmission.expectedText}
                  </div>
                </div>
              </div>

              {/* Admin Note Input */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">এডমিন নোট / মন্তব্য (ঐচ্ছিক):</label>
                <input
                  type="text"
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="যেমন: সঠিকভাবে টাইপ করার জন্য ধন্যবাদ..."
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              {/* Review Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedSubmission(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  বন্ধ করুন
                </button>
                <button
                  type="button"
                  disabled={isProcessingReview}
                  onClick={() => handleReview('rejected')}
                  className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 font-bold"
                >
                  <XCircle className="w-4 h-4 inline mr-1" />
                  বাতিল করুন (Reject)
                </button>
                <button
                  type="button"
                  disabled={isProcessingReview}
                  onClick={() => handleReview('approved')}
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-bold shadow-md shadow-emerald-600/20"
                >
                  <CheckCircle2 className="w-4 h-4 inline mr-1" />
                  অনুমোদন ও রিওয়ার্ড ক্রেডিট করুন (Approve)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
