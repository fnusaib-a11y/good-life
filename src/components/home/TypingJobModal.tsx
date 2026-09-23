import React, { useState, useEffect } from 'react';
import { 
  Keyboard, 
  Briefcase, 
  History, 
  Coins, 
  ArrowLeft,
  Info,
  Sparkles,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TypingJobItem, TypingSubmissionRecord } from '../../types';
import { 
  fetchTypingJobs, 
  fetchTypingSubmissions, 
  submitTypingJob, 
  TypingAccuracyResult 
} from '../../services/typingJobService';
import { TypingJobCard } from '../typing/TypingJobCard';
import { TypingJobDetails } from '../typing/TypingJobDetails';
import { TypingHistoryTab } from '../typing/TypingHistoryTab';
import { TypingRewardVerificationView } from '../typing/TypingRewardVerificationView';
import { PersistentAdBanner } from '../common/PersistentAdBanner';

interface TypingJobModalProps {
  onClose: () => void;
}

export const TypingJobModal: React.FC<TypingJobModalProps> = ({ onClose }) => {
  const { 
    user,
    addEarning,
    showToast, 
    isBn 
  } = useApp();

  // Page View state: 'list' | 'details' | 'verify'
  const [currentView, setCurrentView] = useState<'list' | 'details' | 'verify'>('list');
  const [activeTab, setActiveTab] = useState<'jobs' | 'history'>('jobs');
  
  const [jobs, setJobs] = useState<TypingJobItem[]>([]);
  const [submissions, setSubmissions] = useState<TypingSubmissionRecord[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState<boolean>(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [selectedJob, setSelectedJob] = useState<TypingJobItem | null>(null);

  // In-page reward verification state
  const [pendingSubmission, setPendingSubmission] = useState<{
    job: TypingJobItem;
    typedText: string;
    validation: TypingAccuracyResult;
    submissionId: string;
  } | null>(null);
  const [isClaimingReward, setIsClaimingReward] = useState<boolean>(false);
  const [isClaimedSuccess, setIsClaimedSuccess] = useState<boolean>(false);

  // Load jobs on mount
  useEffect(() => {
    loadJobs();
  }, []);

  // Load user submissions on tab change or mount
  useEffect(() => {
    if (user?.id) {
      loadHistory();
    }
  }, [user?.id, activeTab]);

  const loadJobs = async () => {
    setIsLoadingJobs(true);
    try {
      const data = await fetchTypingJobs();
      setJobs(data);
    } catch (err) {
      console.error('Failed to load typing jobs:', err);
    } finally {
      setIsLoadingJobs(false);
    }
  };

  const loadHistory = async () => {
    if (!user?.id) return;
    setIsLoadingHistory(true);
    try {
      const data = await fetchTypingSubmissions(user.id);
      setSubmissions(data);
    } catch (err) {
      console.error('Failed to load user typing history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // When User completes typing and validation passes
  const handleWorkValidationSuccess = (typedText: string, validation: TypingAccuracyResult) => {
    if (!selectedJob || !user) {
      showToast('অনুগ্রহ করে প্রথমে লগইন করুন।');
      return;
    }

    const submissionId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    setPendingSubmission({
      job: selectedJob,
      typedText,
      validation,
      submissionId
    });

    setIsClaimedSuccess(false);
    // Transition directly to in-page reward verification view (No popup!)
    setCurrentView('verify');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // When Ad completes and user claims reward in-page
  const handleClaimReward = async () => {
    if (!pendingSubmission || !user || isClaimingReward) return;

    setIsClaimingReward(true);
    const { job, typedText, validation, submissionId } = pendingSubmission;

    try {
      const isAutoApprove = job.autoApproval !== false;
      const initialStatus = isAutoApprove ? 'approved' : 'under_review';
      const trxId = isAutoApprove ? `trx_type_${Date.now()}` : undefined;

      const record: TypingSubmissionRecord = {
        id: submissionId,
        submissionId,
        jobId: job.id,
        jobTitle: job.title,
        jobType: job.jobType,
        userId: user.id,
        userName: user.name || 'User',
        userPhone: user.phone || '',
        submittedText: typedText,
        expectedText: job.expectedText,
        matchPercentage: validation.matchPercentage,
        validationPassed: true,
        adCompleted: true,
        rewardAmount: job.rewardAmount,
        rewardClaimed: isAutoApprove,
        status: initialStatus,
        trxId,
        submittedAt: new Date().toISOString()
      };

      // 1. Credit reward to this specific user's balance if auto-approved
      if (isAutoApprove) {
        addEarning(job.rewardAmount, `টাইপিং জব: ${job.title}`, 'jobIncome');
      }

      // 2. Persist to API and local state
      await submitTypingJob(record);

      // 3. Refresh user history & jobs list
      await loadHistory();
      await loadJobs();

      setIsClaimedSuccess(true);
      if (isAutoApprove) {
        showToast(`অভিনন্দন! ৳${job.rewardAmount} সরাসরি আপনার অ্যাকাউন্টে যোগ করা হয়েছে।`);
      } else {
        showToast('কাজ সফলভাবে জমা হয়েছে। এডমিন অনুমোদনের পর রিওয়ার্ড ওয়ালেটে যোগ হবে।');
      }
    } catch (error) {
      console.error('Error claiming typing reward:', error);
      showToast('রিওয়ার্ড প্রসেস করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsClaimingReward(false);
    }
  };

  const isJobSubmittedByUser = (jobId: string) => {
    return submissions.some(s => s.jobId === jobId);
  };

  // Header Back Button Logic
  const handleHeaderBack = () => {
    if (currentView === 'verify') {
      setCurrentView('details');
    } else if (currentView === 'details') {
      setCurrentView('list');
      setSelectedJob(null);
    } else {
      onClose();
    }
  };

  return (
    <div 
      id="typing-job-full-page"
      className="fixed inset-0 z-40 bg-[#F8FAFC] flex flex-col overflow-y-auto animate-in fade-in"
    >
      {/* Direct Page Top Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            id="btn-back-from-typing-page"
            onClick={handleHeaderBack}
            className="flex items-center gap-1.5 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>
              {currentView === 'list' 
                ? 'হোমে ফিরে যান' 
                : currentView === 'details' 
                ? 'কাজের তালিকায় যান' 
                : 'এডিটরে ফিরে যান'}
            </span>
          </button>

          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <Keyboard className="w-4 h-4" />
            </div>
            <h1 className="text-sm sm:text-base font-extrabold text-slate-800">
              {currentView === 'list' 
                ? 'টাইপিং জব পোর্টাল' 
                : currentView === 'details' 
                ? 'কাজের বিবরণ ও টাইপিং' 
                : 'রিওয়ার্ড ভেরিফিকেশন'}
            </h1>
          </div>

          {/* User Balance Badge */}
          {user && (
            <div className="bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-bold text-emerald-800 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-amber-500" />
              <span>৳{(user.balance || 0).toFixed(2)}</span>
            </div>
          )}
        </div>
      </header>

      {/* Top Banner Ad (Ad #1) */}
      <div className="w-full bg-slate-900 border-b border-slate-800 flex justify-center py-0.5">
        <PersistentAdBanner position="top" page="typing_job" />
      </div>

      {/* Main Page Container */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-3 sm:px-4 py-4 flex flex-col">
        {/* VIEW 1: JOB LIST / HISTORY */}
        {currentView === 'list' && (
          <div className="flex-1 flex flex-col">
            {/* Sub-Tabs: Available Jobs vs History */}
            <div className="flex border-b border-slate-200 bg-white rounded-2xl p-1 shadow-2xs mb-4">
              <button
                id="tab-available-typing-jobs"
                onClick={() => setActiveTab('jobs')}
                className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'jobs' 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>উপলব্ধ কাজ ({jobs.length})</span>
              </button>

              <button
                id="tab-my-typing-history"
                onClick={() => setActiveTab('history')}
                className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'history' 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <History className="w-4 h-4" />
                <span>আমার হিস্ট্রি ({submissions.length})</span>
              </button>
            </div>

            {/* TAB: AVAILABLE JOBS */}
            {activeTab === 'jobs' && (
              <div className="flex flex-col gap-3.5">
                {/* Notice Banner */}
                <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-100 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-slate-700 shadow-2xs">
                  <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>নির্দেশনা:</strong> রেফারেন্স ছবি বা ডকুমেন্ট দেখে নির্ভুলভাবে টাইপ করুন। সাবমিটের পর বিজ্ঞাপন ভেরিফিকেশন শেষ হলে রিওয়ার্ড সরাসরি আপনার ওয়ালেটে জমা হবে।
                  </p>
                </div>

                {isLoadingJobs ? (
                  <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center">
                    <RefreshCw className="w-8 h-8 animate-spin mb-3 text-emerald-500" />
                    <p className="text-xs font-medium">কাজের তালিকা লোড হচ্ছে...</p>
                  </div>
                ) : jobs.length === 0 ? (
                  <div className="py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-6">
                    <Keyboard className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <h3 className="font-bold text-slate-700 text-sm mb-1">বর্তমানে কোনো কাজ উপলব্ধ নেই</h3>
                    <p className="text-xs text-slate-500">শীঘ্রই নতুন টাইপিং কাজ যুক্ত করা হবে। একটু পর আবার চেক করুন।</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {jobs.map((job) => (
                      <TypingJobCard
                        key={job.id}
                        job={job}
                        isAlreadySubmitted={isJobSubmittedByUser(job.id)}
                        onStart={(selected) => {
                          setSelectedJob(selected);
                          setCurrentView('details');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: USER SUBMISSION HISTORY */}
            {activeTab === 'history' && (
              <TypingHistoryTab
                submissions={submissions}
                isLoading={isLoadingHistory}
              />
            )}
          </div>
        )}

        {/* VIEW 2: JOB DETAILS & TYPING EDITOR */}
        {currentView === 'details' && selectedJob && (
          <TypingJobDetails
            job={selectedJob}
            onBack={() => {
              setCurrentView('list');
              setSelectedJob(null);
            }}
            onSubmitWork={handleWorkValidationSuccess}
          />
        )}

        {/* VIEW 3: IN-PAGE REWARD VERIFICATION (NO POPUPS) */}
        {currentView === 'verify' && pendingSubmission && (
          <TypingRewardVerificationView
            job={pendingSubmission.job}
            validation={pendingSubmission.validation}
            onClaimReward={handleClaimReward}
            onCancel={() => setCurrentView('details')}
            isClaiming={isClaimingReward}
            isClaimedSuccess={isClaimedSuccess}
            onGoToJobs={() => {
              setSelectedJob(null);
              setPendingSubmission(null);
              setCurrentView('list');
              setActiveTab('jobs');
            }}
            onGoToHistory={() => {
              setSelectedJob(null);
              setPendingSubmission(null);
              setCurrentView('list');
              setActiveTab('history');
            }}
          />
        )}
      </main>

      {/* Bottom Banner Ad (Ad #2) */}
      <div className="w-full bg-slate-900 border-t border-slate-800 flex justify-center py-0.5 mt-auto">
        <PersistentAdBanner position="bottom" page="typing_job" />
      </div>
    </div>
  );
};

export const TypingJobPage = TypingJobModal;
