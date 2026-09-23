import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Plus, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Save, 
  X, 
  Layers, 
  Check, 
  XCircle, 
  FileText, 
  MessageSquare 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FreelanceOpportunityItem } from '../../types/contentTypes';
import { 
  getFreelanceOpportunities, 
  saveFreelanceOpportunity, 
  deleteFreelanceOpportunity, 
  toggleFreelanceOpportunityStatus 
} from '../../services/realContentService';

export const AdminFreelanceManagementTab: React.FC = () => {
  const { showToast, courseApplications, adminUpdateApplicationStatus, adminDeleteApplication } = useApp();

  const [opportunities, setOpportunities] = useState<FreelanceOpportunityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'add' | 'applications'>('all');
  const [editingOpp, setEditingOpp] = useState<FreelanceOpportunityItem | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [workDetails, setWorkDetails] = useState('');
  const [category, setCategory] = useState('সোশ্যাল মিডিয়া');
  const [earningInfo, setEarningInfo] = useState('');
  const [applicationLink, setApplicationLink] = useState('');
  const [deadline, setDeadline] = useState('চলমান');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [contactInfo, setContactInfo] = useState('');
  const [requirements, setRequirements] = useState('');
  const [clientName, setClientName] = useState('গুড লাইফ ক্লায়েন্ট নেটওয়ার্ক');
  const [isSaving, setIsSaving] = useState(false);

  const loadOpportunities = async () => {
    setLoading(true);
    try {
      const data = await getFreelanceOpportunities(false);
      setOpportunities(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOpportunities();
  }, []);

  const handleEdit = (item: FreelanceOpportunityItem) => {
    setEditingOpp(item);
    setTitle(item.title || '');
    setImage(item.image || '');
    setDescription(item.description || '');
    setWorkDetails(item.workDetails || '');
    setCategory(item.category || 'সোশ্যাল মিডিয়া');
    setEarningInfo(item.earningInfo || '');
    setApplicationLink(item.applicationLink || '');
    setDeadline(item.deadline || 'চলমান');
    setStatus(item.status || 'active');
    setContactInfo(item.contactInfo || '');
    setRequirements(item.requirements || '');
    setClientName(item.clientName || 'গুড লাইফ ক্লায়েন্ট নেটওয়ার্ক');
    setActiveSubTab('add');
  };

  const handleReset = () => {
    setEditingOpp(null);
    setTitle('');
    setImage('');
    setDescription('');
    setWorkDetails('');
    setCategory('সোশ্যাল মিডিয়া');
    setEarningInfo('');
    setApplicationLink('');
    setDeadline('চলমান');
    setStatus('active');
    setContactInfo('');
    setRequirements('');
    setClientName('গুড লাইফ ক্লায়েন্ট নেটওয়ার্ক');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('কাজের শিরোনাম আবশ্যক');
      return;
    }

    setIsSaving(true);
    try {
      const payload: FreelanceOpportunityItem = {
        id: editingOpp?.id || `opp_${Date.now()}`,
        title: title.trim(),
        image: image.trim() || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80',
        description: description.trim(),
        workDetails: workDetails.trim(),
        category,
        earningInfo: earningInfo.trim() || '৳২০০ - ৳৫০০ / টাস্ক',
        applicationLink: applicationLink.trim(),
        deadline: deadline.trim() || 'চলমান',
        status,
        contactInfo: contactInfo.trim(),
        requirements: requirements.trim(),
        clientName: clientName.trim() || 'গুড লাইফ ক্লায়েন্ট নেটওয়ার্ক',
        createdAt: editingOpp?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await saveFreelanceOpportunity(payload);
      showToast(editingOpp ? 'ফ্রিল্যান্সিং অপরচুনিটি আপডেট সফল!' : 'নতুন ফ্রিল্যান্সিং অপরচুনিটি পাবলিশ সফল!');
      handleReset();
      setActiveSubTab('all');
      await loadOpportunities();
    } catch (err) {
      console.error(err);
      showToast('বিজ্ঞপ্তি সংরক্ষণ ব্যর্থ হয়েছে');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('আপনি কি নিশ্চিত এই অপরচুনিটি মুছে ফেলতে চান?')) return;
    try {
      await deleteFreelanceOpportunity(id);
      showToast('অপরচুনিটি মুছে ফেলা হয়েছে');
      await loadOpportunities();
    } catch (err) {
      console.error(err);
      showToast('ডিলিট করতে সমস্যা হয়েছে');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const updated = await toggleFreelanceOpportunityStatus(id);
      if (updated) {
        showToast(`অপরচুনিটি এখন ${updated.status === 'active' ? 'সক্রিয় (Active)' : 'নিষ্ক্রিয় (Inactive)'}`);
        await loadOpportunities();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const freelanceApps = (courseApplications || []).filter(app => 
    !app.itemTitle.includes('কোর্স') && !app.itemTitle.includes('মাস্টারক্লাস')
  );

  return (
    <div className="space-y-6 text-slate-900">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shadow-inner">
              <Briefcase className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">ফ্রিল্যান্সিং অপরচুনিটি ম্যানেজমেন্ট</h2>
              <p className="text-xs sm:text-sm text-blue-100 font-medium mt-0.5">
                মাইক্রো ফ্রিল্যান্সিং প্রজেক্ট পোস্ট করুন ও সদস্যদের কাজের আবেদন যাচাই করুন
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (activeSubTab === 'add') {
                setActiveSubTab('all');
                handleReset();
              } else {
                handleReset();
                setActiveSubTab('add');
              }
            }}
            className="flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-bold shadow transition cursor-pointer"
          >
            {activeSubTab === 'add' ? (
              <>
                <Layers className="w-4 h-4" /> সকল বিজ্ঞপ্তি
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" /> নতুন বিজ্ঞপ্তি পোস্ট
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        <button
          onClick={() => { setActiveSubTab('all'); setEditingOpp(null); }}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'all'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" /> সকল অপরচুনিটি ({opportunities.length})
        </button>
        <button
          onClick={() => setActiveSubTab('add')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'add'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
          }`}
        >
          <Plus className="w-4 h-4" /> {editingOpp ? 'অপরচুনিটি সম্পাদনা' : 'নতুন বিজ্ঞপ্তি পোস্ট'}
        </button>
        <button
          onClick={() => setActiveSubTab('applications')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'applications'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" /> জমাকৃত আবেদন ({freelanceApps.length})
        </button>
      </div>

      {/* SUB-TAB 1: Add / Edit Form */}
      {activeSubTab === 'add' && (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-300 rounded-2xl p-6 shadow-md space-y-5 text-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              <span>{editingOpp ? 'ফ্রিল্যান্সিং বিজ্ঞপ্তি আপডেট করুন' : 'নতুন ফ্রিল্যান্সিং বিজ্ঞপ্তি প্রকাশ করুন'}</span>
            </h3>
            {editingOpp && (
              <button
                type="button"
                onClick={() => { handleReset(); setActiveSubTab('all'); }}
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
                কাজের শিরোনাম (Job Title) *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="যেমন: ফেসবুক পেজ মডারেটর ও কাস্টমার সাপোর্ট এজেন্ট"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>

            {/* Category / Skill */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                স্কিল / কাজের ধরণ (Category)
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
              >
                <option value="সোশ্যাল মিডিয়া">সোশ্যাল মিডিয়া</option>
                <option value="ডাটা এন্ট্রি">ডাটা এন্ট্রি</option>
                <option value="ডিজাইন">গ্রাফিক্স ও থাম্বনেইল ডিজাইন</option>
                <option value="কন্টেন্ট রাইটিং">কন্টেন্ট ও কপিরাইটিং</option>
                <option value="ভিডিও এডিটিং">শর্টস ও রিলস এডিটিং</option>
                <option value="মার্কেটিং">প্রমোশন ও মার্কেটিং</option>
                <option value="অন্যান্য">অন্যান্য মাইক্রো কাজ</option>
              </select>
            </div>

            {/* Earning / Payment Info */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                আয়ের পরিমাণ / পারিশ্রমিক (Earning Rate) *
              </label>
              <input
                type="text"
                required
                value={earningInfo}
                onChange={e => setEarningInfo(e.target.value)}
                placeholder="যেমন: ৳৫০০/প্রতিদিন অথবা ৳৫০/টাস্ক"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-bold text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                ব্যানার / ইমেজ লিংক (Image URL)
              </label>
              <input
                type="url"
                value={image}
                onChange={e => setImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>

            {/* Client / Provider */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                ক্লায়েন্ট / প্রতিষ্ঠানের নাম
              </label>
              <input
                type="text"
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                placeholder="যেমন: গুড লাইফ ক্লায়েন্ট নেটওয়ার্ক"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>

            {/* External Form / Application Link */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                বাহ্যিক আবেদন লিংক (Optional Link)
              </label>
              <input
                type="url"
                value={applicationLink}
                onChange={e => setApplicationLink(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                আবেদনের সময়সীমা (Deadline)
              </label>
              <input
                type="text"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                placeholder="যেমন: চলমান অথবা ১৫ জানুয়ারি"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                স্ট্যাটাস (Status)
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-bold text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
              >
                <option value="active">Active (সক্রিয়)</option>
                <option value="inactive">Inactive (নিষ্ক্রিয়)</option>
              </select>
            </div>

            {/* Contact Info */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                যোগাযোগের তথ্য (WhatsApp/Phone/Telegram)
              </label>
              <input
                type="text"
                value={contactInfo}
                onChange={e => setContactInfo(e.target.value)}
                placeholder="যেমন: WhatsApp: 01700000000"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>

            {/* Short Description */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                সংক্ষিপ্ত বিবরণ (Short Description)
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="কাজের সংক্ষেপ লিখুন..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>

            {/* Full Work Details */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                কাজের বিস্তারিত নিয়ম ও দায়িত্ব (Work Details)
              </label>
              <textarea
                rows={4}
                value={workDetails}
                onChange={e => setWorkDetails(e.target.value)}
                placeholder="প্রতিদিন কী কী কাজ সম্পন্ন করতে হবে, পেমেন্ট কীভাবে দেয়া হবে..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>

            {/* Requirements */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                প্রয়োজনীয় যোগ্যতা (Requirements)
              </label>
              <textarea
                rows={2}
                value={requirements}
                onChange={e => setRequirements(e.target.value)}
                placeholder="যেমন: স্মার্টফোন পরিচালনা জ্ঞান ও সৎ কাজের ইচ্ছা..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => { handleReset(); setActiveSubTab('all'); }}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 bg-slate-100 hover:bg-slate-200 text-sm font-bold transition cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow transition flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'সংরক্ষণ হচ্ছে...' : editingOpp ? 'আপডেট করুন' : 'পাবলিশ করুন'}
            </button>
          </div>
        </form>
      )}

      {/* SUB-TAB 2: All Opportunities List */}
      {activeSubTab === 'all' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900">
              প্রকাশিত ফ্রিল্যান্সিং বিজ্ঞপ্তি ({opportunities.length})
            </h3>
            <button
              onClick={loadOpportunities}
              className="text-xs text-blue-600 hover:text-blue-700 font-bold cursor-pointer"
            >
              রিফ্রেশ করুন
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-500 font-medium">লোড হচ্ছে...</div>
          ) : opportunities.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-dashed border-slate-200 text-center">
              <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-700 font-bold">বর্তমানে কোনো ফ্রিল্যান্সিং বিজ্ঞপ্তি নেই</p>
              <p className="text-xs text-slate-500 mt-1">
                "নতুন বিজ্ঞপ্তি পোস্ট" বাটনে ক্লিক করে নতুন প্রজেক্ট যুক্ত করুন।
              </p>
              <button
                onClick={() => { handleReset(); setActiveSubTab('add'); }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow cursor-pointer"
              >
                + নতুন পোস্ট তৈরি করুন
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {opportunities.map(opp => (
                <div
                  key={opp.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start gap-3">
                      <img
                        src={opp.image || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80'}
                        alt={opp.title}
                        className="w-20 h-20 rounded-xl object-cover border border-slate-200 shrink-0"
                        onError={(e: any) => {
                          e.target.src = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                            {opp.category}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              opp.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {opp.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 line-clamp-2">
                          {opp.title}
                        </h4>
                        <p className="text-xs font-bold text-emerald-700 mt-1">
                          {opp.earningInfo}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-600 space-y-1">
                      {opp.applicationLink && (
                        <div className="flex items-center gap-1 text-blue-700 truncate font-semibold">
                          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                          <a href={opp.applicationLink} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
                            {opp.applicationLink}
                          </a>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-slate-500 font-medium">
                        <span>ক্লায়েন্ট: {opp.clientName || 'ভেরিফাইড পার্টনার'}</span>
                        <span>ডেডলাইন: {opp.deadline || 'চলমান'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => handleToggleStatus(opp.id)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                        opp.status === 'active'
                          ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                      }`}
                    >
                      {opp.status === 'active' ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(opp)}
                        className="p-1.5 text-slate-600 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                        title="সম্পাদনা করুন"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(opp.id)}
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

      {/* SUB-TAB 3: Freelance Applications */}
      {activeSubTab === 'applications' && (
        <div className="space-y-4">
          <h3 className="text-base font-extrabold text-slate-900">
            জমাকৃত ফ্রিল্যান্সিং আবেদন ({freelanceApps.length})
          </h3>

          {freelanceApps.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center">
              <FileText className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-600 text-sm font-medium">কোনো আবেদন পাওয়া যায়নি</p>
            </div>
          ) : (
            <div className="space-y-3">
              {freelanceApps.map(app => (
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

                    <p className="text-xs text-blue-800 font-bold">
                      আবেদনকৃত কাজ: {app.itemTitle}
                    </p>

                    {app.experienceLevel && (
                      <p className="text-[11px] text-slate-600 font-medium">
                        দক্ষতা ও অভিজ্ঞতা: <span className="text-slate-900 font-bold">{app.experienceLevel}</span>
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
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
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

export default AdminFreelanceManagementTab;
