import React, { useState, useEffect } from 'react';
import { 
  X, 
  GraduationCap, 
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  Phone,
  MessageCircle,
  User,
  Send,
  Briefcase,
  Layers,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { SkillCoursePost, FreelanceOpportunityItem } from '../../types/contentTypes';
import { getSkillCourses, getFreelanceOpportunities } from '../../services/realContentService';

interface SkillCoursesModalProps {
  type: 'skill_course' | 'freelancing';
  onClose: () => void;
}

interface ApplyItem {
  id: string;
  title: string;
  type: 'skill_course' | 'freelancing';
  rateOrBadge?: string;
  category?: string;
  applicationLink?: string;
  contactInfo?: string;
}

export const SkillCoursesModal: React.FC<SkillCoursesModalProps> = ({ type, onClose }) => {
  const { 
    user, 
    showToast, 
    isBn, 
    courseApplications, 
    submitCourseFreelanceApplication 
  } = useApp();

  const isCourse = type === 'skill_course';

  // Real data state
  const [courses, setCourses] = useState<SkillCoursePost[]>([]);
  const [opportunities, setOpportunities] = useState<FreelanceOpportunityItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Sub-tab: Browse items or My Applications
  const [activeTab, setActiveTab] = useState<'browse' | 'my_applications'>('browse');

  // Selected item for Detailed View Modal
  const [selectedDetailsItem, setSelectedDetailsItem] = useState<SkillCoursePost | FreelanceOpportunityItem | null>(null);

  // Application Form state
  const [applyingItem, setApplyingItem] = useState<ApplyItem | null>(null);
  const [applicantName, setApplicantName] = useState(user?.name && user?.name !== 'Nusaib' ? user.name : '');
  const [applicantPhone, setApplicantPhone] = useState(user?.phone || '');
  const [whatsappNumber, setWhatsappNumber] = useState(user?.phone || '');
  const [experienceLevel, setExperienceLevel] = useState('নতুন শিখতে আগ্রহী (শুরুর লেভেল)');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);

  // Load Real Data from Firestore & LocalStorage
  const loadRealData = async () => {
    setLoading(true);
    try {
      if (isCourse) {
        const data = await getSkillCourses(true); // only active posts
        setCourses(data);
      } else {
        const data = await getFreelanceOpportunities(true); // only active opportunities
        setOpportunities(data);
      }
    } catch (err) {
      console.error('Failed to load real items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRealData();
  }, [type]);

  // Applications submitted by this user
  const userApplications = courseApplications.filter(a => 
    a.type === type && (a.applicantPhone === user?.phone || a.applicantName === user?.name)
  );

  const handleOpenApplyModal = (item: ApplyItem) => {
    setApplyingItem(item);
    setSubmissionSuccess(null);
    setApplicantName(user?.name && user?.name !== 'Nusaib' ? user.name : '');
    setApplicantPhone(user?.phone || '');
    setWhatsappNumber(user?.phone || '');
    setExperienceLevel('নতুন শিখতে আগ্রহী (শুরুর লেভেল)');
    setNotes('');
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingItem) return;

    if (!applicantName.trim()) {
      showToast(isBn ? 'অনুগ্রহ করে আপনার নাম লিখুন।' : 'Please enter your name.');
      return;
    }

    if (!applicantPhone.trim() || applicantPhone.length < 10) {
      showToast(isBn ? 'সঠিক মোবাইল নম্বর দিন।' : 'Please provide a valid phone number.');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitCourseFreelanceApplication({
        itemId: applyingItem.id,
        itemTitle: applyingItem.title,
        type: applyingItem.type,
        applicantName: applicantName.trim(),
        applicantPhone: applicantPhone.trim(),
        whatsappNumber: whatsappNumber.trim() || undefined,
        experienceLevel: experienceLevel.trim(),
        notes: notes.trim() || undefined
      });

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });

      setSubmissionSuccess(applyingItem.title);
      showToast(isBn ? 'আবেদন সফলভাবে গৃহীত হয়েছে!' : 'Application submitted successfully!');
    } catch (err) {
      console.error(err);
      showToast(isBn ? 'আবেদন জমা করতে ব্যর্থ হয়েছে। পরে চেষ্টা করুন।' : 'Failed to submit application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAppliedStatus = (itemId: string) => {
    return courseApplications.find(a => 
      a.itemId === itemId && 
      (a.applicantPhone === user?.phone || a.applicantName === user?.name)
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col animate-in fade-in duration-200 overflow-y-auto text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
              title="ফিরে যান"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-xl text-white ${isCourse ? 'bg-emerald-600' : 'bg-blue-600'}`}>
                {isCourse ? <GraduationCap className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />}
              </div>
              <div>
                <h1 className="text-base font-black text-slate-900">
                  {isCourse ? 'দক্ষতা উন্নয়ন কোর্স' : 'মাইক্রো ফ্রিল্যান্সিং কাজ'}
                </h1>
                <p className="text-[11px] text-slate-500 font-medium">
                  {isCourse ? 'বাছাইকৃত প্রফেশনাল স্কিল কোর্স ও ক্যারিয়ার গাইডেন্স' : 'সহজ অনলাইন কাজ সম্পন্ন করে নিশ্চিত আয় করুন'}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-Tabs */}
        <div className="max-w-3xl mx-auto flex items-center px-4 pt-1 text-xs font-bold border-t border-slate-100">
          <button
            onClick={() => { setActiveTab('browse'); setApplyingItem(null); setSelectedDetailsItem(null); }}
            className={`pb-2 px-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'browse' 
                ? (isCourse ? 'border-emerald-600 text-emerald-700 font-black' : 'border-blue-600 text-blue-700 font-black')
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {isCourse ? 'কোর্স তালিকা' : 'কাজের তালিকা'}
          </button>
          <button
            onClick={() => { setActiveTab('my_applications'); setApplyingItem(null); setSelectedDetailsItem(null); }}
            className={`pb-2 px-3 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'my_applications' 
                ? (isCourse ? 'border-emerald-600 text-emerald-700 font-black' : 'border-blue-600 text-blue-700 font-black')
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>আমার আবেদনসমূহ</span>
            {userApplications.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] text-white font-bold ${isCourse ? 'bg-emerald-600' : 'bg-blue-600'}`}>
                {userApplications.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-3xl mx-auto p-4 sm:p-5 space-y-4 text-xs">
        
        {/* Loading state */}
        {loading && (
          <div className="py-16 text-center space-y-3">
            <div className={`w-8 h-8 border-3 ${isCourse ? 'border-emerald-500' : 'border-blue-500'} border-t-transparent rounded-full animate-spin mx-auto`}></div>
            <p className="text-slate-500 font-medium">তথ্য লোড হচ্ছে...</p>
          </div>
        )}

        {/* DETAILS MODAL VIEW */}
        {selectedDetailsItem && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-md animate-in fade-in">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isCourse ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {selectedDetailsItem.category}
                </span>
                <span className="text-[10px] font-medium text-slate-500">
                  শেষ সময়: {selectedDetailsItem.deadline || 'চলমান'}
                </span>
              </div>
              <button
                onClick={() => setSelectedDetailsItem(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {selectedDetailsItem.title}
              </h3>
              {'earningInfo' in selectedDetailsItem && (
                <p className="text-sm font-bold text-emerald-700 mt-1">
                  পারিশ্রমিক: {selectedDetailsItem.earningInfo}
                </p>
              )}
            </div>

            {/* Thumbnail */}
            {(('thumbnail' in selectedDetailsItem && selectedDetailsItem.thumbnail) || ('image' in selectedDetailsItem && selectedDetailsItem.image)) && (
              <img
                src={('thumbnail' in selectedDetailsItem ? selectedDetailsItem.thumbnail : selectedDetailsItem.image) || ''}
                alt={selectedDetailsItem.title}
                className="w-full max-h-56 object-cover rounded-xl border border-slate-200"
              />
            )}

            {/* Description */}
            {selectedDetailsItem.description && (
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900">বিবরণ:</h4>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                  {selectedDetailsItem.description}
                </p>
              </div>
            )}

            {/* Detailed Info / Work Details */}
            {('detailedInfo' in selectedDetailsItem && selectedDetailsItem.detailedInfo) && (
              <div className="space-y-1 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-emerald-600" /> বিস্তারিত কারিকুলাম ও তথ্য:
                </h4>
                <p className="text-slate-700 whitespace-pre-line text-[11px] leading-relaxed">
                  {selectedDetailsItem.detailedInfo}
                </p>
              </div>
            )}

            {('workDetails' in selectedDetailsItem && selectedDetailsItem.workDetails) && (
              <div className="space-y-1 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-blue-600" /> কাজের বিস্তারিত দায়িত্ব:
                </h4>
                <p className="text-slate-700 whitespace-pre-line text-[11px] leading-relaxed">
                  {selectedDetailsItem.workDetails}
                </p>
              </div>
            )}

            {/* Requirements */}
            {selectedDetailsItem.requirements && (
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900">প্রয়োজনীয় যোগ্যতা ও শর্ত:</h4>
                <p className="text-slate-700 whitespace-pre-line">
                  {selectedDetailsItem.requirements}
                </p>
              </div>
            )}

            {/* Contact Info */}
            {selectedDetailsItem.contactInfo && (
              <div className="text-[11px] text-slate-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200 flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="font-medium">যোগাযোগ: {selectedDetailsItem.contactInfo}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-3 border-t border-slate-100">
              {selectedDetailsItem.applicationLink && (
                <a
                  href={selectedDetailsItem.applicationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full sm:w-1/2 py-2.5 px-4 text-white font-bold rounded-xl text-center flex items-center justify-center gap-1.5 shadow transition cursor-pointer ${
                    isCourse ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>লিংকে গিয়ে সরাসরি আবেদন</span>
                </a>
              )}

              <button
                onClick={() => {
                  const itm = selectedDetailsItem;
                  setSelectedDetailsItem(null);
                  handleOpenApplyModal({
                    id: itm.id,
                    title: itm.title,
                    type: isCourse ? 'skill_course' : 'freelancing',
                    rateOrBadge: 'earningInfo' in itm ? itm.earningInfo : itm.category,
                    category: itm.category,
                    applicationLink: itm.applicationLink,
                    contactInfo: itm.contactInfo
                  });
                }}
                className={`w-full ${selectedDetailsItem.applicationLink ? 'sm:w-1/2' : ''} py-2.5 px-4 ${
                  isCourse ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-blue-700 hover:bg-blue-800'
                } text-white font-bold rounded-xl text-center flex items-center justify-center gap-1.5 shadow transition cursor-pointer`}
              >
                <Send className="w-4 h-4" />
                <span>অ্যাপের মাধ্যমে আবেদন করুন</span>
              </button>
            </div>
          </div>
        )}

        {/* APPLY FORM VIEW */}
        {applyingItem && !selectedDetailsItem && (
          <div className="bg-white border border-slate-300 rounded-2xl p-4 sm:p-5 space-y-3 shadow-md">
            {submissionSuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-base text-slate-900">
                  আবেদন সফলভাবে জমা হয়েছে!
                </h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  আপনার আবেদন এডমিন প্যানেলে পৌঁছেছে। শীঘ্রই যোগাযোগ করা হবে।
                </p>
                <div className="pt-2 flex justify-center gap-2">
                  <button
                    onClick={() => {
                      setApplyingItem(null);
                      setSubmissionSuccess(null);
                      setActiveTab('my_applications');
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow cursor-pointer"
                  >
                    আবেদনের স্ট্যাটাস দেখুন
                  </button>
                  <button
                    onClick={() => {
                      setApplyingItem(null);
                      setSubmissionSuccess(null);
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold rounded-xl text-xs cursor-pointer"
                  >
                    তালিকায় ফিরুন
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitApplication} className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isCourse ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {isCourse ? 'কোর্সে ভর্তি আবেদন' : 'ফ্রিল্যান্সিং কাজের আবেদন'}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 mt-1">
                      {applyingItem.title}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setApplyingItem(null)}
                    className="p-1 hover:bg-slate-100 rounded-full text-slate-400 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">
                      আপনার পূর্ণ নাম *
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={applicantName}
                        onChange={(e) => setApplicantName(e.target.value)}
                        placeholder="আপনার নাম লিখুন"
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl font-medium text-xs text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-slate-800 block mb-1">
                        মোবাইল নম্বর *
                      </label>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          required
                          value={applicantPhone}
                          onChange={(e) => setApplicantPhone(e.target.value)}
                          placeholder="01XXXXXXXXX"
                          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl font-medium text-xs text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-800 block mb-1">
                        হোয়াটসঅ্যাপ নম্বর
                      </label>
                      <div className="relative">
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          value={whatsappNumber}
                          onChange={(e) => setWhatsappNumber(e.target.value)}
                          placeholder="01XXXXXXXXX"
                          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl font-medium text-xs text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1">
                      {isCourse ? 'আপনার পূর্ব অভিজ্ঞতা / আগ্রহ' : 'দক্ষতা / কাজের অভিজ্ঞতা'}
                    </label>
                    <select
                      value={experienceLevel}
                      onChange={(e) => setExperienceLevel(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl font-medium text-xs text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
                    >
                      <option value="নতুন শিখতে আগ্রহী (শুরুর লেভেল)">নতুন শিখতে আগ্রহী (শুরুর লেভেল)</option>
                      <option value="বেসিক ধারণা ও অভিজ্ঞতা আছে">বেসিক ধারণা ও অভিজ্ঞতা আছে</option>
                      <option value="৬ মাস বা তদূর্ধ্ব কাজের অভিজ্ঞতা আছে">৬ মাস বা তদূর্ধ্ব কাজের অভিজ্ঞতা আছে</option>
                      <option value="প্রফেশনাল লেভেল">প্রফেশনাল লেভেল</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1">
                      অতিরিক্ত বার্তা বা জিজ্ঞাসা (ঐচ্ছিক)
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="কোর্স বা কাজ নিয়ে কোনো তথ্য জানার থাকলে লিখুন..."
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setApplyingItem(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-5 py-2 ${
                      isCourse ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'
                    } text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow cursor-pointer`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'জমা হচ্ছে...' : 'আবেদন নিশ্চিত করুন'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* BROWSE LIST VIEW */}
        {!applyingItem && !selectedDetailsItem && activeTab === 'browse' && !loading && (
          <div className="space-y-3">
            {isCourse ? (
              courses.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center space-y-2">
                  <GraduationCap className="w-12 h-12 text-slate-400 mx-auto" />
                  <h4 className="font-bold text-slate-700 text-sm">
                    বর্তমানে কোনো নতুন কোর্স প্রকাশিত নেই
                  </h4>
                  <p className="text-slate-500 text-xs">
                    এডমিন নতুন কোর্স পাবলিশ করার সাথে সাথে এখানে প্রদর্শিত হবে।
                  </p>
                </div>
              ) : (
                courses.map(course => {
                  const appliedStatus = getAppliedStatus(course.id);
                  return (
                    <div 
                      key={course.id}
                      className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:shadow-md transition space-y-3"
                    >
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
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                              {course.category}
                            </span>
                            {appliedStatus && (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                appliedStatus.status === 'approved' 
                                  ? 'bg-emerald-100 text-emerald-800' 
                                  : appliedStatus.status === 'rejected'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {appliedStatus.status === 'approved' ? 'গৃহীত' : appliedStatus.status === 'rejected' ? 'বাতিল' : 'আবেদন জমা আছে'}
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-sm text-slate-900 leading-snug line-clamp-2">
                            {course.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                            {course.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                        <span>সময়: {course.duration || '৩ মাস'}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedDetailsItem(course)}
                            className="text-emerald-700 hover:text-emerald-800 font-bold cursor-pointer"
                          >
                            বিস্তারিত
                          </button>
                          <button
                            onClick={() => handleOpenApplyModal({
                              id: course.id,
                              title: course.title,
                              type: 'skill_course',
                              rateOrBadge: course.category,
                              category: course.category,
                              applicationLink: course.applicationLink,
                              contactInfo: course.contactInfo
                            })}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow cursor-pointer"
                          >
                            আবেদন করুন
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )
            ) : (
              opportunities.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center space-y-2">
                  <Briefcase className="w-12 h-12 text-slate-400 mx-auto" />
                  <h4 className="font-bold text-slate-700 text-sm">
                    বর্তমানে কোনো ফ্রিল্যান্সিং কাজ প্রকাশিত নেই
                  </h4>
                  <p className="text-slate-500 text-xs">
                    এডমিন নতুন বিজ্ঞপ্তি পোস্ট করার সাথে সাথে এখানে প্রদর্শিত হবে।
                  </p>
                </div>
              ) : (
                opportunities.map(opp => {
                  const appliedStatus = getAppliedStatus(opp.id);
                  return (
                    <div 
                      key={opp.id}
                      className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:shadow-md transition space-y-3"
                    >
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
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                              {opp.category}
                            </span>
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                              {opp.earningInfo}
                            </span>
                            {appliedStatus && (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                appliedStatus.status === 'approved' 
                                  ? 'bg-emerald-100 text-emerald-800' 
                                  : appliedStatus.status === 'rejected'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {appliedStatus.status === 'approved' ? 'গৃহীত' : appliedStatus.status === 'rejected' ? 'বাতিল' : 'আবেদন জমা আছে'}
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-sm text-slate-900 leading-snug line-clamp-2">
                            {opp.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                            {opp.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                        <span>ক্লায়েন্ট: {opp.clientName || 'ভেরিফাইড পার্টনার'}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedDetailsItem(opp)}
                            className="text-blue-700 hover:text-blue-800 font-bold cursor-pointer"
                          >
                            বিস্তারিত
                          </button>
                          <button
                            onClick={() => handleOpenApplyModal({
                              id: opp.id,
                              title: opp.title,
                              type: 'freelancing',
                              rateOrBadge: opp.earningInfo,
                              category: opp.category,
                              applicationLink: opp.applicationLink,
                              contactInfo: opp.contactInfo
                            })}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow cursor-pointer"
                          >
                            আবেদন করুন
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )
            )}
          </div>
        )}

        {/* MY APPLICATIONS LIST */}
        {!applyingItem && !selectedDetailsItem && activeTab === 'my_applications' && !loading && (
          <div className="space-y-3">
            {userApplications.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-2">
                <Layers className="w-10 h-10 text-slate-400 mx-auto" />
                <p className="font-bold text-slate-700 text-xs">
                  আপনি এখনও কোনো আবেদন জমা দেননি।
                </p>
                <button
                  onClick={() => setActiveTab('browse')}
                  className={`px-4 py-2 text-white font-bold rounded-xl text-xs shadow cursor-pointer ${
                    isCourse ? 'bg-emerald-600' : 'bg-blue-600'
                  }`}
                >
                  {isCourse ? 'কোর্স তালিকা দেখুন' : 'কাজের তালিকা দেখুন'}
                </button>
              </div>
            ) : (
              userApplications.map(app => (
                <div key={app.id} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mb-1 ${
                        isCourse ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        আবেদন আইডি: #{app.id.slice(-6)}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900">{app.itemTitle}</h4>
                      <p className="text-[10px] text-slate-400 pt-0.5">জমাদানের সময়: {app.submittedAt}</p>
                    </div>

                    <div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        app.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : app.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {app.status === 'pending' && '⏳ অপেক্ষমাণ'}
                        {app.status === 'approved' && '✅ অনুমোদিত'}
                        {app.status === 'rejected' && '❌ বাতিল'}
                      </span>
                    </div>
                  </div>

                  {app.experienceLevel && (
                    <p className="text-[11px] text-slate-600 font-medium">
                      অভিজ্ঞতা: <span className="text-slate-900 font-bold">{app.experienceLevel}</span>
                    </p>
                  )}

                  {app.notes && (
                    <p className="text-[11px] text-slate-600 italic bg-slate-50 border border-slate-100 p-2 rounded-xl">
                      নোট: "{app.notes}"
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default SkillCoursesModal;
