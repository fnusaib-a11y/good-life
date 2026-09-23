import React, { useState } from 'react';
import { 
  GraduationCap, 
  Laptop, 
  Search, 
  CheckCircle2, 
  Clock, 
  Phone, 
  MessageCircle, 
  Trash2, 
  Filter, 
  User, 
  Calendar, 
  FileText, 
  Edit3, 
  Check, 
  X,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CourseFreelanceApplication } from '../../types';

export const AdminApplicationsTab: React.FC = () => {
  const { 
    courseApplications, 
    adminUpdateApplicationStatus, 
    adminDeleteApplication, 
    showToast,
    isBn 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'skill_course' | 'freelancing'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'contacted' | 'approved' | 'rejected'>('all');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState('');

  // Statistics
  const totalCount = courseApplications.length;
  const pendingCount = courseApplications.filter(a => a.status === 'pending').length;
  const contactedCount = courseApplications.filter(a => a.status === 'contacted').length;
  const approvedCount = courseApplications.filter(a => a.status === 'approved').length;
  const rejectedCount = courseApplications.filter(a => a.status === 'rejected').length;

  // Filtered List
  const filteredApplications = courseApplications.filter(app => {
    if (filterType !== 'all' && app.type !== filterType) return false;
    if (filterStatus !== 'all' && app.status !== filterStatus) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = app.applicantName?.toLowerCase().includes(q);
      const matchPhone = app.applicantPhone?.includes(q) || app.whatsappNumber?.includes(q);
      const matchTitle = app.itemTitle?.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchTitle) return false;
    }
    return true;
  });

  const cleanPhoneForWa = (phone?: string) => {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('880')) return digits;
    if (digits.startsWith('0')) return '88' + digits;
    return '880' + digits;
  };

  const handleSaveNotes = (id: string) => {
    adminUpdateApplicationStatus(id, courseApplications.find(a => a.id === id)?.status || 'pending', tempNotes);
    setEditingNotesId(null);
    showToast(isBn ? 'এডমিন নোট সংরক্ষিত হয়েছে' : 'Admin note saved');
  };

  return (
    <div className="space-y-4">
      {/* Top Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div 
          onClick={() => { setFilterStatus('all'); setFilterType('all'); }}
          className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs cursor-pointer hover:border-sky-300 transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold">{isBn ? 'মোট আবেদন' : 'Total Applications'}</span>
            <FileText className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-xl font-black text-slate-900">{totalCount}</div>
        </div>

        <div 
          onClick={() => setFilterStatus('pending')}
          className={`bg-amber-50/70 p-3 rounded-2xl border border-amber-200 shadow-xs cursor-pointer transition-all ${filterStatus === 'pending' ? 'ring-2 ring-amber-500' : ''}`}
        >
          <div className="flex items-center justify-between text-amber-700 mb-1">
            <span className="text-[11px] font-bold">{isBn ? 'অপেক্ষমাণ' : 'Pending'}</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-black text-amber-900">{pendingCount}</div>
        </div>

        <div 
          onClick={() => setFilterStatus('contacted')}
          className={`bg-blue-50/70 p-3 rounded-2xl border border-blue-200 shadow-xs cursor-pointer transition-all ${filterStatus === 'contacted' ? 'ring-2 ring-blue-500' : ''}`}
        >
          <div className="flex items-center justify-between text-blue-700 mb-1">
            <span className="text-[11px] font-bold">{isBn ? 'যোগাযোগ সম্পন্ন' : 'Contacted'}</span>
            <Phone className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-black text-blue-900">{contactedCount}</div>
        </div>

        <div 
          onClick={() => setFilterStatus('approved')}
          className={`bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200 shadow-xs cursor-pointer transition-all ${filterStatus === 'approved' ? 'ring-2 ring-emerald-500' : ''}`}
        >
          <div className="flex items-center justify-between text-emerald-700 mb-1">
            <span className="text-[11px] font-bold">{isBn ? 'অনুমোদিত' : 'Approved'}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-900">{approvedCount}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isBn ? 'আবেদনকারীর নাম, ফোন নম্বর বা কোর্সের নাম দিয়ে খুঁজুন...' : 'Search by name, phone or title...'}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-sky-500"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-xs">
          {/* Type Filter */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold text-slate-500 mr-1">{isBn ? 'ক্যাটাগরি:' : 'Type:'}</span>
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                filterType === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {isBn ? 'সব' : 'All'}
            </button>
            <button
              onClick={() => setFilterType('skill_course')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer ${
                filterType === 'skill_course' ? 'bg-teal-600 text-white' : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
              }`}
            >
              <GraduationCap className="w-3 h-3" />
              <span>{isBn ? 'স্কিল কোর্স' : 'Courses'}</span>
            </button>
            <button
              onClick={() => setFilterType('freelancing')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer ${
                filterType === 'freelancing' ? 'bg-cyan-600 text-white' : 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100'
              }`}
            >
              <Laptop className="w-3 h-3" />
              <span>{isBn ? 'ফ্রিল্যান্সিং' : 'Freelance'}</span>
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold text-slate-500 mr-1">{isBn ? 'স্ট্যাটাস:' : 'Status:'}</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-[11px] text-slate-700 cursor-pointer"
            >
              <option value="all">{isBn ? 'সকল স্ট্যাটাস' : 'All Status'}</option>
              <option value="pending">{isBn ? 'অপেক্ষমাণ (Pending)' : 'Pending'}</option>
              <option value="contacted">{isBn ? 'যোগাযোগ সম্পন্ন' : 'Contacted'}</option>
              <option value="approved">{isBn ? 'অনুমোদিত' : 'Approved'}</option>
              <option value="rejected">{isBn ? 'বাতিল' : 'Rejected'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Application Cards List */}
      <div className="space-y-3">
        {filteredApplications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <h5 className="font-black text-slate-800 text-sm">
              {isBn ? 'কোনো আবেদন পাওয়া যায়নি' : 'No applications found'}
            </h5>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {isBn 
                ? 'ইউজাররা যখন হোমপেজের "স্কিল কোর্স" বা "ফ্রিল্যান্সিং" বাটনে ক্লিক করে আবেদন জমা দেবে, তখন এখানে সরাসরি জমা হবে।' 
                : 'When users submit applications from Skill Courses or Freelancing, they will appear here.'}
            </p>
          </div>
        ) : (
          filteredApplications.map(app => {
            const isCourse = app.type === 'skill_course';
            const waNumber = app.whatsappNumber || app.applicantPhone;

            return (
              <div 
                key={app.id} 
                className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition-all overflow-hidden"
              >
                {/* Header Strip */}
                <div className={`px-4 py-2.5 flex items-center justify-between border-b ${
                  isCourse ? 'bg-teal-50/60 border-teal-100' : 'bg-cyan-50/60 border-cyan-100'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 ${
                      isCourse ? 'bg-teal-600 text-white' : 'bg-cyan-600 text-white'
                    }`}>
                      {isCourse ? <GraduationCap className="w-3 h-3" /> : <Laptop className="w-3 h-3" />}
                      <span>{isCourse ? 'স্কিল কোর্স' : 'ফ্রিল্যান্সিং গিগ'}</span>
                    </span>

                    <h4 className="font-black text-xs text-slate-900 truncate max-w-[200px] sm:max-w-md">
                      {app.itemTitle}
                    </h4>
                  </div>

                  {/* Status Badge */}
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                    app.status === 'pending'
                      ? 'bg-amber-100 text-amber-800 border-amber-200'
                      : app.status === 'contacted'
                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                      : app.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : 'bg-rose-100 text-rose-800 border-rose-200'
                  }`}>
                    {app.status === 'pending' && '⏳ অপেক্ষমাণ'}
                    {app.status === 'contacted' && '📞 যোগাযোগ সম্পন্ন'}
                    {app.status === 'approved' && '✅ অনুমোদিত'}
                    {app.status === 'rejected' && '❌ বাতিল'}
                  </span>
                </div>

                {/* Body Content */}
                <div className="p-4 space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="space-y-1">
                      <div className="text-[11px] text-slate-500 font-bold flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>আবেদনকারী:</span>
                      </div>
                      <div className="font-black text-slate-900 text-sm">{app.applicantName}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>তারিখ: {app.submittedAt}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-[11px] text-slate-500 font-bold">যোগাযোগের নম্বর:</div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Direct Call Button */}
                        <a 
                          href={`tel:${app.applicantPhone}`}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold rounded-lg text-[11px] flex items-center gap-1 shadow-2xs cursor-pointer"
                        >
                          <Phone className="w-3 h-3 text-blue-600" />
                          <span>{app.applicantPhone}</span>
                        </a>

                        {/* WhatsApp Button */}
                        <a
                          href={`https://wa.me/${cleanPhoneForWa(waNumber)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] flex items-center gap-1 shadow-2xs cursor-pointer"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>WhatsApp চ্যাট</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Qualification and Notes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700 text-[11px]">
                    {app.experienceLevel && (
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                        <span className="font-bold text-slate-500 block mb-0.5">যোগ্যতা / অভিজ্ঞতা:</span>
                        <span className="font-semibold text-slate-800">{app.experienceLevel}</span>
                      </div>
                    )}
                    {app.notes && (
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                        <span className="font-bold text-slate-500 block mb-0.5">আবেদনকারীর বার্তা:</span>
                        <span className="font-medium text-slate-700 italic">"{app.notes}"</span>
                      </div>
                    )}
                  </div>

                  {/* Admin Notes Section */}
                  <div className="bg-amber-50/50 p-2.5 rounded-xl border border-amber-200/70 text-[11px]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-amber-900 flex items-center gap-1">
                        <Edit3 className="w-3 h-3 text-amber-600" />
                        <span>এডমিন নোট (অফিসিয়াল ট্র্যাকিং):</span>
                      </span>
                      {editingNotesId !== app.id && (
                        <button
                          onClick={() => {
                            setEditingNotesId(app.id);
                            setTempNotes(app.adminNotes || '');
                          }}
                          className="text-amber-700 hover:text-amber-900 font-bold underline cursor-pointer"
                        >
                          {app.adminNotes ? 'এডিট করুন' : '+ নোট লিখুন'}
                        </button>
                      )}
                    </div>

                    {editingNotesId === app.id ? (
                      <div className="space-y-1.5 pt-1">
                        <input
                          type="text"
                          value={tempNotes}
                          onChange={(e) => setTempNotes(e.target.value)}
                          placeholder="যেমন: কথা বলেছি, আগামী সোমবার শুরু করবে..."
                          className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-hidden"
                        />
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => setEditingNotesId(null)}
                            className="px-2 py-1 bg-slate-200 text-slate-700 font-bold rounded text-[10px] cursor-pointer"
                          >
                            বাতিল
                          </button>
                          <button
                            onClick={() => handleSaveNotes(app.id)}
                            className="px-2.5 py-1 bg-amber-600 text-white font-bold rounded text-[10px] cursor-pointer"
                          >
                            সংরক্ষণ করুন
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-600 italic">
                        {app.adminNotes || 'কোনো নোট নেই। আবেদনকারীর সাথে কথা বলে অগ্রগতি নোট করতে পারেন।'}
                      </p>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-bold text-slate-500">{isBn ? 'স্ট্যাটাস পরিবর্তন:' : 'Set Status:'}</span>
                      
                      <button
                        onClick={() => adminUpdateApplicationStatus(app.id, 'contacted')}
                        className={`px-2 py-1 rounded-lg font-bold text-[10px] cursor-pointer transition-all ${
                          app.status === 'contacted' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                        }`}
                      >
                        📞 যোগাযোগ সম্পন্ন
                      </button>

                      <button
                        onClick={() => adminUpdateApplicationStatus(app.id, 'approved')}
                        className={`px-2 py-1 rounded-lg font-bold text-[10px] cursor-pointer transition-all ${
                          app.status === 'approved' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        ✅ অনুমোদন দিন
                      </button>

                      <button
                        onClick={() => adminUpdateApplicationStatus(app.id, 'rejected')}
                        className={`px-2 py-1 rounded-lg font-bold text-[10px] cursor-pointer transition-all ${
                          app.status === 'rejected' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                        }`}
                      >
                        ❌ বাতিল করুন
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        if (window.confirm('আপনি কি নিশ্চিত যে এই আবেদনটি স্থায়ীভাবে মুছে ফেলতে চান?')) {
                          adminDeleteApplication(app.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-all"
                      title="আবেদন মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
