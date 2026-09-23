import React, { useState, useEffect } from 'react';
import { 
  Megaphone, 
  Plus, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Save, 
  X, 
  Layers, 
  Check, 
  XCircle, 
  DollarSign, 
  Image, 
  Link as LinkIcon, 
  FileText 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MarketingTaskItem, MarketingSubmissionItem, ProofSubmissionType } from '../../types/contentTypes';
import { 
  getMarketingTasks, 
  saveMarketingTask, 
  deleteMarketingTask, 
  toggleMarketingTaskStatus,
  getMarketingSubmissions,
  updateMarketingSubmissionStatus
} from '../../services/realContentService';

export const AdminMarketingManagementTab: React.FC = () => {
  const { 
    showToast, 
    creditUserReward, 
    addTransaction 
  } = useApp();

  const [tasks, setTasks] = useState<MarketingTaskItem[]>([]);
  const [submissions, setSubmissions] = useState<MarketingSubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'tasks' | 'add' | 'submissions'>('tasks');
  const [editingTask, setEditingTask] = useState<MarketingTaskItem | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [instructions, setInstructions] = useState('');
  const [marketingLink, setMarketingLink] = useState('');
  const [rewardAmount, setRewardAmount] = useState<number>(2.00);
  const [taskLimit, setTaskLimit] = useState<number>(100);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [proofType, setProofType] = useState<ProofSubmissionType>('screenshot');
  const [proofRequirement, setProofRequirement] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [isSaving, setIsSaving] = useState(false);

  // Submissions filter & modal
  const [subFilter, setSubFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedSub, setSelectedSub] = useState<MarketingSubmissionItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tList, sList] = await Promise.all([
        getMarketingTasks(false),
        getMarketingSubmissions()
      ]);
      setTasks(tList);
      setSubmissions(sList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEdit = (item: MarketingTaskItem) => {
    setEditingTask(item);
    setTitle(item.title || '');
    setThumbnail(item.thumbnail || '');
    setInstructions(item.instructions || '');
    setMarketingLink(item.marketingLink || '');
    setRewardAmount(item.rewardAmount || 2.00);
    setTaskLimit(item.taskLimit || 100);
    setStartDate(item.startDate || new Date().toISOString().split('T')[0]);
    setEndDate(item.endDate || '');
    setProofType(item.proofType || 'screenshot');
    setProofRequirement(item.proofRequirement || '');
    setStatus(item.status || 'active');
    setActiveSubTab('add');
  };

  const handleReset = () => {
    setEditingTask(null);
    setTitle('');
    setThumbnail('');
    setInstructions('');
    setMarketingLink('');
    setRewardAmount(2.00);
    setTaskLimit(100);
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate('');
    setProofType('screenshot');
    setProofRequirement('');
    setStatus('active');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('টাস্ক শিরোনাম আবশ্যক');
      return;
    }

    setIsSaving(true);
    try {
      const payload: MarketingTaskItem = {
        id: editingTask?.id || `task_${Date.now()}`,
        title: title.trim(),
        thumbnail: thumbnail.trim() || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&auto=format&fit=crop&q=80',
        instructions: instructions.trim(),
        marketingLink: marketingLink.trim(),
        rewardAmount: Number(rewardAmount) || 2.00,
        taskLimit: Number(taskLimit) || 100,
        completedCount: editingTask?.completedCount || 0,
        startDate: startDate || new Date().toISOString().split('T')[0],
        endDate: endDate || undefined,
        proofType,
        proofRequirement: proofRequirement.trim() || 'সঠিক স্ক্রিনশট বা লিংক প্রদান করুন',
        status,
        createdAt: editingTask?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await saveMarketingTask(payload);
      showToast(editingTask ? 'মার্কেটিং টাস্ক আপডেট সফল!' : 'নতুন মার্কেটিং টাস্ক তৈরি ও পাবলিশ সফল!');
      handleReset();
      setActiveSubTab('tasks');
      await loadData();
    } catch (err) {
      console.error(err);
      showToast('টাস্ক সংরক্ষণ ব্যর্থ হয়েছে');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('আপনি কি নিশ্চিত এই টাস্কটি মুছে ফেলতে চান?')) return;
    try {
      await deleteMarketingTask(id);
      showToast('টাস্ক মুছে ফেলা হয়েছে');
      await loadData();
    } catch (err) {
      console.error(err);
      showToast('ডিলিট করতে সমস্যা হয়েছে');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const updated = await toggleMarketingTaskStatus(id);
      if (updated) {
        showToast(`টাস্কটি এখন ${updated.status === 'active' ? 'সক্রিয় (Active)' : 'নিষ্ক্রিয় (Inactive)'}`);
        await loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Approve submission
  const handleApproveSubmission = async (sub: MarketingSubmissionItem) => {
    if (!window.confirm(`আপনি কি এই প্রুফ অনুমোদন করে ইউজারকে ৳${sub.rewardAmount} ব্যালেন্স ক্রেডিট করতে চান?`)) return;

    setIsProcessingAction(true);
    try {
      await updateMarketingSubmissionStatus(sub.id, 'approved');

      // Credit user reward to real wallet balance
      creditUserReward(sub.rewardAmount, `বিজ্ঞাপন মার্কেটিং বোনাস: ${sub.taskTitle}`, 'bonus');

      // Record transaction
      addTransaction({
        type: 'bonus',
        amount: sub.rewardAmount,
        status: 'completed',
        description: `মার্কেটিং টাস্ক রিওয়ার্ড: ${sub.taskTitle}`
      });

      showToast(`সফল! ইউজারের ব্যালেন্সে ৳${sub.rewardAmount} জমা হয়েছে`);
      await loadData();
    } catch (err) {
      console.error(err);
      showToast('অনুমোদন করতে সমস্যা হয়েছে');
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Reject submission
  const handleRejectSubmission = async (sub: MarketingSubmissionItem) => {
    if (!rejectReason.trim()) {
      showToast('বাতিলের কারণ উল্লেখ করুন');
      return;
    }

    setIsProcessingAction(true);
    try {
      await updateMarketingSubmissionStatus(sub.id, 'rejected', rejectReason.trim());
      showToast('সাবমিশনটি বাতিল করা হয়েছে');
      setSelectedSub(null);
      setRejectReason('');
      await loadData();
    } catch (err) {
      console.error(err);
      showToast('বাতিল করতে সমস্যা হয়েছে');
    } finally {
      setIsProcessingAction(false);
    }
  };

  const filteredSubs = submissions.filter(s => {
    if (subFilter === 'all') return true;
    return s.status === subFilter;
  });

  return (
    <div className="space-y-6 text-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 rounded-2xl p-5 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shadow-inner">
              <Megaphone className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-black tracking-tight">বিজ্ঞাপন মার্কেটিং ও প্রুফ জমা ম্যানেজমেন্ট</h2>
          </div>
          <p className="text-xs sm:text-sm text-pink-100 font-medium mt-1">
            মার্কেটিং ক্যাম্পেইন তৈরি করুন, ইউজারের জমাকৃত প্রুফ রিভিউ ও নিরাপদ রিওয়ার্ড ক্রেডিট নিশ্চিত করুন।
          </p>
        </div>
        <button
          onClick={() => {
            if (activeSubTab === 'add') {
              setActiveSubTab('tasks');
              handleReset();
            } else {
              handleReset();
              setActiveSubTab('add');
            }
          }}
          className="flex items-center gap-2 bg-white text-purple-700 hover:bg-purple-50 px-4 py-2 rounded-xl text-sm font-bold shadow transition cursor-pointer"
        >
          {activeSubTab === 'add' ? (
            <>
              <Layers className="w-4 h-4" /> সকল টাস্ক
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" /> নতুন টাস্ক তৈরি
            </>
          )}
        </button>
      </div>

      {/* Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        <button
          onClick={() => { setActiveSubTab('tasks'); setEditingTask(null); }}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'tasks'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" /> সকল মার্কেটিং টাস্ক ({tasks.length})
        </button>
        <button
          onClick={() => setActiveSubTab('add')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'add'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
          }`}
        >
          <Plus className="w-4 h-4" /> {editingTask ? 'টাস্ক সম্পাদনা' : 'নতুন টাস্ক তৈরি'}
        </button>
        <button
          onClick={() => setActiveSubTab('submissions')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'submissions'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" /> প্রুফ সাবমিশন ({submissions.length})
          {submissions.filter(s => s.status === 'pending').length > 0 && (
            <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
              {submissions.filter(s => s.status === 'pending').length}
            </span>
          )}
        </button>
      </div>

      {/* SUB-TAB 1: Add or Edit Form */}
      {activeSubTab === 'add' && (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-300 rounded-2xl p-6 shadow-md space-y-5 text-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-purple-600" />
              <span>{editingTask ? 'মার্কেটিং টাস্ক আপডেট করুন' : 'নতুন বিজ্ঞাপন মার্কেটিং টাস্ক তৈরি'}</span>
            </h3>
            {editingTask && (
              <button
                type="button"
                onClick={() => { handleReset(); setActiveSubTab('tasks'); }}
                className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1 cursor-pointer font-bold"
              >
                <X className="w-4 h-4" /> বাতিল
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                টাস্কের শিরোনাম (Campaign Title) *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="যেমন: আমাদের অফিসিয়াল ইউটিউব চ্যানেল সাবস্ক্রাইব করুন"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none"
              />
            </div>

            {/* Reward Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                রিওয়ার্ড টাকার পরিমাণ (৳ Reward) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-500 font-bold">৳</span>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  value={rewardAmount}
                  onChange={e => setRewardAmount(parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-bold text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none"
                />
              </div>
            </div>

            {/* Task Limit */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                সর্বোচ্চ কতজন ইউজার কাজ করতে পারবে (Limit)
              </label>
              <input
                type="number"
                min="1"
                value={taskLimit}
                onChange={e => setTaskLimit(parseInt(e.target.value) || 100)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-bold text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none"
              />
            </div>

            {/* Target URL */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                টার্গেট মার্কেটিং লিংক (Link to Visit/Follow/Join) *
              </label>
              <input
                type="url"
                required
                value={marketingLink}
                onChange={e => setMarketingLink(e.target.value)}
                placeholder="https://facebook.com/... অথবা https://youtube.com/..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none"
              />
            </div>

            {/* Banner/Image */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                ব্যানার বা লোগো লিংক (Image URL)
              </label>
              <input
                type="url"
                value={thumbnail}
                onChange={e => setThumbnail(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none"
              />
            </div>

            {/* Proof Type */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                প্রুফ জমা দেওয়ার মাধ্যম (Proof Type)
              </label>
              <select
                value={proofType}
                onChange={e => setProofType(e.target.value as ProofSubmissionType)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-bold text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none"
              >
                <option value="screenshot">স্ক্রিনশট আপলোড (Screenshot Image)</option>
                <option value="link">ইউজার প্রোফাইল লিংক বা পোস্ট লিংক (Link URL)</option>
                <option value="text">ইউজারনেম বা টেক্সট প্রুফ (Text / Username)</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                স্ট্যাটাস (Status)
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-bold text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none"
              >
                <option value="active">Active (সক্রিয়)</option>
                <option value="inactive">Inactive (নিষ্ক্রিয়)</option>
              </select>
            </div>

            {/* Proof Requirement Instructions */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                প্রুফ জমা দেওয়ার নিয়ম (Proof Requirement Details)
              </label>
              <input
                type="text"
                value={proofRequirement}
                onChange={e => setProofRequirement(e.target.value)}
                placeholder="যেমন: চ্যানেল সাবস্ক্রাইব করে বেল আইকন প্রেস করার একটি স্পষ্ট স্ক্রিনশট দিন"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none"
              />
            </div>

            {/* Step-by-step Instructions */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                কাজের ধাপ ও বিস্তারিত নির্দেশিকা (Instructions) *
              </label>
              <textarea
                rows={4}
                required
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
                placeholder="১. উপরের লিংকে ক্লিক করে আমাদের পেজে যান।&#10;২. পেজটিতে লাইক ও ফলো করুন।&#10;৩. ফলো করার স্ক্রিনশট তুলে এখানে আপলোড করুন।"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => { handleReset(); setActiveSubTab('tasks'); }}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 bg-slate-100 hover:bg-slate-200 text-sm font-bold transition cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold shadow transition flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'সংরক্ষণ হচ্ছে...' : editingTask ? 'আপডেট করুন' : 'পাবলিশ করুন'}
            </button>
          </div>
        </form>
      )}

      {/* SUB-TAB 2: All Marketing Tasks List */}
      {activeSubTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900">
              সকল বিজ্ঞাপন টাস্ক ({tasks.length})
            </h3>
            <button
              onClick={loadData}
              className="text-xs text-purple-600 hover:text-purple-700 font-bold cursor-pointer"
            >
              রিফ্রেশ করুন
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-500 font-medium">লোড হচ্ছে...</div>
          ) : tasks.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-dashed border-slate-200 text-center">
              <Megaphone className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-700 font-bold">বর্তমানে কোনো বিজ্ঞাপন মার্কেটিং টাস্ক নেই</p>
              <p className="text-xs text-slate-500 mt-1">
                "নতুন টাস্ক তৈরি" বাটনে ক্লিক করে নতুন ক্যাম্পেইন যুক্ত করুন।
              </p>
              <button
                onClick={() => { handleReset(); setActiveSubTab('add'); }}
                className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold shadow cursor-pointer"
              >
                + নতুন টাস্ক তৈরি
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tasks.map(task => (
                <div
                  key={task.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start gap-3">
                      <img
                        src={task.thumbnail || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&auto=format&fit=crop&q=80'}
                        alt={task.title}
                        className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                        onError={(e: any) => {
                          e.target.src = 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                            ৳{task.rewardAmount}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              task.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {task.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 line-clamp-2">
                          {task.title}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                          {task.instructions}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-600 space-y-1">
                      {task.marketingLink && (
                        <div className="flex items-center gap-1 text-purple-700 truncate font-semibold">
                          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                          <a href={task.marketingLink} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
                            {task.marketingLink}
                          </a>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-slate-500 font-medium">
                        <span>সম্পন্ন: {task.completedCount || 0}/{task.taskLimit || 100}</span>
                        <span>প্রুফ ধরণ: {task.proofType}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => handleToggleStatus(task.id)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                        task.status === 'active'
                          ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                      }`}
                    >
                      {task.status === 'active' ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(task)}
                        className="p-1.5 text-slate-600 hover:text-purple-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                        title="সম্পাদনা করুন"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: Submissions Review */}
      {activeSubTab === 'submissions' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-base font-extrabold text-slate-900">
              জমাকৃত প্রুফ পর্যালোচনা ({filteredSubs.length})
            </h3>
            <div className="flex items-center gap-2">
              {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setSubFilter(f)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-bold capitalize transition cursor-pointer ${
                    subFilter === f
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  }`}
                >
                  {f === 'all' ? 'সকল' : f === 'pending' ? 'অপেক্ষমাণ' : f === 'approved' ? 'অনুমোদিত' : 'বাতিল'}
                </button>
              ))}
            </div>
          </div>

          {filteredSubs.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center">
              <FileText className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-600 text-sm font-medium">কোনো প্রুফ সাবমিশন পাওয়া যায়নি</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSubs.map(sub => (
                <div
                  key={sub.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-900">
                        {sub.userName}
                      </h4>
                      <span className="text-xs text-slate-500 font-mono">
                        ({sub.userPhone})
                      </span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        ৳{sub.rewardAmount}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          sub.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : sub.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {sub.status === 'approved' ? 'অনুমোদিত' : sub.status === 'rejected' ? 'বাতিল' : 'অপেক্ষমাণ'}
                      </span>
                    </div>

                    <p className="text-xs text-purple-800 font-bold">
                      টাস্ক: {sub.taskTitle}
                    </p>

                    {/* Proof Details Preview */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-2">
                      <div className="font-bold text-slate-700 flex items-center gap-1.5">
                        {sub.proofType === 'screenshot' && <Image className="w-3.5 h-3.5 text-purple-600" />}
                        {sub.proofType === 'link' && <LinkIcon className="w-3.5 h-3.5 text-blue-600" />}
                        {sub.proofType === 'text' && <FileText className="w-3.5 h-3.5 text-emerald-600" />}
                        <span>প্রুফ তথ্য:</span>
                      </div>

                      {/* Image Preview */}
                      {(sub.proofImage || (sub.proof && sub.proof.startsWith('data:image'))) && (
                        <div>
                          <a
                            href={sub.proofImage || sub.proof}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block"
                          >
                            <img
                              src={sub.proofImage || sub.proof}
                              alt="Proof preview"
                              className="max-h-36 rounded-lg border border-slate-200 shadow-sm cursor-pointer hover:opacity-90"
                            />
                          </a>
                        </div>
                      )}

                      {/* Text proof */}
                      {(sub.proofText || (sub.proof && !sub.proof.startsWith('data:image'))) && (
                        <p className="text-slate-800 font-mono bg-white p-2 rounded border border-slate-200 break-all font-medium">
                          {sub.proofText || sub.proof}
                        </p>
                      )}

                      {/* Link proof */}
                      {sub.proofLink && (
                        <a
                          href={sub.proofLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1 break-all font-semibold"
                        >
                          <ExternalLink className="w-3.5 h-3.5 shrink-0" /> {sub.proofLink}
                        </a>
                      )}

                      {sub.note && (
                        <p className="text-slate-600 italic text-[11px]">
                          নোট: "{sub.note}"
                        </p>
                      )}
                    </div>

                    {sub.rejectionReason && (
                      <p className="text-[11px] text-rose-700 bg-rose-50 border border-rose-200 p-2 rounded-lg font-medium">
                        বাতিলের কারণ: {sub.rejectionReason}
                      </p>
                    )}

                    <p className="text-[10px] text-slate-400">
                      জমাদানের সময়: {sub.submittedAt || new Date(sub.timestamp || Date.now()).toLocaleString('bn-BD')}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-slate-100">
                    {sub.status === 'pending' && (
                      <>
                        <button
                          disabled={isProcessingAction}
                          onClick={() => handleApproveSubmission(sub)}
                          className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Check className="w-4 h-4" /> অনুমোদন ও ক্রেডিট করুন
                        </button>
                        <button
                          disabled={isProcessingAction}
                          onClick={() => {
                            setSelectedSub(sub);
                            setRejectReason('');
                          }}
                          className="w-full sm:w-auto px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <XCircle className="w-4 h-4" /> বাতিল করুন
                        </button>
                      </>
                    )}

                    {sub.status === 'approved' && (
                      <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                        <Check className="w-4 h-4" /> সফলভাবে পরিশোধিত
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reject Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-300 space-y-4 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                প্রুফ সাবমিশন বাতিল নিশ্চিত করুন
              </h3>
              <button
                onClick={() => setSelectedSub(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              ইউজার: <strong className="text-slate-900">{selectedSub.userName}</strong> ({selectedSub.userPhone})<br />
              টাস্ক: <strong className="text-slate-900">{selectedSub.taskTitle}</strong>
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                বাতিলের কারণ লিখুন *
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="যেমন: অস্পষ্ট স্ক্রিনশট / লিংকে জয়েন করা হয়নি / ভুল ইউজারনেম"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 font-medium"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedSub(null)}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl cursor-pointer"
              >
                বন্ধ
              </button>
              <button
                disabled={isProcessingAction}
                onClick={() => handleRejectSubmission(selectedSub)}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow cursor-pointer"
              >
                বাতিল সম্পন্ন করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMarketingManagementTab;
