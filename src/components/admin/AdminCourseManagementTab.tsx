import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Plus, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Save, 
  X, 
  Clock, 
  Layers, 
  FileText, 
  Check, 
  XCircle, 
  MessageSquare 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SkillCoursePost } from '../../types/contentTypes';
import { 
  getSkillCourses, 
  saveSkillCourse, 
  deleteSkillCourse, 
  toggleSkillCourseStatus 
} from '../../services/realContentService';

export const AdminCourseManagementTab: React.FC = () => {
  const { showToast, courseApplications, adminUpdateApplicationStatus, adminDeleteApplication } = useApp();
  
  const [courses, setCourses] = useState<SkillCoursePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'posts' | 'add' | 'applications'>('posts');
  const [editingCourse, setEditingCourse] = useState<SkillCoursePost | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [description, setDescription] = useState('');
  const [detailedInfo, setDetailedInfo] = useState('');
  const [category, setCategory] = useState('ডিজিটাল মার্কেটিং');
  const [applicationLink, setApplicationLink] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [requirements, setRequirements] = useState('');
  const [deadline, setDeadline] = useState('চলমান');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [sortOrder, setSortOrder] = useState(1);
  const [instructor, setInstructor] = useState('গুড লাইফ একাডেমি');
  const [duration, setDuration] = useState('৩ মাস');
  const [isSaving, setIsSaving] = useState(false);

  // Application filter
  const [appFilter, setAppFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const loadCourses = async () => {
    setLoading(true);
    try {
      const data = await getSkillCourses(false);
      setCourses(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleEdit = (c: SkillCoursePost) => {
    setEditingCourse(c);
    setTitle(c.title || '');
    setThumbnail(c.thumbnail || '');
    setDescription(c.description || '');
    setDetailedInfo(c.detailedInfo || '');
    setCategory(c.category || 'ডিজিটাল মার্কেটিং');
    setApplicationLink(c.applicationLink || '');
    setContactInfo(c.contactInfo || '');
    setRequirements(c.requirements || '');
    setDeadline(c.deadline || 'চলমান');
    setStatus(c.status || 'active');
    setSortOrder(c.sortOrder || 1);
    setInstructor(c.instructor || 'গুড লাইফ একাডেমি');
    setDuration(c.duration || '৩ মাস');
    setActiveSubTab('add');
  };

  const handleResetForm = () => {
    setEditingCourse(null);
    setTitle('');
    setThumbnail('');
    setDescription('');
    setDetailedInfo('');
    setCategory('ডিজিটাল মার্কেটিং');
    setApplicationLink('');
    setContactInfo('');
    setRequirements('');
    setDeadline('চলমান');
    setStatus('active');
    setSortOrder(courses.length + 1);
    setInstructor('গুড লাইফ একাডেমি');
    setDuration('৩ মাস');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('কোর্সের টাইটেল আবশ্যক');
      return;
    }

    setIsSaving(true);
    try {
      const courseId = editingCourse?.id || `course_${Date.now()}`;
      const payload: SkillCoursePost = {
        id: courseId,
        title: title.trim(),
        thumbnail: thumbnail.trim() || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
        description: description.trim(),
        detailedInfo: detailedInfo.trim(),
        category,
        applicationLink: applicationLink.trim(),
        contactInfo: contactInfo.trim(),
        requirements: requirements.trim(),
        deadline: deadline.trim() || 'চলমান',
        status,
        sortOrder: Number(sortOrder) || 1,
        instructor: instructor.trim() || 'গুড লাইফ একাডেমি',
        duration: duration.trim() || '৩ মাস',
        createdAt: editingCourse?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await saveSkillCourse(payload);
      showToast(editingCourse ? 'কোর্স পোস্ট আপডেট সফল!' : 'নতুন কোর্স পোস্ট সফলভাবে পাবলিশ হয়েছে!');
      handleResetForm();
      setActiveSubTab('posts');
      await loadCourses();
    } catch (err) {
      console.error(err);
      showToast('কোর্স সংরক্ষণ করতে সমস্যা হয়েছে');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (courseId: string) => {
    if (!window.confirm('আপনি কি নিশ্চিত এই কোর্স পোস্টটি মুছে ফেলতে চান? ইউজার সাইড থেকেও এটি সম্পূর্ণ মুছে যাবে।')) return;
    try {
      await deleteSkillCourse(courseId);
      showToast('কোর্স পোস্ট মুছে ফেলা হয়েছে');
      await loadCourses();
    } catch (err) {
      console.error(err);
      showToast('ডিলিট করতে সমস্যা হয়েছে');
    }
  };

  const handleToggleStatus = async (courseId: string) => {
    try {
      const updated = await toggleSkillCourseStatus(courseId);
      if (updated) {
        showToast(`কোর্সটি এখন ${updated.status === 'active' ? 'সক্রিয় (Active)' : 'নিষ্ক্রিয় (Inactive)'}`);
        await loadCourses();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const courseApps = courseApplications || [];
  const filteredApps = courseApps.filter(app => {
    if (appFilter === 'all') return true;
    return app.status === appFilter;
  });

  return (
    <div className="space-y-6 text-slate-900">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shadow-inner">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">কোর্স ও ফ্রিল্যান্সিং আবেদন ম্যানেজমেন্ট</h2>
              <p className="text-xs sm:text-sm text-emerald-100 font-medium mt-0.5">
                রিয়েল কোর্স তৈরি, প্রকাশ, এডিট এবং ইউজার আবেদনসমূহ পর্যবেক্ষণ করুন
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (activeSubTab === 'add') {
                setActiveSubTab('posts');
                handleResetForm();
              } else {
                handleResetForm();
                setActiveSubTab('add');
              }
            }}
            className="flex items-center gap-2 bg-white text-emerald-700 hover:bg-emerald-50 px-4 py-2 rounded-xl text-sm font-bold shadow transition cursor-pointer"
          >
            {activeSubTab === 'add' ? (
              <>
                <Layers className="w-4 h-4" /> সকল পোস্ট
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" /> নতুন কোর্স পোস্ট
              </>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs - Light Theme */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        <button
          onClick={() => { setActiveSubTab('posts'); setEditingCourse(null); }}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'posts'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" /> সকল কোর্স পোস্ট ({courses.length})
        </button>
        <button
          onClick={() => { setActiveSubTab('add'); }}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'add'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
          }`}
        >
          <Plus className="w-4 h-4" /> {editingCourse ? 'কোর্স সম্পাদনা' : 'নতুন পোস্ট তৈরি'}
        </button>
        <button
          onClick={() => { setActiveSubTab('applications'); }}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'applications'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" /> জমাকৃত আবেদন ({courseApps.length})
        </button>
      </div>

      {/* SUB-TAB 1: Add or Edit Course Form */}
      {activeSubTab === 'add' && (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-300 rounded-2xl p-6 shadow-md space-y-5 text-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-emerald-600" />
              <span>{editingCourse ? 'কোর্স তথ্য আপডেট করুন' : 'নতুন কোর্স পোস্ট প্রকাশ করুন'}</span>
            </h3>
            {editingCourse && (
              <button
                type="button"
                onClick={() => { handleResetForm(); setActiveSubTab('posts'); }}
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
                কোর্সের শিরোনাম (Title) *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="যেমন: প্রফেশনাল ডিজিটাল মার্কেটিং ও ফেসবুক অ্যাডস মাস্টারক্লাস"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                ক্যাটাগরি (Category)
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
              >
                <option value="ডিজিটাল মার্কেটিং">ডিজিটাল মার্কেটিং</option>
                <option value="গ্রাফিক্স ডিজাইন">গ্রাফিক্স ডিজাইন</option>
                <option value="ভিডিও এডিটিং">ভিডিও এডিটিং</option>
                <option value="ডাটা এন্ট্রি">ডাটা এন্ট্রি</option>
                <option value="ওয়েব ডিজাইন ও ডেভেলপমেন্ট">ওয়েব ডিজাইন ও ডেভেলপমেন্ট</option>
                <option value="কন্টেন্ট রাইটিং">কন্টেন্ট রাইটিং</option>
                <option value="অন্যান্য স্কিল">অন্যান্য স্কিল</option>
              </select>
            </div>

            {/* Thumbnail URL */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                থাম্বনেইল / ইমেজ লিংক (Thumbnail Image URL)
              </label>
              <input
                type="url"
                value={thumbnail}
                onChange={e => setThumbnail(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
              />
            </div>

            {/* Application Link */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                অ্যাপ্লিকেশন / রেজিস্ট্রেশন লিংক (Application Link)
              </label>
              <input
                type="url"
                value={applicationLink}
                onChange={e => setApplicationLink(e.target.value)}
                placeholder="https://docs.google.com/forms/... অথবা টেলিগ্রাম/ওয়েবসাইট"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">ইউজার সরাসরি এই লিংকে গিয়েও আবেদন করতে পারবে</span>
            </div>

            {/* Contact Information */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                যোগাযোগের তথ্য (Contact Info / WhatsApp / Phone)
              </label>
              <input
                type="text"
                value={contactInfo}
                onChange={e => setContactInfo(e.target.value)}
                placeholder="যেমন: WhatsApp: 01700000000 অথবা academy@goodlife.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
              />
            </div>

            {/* Instructor */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                ট্রেইনার / একাডেমি নাম
              </label>
              <input
                type="text"
                value={instructor}
                onChange={e => setInstructor(e.target.value)}
                placeholder="গুড লাইফ একাডেমি"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                সময়সীমা / ক্লাস সংখ্যা
              </label>
              <input
                type="text"
                value={duration}
                onChange={e => setDuration(e.target.value)}
                placeholder="যেমন: ২ মাস / ৩০টি ক্লাস"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
              />
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                আবেদনের শেষ সময় (Deadline)
              </label>
              <input
                type="text"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                placeholder="যেমন: ৩১ ডিসেম্বর অথবা 'চলমান'"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
              />
            </div>

            {/* Sort Order & Status */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  সর্ট অর্ডার (Sort Order)
                </label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={e => setSortOrder(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-bold text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  স্ট্যাটাস (Status)
                </label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-bold text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
                >
                  <option value="active">Active (সক্রিয়)</option>
                  <option value="inactive">Inactive (বন্ধ)</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                সংক্ষিপ্ত বিবরণ (Short Description)
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="কোর্সের মূল উদ্দেশ্য ও সারসংক্ষেপ লিখুন..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
              />
            </div>

            {/* Detailed Info */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                বিস্তারিত তথ্য ও কারিকুলাম (Detailed Information)
              </label>
              <textarea
                rows={4}
                value={detailedInfo}
                onChange={e => setDetailedInfo(e.target.value)}
                placeholder="কোর্সে কী কী শেখানো হবে, ক্লাস সিডিউল, মেন্টরশিপ সাপোর্ট ইত্যাদি বিস্তারিত লিখুন..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
              />
            </div>

            {/* Requirements */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                প্রয়োজনীয় শর্তাবলী (Requirements / Conditions)
              </label>
              <textarea
                rows={2}
                value={requirements}
                onChange={e => setRequirements(e.target.value)}
                placeholder="যেমন: স্মার্টফোন অথবা ল্যাপটপ এবং প্রতিদিন ২ ঘণ্টা অনুশীলনের সময়..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => { handleResetForm(); setActiveSubTab('posts'); }}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 bg-slate-100 hover:bg-slate-200 text-sm font-bold transition cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow transition flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'সংরক্ষণ হচ্ছে...' : editingCourse ? 'আপডেট করুন' : 'পাবলিশ করুন'}
            </button>
          </div>
        </form>
      )}

      {/* SUB-TAB 2: All Courses List */}
      {activeSubTab === 'posts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900">
              প্রকাশিত কোর্স তালিকা ({courses.length})
            </h3>
            <button
              onClick={loadCourses}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-bold cursor-pointer"
            >
              রিফ্রেশ করুন
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-500 font-medium">লোড হচ্ছে...</div>
          ) : courses.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-dashed border-slate-200 text-center">
              <GraduationCap className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-700 font-bold">বর্তমানে কোনো কোর্স পোস্ট নেই</p>
              <p className="text-xs text-slate-500 mt-1">
                "নতুন কোর্স পোস্ট" বাটনে ক্লিক করে সহজে নতুন কোর্স যুক্ত করুন।
              </p>
              <button
                onClick={() => { handleResetForm(); setActiveSubTab('add'); }}
                className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow cursor-pointer"
              >
                + নতুন পোস্ট তৈরি করুন
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map(course => (
                <div
                  key={course.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start gap-3">
                      <img
                        src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80'}
                        alt={course.title}
                        className="w-20 h-20 rounded-xl object-cover border border-slate-200 shrink-0"
                        onError={(e: any) => {
                          e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                            {course.category}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              course.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {course.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 line-clamp-2">
                          {course.title}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-1 font-medium">
                          {course.description || 'কোনো বিবরণ নেই'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-600 space-y-1">
                      {course.applicationLink && (
                        <div className="flex items-center gap-1 text-emerald-700 truncate font-semibold">
                          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                          <a href={course.applicationLink} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
                            {course.applicationLink}
                          </a>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-slate-500 font-medium">
                        <span>শেষ সময়: {course.deadline || 'চলমান'}</span>
                        <span>সর্ট: {course.sortOrder || 1}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => handleToggleStatus(course.id)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                        course.status === 'active'
                          ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      }`}
                    >
                      {course.status === 'active' ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(course)}
                        className="p-1.5 text-slate-600 hover:text-emerald-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                        title="সম্পাদনা করুন"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(course.id)}
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

      {/* SUB-TAB 3: User Applications Review */}
      {activeSubTab === 'applications' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-base font-extrabold text-slate-900">
              কোর্স আবেদন তালিকা ({filteredApps.length})
            </h3>
            <div className="flex items-center gap-2">
              {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setAppFilter(f)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-bold capitalize transition cursor-pointer ${
                    appFilter === f
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {f === 'all' ? 'সকল' : f === 'pending' ? 'অপেক্ষমাণ' : f === 'approved' ? 'গৃহীত' : 'বাতিল'}
                </button>
              ))}
            </div>
          </div>

          {filteredApps.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center">
              <FileText className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-600 text-sm font-medium">কোনো আবেদন পাওয়া যায়নি</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredApps.map(app => (
                <div
                  key={app.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-900">
                        {app.applicantName}
                      </h4>
                      <span className="text-xs text-slate-500 font-mono">
                        ({app.applicantPhone})
                      </span>
                      {app.whatsappNumber && (
                        <span className="text-[11px] bg-green-50 text-green-700 px-2 py-0.5 rounded-md flex items-center gap-1 font-mono">
                          <MessageSquare className="w-3 h-3" /> WA: {app.whatsappNumber}
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          app.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : app.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {app.status === 'approved' ? 'অনুমোদিত' : app.status === 'rejected' ? 'বাতিল' : 'অপেক্ষমাণ'}
                      </span>
                    </div>

                    <p className="text-xs text-emerald-800 font-bold">
                      আবেদনকৃত কোর্স: {app.itemTitle}
                    </p>

                    {app.experienceLevel && (
                      <p className="text-[11px] text-slate-600 font-medium">
                        অভিজ্ঞতা: <span className="text-slate-900 font-bold">{app.experienceLevel}</span>
                      </p>
                    )}

                    {app.notes && (
                      <p className="text-[11px] text-slate-600 italic bg-slate-50 border border-slate-200 p-2 rounded-lg mt-1">
                        "{app.notes}"
                      </p>
                    )}

                    <p className="text-[10px] text-slate-400">
                      আবেদনের সময়: {app.submittedAt}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-slate-100">
                    {app.status !== 'approved' && (
                      <button
                        onClick={() => adminUpdateApplicationStatus(app.id, 'approved')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" /> অনুমোদন
                      </button>
                    )}
                    {app.status !== 'rejected' && (
                      <button
                        onClick={() => adminUpdateApplicationStatus(app.id, 'rejected')}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-rose-100 hover:text-rose-700 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer border border-slate-200"
                      >
                        <XCircle className="w-3.5 h-3.5" /> বাতিল
                      </button>
                    )}
                    <button
                      onClick={() => adminDeleteApplication(app.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminCourseManagementTab;
