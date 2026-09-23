import React, { useState, useEffect, useMemo } from 'react';
import { 
  HelpCircle, 
  Settings, 
  ListChecks, 
  PlaySquare, 
  History, 
  Plus, 
  Trash2, 
  Edit3, 
  ArrowUp, 
  ArrowDown, 
  Save, 
  CheckCircle2, 
  Sparkles, 
  AlertCircle, 
  Search, 
  Clock, 
  Gift, 
  Film, 
  Globe, 
  RefreshCw,
  Play,
  X,
  Check,
  Calendar,
  Lock,
  Unlock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  QuizQuestionItem, 
  QuizSettings, 
  QuizAttemptRecord, 
  QuizAdItem 
} from '../../types';
import { 
  fetchQuizSettings, 
  saveQuizSettingsToDb, 
  fetchQuizQuestions, 
  saveQuizQuestionToDb, 
  deleteQuizQuestionFromDb, 
  reorderQuizQuestionsInDb, 
  fetchAllQuizAttempts,
  DEFAULT_QUIZ_SETTINGS,
  INITIAL_QUIZ_QUESTIONS
} from '../../services/quizService';
import { 
  playAdNetworkRewardedAd, 
  isAdNetworkSdkAvailable,
  setAdsterraKey,
  setAdsterraDirectUrl,
  setActiveAdProvider,
  getAdsterraKey,
  DEFAULT_ADSTERRA_KEY
} from '../../services/adNetworkService';

type AdminQuizSubTab = 'settings' | 'questions' | 'ads' | 'history';

export const AdminQuizManagementSection: React.FC = () => {
  const { showToast, isBn } = useApp();

  const [activeTab, setActiveTab] = useState<AdminQuizSubTab>('settings');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [testingAd, setTestingAd] = useState<boolean>(false);
  const [testAdResult, setTestAdResult] = useState<string | null>(null);

  // Core Data
  const [settings, setSettings] = useState<QuizSettings>(DEFAULT_QUIZ_SETTINGS);
  const [questions, setQuestions] = useState<QuizQuestionItem[]>(INITIAL_QUIZ_QUESTIONS);
  const [attempts, setAttempts] = useState<QuizAttemptRecord[]>([]);

  // Question Form State (for Add / Edit)
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState<boolean>(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [questionText, setQuestionText] = useState<string>('');
  const [optionA, setOptionA] = useState<string>('');
  const [optionB, setOptionB] = useState<string>('');
  const [optionC, setOptionC] = useState<string>('');
  const [optionD, setOptionD] = useState<string>('');
  const [correctAnswer, setCorrectAnswer] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [explanation, setExplanation] = useState<string>('');

  // History Search Filter
  const [historySearch, setHistorySearch] = useState<string>('');

  // Initial Load
  const loadAll = async () => {
    setLoading(true);
    try {
      const [s, q, atts] = await Promise.all([
        fetchQuizSettings(),
        fetchQuizQuestions(),
        fetchAllQuizAttempts()
      ]);
      setSettings(s);
      setQuestions(q);
      setAttempts(atts);
    } catch (err) {
      console.error('[AdminQuiz] Error loading data:', err);
      showToast(isBn ? 'ডাটা লোড করতে সমস্যা হয়েছে।' : 'Error loading quiz data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // Save Settings
  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      if (settings.adsterraKey) {
        setAdsterraKey(settings.adsterraKey);
      }
      if (settings.adsterraDirectUrl !== undefined) {
        setAdsterraDirectUrl(settings.adsterraDirectUrl);
      }
      if (settings.adProvider) {
        setActiveAdProvider(settings.adProvider);
      }
      const success = await saveQuizSettingsToDb(settings);
      if (success) {
        showToast(isBn ? 'কুইজ ও অ্যাড নেটওয়ার্ক সেটিংস সফলভাবে সংরক্ষিত হয়েছে!' : 'Quiz & Ad Network settings saved successfully!');
      } else {
        showToast(isBn ? 'সেটিংস সংরক্ষণ ব্যর্থ হয়েছে।' : 'Failed to save settings.');
      }
    } catch (err) {
      console.error('[AdminQuiz] Save settings error:', err);
      showToast(isBn ? 'ত্রুটি ঘটেছে।' : 'Error saving settings.');
    } finally {
      setSaving(false);
    }
  };

  // Test Existing Ad Network SDK from Admin Panel
  const handleTestAdNetwork = async (providerOverride?: 'adsterra' | 'monetag' | 'auto') => {
    setTestingAd(true);
    setTestAdResult(null);
    const targetProvider = providerOverride || settings.adProvider || 'adsterra';
    try {
      const res = await playAdNetworkRewardedAd({
        provider: targetProvider,
        adsterraKey: settings.adsterraKey || DEFAULT_ADSTERRA_KEY,
        adsterraDirectUrl: settings.adsterraDirectUrl,
        timeoutSeconds: 15
      });
      if (res.success) {
        const netName = targetProvider === 'adsterra' ? `Adsterra (Zone: ${(settings.adsterraKey || DEFAULT_ADSTERRA_KEY).substring(0, 10)}...)` : targetProvider === 'monetag' ? 'Monetag (Zone: 9796489)' : 'Ad Network';
        setTestAdResult(isBn ? `✅ ${netName} বিজ্ঞাপন সফলভাবে কাজ করছে! বিজ্ঞাপন প্রদর্শিত হয়েছে।` : `✅ ${netName} displayed successfully!`);
        showToast(isBn ? 'বিজ্ঞাপন টেস্ট সফল হয়েছে!' : 'Ad test successful!');
      } else {
        setTestAdResult(res.error || (isBn ? '❌ Ad Network লোড হয়নি বা AdBlocker সক্রিয় রয়েছে।' : '❌ Ad failed to display or was blocked.'));
        showToast(isBn ? 'বিজ্ঞাপন টেস্ট ব্যর্থ হয়েছে।' : 'Ad test failed.');
      }
    } catch (err: any) {
      setTestAdResult(err?.message || (isBn ? '❌ ত্রুটি ঘটেছে।' : '❌ Error occurred.'));
    } finally {
      setTestingAd(false);
    }
  };

  // Open Question Modal for Add
  const handleOpenAddQuestion = () => {
    setEditingQuestionId(null);
    setQuestionText('');
    setOptionA('');
    setOptionB('');
    setOptionC('');
    setOptionD('');
    setCorrectAnswer('A');
    setExplanation('');
    setIsQuestionModalOpen(true);
  };

  // Open Question Modal for Edit
  const handleOpenEditQuestion = (q: QuizQuestionItem) => {
    setEditingQuestionId(q.id);
    setQuestionText(q.question);
    setOptionA(q.options.A);
    setOptionB(q.options.B);
    setOptionC(q.options.C);
    setOptionD(q.options.D);
    setCorrectAnswer(q.correctAnswer);
    setExplanation(q.explanation || '');
    setIsQuestionModalOpen(true);
  };

  // Save Question (Create or Edit)
  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim() || !optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim()) {
      showToast(isBn ? 'দয়া করে প্রশ্ন ও ৪টি অপশন সঠিকভাবে পূরণ করুন।' : 'Please fill all question fields.');
      return;
    }

    const newQ: QuizQuestionItem = {
      id: editingQuestionId || `q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      order: editingQuestionId 
        ? (questions.find(q => q.id === editingQuestionId)?.order || questions.length + 1)
        : questions.length + 1,
      question: questionText.trim(),
      options: {
        A: optionA.trim(),
        B: optionB.trim(),
        C: optionC.trim(),
        D: optionD.trim()
      },
      correctAnswer,
      explanation: explanation.trim()
    };

    setSaving(true);
    try {
      const ok = await saveQuizQuestionToDb(newQ);
      if (ok) {
        showToast(isBn ? (editingQuestionId ? 'প্রশ্ন সফলভাবে আপডেট হয়েছে!' : 'নতুন প্রশ্ন যুক্ত হয়েছে!') : 'Question saved!');
        setIsQuestionModalOpen(false);
        // Reload questions
        const updated = await fetchQuizQuestions();
        setQuestions(updated);
      }
    } catch (err) {
      console.error('[AdminQuiz] Save question error:', err);
    } finally {
      setSaving(false);
    }
  };

  // Delete Question
  const handleDeleteQuestion = async (id: string) => {
    if (!window.confirm(isBn ? 'আপনি কি নিশ্চিত এই প্রশ্নটি ডিলিট করতে চান?' : 'Are you sure you want to delete this question?')) {
      return;
    }
    try {
      await deleteQuizQuestionFromDb(id);
      setQuestions(prev => prev.filter(q => q.id !== id));
      showToast(isBn ? 'প্রশ্ন ডিলিট করা হয়েছে।' : 'Question deleted.');
    } catch (err) {
      console.error('[AdminQuiz] Delete question error:', err);
    }
  };

  // Move Question Order
  const handleMoveQuestion = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === questions.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const reordered = [...questions];
    const [movedItem] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, movedItem);

    setQuestions(reordered);
    await reorderQuizQuestionsInDb(reordered);
    showToast(isBn ? 'প্রশ্নের ক্রম আপডেট করা হয়েছে।' : 'Order updated.');
  };

  // Filtered History
  const filteredAttempts = useMemo(() => {
    if (!historySearch.trim()) return attempts;
    const q = historySearch.toLowerCase();
    return attempts.filter(att => 
      att.userName?.toLowerCase().includes(q) ||
      att.userId?.toLowerCase().includes(q) ||
      att.attemptId?.toLowerCase().includes(q) ||
      att.quizTitle?.toLowerCase().includes(q)
    );
  }, [attempts, historySearch]);

  const totalRewardsGiven = useMemo(() => {
    return attempts.reduce((sum, a) => sum + (a.reward || 0), 0);
  }, [attempts]);

  return (
    <div className="space-y-6">
      
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-200">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              {isBn ? 'কুইজ ম্যানেজমেন্ট (Quiz Management)' : 'Quiz Management'}
            </h3>
            <p className="text-xs text-slate-500">
              {isBn ? 'কুইজ সেটিংস, প্রশ্ন ব্যাংক, ২টি আলাদা Ad এবং ইউজার হিস্ট্রি নিয়ন্ত্রণ করুন' : 'Control quiz settings, question bank, 2 ads, and user history'}
            </p>
          </div>
        </div>

        <button
          onClick={loadAll}
          disabled={loading}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-600 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{isBn ? 'রিফ্রেশ ডাটা' : 'Refresh'}</span>
        </button>
      </div>

      {/* QUICK STATS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase">{isBn ? 'কুইজ স্ট্যাটাস' : 'Status'}</span>
            {settings.enabled && settings.isActive ? (
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            ) : (
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            )}
          </div>
          <p className="text-lg font-black text-slate-900">
            {settings.enabled && settings.isActive ? (isBn ? 'সক্রিয় (Active)' : 'Active') : (isBn ? 'বন্ধ (Inactive)' : 'Inactive')}
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase">{isBn ? 'প্রশ্ন সংখ্যা' : 'Questions'}</span>
            <ListChecks className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-lg font-black text-slate-900">
            {questions.length} {isBn ? 'টি' : 'items'}
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase">{isBn ? 'মোট অ্যাটেম্পট' : 'Attempts'}</span>
            <History className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-lg font-black text-slate-900">
            {attempts.length} {isBn ? 'বার' : 'times'}
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase">{isBn ? 'বিতরণকৃত রিওয়ার্ড' : 'Rewards'}</span>
            <Gift className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-lg font-black text-amber-600">
            {totalRewardsGiven} Pts
          </p>
        </div>
      </div>

      {/* SUB-TABS NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${
            activeTab === 'settings'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>{isBn ? 'কুইজ সেটিংস' : 'Quiz Settings'}</span>
        </button>

        <button
          onClick={() => setActiveTab('questions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${
            activeTab === 'questions'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ListChecks className="w-4 h-4" />
          <span>{isBn ? `প্রশ্ন ব্যাংক (${questions.length})` : `Questions (${questions.length})`}</span>
        </button>

        <button
          onClick={() => setActiveTab('ads')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${
            activeTab === 'ads'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <PlaySquare className="w-4 h-4" />
          <span>{isBn ? 'বিজ্ঞাপন কনফিগার (Ad Network)' : 'Ad Network Setup'}</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${
            activeTab === 'history'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <History className="w-4 h-4" />
          <span>{isBn ? `কুইজ হিস্ট্রি (${attempts.length})` : `Quiz History (${attempts.length})`}</span>
        </button>
      </div>

      {/* TAB 1: QUIZ SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h4 className="font-bold text-slate-800 text-base">
                {isBn ? 'মূল কুইজ সেটিংস' : 'General Quiz Settings'}
              </h4>
              <p className="text-xs text-slate-500">
                {isBn ? 'কুইজ অন/অফ, রিওয়ার্ড পয়েন্ট, সময়সীমা ও দৈনিক লিমিট কনফিগার করুন' : 'Configure quiz status, reward points, time limit, and daily limits'}
              </p>
            </div>

            {/* Quick Toggle */}
            <label className="flex items-center gap-2.5 cursor-pointer">
              <span className="text-xs font-semibold text-slate-700">
                {settings.enabled ? (isBn ? 'সক্রিয়' : 'Enabled') : (isBn ? 'নিষ্ক্রিয়' : 'Disabled')}
              </span>
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => setSettings({ ...settings, enabled: e.target.checked, isActive: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isBn ? 'কুইজের নাম (Title)' : 'Quiz Title'}
              </label>
              <input
                type="text"
                value={settings.title}
                onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="যেমন: আজকের কুইজ চ্যালেঞ্জ"
              />
            </div>

            {/* Reward Points */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isBn ? 'রিওয়ার্ড পয়েন্ট (Reward Points)' : 'Reward Points'}
              </label>
              <input
                type="number"
                value={settings.rewardPoints}
                onChange={(e) => setSettings({ ...settings, rewardPoints: Number(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="20"
              />
            </div>

            {/* Total Questions per session */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isBn ? 'প্রতি সেশনে মোট প্রশ্ন (Total Questions)' : 'Questions Per Session'}
              </label>
              <input
                type="number"
                value={settings.totalQuestions}
                onChange={(e) => setSettings({ ...settings, totalQuestions: Number(e.target.value) || 5 })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="5"
                min={1}
                max={questions.length || 20}
              />
              <p className="text-[11px] text-slate-400 mt-1">
                {isBn ? `প্রশ্ন ব্যাংক থেকে মোট ${questions.length}টি প্রশ্নের মধ্যে যতগুলো ইউজারকে দেওয়া হবে` : `Out of ${questions.length} total questions`}
              </p>
            </div>

            {/* Time Limit */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isBn ? 'প্রতি প্রশ্নের সময় সীমা (Time Limit in Seconds)' : 'Time Limit (Seconds)'}
              </label>
              <input
                type="number"
                value={settings.timeLimitSeconds}
                onChange={(e) => setSettings({ ...settings, timeLimitSeconds: Number(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="30 (0 = সীমাহীন)"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                {isBn ? '০ দিলে কোনো সময়সীমা থাকবে না' : 'Enter 0 for unlimited time'}
              </p>
            </div>

            {/* Daily Attempt Limit */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isBn ? 'দৈনিক সর্বোচ্চ অংশগ্রহণ সীমা (Daily Attempt Limit)' : 'Daily Attempt Limit'}
              </label>
              <input
                type="number"
                value={settings.dailyAttemptLimit}
                onChange={(e) => setSettings({ ...settings, dailyAttemptLimit: Number(e.target.value) || 1 })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="1"
                min={1}
              />
            </div>

            {/* Start Date & End Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isBn ? 'কুইজের সময়কাল (ঐচ্ছিক)' : 'Start / End Date (Optional)'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={settings.startDate || ''}
                  onChange={(e) => setSettings({ ...settings, startDate: e.target.value })}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="date"
                  value={settings.endDate || ''}
                  onChange={(e) => setSettings({ ...settings, endDate: e.target.value })}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isBn ? 'কুইজের বিবরণ / নির্দেশিকা (Description)' : 'Quiz Description'}
              </label>
              <textarea
                rows={2}
                value={settings.description}
                onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="কুইজের বর্ণনা লিখুন..."
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-200 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (isBn ? 'সেটিংস সংরক্ষণ করুন' : 'Save Settings')}</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: QUESTIONS MANAGEMENT */}
      {activeTab === 'questions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-800 text-base">
                {isBn ? 'প্রশ্ন ব্যাংক (Question Bank)' : 'Question Bank'}
              </h4>
              <p className="text-xs text-slate-500">
                {isBn ? 'নতুন প্রশ্ন যুক্ত করুন, সম্পাদনা করুন বা ক্রম পরিবর্তন করুন' : 'Create, edit, delete, or reorder questions'}
              </p>
            </div>

            <button
              onClick={handleOpenAddQuestion}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{isBn ? 'নতুন প্রশ্ন যোগ করুন' : 'Add New Question'}</span>
            </button>
          </div>

          {questions.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
              <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700 mb-1">
                {isBn ? 'কোনো প্রশ্ন পাওয়া যায়নি' : 'No questions found'}
              </p>
              <p className="text-xs text-slate-500 mb-4">
                {isBn ? '“নতুন প্রশ্ন যোগ করুন” বাটনে চাপ দিয়ে প্রথম প্রশ্ন যুক্ত করুন।' : 'Click Add New Question to create your first question.'}
              </p>
              <button
                onClick={handleOpenAddQuestion}
                className="px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl shadow-sm"
              >
                {isBn ? 'প্রশ্ন যোগ করুন' : 'Add Question'}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {questions.map((q, idx) => (
                <div 
                  key={q.id} 
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-purple-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      #{idx + 1}
                    </div>

                    <div className="space-y-2 flex-1">
                      <h5 className="font-bold text-slate-800 text-sm leading-snug">
                        {q.question}
                      </h5>

                      {/* 4 Options Pill Preview */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        {(['A', 'B', 'C', 'D'] as const).map((key) => {
                          const isCorrect = q.correctAnswer === key;
                          return (
                            <div 
                              key={key} 
                              className={`p-2 rounded-xl border flex items-center gap-1.5 ${
                                isCorrect 
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold' 
                                  : 'bg-slate-50 border-slate-200 text-slate-700'
                              }`}
                            >
                              <span className={`w-4 h-4 rounded text-[10px] flex items-center justify-center font-bold shrink-0 ${
                                isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                              }`}>
                                {key}
                              </span>
                              <span className="truncate">{q.options[key]}</span>
                              {isCorrect && <Check className="w-3.5 h-3.5 text-emerald-600 ml-auto shrink-0" />}
                            </div>
                          );
                        })}
                      </div>

                      {q.explanation && (
                        <p className="text-[11px] text-slate-400 italic">
                          {isBn ? 'ব্যাখ্যা: ' : 'Explanation: '}{q.explanation}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions (Reorder, Edit, Delete) */}
                  <div className="flex items-center gap-1 self-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <button
                      onClick={() => handleMoveQuestion(idx, 'up')}
                      disabled={idx === 0}
                      className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move Up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMoveQuestion(idx, 'down')}
                      disabled={idx === questions.length - 1}
                      className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move Down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEditQuestion(q)}
                      className="p-2 rounded-lg border border-slate-200 hover:bg-purple-50 text-purple-600"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-2 rounded-lg border border-slate-200 hover:bg-rose-50 text-rose-500"
                      title="Delete"
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

      {/* TAB 3: AD NETWORK MANAGEMENT (No Video URLs needed) */}
      {activeTab === 'ads' && (
        <div className="space-y-6">
          {/* Ad Network SDK Info Card */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 shadow-md border border-slate-800 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 text-blue-300 flex items-center justify-center font-bold shrink-0">
                  <PlaySquare className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white text-sm sm:text-base">
                      {isBn ? 'অ্যাড নেটওয়ার্ক ইন্টিগ্রেশন (Adsterra & Monetag)' : 'Ad Network Integration (Adsterra & Monetag)'}
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      সক্রিয় SDK
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    {isBn ? 'Adsterra (Zone: a5ea718688da962e97053af64e1de8f0) ও Monetag ডুয়েল সাপোর্ট' : 'Adsterra (Zone: a5ea718688da962e97053af64e1de8f0) & Monetag Dual Support'}
                  </p>
                </div>
              </div>

              {/* Action Test Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleTestAdNetwork('adsterra')}
                  disabled={testingAd}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-white" />
                  <span>Adsterra টেস্ট</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTestAdNetwork('monetag')}
                  disabled={testingAd}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/80 hover:bg-purple-600 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-white" />
                  <span>Monetag টেস্ট</span>
                </button>
              </div>
            </div>

            {/* Test Result Message */}
            {testAdResult && (
              <div className="p-3 bg-white/10 rounded-xl text-xs text-slate-200 border border-white/10">
                {testAdResult}
              </div>
            )}

            {/* Ad Provider & Adsterra Settings Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
              {/* Active Network Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-200">
                  {isBn ? 'সক্রিয় বিজ্ঞাপন নেটওয়ার্ক' : 'Active Ad Network'}
                </label>
                <select
                  value={settings.adProvider || 'adsterra'}
                  onChange={(e) => setSettings({ ...settings, adProvider: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
                >
                  <option value="adsterra">Adsterra Ad Network (ডিফল্ট / রিকমেন্ডেড)</option>
                  <option value="monetag">Monetag (Libtl Zone: 9796489)</option>
                  <option value="auto">Smart Auto Waterfall (Adsterra ➔ Monetag)</option>
                </select>
                <p className="text-[10px] text-slate-400">
                  {isBn ? 'কুইজের আগে ও পরে কোন নেটওয়ার্কের বিজ্ঞাপন প্রদর্শিত হবে।' : 'Select which network delivers rewarded ads.'}
                </p>
              </div>

              {/* Adsterra Key / Zone */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-200">
                    Adsterra Zone Key
                  </label>
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, adsterraKey: DEFAULT_ADSTERRA_KEY })}
                    className="text-[10px] text-blue-400 hover:text-blue-300 font-bold underline"
                  >
                    ডিফল্ট
                  </button>
                </div>
                <input
                  type="text"
                  value={settings.adsterraKey || DEFAULT_ADSTERRA_KEY}
                  onChange={(e) => setSettings({ ...settings, adsterraKey: e.target.value.trim() })}
                  placeholder={DEFAULT_ADSTERRA_KEY}
                  className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 font-mono font-bold"
                />
                <p className="text-[10px] text-slate-400">
                  {isBn ? 'Adsterra কোড থেকে প্রাপ্ত Zone Key' : 'Your Adsterra Zone Key'}
                </p>
              </div>

              {/* Adsterra Direct / Smartlink URL (Optional) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-200">
                  Adsterra Direct Link / SmartLink (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  value={settings.adsterraDirectUrl || ''}
                  onChange={(e) => setSettings({ ...settings, adsterraDirectUrl: e.target.value.trim() })}
                  placeholder="https://... (ঐচ্ছিক)"
                  className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 text-ellipsis"
                />
                <p className="text-[10px] text-slate-400">
                  {isBn ? 'স্মার্টলিঙ্ক বা কাস্টম ক্যাম্পেইন ইউআরএল (প্রয়োজনে)' : 'Optional custom campaign smartlink'}
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-300 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
              <p className="font-semibold text-blue-200 mb-1">
                📌 {isBn ? 'অ্যাডমিন নির্দেশিকা (Adsterra ইন্টিগ্রেশন):' : 'Admin Guidelines (Adsterra Integration):'}
              </p>
              <p>
                {isBn 
                  ? 'Adsterra অ্যাড নেটওয়ার্ক (Zone: a5ea718688da962e97053af64e1de8f0) সিস্টেমে সক্রিয় রয়েছে। কুইজ শুরুর পূর্বে ১ম বিজ্ঞাপন এবং কুইজ সম্পন্ন হলে রিওয়ার্ড আনলকের জন্য ২য় বিজ্ঞাপন প্রদর্শিত হয়। ইউজার বিজ্ঞাপন সম্পূর্ণ না দেখা পর্যন্ত কোনো পয়েন্ট ক্লেইম করতে পারবে না।'
                  : 'Adsterra Ad Network (Zone: a5ea718688da962e97053af64e1de8f0) is integrated with full callback verification. Points are granted only upon full completion.'
                }
              </p>
            </div>
          </div>

          {/* TWO AD CONTROLS (Before Quiz & After Quiz) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* FIRST AD (BEFORE QUIZ) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-xs">
                    ১
                  </span>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">
                      {isBn ? 'কুইজ শুরুর আগের বিজ্ঞাপন' : 'Before Quiz Ad'}
                    </h5>
                    <p className="text-[11px] text-slate-500">
                      {isBn ? 'ইউজার কুইজ শুরু করার পূর্বে Ad Network-এর বিজ্ঞাপন দেখবে' : 'Shown before user begins the quiz'}
                    </p>
                  </div>
                </div>

                {/* Toggle */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className={`text-xs font-bold ${
                    (settings.beforeQuizAdEnabled ?? settings.firstAd?.enabled ?? true)
                      ? 'text-purple-600'
                      : 'text-slate-400'
                  }`}>
                    {(settings.beforeQuizAdEnabled ?? settings.firstAd?.enabled ?? true) 
                      ? (isBn ? 'চালু' : 'Active') 
                      : (isBn ? 'বন্ধ' : 'Disabled')}
                  </span>
                  <input
                    type="checkbox"
                    checked={settings.beforeQuizAdEnabled ?? settings.firstAd?.enabled ?? true}
                    onChange={(e) => setSettings({
                      ...settings,
                      beforeQuizAdEnabled: e.target.checked,
                      firstAd: { ...(settings.firstAd || DEFAULT_QUIZ_SETTINGS.firstAd!), enabled: e.target.checked }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className="bg-purple-50/60 rounded-xl p-3 border border-purple-100 text-xs text-purple-900 space-y-1.5">
                <p className="font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                  <span>{isBn ? 'কুইজ সুরক্ষা ও নিয়ম:' : 'Rule & Security:'}</span>
                </p>
                <p className="text-[11px] text-purple-800 leading-relaxed">
                  {isBn 
                    ? 'এটি চালু থাকলে ইউজারকে অবশ্যই Ad Network বিজ্ঞাপনটি সম্পূর্ণ দেখতে হবে। Ad বন্ধ করে দিলে বা ব্যর্থ হলে কুইজ শুরু হবে না।'
                    : 'When enabled, the user must watch the Ad Network ad to completion before questions appear.'
                  }
                </p>
              </div>
            </div>

            {/* SECOND AD (AFTER QUIZ / UNLOCK REWARD) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs">
                    ২
                  </span>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">
                      {isBn ? 'কুইজ শেষের পরের বিজ্ঞাপন (রিওয়ার্ড)' : 'After Quiz Ad (Reward Unlock)'}
                    </h5>
                    <p className="text-[11px] text-slate-500">
                      {isBn ? 'কুইজ শেষ হলে রিওয়ার্ড আনলক করতে Ad Network-এর বিজ্ঞাপন দেখবে' : 'Shown after quiz submission to credit points'}
                    </p>
                  </div>
                </div>

                {/* Toggle */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className={`text-xs font-bold ${
                    (settings.afterQuizAdEnabled ?? settings.secondAd?.enabled ?? true)
                      ? 'text-emerald-600'
                      : 'text-slate-400'
                  }`}>
                    {(settings.afterQuizAdEnabled ?? settings.secondAd?.enabled ?? true) 
                      ? (isBn ? 'চালু' : 'Active') 
                      : (isBn ? 'বন্ধ' : 'Disabled')}
                  </span>
                  <input
                    type="checkbox"
                    checked={settings.afterQuizAdEnabled ?? settings.secondAd?.enabled ?? true}
                    onChange={(e) => setSettings({
                      ...settings,
                      afterQuizAdEnabled: e.target.checked,
                      secondAd: { ...(settings.secondAd || DEFAULT_QUIZ_SETTINGS.secondAd!), enabled: e.target.checked }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div className="bg-emerald-50/60 rounded-xl p-3 border border-emerald-100 text-xs text-emerald-900 space-y-1.5">
                <p className="font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isBn ? 'রিওয়ার্ড সুরক্ষা ও নিয়ম:' : 'Rule & Security:'}</span>
                </p>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  {isBn 
                    ? `এটি চালু থাকলে দ্বিতীয় বিজ্ঞাপন সফলভাবে শেষ হওয়ার পরই ইউজারের মূল অ্যাকাউন্টে নির্ধারিত +${settings.rewardPoints} Points যুক্ত হবে।`
                    : `Points are credited strictly upon successful completion callback of this ad.`
                  }
                </p>
              </div>
            </div>

          </div>

          {/* SAVE BUTTON */}
          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-200 transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (isBn ? 'বিজ্ঞাপন সেটিংস সংরক্ষণ করুন' : 'Save Ad Settings')}</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: QUIZ HISTORY (Admin View) */}
      {activeTab === 'history' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h4 className="font-bold text-slate-800 text-base">
                {isBn ? 'ইউজার কুইজ হিস্ট্রি (Quiz History Log)' : 'User Quiz History Log'}
              </h4>
              <p className="text-xs text-slate-500">
                {isBn ? 'কোন ইউজার কত পয়েন্ট অর্জন করেছে ও কুইজ ফলাফল মনিটর করুন' : 'Monitor quiz participation and claimed rewards'}
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder={isBn ? 'ইউজারনেম বা আইডি দিয়ে খুঁজুন...' : 'Search by username or ID...'}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {filteredAttempts.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <History className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold">
                {isBn ? 'কোনো কুইজ হিস্ট্রি পাওয়া যায়নি' : 'No quiz records found'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">{isBn ? 'ইউজার / নাম' : 'User / Name'}</th>
                    <th className="p-3">{isBn ? 'কুইজের নাম' : 'Quiz Title'}</th>
                    <th className="p-3">{isBn ? 'ফলাফল (সঠিক/ভুল)' : 'Score (C/W/T)'}</th>
                    <th className="p-3">{isBn ? 'রিওয়ার্ড' : 'Reward'}</th>
                    <th className="p-3">{isBn ? 'তারিখ ও সময়' : 'Date & Time'}</th>
                    <th className="p-3">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAttempts.map((att) => (
                    <tr key={att.attemptId || att.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{att.userName || 'User'}</div>
                        <div className="font-mono text-[10px] text-slate-400">UID: {att.userId}</div>
                        <div className="font-mono text-[9px] text-purple-600">AttID: {att.attemptId}</div>
                      </td>
                      <td className="p-3 font-medium text-slate-800">
                        {att.quizTitle || 'কুইজ খেলে আয়'}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2 font-semibold">
                          <span className="text-emerald-600">✓ {att.correctCount}</span>
                          <span className="text-rose-500">✗ {att.wrongCount}</span>
                          <span className="text-slate-400 font-normal">({att.totalQuestions})</span>
                        </div>
                      </td>
                      <td className="p-3 font-extrabold text-amber-600">
                        +{att.reward} Pts
                      </td>
                      <td className="p-3 text-[11px] text-slate-500">
                        <div>{new Date(att.timestamp).toLocaleDateString('bn-BD')}</div>
                        <div className="text-[10px] text-slate-400">{att.completionTime || 'সম্পন্ন'}</div>
                      </td>
                      <td className="p-3">
                        {att.rewardClaimed ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold text-[10px]">
                            <CheckCircle2 className="w-3 h-3" />
                            Claimed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-bold text-[10px]">
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* QUESTION CREATE / EDIT MODAL */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
              <h4 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-purple-600" />
                <span>{editingQuestionId ? (isBn ? 'প্রশ্ন সম্পাদনা করুন' : 'Edit Question') : (isBn ? 'নতুন প্রশ্ন যুক্ত করুন' : 'Add Question')}</span>
              </h4>
              <button
                onClick={() => setIsQuestionModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="p-5 space-y-4 overflow-y-auto flex-1">
              
              {/* Question */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isBn ? 'প্রশ্ন লিখুন (Question):' : 'Question:'}
                </label>
                <textarea
                  rows={2}
                  required
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="যেমন: বাংলাদেশের জাতীয় কবি কে?"
                />
              </div>

              {/* 4 Options */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-slate-700">
                  {isBn ? '৪টি উত্তর অপশন (Options):' : '4 Answer Options:'}
                </label>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">A</span>
                    <input
                      type="text"
                      required
                      value={optionA}
                      onChange={(e) => setOptionA(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Option A"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">B</span>
                    <input
                      type="text"
                      required
                      value={optionB}
                      onChange={(e) => setOptionB(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Option B"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">C</span>
                    <input
                      type="text"
                      required
                      value={optionC}
                      onChange={(e) => setOptionC(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Option C"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">D</span>
                    <input
                      type="text"
                      required
                      value={optionD}
                      onChange={(e) => setOptionD(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Option D"
                    />
                  </div>
                </div>
              </div>

              {/* Correct Answer */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {isBn ? 'সঠিক উত্তর নির্বাচন করুন (Correct Answer):' : 'Correct Answer:'}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['A', 'B', 'C', 'D'] as const).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setCorrectAnswer(key)}
                      className={`py-2 rounded-xl border font-bold text-xs flex items-center justify-center gap-1 transition-all ${
                        correctAnswer === key
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span>Option {key}</span>
                      {correctAnswer === key && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Explanation */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isBn ? 'ব্যাখ্যা (ঐচ্ছিক):' : 'Explanation (Optional):'}
                </label>
                <input
                  type="text"
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="সঠিক উত্তরের কারণ বা অতিরিক্ত তথ্য..."
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-colors"
                >
                  {saving ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (isBn ? 'সংরক্ষণ করুন' : 'Save Question')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
