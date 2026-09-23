import React, { useState } from 'react';
import { 
  Briefcase, 
  PlusCircle, 
  Search, 
  Trash2, 
  CheckCircle2, 
  ExternalLink, 
  Pause, 
  Play, 
  Layers,
  Edit3,
  Image as ImageIcon
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MicroJob } from '../../types';
import { JobThumbnailUploader } from '../microjobs/JobThumbnailUploader';
import { JOB_PRESET_THUMBNAILS } from '../../lib/imageUtils';

export const AdminJobsTab: React.FC = () => {
  const { 
    jobs, 
    adminCreateJob, 
    adminUpdateJob, 
    adminDeleteJob, 
    showToast,
    language 
  } = useApp();

  const isBn = language === 'bn';

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingJob, setEditingJob] = useState<MicroJob | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // New Job state
  const [newJob, setNewJob] = useState({
    jobCode: String(Math.floor(10000 + Math.random() * 90000)),
    title: '',
    category: 'সোশ্যাল মিডিয়া',
    reward: 0.50,
    taskDuration: '১min এর কাজ',
    notes: 'Go বাটনে ক্লিক করুন কি করে কাজ করবে ওয়েবসাইটে বলা হয়েছে সততার সাথে কাজ করবেন 🥰🥰',
    image: JOB_PRESET_THUMBNAILS[0].url,
    videoUrl: '',
    availableSlots: 200,
    targetUrl: 'https://youtube.com',
    proofType: 'screenshot_text' as 'screenshot' | 'text' | 'link' | 'screenshot_text' | 'all',
    proofRequirement: 'সাবস্ক্রাইব করে স্ক্রিনশট এবং ইউজারনেম জমা দিন।',
    instructionsText: 'Go বাটনে ক্লিক করে ওয়েবসাইট বা ভিডিওতে যান।\nমনোযোগ দিয়ে সম্পূর্ণ কাজটি করুন।\nসঠিক প্রমাণ জমা দিন।'
  });

  const filteredJobs = (Array.isArray(jobs) ? jobs : []).filter(j => {
    if (!j) return false;
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    const titleStr = String(j.title || '').toLowerCase();
    const catStr = String(j.category || '').toLowerCase();
    const codeStr = String(j.jobCode || '');
    return titleStr.includes(query) || catStr.includes(query) || codeStr.includes(query);
  });

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJob.title || !newJob.title.trim()) {
      showToast('জবের শিরোনাম লিখুন!');
      return;
    }
    if (!newJob.image && !newJob.videoUrl) {
      showToast('জবের থাম্বনেইল ছবি বা ভিডিও দিন!');
      return;
    }

    try {
      const instructions = newJob.instructionsText
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);

      adminCreateJob({
        jobCode: (newJob.jobCode || String(Math.floor(10000 + Math.random() * 90000))).trim(),
        title: newJob.title.trim(),
        category: newJob.category || 'সোশ্যাল মিডিয়া',
        reward: Math.max(0.05, Number(newJob.reward) || 0.5),
        taskDuration: (newJob.taskDuration || '১min এর কাজ').trim(),
        notes: (newJob.notes || '').trim(),
        image: newJob.image || JOB_PRESET_THUMBNAILS[0].url,
        videoUrl: (newJob.videoUrl || '').trim(),
        mediaType: newJob.videoUrl ? 'video' : 'image',
        availableSlots: Math.max(1, Number(newJob.availableSlots) || 10),
        completedSlots: 0,
        deadline: 'আজ রাত ১২টা পর্যন্ত',
        instructions: instructions.length > 0 ? instructions : ['কাজ সম্পন্ন করে সঠিক প্রমাণ দিন'],
        targetUrl: (newJob.targetUrl || '').trim(),
        proofType: newJob.proofType || 'screenshot_text',
        proofRequirement: (newJob.proofRequirement || 'স্ক্রিনশট এবং ইউজারনেম জমা দিন').trim(),
        status: 'active',
        featured: true
      });

      setShowAddModal(false);
      setNewJob({
        jobCode: String(Math.floor(10000 + Math.random() * 90000)),
        title: '',
        category: 'সোশ্যাল মিডিয়া',
        reward: 0.50,
        taskDuration: '১min এর কাজ',
        notes: 'Go বাটনে ক্লিক করুন কি করে কাজ করবে ওয়েবসাইটে বলা হয়েছে সততার সাথে কাজ করবেন 🥰🥰',
        image: JOB_PRESET_THUMBNAILS[0].url,
        videoUrl: '',
        availableSlots: 200,
        targetUrl: 'https://youtube.com',
        proofType: 'screenshot_text',
        proofRequirement: 'সাবস্ক্রাইব করে স্ক্রিনশট এবং ইউজারনেম জমা দিন।',
        instructionsText: 'Go বাটনে ক্লিক করে ওয়েবসাইট বা ভিডিওতে যান।\nমনোযোগ দিয়ে সম্পূর্ণ কাজটি করুন।\nসঠিক প্রমাণ জমা দিন।'
      });
    } catch (err) {
      console.error('Failed to create job in admin:', err);
      showToast('জব তৈরি করতে সমস্যা হয়েছে, আবার চেষ্টা করুন।');
    }
  };

  const handleSaveEditJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;
    adminUpdateJob(editingJob.id, {
      jobCode: editingJob.jobCode,
      title: editingJob.title,
      category: editingJob.category,
      reward: Number(editingJob.reward),
      taskDuration: editingJob.taskDuration || '১min এর কাজ',
      notes: editingJob.notes,
      image: editingJob.image || JOB_PRESET_THUMBNAILS[0].url,
      videoUrl: editingJob.videoUrl,
      mediaType: editingJob.videoUrl ? 'video' : 'image',
      availableSlots: Number(editingJob.availableSlots),
      targetUrl: editingJob.targetUrl,
      proofType: editingJob.proofType,
      proofRequirement: editingJob.proofRequirement,
      status: editingJob.status
    });
    setEditingJob(null);
  };

  return (
    <div className="space-y-3.5">
      {/* Top Search & Add Job */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-100 shadow-xs space-y-2.5">
        <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isBn ? 'মাইক্রো জব খুঁজুন...' : 'Search jobs...'}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-sky-400"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isBn ? 'নতুন মাইক্রো জব তৈরি' : 'Post New Job'}</span>
          </button>
        </div>
      </div>

      {/* Jobs List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredJobs.map(job => (
          <div 
            key={job.id}
            className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-800 text-[10px] font-black rounded">
                    #{job.jobCode || job.id.slice(-4)}
                  </span>
                  <span className="px-2 py-0.5 bg-sky-50 text-sky-700 text-[10px] font-bold rounded">
                    {job.category}
                  </span>
                </div>
                <h4 className="font-extrabold text-xs sm:text-sm text-gray-900 mt-1 line-clamp-1">
                  {job.title}
                </h4>
              </div>

              <div className="text-right shrink-0">
                <span className="text-sm sm:text-base font-black text-sky-600 block">
                  ৳{(job.reward || 0.5).toFixed(2)}
                </span>
                <span className="text-[10px] text-gray-400 font-semibold">{job.deadline}</span>
              </div>
            </div>

            {/* Slots and Completion Progress */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-bold text-gray-500">
                <span>স্লট পূরণ: {job.completedSlots} / {job.availableSlots}</span>
                <span>{Math.round(((job.completedSlots || 0) / (job.availableSlots || 100)) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-sky-500 h-full rounded-full" 
                  style={{ width: `${Math.min(100, Math.round(((job.completedSlots || 0) / (job.availableSlots || 100)) * 100))}%` }}
                />
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                job.status === 'active' ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {job.status}
              </span>

              <div className="flex gap-1.5">
                <button
                  onClick={() => setEditingJob({ ...job })}
                  className="p-1.5 bg-sky-50 hover:bg-sky-100 text-sky-900 rounded-lg text-xs flex items-center gap-1 font-bold cursor-pointer"
                  title="জব এডিট"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>এডিট</span>
                </button>

                <button
                  onClick={() => adminUpdateJob(job.id, { status: job.status === 'active' ? 'paused' : 'active' })}
                  className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs flex items-center gap-1 font-bold"
                >
                  {job.status === 'active' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{job.status === 'active' ? 'পজ' : 'চালু'}</span>
                </button>

                <button
                  onClick={() => setDeleteConfirmId(job.id)}
                  className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Job Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <form 
            onSubmit={handleCreateJob}
            className="bg-white w-full max-w-lg rounded-3xl p-5 shadow-2xl space-y-3 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-black text-sm sm:text-base text-gray-900 flex items-center gap-1.5">
                <Briefcase className="w-5 h-5 text-sky-600" />
                <span>{isBn ? 'নতুন মাইক্রো জব পোস্ট করুন' : 'Post New Micro Job'}</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="font-bold text-gray-700 block mb-1">জবের টাইটেল *</label>
                <input
                  type="text"
                  required
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  placeholder="যেমন: বিজ্ঞাপন দেখে ইনকাম করুন! প্রতিদিন আনলিমিটেড"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-400"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">জব কোড / আইডি (Job Code)</label>
                <input
                  type="text"
                  required
                  value={newJob.jobCode}
                  onChange={(e) => setNewJob({ ...newJob, jobCode: e.target.value })}
                  placeholder="যেমন: 10165"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">কাজের সময় (Task Duration)</label>
                <input
                  type="text"
                  required
                  value={newJob.taskDuration}
                  onChange={(e) => setNewJob({ ...newJob, taskDuration: e.target.value })}
                  placeholder="যেমন: ১min এর কাজ"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">ক্যাটাগরি</label>
                <select
                  value={newJob.category}
                  onChange={(e) => setNewJob({ ...newJob, category: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold"
                >
                  <option value="সোশ্যাল মিডিয়া">সোশ্যাল মিডিয়া</option>
                  <option value="ইউটিউব ওয়াচ">ইউটিউব ওয়াচ</option>
                  <option value="অ্যাপ ইনস্টল">অ্যাপ ইনস্টল</option>
                  <option value="ফেসবুক ফলো">ফেসবুক ফলো</option>
                  <option value="টেলিগ্রাম জয়েন">টেলিগ্রাম জয়েন</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">রিওয়ার্ড প্রতি ইউজার (৳)</label>
                <input
                  type="number"
                  step="0.05"
                  required
                  value={newJob.reward}
                  onChange={(e) => setNewJob({ ...newJob, reward: Number(e.target.value) })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">মোট স্লট সংখ্যা (Job Limit)</label>
                <input
                  type="number"
                  required
                  value={newJob.availableSlots}
                  onChange={(e) => setNewJob({ ...newJob, availableSlots: Number(e.target.value) })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">প্রুফ টাইপ (Proof Type)</label>
                <select
                  value={newJob.proofType}
                  onChange={(e) => setNewJob({ ...newJob, proofType: e.target.value as any })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold"
                >
                  <option value="screenshot_text">স্ক্রিনশট + টেক্সট (উভয়ই)</option>
                  <option value="screenshot">শুধুমাত্র স্ক্রিনশট</option>
                  <option value="text">শুধুমাত্র টেক্সট / ইউজারনেম / কোড</option>
                  <option value="link">শুধুমাত্র লিংক / URL</option>
                  <option value="all">স্ক্রিনশট + টেক্সট + লিংক (সবগুলো)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-gray-700 block mb-1">টার্গেট লিংক (URL) — লিংকে যান বাটন</label>
                <input
                  type="url"
                  value={newJob.targetUrl}
                  onChange={(e) => setNewJob({ ...newJob, targetUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-gray-700 block mb-1">ভিডিও লিংক (ঐচ্ছিক — Video URL/Embed)</label>
                <input
                  type="url"
                  value={newJob.videoUrl}
                  onChange={(e) => setNewJob({ ...newJob, videoUrl: e.target.value })}
                  placeholder="https://...mp4 বা YouTube ভিডিও লিংক"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              {/* Direct Picture Upload for Thumbnail */}
              <div className="sm:col-span-2 p-3 bg-sky-50/50 rounded-2xl border border-sky-100">
                <JobThumbnailUploader
                  value={newJob.image}
                  onChange={(img) => setNewJob({ ...newJob, image: img })}
                  isBn={isBn}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-gray-700 block mb-1">কাজের বিশেষ বার্তা / নোটিশ (Instruction Note)</label>
                <textarea
                  rows={2}
                  value={newJob.notes}
                  onChange={(e) => setNewJob({ ...newJob, notes: e.target.value })}
                  placeholder="যেমন: Go বাটনে ক্লিক করুন কি করে কাজ করবে ওয়েবসাইটে বলা হয়েছে সততার সাথে কাজ করবেন 🥰🥰"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-gray-700 block mb-1">ধাপ অনুযায়ী কাজের নির্দেশনা (Instructions — প্রতি লাইনে একটি ধাপ)</label>
                <textarea
                  rows={3}
                  value={newJob.instructionsText}
                  onChange={(e) => setNewJob({ ...newJob, instructionsText: e.target.value })}
                  placeholder="Go বাটনে ক্লিক করে ওয়েবসাইট বা ভিডিওতে যান।&#10;মনোযোগ দিয়ে সম্পূর্ণ কাজটি করুন।&#10;সঠিক প্রমাণ জমা দিন।"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-gray-700 block mb-1">প্রমাণ জমা নেওয়ার শর্তাবলী</label>
                <textarea
                  rows={2}
                  value={newJob.proofRequirement}
                  onChange={(e) => setNewJob({ ...newJob, proofRequirement: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-black text-xs rounded-xl shadow-xs cursor-pointer"
              >
                জব পাবলিশ করুন
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Job Modal */}
      {editingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <form 
            onSubmit={handleSaveEditJob}
            className="bg-white w-full max-w-lg rounded-3xl p-5 shadow-2xl space-y-3 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-black text-sm sm:text-base text-gray-900 flex items-center gap-1.5">
                <Edit3 className="w-5 h-5 text-sky-600" />
                <span>{isBn ? 'মাইক্রো জব এডিট করুন' : 'Edit Micro Job'}</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setEditingJob(null)}
                className="text-gray-400 hover:text-gray-600 font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="font-bold text-gray-700 block mb-1">জবের টাইটেল *</label>
                <input
                  type="text"
                  required
                  value={editingJob.title}
                  onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-400 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">জব কোড / আইডি (Job Code)</label>
                <input
                  type="text"
                  required
                  value={editingJob.jobCode || ''}
                  onChange={(e) => setEditingJob({ ...editingJob, jobCode: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">কাজের সময় (Task Duration)</label>
                <input
                  type="text"
                  value={editingJob.taskDuration || ''}
                  onChange={(e) => setEditingJob({ ...editingJob, taskDuration: e.target.value })}
                  placeholder="যেমন: ১min এর কাজ"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">ক্যাটাগরি</label>
                <select
                  value={editingJob.category}
                  onChange={(e) => setEditingJob({ ...editingJob, category: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold"
                >
                  <option value="সোশ্যাল মিডিয়া">সোশ্যাল মিডিয়া</option>
                  <option value="ইউটিউব ওয়াচ">ইউটিউব ওয়াচ</option>
                  <option value="অ্যাপ ইনস্টল">অ্যাপ ইনস্টল</option>
                  <option value="ফেসবুক ফলো">ফেসবুক ফলো</option>
                  <option value="টেলিগ্রাম জয়েন">টেলিগ্রাম জয়েন</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">রিওয়ার্ড প্রতি ইউজার (৳)</label>
                <input
                  type="number"
                  step="0.05"
                  required
                  value={editingJob.reward}
                  onChange={(e) => setEditingJob({ ...editingJob, reward: Number(e.target.value) })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">মোট স্লট সংখ্যা (Job Limit)</label>
                <input
                  type="number"
                  required
                  value={editingJob.availableSlots}
                  onChange={(e) => setEditingJob({ ...editingJob, availableSlots: Number(e.target.value) })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">প্রুফ টাইপ (Proof Type)</label>
                <select
                  value={editingJob.proofType || 'screenshot_text'}
                  onChange={(e) => setEditingJob({ ...editingJob, proofType: e.target.value as any })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold"
                >
                  <option value="screenshot_text">স্ক্রিনশট + টেক্সট (উভয়ই)</option>
                  <option value="screenshot">শুধুমাত্র স্ক্রিনশট</option>
                  <option value="text">শুধুমাত্র টেক্সট / ইউজারনেম / কোড</option>
                  <option value="link">শুধুমাত্র লিংক / URL</option>
                  <option value="all">স্ক্রিনশট + টেক্সট + লিংক (সবগুলো)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">বর্তমান স্ট্যাটাস (Status)</label>
                <select
                  value={editingJob.status || 'active'}
                  onChange={(e) => setEditingJob({ ...editingJob, status: e.target.value as any })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                >
                  <option value="active">সক্রিয় (Active)</option>
                  <option value="paused">সাময়িক বন্ধ (Paused)</option>
                  <option value="completed">সম্পূর্ণ / লিমিট শেষ (Completed)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-gray-700 block mb-1">টার্গেট লিংক (URL) — লিংকে যান বাটন</label>
                <input
                  type="url"
                  value={editingJob.targetUrl || ''}
                  onChange={(e) => setEditingJob({ ...editingJob, targetUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-gray-700 block mb-1">ভিডিও লিংক (ঐচ্ছিক — Video URL)</label>
                <input
                  type="url"
                  value={editingJob.videoUrl || ''}
                  onChange={(e) => setEditingJob({ ...editingJob, videoUrl: e.target.value })}
                  placeholder="https://...mp4 বা YouTube ভিডিও লিংক"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              {/* Direct Picture Upload for Edit Thumbnail */}
              <div className="sm:col-span-2 p-3 bg-sky-50/50 rounded-2xl border border-sky-100">
                <JobThumbnailUploader
                  value={editingJob.image || ''}
                  onChange={(img) => setEditingJob({ ...editingJob, image: img })}
                  isBn={isBn}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-gray-700 block mb-1">কাজের বিশেষ বার্তা / নোটিশ (Instruction Note)</label>
                <textarea
                  rows={2}
                  value={editingJob.notes || ''}
                  onChange={(e) => setEditingJob({ ...editingJob, notes: e.target.value })}
                  placeholder="যেমন: Go বাটনে ক্লিক করুন কি করে কাজ করবে ওয়েবসাইটে বলা হয়েছে সততার সাথে কাজ করবেন 🥰🥰"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-gray-700 block mb-1">প্রমাণ জমা নেওয়ার শর্তাবলী</label>
                <textarea
                  rows={2}
                  value={editingJob.proofRequirement || ''}
                  onChange={(e) => setEditingJob({ ...editingJob, proofRequirement: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingJob(null)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-black text-xs rounded-xl shadow-xs cursor-pointer"
              >
                পরিবর্তন সংরক্ষণ করুন
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4 text-center">
            <h4 className="font-black text-base text-gray-900">জবটি ডিলিট করতে চান?</h4>
            <p className="text-xs text-gray-500">ইউজাররা আর এই কাজটি দেখতে বা রিওয়ার্ড ক্লেইম করতে পারবেন না।</p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="py-2.5 bg-gray-100 text-gray-700 font-bold text-xs rounded-xl"
              >
                বাতিল
              </button>
              <button
                onClick={() => {
                  adminDeleteJob(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="py-2.5 bg-red-600 text-white font-black text-xs rounded-xl shadow-xs"
              >
                ডিলিট নিশ্চিত
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
