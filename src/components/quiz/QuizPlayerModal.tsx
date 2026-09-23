import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  HelpCircle, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Trophy, 
  Gift, 
  Sparkles,
  ArrowRight,
  ArrowLeft,
  History,
  ShieldCheck,
  AlertCircle,
  Check,
  RefreshCw,
  Wallet,
  Play,
  Award,
  Radio,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { 
  QuizQuestionItem, 
  QuizSettings, 
  QuizAttemptRecord 
} from '../../types';
import { 
  fetchQuizSettings, 
  fetchQuizQuestions, 
  recordQuizAttemptToDb, 
  fetchUserQuizAttempts,
  DEFAULT_QUIZ_SETTINGS,
  INITIAL_QUIZ_QUESTIONS
} from '../../services/quizService';
import { 
  playAdNetworkRewardedAd, 
  isAdNetworkSdkAvailable 
} from '../../services/adNetworkService';
import { PersistentAdBanner } from '../common/PersistentAdBanner';
import { AdsterraQuizAdBox } from './AdsterraQuizAdBox';

interface QuizPlayerModalProps {
  onClose: () => void;
}

type QuizPhase = 
  | 'loading' 
  | 'disabled'
  | 'completed_today'
  | 'first_ad' 
  | 'question' 
  | 'result'
  | 'second_ad' 
  | 'reward_claimed' 
  | 'history';

export const QuizPlayerModal: React.FC<QuizPlayerModalProps> = ({ onClose }) => {
  const { 
    user, 
    wallet,
    creditUserReward, 
    showToast, 
    isBn 
  } = useApp();

  // Settings & Question Bank
  const [settings, setSettings] = useState<QuizSettings>(DEFAULT_QUIZ_SETTINGS);
  const [allQuestions, setAllQuestions] = useState<QuizQuestionItem[]>(INITIAL_QUIZ_QUESTIONS);
  const [activeQuestions, setActiveQuestions] = useState<QuizQuestionItem[]>([]);
  const [userHistory, setUserHistory] = useState<QuizAttemptRecord[]>([]);
  
  // Lifecycle Phase
  const [phase, setPhase] = useState<QuizPhase>('loading');
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [wrongCount, setWrongCount] = useState<number>(0);
  const [questionTimer, setQuestionTimer] = useState<number>(30);
  
  // Ad Network State & Progress
  const [isAdLoading, setIsAdLoading] = useState<boolean>(false);
  const [adErrorMessage, setAdErrorMessage] = useState<string | null>(null);
  const [firstAdWatched, setFirstAdWatched] = useState<boolean>(false);
  const [secondAdWatched, setSecondAdWatched] = useState<boolean>(false);

  // Security & Attempt State
  const [currentAttemptId, setCurrentAttemptId] = useState<string>('');
  const [rewardClaimed, setRewardClaimed] = useState<boolean>(false);
  const isClaimingRef = useRef<boolean>(false);

  // Initialize Quiz Data on Mount
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [loadedSettings, loadedQuestions] = await Promise.all([
          fetchQuizSettings(),
          fetchQuizQuestions()
        ]);

        if (!isMounted) return;
        setSettings(loadedSettings);
        setAllQuestions(loadedQuestions);

        // Load user history to check daily attempt limits
        let history: QuizAttemptRecord[] = [];
        if (user?.id) {
          history = await fetchUserQuizAttempts(user.id);
          if (isMounted) setUserHistory(history);
        }

        // Check if Admin disabled quiz
        if (!loadedSettings.enabled || !loadedSettings.isActive) {
          setPhase('disabled');
          return;
        }

        // Check Daily Limit
        const todayStr = new Date().toISOString().split('T')[0];
        const userTodayAttempts = history.filter(
          att => att.timestamp?.startsWith(todayStr) && att.rewardClaimed
        );
        const limit = loadedSettings.dailyAttemptLimit || 1;

        if (userTodayAttempts.length >= limit) {
          setPhase('completed_today');
          return;
        }

        // Prepare Questions & Unique Attempt ID
        const totalToTake = Math.min(loadedSettings.totalQuestions || 5, loadedQuestions.length || 5);
        const shuffled = [...loadedQuestions].sort(() => 0.5 - Math.random()).slice(0, totalToTake);
        setActiveQuestions(shuffled);

        const newAttemptId = `quiz_att_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        setCurrentAttemptId(newAttemptId);
        setCurrentIdx(0);
        setSelectedOption(null);
        setUserAnswers({});
        setCorrectCount(0);
        setWrongCount(0);
        setFirstAdWatched(false);
        setSecondAdWatched(false);
        setRewardClaimed(false);
        setAdErrorMessage(null);
        isClaimingRef.current = false;

        // Step 1: Check if Admin enabled Ad before Quiz
        const beforeAdEnabled = loadedSettings.beforeQuizAdEnabled ?? loadedSettings.firstAd?.enabled ?? true;
        if (beforeAdEnabled) {
          setPhase('first_ad');
        } else {
          setFirstAdWatched(true);
          setPhase('question');
        }

      } catch (err) {
        console.error('[QuizPlayerModal] Failed to load quiz data:', err);
        if (isMounted) setPhase('disabled');
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, [user?.id]);

  // Question countdown timer
  useEffect(() => {
    if (phase !== 'question') return;
    const timeLimit = settings.timeLimitSeconds > 0 ? settings.timeLimitSeconds : 0;
    if (timeLimit === 0) return; // unlimited

    setQuestionTimer(timeLimit);
    const interval = setInterval(() => {
      setQuestionTimer(prev => {
        if (prev <= 1) {
          // Time expired for this question, auto move to next
          handleNextQuestion(true);
          return timeLimit;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, currentIdx, settings.timeLimitSeconds]);

  // Handle Triggering the First Ad from Existing Ad Network
  const handlePlayFirstAd = async () => {
    setIsAdLoading(true);
    setAdErrorMessage(null);

    try {
      const res = await playAdNetworkRewardedAd({
        provider: settings.adProvider || 'adsterra',
        adsterraKey: settings.adsterraKey,
        adsterraDirectUrl: settings.adsterraDirectUrl,
        timeoutSeconds: 15
      });
      if (res.success) {
        setFirstAdWatched(true);
        showToast(isBn ? 'বিজ্ঞাপন সফলভাবে সম্পন্ন! কুইজ শুরু হচ্ছে...' : 'Ad completed! Starting Quiz...');
        setPhase('question');
        if (settings.timeLimitSeconds > 0) {
          setQuestionTimer(settings.timeLimitSeconds);
        }
      } else {
        setAdErrorMessage(res.error || (isBn ? 'বিজ্ঞাপন সফলভাবে শেষ হয়নি। পুরো বিজ্ঞাপনটি দেখা বাধ্যতামূলক।' : 'Ad was not completed.'));
        showToast(isBn ? 'বিজ্ঞাপন সম্পূর্ণ না দেখলে কুইজ শুরু করা যাবে না।' : 'Must watch ad completely to start quiz.');
      }
    } catch (err: any) {
      setAdErrorMessage(err?.message || (isBn ? 'বিজ্ঞাপন লোড করতে সমস্যা হয়েছে।' : 'Error showing ad.'));
    } finally {
      setIsAdLoading(false);
    }
  };

  // Handle Answer Selection & Progression (Next Button or Final Submit)
  const handleNextQuestion = (isTimeout: boolean = false) => {
    const currentQ = activeQuestions[currentIdx];
    if (!currentQ) return;

    const chosen = isTimeout ? null : selectedOption;
    const isCorrect = chosen !== null && chosen === currentQ.correctAnswer;

    if (chosen !== null) {
      setUserAnswers(prev => ({ ...prev, [currentQ.id]: chosen }));
    }

    const nextCorrect = isCorrect ? correctCount + 1 : correctCount;
    const nextWrong = (!isCorrect) ? wrongCount + 1 : wrongCount;

    if (isCorrect) {
      setCorrectCount(nextCorrect);
    } else {
      setWrongCount(nextWrong);
    }

    // If more questions remain -> go to next question
    if (currentIdx < activeQuestions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(null);
      if (settings.timeLimitSeconds > 0) {
        setQuestionTimer(settings.timeLimitSeconds);
      }
    } else {
      // Last question submitted! Transition to Result Screen
      setPhase('result');
    }
  };

  // Move from Result Screen to Second Ad or Direct Claim
  const handleProceedFromResults = () => {
    const afterAdEnabled = settings.afterQuizAdEnabled ?? settings.secondAd?.enabled ?? true;
    if (afterAdEnabled) {
      setPhase('second_ad');
    } else {
      setSecondAdWatched(true);
      handleClaimReward();
    }
  };

  // Handle Triggering the Second Ad from Existing Ad Network
  const handlePlaySecondAd = async () => {
    setIsAdLoading(true);
    setAdErrorMessage(null);

    try {
      const res = await playAdNetworkRewardedAd({
        provider: settings.adProvider || 'adsterra',
        adsterraKey: settings.adsterraKey,
        adsterraDirectUrl: settings.adsterraDirectUrl,
        timeoutSeconds: 15
      });
      if (res.success) {
        setSecondAdWatched(true);
        // Second Ad completed! Now claim the reward
        await handleClaimReward();
      } else {
        setAdErrorMessage(res.error || (isBn ? 'বিজ্ঞাপন সফলভাবে সম্পন্ন হয়নি। রিওয়ার্ড আনলক করতে সম্পূর্ণ বিজ্ঞাপনটি দেখতে হবে।' : 'Ad was not completed.'));
        showToast(isBn ? 'বিজ্ঞাপন সম্পূর্ণ না করলে পয়েন্ট একাউন্টে যোগ হবে না।' : 'Must watch ad to unlock reward.');
      }
    } catch (err: any) {
      setAdErrorMessage(err?.message || (isBn ? 'বিজ্ঞাপন লোড করতে সমস্যা হয়েছে।' : 'Error loading ad.'));
    } finally {
      setIsAdLoading(false);
    }
  };

  // Claim Reward strictly tied to current authenticated user's balance
  const handleClaimReward = async () => {
    // 1. Anti-abuse guard: Check if already claiming or claimed
    if (isClaimingRef.current || rewardClaimed) return;
    
    // Check local storage duplicate prevention key
    const duplicateKey = `gl_quiz_claimed_${currentAttemptId}`;
    if (localStorage.getItem(duplicateKey)) {
      showToast(isBn ? 'এই কুইজের রিওয়ার্ড ইতিমধ্যে গ্রহণ করা হয়েছে।' : 'Reward already claimed for this quiz.');
      return;
    }

    isClaimingRef.current = true;

    // Security Verification: Ensure First Ad was watched if enabled
    const beforeAdEnabled = settings.beforeQuizAdEnabled ?? settings.firstAd?.enabled ?? true;
    if (beforeAdEnabled && !firstAdWatched) {
      showToast(isBn ? 'প্রথম বিজ্ঞাপন না দেখে রিওয়ার্ড পাওয়া যাবে না।' : 'First ad was not completed.');
      isClaimingRef.current = false;
      return;
    }

    const pointsToCredit = Number(settings.rewardPoints) || 20;

    try {
      // 2. Mark local storage immediately to prevent double click or replay attacks
      localStorage.setItem(duplicateKey, 'true');

      // 3. Credit reward directly to the current authenticated user's account
      creditUserReward(
        pointsToCredit, 
        `কুইজ খেলে আয় রিওয়ার্ড (+${pointsToCredit} Points) - ID: ${currentAttemptId}`, 
        'job'
      );
      
      const now = new Date();
      const attemptRecord: QuizAttemptRecord = {
        id: currentAttemptId,
        attemptId: currentAttemptId,
        userId: user?.id || 'anonymous_user',
        userName: user?.name || 'User',
        userPhone: user?.phone || '',
        quizId: settings.id || 'main_config',
        quizTitle: settings.title || 'কুইজ খেলে আয়',
        totalQuestions: activeQuestions.length,
        correctCount,
        wrongCount,
        answers: userAnswers,
        reward: pointsToCredit,
        rewardClaimed: true,
        firstAdCompleted: true,
        secondAdCompleted: true,
        completionTime: now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
        timestamp: now.toISOString(),
        status: 'claimed'
      };

      // 4. Save attempt record to database
      await recordQuizAttemptToDb(attemptRecord);

      // 5. Update local state
      setUserHistory(prev => [attemptRecord, ...prev]);
      setRewardClaimed(true);
      setPhase('reward_claimed');

      // 6. Confetti celebration
      try {
        confetti({
          particleCount: 120,
          spread: 85,
          origin: { y: 0.6 }
        });
      } catch {}

      showToast(isBn ? `অভিনন্দন! +${pointsToCredit} Points আপনার একাউন্টে যোগ হয়েছে!` : `Congratulations! +${pointsToCredit} Points added!`);

    } catch (err) {
      console.error('[QuizPlayerModal] Error claiming reward:', err);
      showToast(isBn ? 'রিওয়ার্ড যোগ করতে সমস্যা হয়েছে।' : 'Error claiming reward.');
      isClaimingRef.current = false;
    }
  };

  const currentQ = activeQuestions[currentIdx];
  const progressPercent = activeQuestions.length > 0 
    ? Math.round(((currentIdx + 1) / activeQuestions.length) * 100) 
    : 0;

  return (
    <div 
      id="quiz-job-full-page"
      className="fixed inset-0 z-50 bg-[#F8FAFC] flex flex-col overflow-y-auto animate-in fade-in duration-200"
    >
      {/* DIRECT PAGE TOP APP BAR */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                if (phase === 'first_ad' || phase === 'question' || phase === 'result' || phase === 'second_ad') {
                  if (window.confirm(isBn ? 'কুইজ অসমাপ্ত রেখে বের হলে কোনো পয়েন্ট পাবেন না। আপনি কি নিশ্চিত?' : 'Leaving now will forfeit your reward. Are you sure?')) {
                    onClose();
                  }
                } else {
                  onClose();
                }
              }}
              className="flex items-center gap-1.5 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{isBn ? 'হোমে ফিরে যান' : 'Back to Home'}</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-200 shrink-0">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <h1 className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight">
                  {settings.title || (isBn ? 'কুইজ খেলে আয়' : 'Quiz & Earn')}
                </h1>
                <p className="text-[10px] sm:text-[11px] text-purple-700 font-semibold flex items-center gap-1.5">
                  <span className="flex items-center gap-0.5">
                    <Gift className="w-3 h-3 text-amber-500" />
                    {isBn ? `রিওয়ার্ড: +${settings.rewardPoints} Points` : `Reward: +${settings.rewardPoints} Points`}
                  </span>
                  <span>•</span>
                  <span>{isBn ? `প্রশ্ন: ${activeQuestions.length || settings.totalQuestions}টি` : `${activeQuestions.length || settings.totalQuestions} Questions`}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Live Wallet Chip */}
            <div className="bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-full text-xs font-bold text-purple-800 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>৳{(wallet?.balance || 0).toFixed(2)}</span>
            </div>

            <button
              onClick={() => setPhase(prev => prev === 'history' ? (firstAdWatched ? 'question' : 'first_ad') : 'history')}
              className="p-2 rounded-xl text-slate-500 hover:text-purple-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title={isBn ? 'কুইজ হিস্ট্রি' : 'Quiz History'}
            >
              <History className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Top Persistent Banner Ad */}
      <div className="w-full bg-slate-900 border-b border-slate-800 flex justify-center py-0.5">
        <PersistentAdBanner position="top" page="quiz_job" />
      </div>

      {/* STEP PROGRESS TRACKER */}
      {(phase === 'first_ad' || phase === 'question' || phase === 'result' || phase === 'second_ad' || phase === 'reward_claimed') && (
        <div className="bg-white px-4 py-2 border-b border-slate-100 shadow-2xs">
          <div className="max-w-3xl mx-auto grid grid-cols-4 gap-1.5 text-center text-[10px] sm:text-xs font-bold">
            
            {/* Step 1: Ad 1 */}
            <div className={`py-1.5 px-2 rounded-xl border transition-all ${
              phase === 'first_ad'
                ? 'bg-purple-600 border-purple-600 text-white shadow-sm'
                : (firstAdWatched ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-400')
            }`}>
              {firstAdWatched ? '✓ ১ম Ad' : '১. ১ম Ad'}
            </div>

            {/* Step 2: Quiz */}
            <div className={`py-1.5 px-2 rounded-xl border transition-all ${
              phase === 'question'
                ? 'bg-purple-600 border-purple-600 text-white shadow-sm'
                : (phase === 'result' || phase === 'second_ad' || phase === 'reward_claimed' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-400')
            }`}>
              {phase === 'result' || phase === 'second_ad' || phase === 'reward_claimed' ? '✓ কুইজ' : '২. কুইজ'}
            </div>

            {/* Step 3: Ad 2 */}
            <div className={`py-1.5 px-2 rounded-xl border transition-all ${
              phase === 'second_ad'
                ? 'bg-purple-600 border-purple-600 text-white shadow-sm'
                : (secondAdWatched ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-400')
            }`}>
              {secondAdWatched ? '✓ ২য় Ad' : '৩. ২য় Ad'}
            </div>

            {/* Step 4: Reward */}
            <div className={`py-1.5 px-2 rounded-xl border transition-all ${
              phase === 'reward_claimed'
                ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}>
              {phase === 'reward_claimed' ? '🎉 রিওয়ার্ড' : '৪. রিওয়ার্ড'}
            </div>

          </div>
        </div>
      )}

      {/* MAIN PAGE BODY CONTAINER */}
      <main className="flex-1 w-full max-w-3xl mx-auto p-4 sm:p-5 flex flex-col">
          
          {/* LOADING STATE */}
          {phase === 'loading' && (
            <div className="py-16 text-center space-y-3">
              <RefreshCw className="w-9 h-9 text-purple-600 animate-spin mx-auto" />
              <p className="text-sm font-bold text-slate-700">
                {isBn ? 'কুইজ এবং Ad Network লোড হচ্ছে...' : 'Loading quiz & Ad Network...'}
              </p>
            </div>
          )}

          {/* QUIZ DISABLED BY ADMIN */}
          {phase === 'disabled' && (
            <div className="py-10 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base sm:text-lg font-bold text-slate-800">
                  {isBn ? 'কুইজ বর্তমানে বন্ধ রয়েছে' : 'Quiz Currently Disabled'}
                </h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  {isBn 
                    ? 'অ্যাডমিন এই মুহূর্তে কুইজ সেকশনটি বন্ধ রেখেছেন। দয়া করে পরবর্তীতে চেষ্টা করুন।'
                    : 'The administrator has paused the quiz feature at this moment. Please check back later.'
                  }
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors shadow-sm"
              >
                {isBn ? 'বন্ধ করুন' : 'Close'}
              </button>
            </div>
          )}

          {/* COMPLETED TODAY */}
          {phase === 'completed_today' && (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base sm:text-lg font-bold text-slate-800">
                  {isBn ? 'আজকের কুইজ সম্পন্ন হয়েছে!' : 'Quiz Completed Today!'}
                </h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  {isBn 
                    ? `আপনি আজকের নির্ধারিত সীমা (${settings.dailyAttemptLimit || 1} বার) পূর্ণ করেছেন। আগামীকাল পুনরায় কুইজ খেলতে পারবেন!`
                    : `You have reached your daily attempt limit (${settings.dailyAttemptLimit || 1}). Please return tomorrow!`
                  }
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => setPhase('history')}
                  className="px-4 py-2.5 rounded-xl border border-purple-200 text-purple-700 font-bold text-xs hover:bg-purple-50 transition-colors"
                >
                  {isBn ? 'পূর্ববর্তী ফলাফল দেখুন' : 'View History'}
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors shadow-md"
                >
                  {isBn ? 'ঠিক আছে' : 'OK'}
                </button>
              </div>
            </div>
          )}

          {/* 1. FIRST AD SCREEN (Direct Adsterra Official Integration) */}
          {phase === 'first_ad' && (
            <AdsterraQuizAdBox
              step={1}
              stepTitle={isBn ? 'ধাপ ১: স্পন্সর বিজ্ঞাপন দেখুন (কুইজ শুরু)' : 'Step 1: Watch Sponsor Ad (Start Quiz)'}
              stepDescription={isBn 
                ? 'কুইজ শুরু করার জন্য Adsterra-এর বিজ্ঞাপনটি সম্পূর্ণ দেখুন। বিজ্ঞাপন শেষ হলেই কুইজ স্বয়ংক্রিয়ভাবে আনলক হবে।' 
                : 'Watch the Adsterra advertisement completely to unlock and start the quiz.'}
              durationSeconds={settings.firstAd?.durationSeconds || 15}
              rewardPoints={settings.rewardPoints}
              adsterraKey={settings.adsterraKey}
              adsterraDirectUrl={settings.adsterraDirectUrl}
              isCompleted={firstAdWatched}
              onAdCompleted={() => {
                setFirstAdWatched(true);
                showToast(isBn ? 'বিজ্ঞাপন দেখা সম্পন্ন! কুইজ শুরু করুন।' : 'Ad watched! You can now start the quiz.');
              }}
              onProceed={() => {
                setFirstAdWatched(true);
                setPhase('question');
                if (settings.timeLimitSeconds > 0) {
                  setQuestionTimer(settings.timeLimitSeconds);
                }
              }}
            />
          )}

          {/* 2. & 3. QUESTION SCREEN (Interactive Quiz UI) */}
          {phase === 'question' && currentQ && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              {/* Question Header & Live Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-purple-700 bg-purple-50 px-3 py-1 rounded-xl border border-purple-200">
                    {isBn ? `প্রশ্ন ${currentIdx + 1} / ${activeQuestions.length}` : `Question ${currentIdx + 1} of ${activeQuestions.length}`}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 text-[11px]">
                      +{settings.rewardPoints} Pts
                    </span>

                    {settings.timeLimitSeconds > 0 && (
                      <span className={`inline-flex items-center gap-1 font-bold px-2.5 py-1 rounded-xl text-xs ${
                        questionTimer <= 5 
                          ? 'bg-rose-50 text-rose-600 border border-rose-200 animate-pulse' 
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        <Clock className="w-3.5 h-3.5" />
                        {questionTimer}s
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Question Box */}
              <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-5 rounded-2xl shadow-md border border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">
                    {isBn ? 'সঠিক উত্তর নির্বাচন করুন' : 'Select Correct Answer'}
                  </p>
                  <span className="text-[10px] text-slate-400">
                    {settings.title}
                  </span>
                </div>
                <h4 className="text-base sm:text-lg font-bold leading-relaxed">
                  {currentQ.question}
                </h4>
              </div>

              {/* 4 Options Grid */}
              <div className="space-y-2.5">
                {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                  const optText = currentQ.options[optKey];
                  const isSelected = selectedOption === optKey;

                  return (
                    <button
                      key={optKey}
                      type="button"
                      onClick={() => setSelectedOption(optKey)}
                      className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-purple-50 border-purple-600 text-purple-900 shadow-sm ring-2 ring-purple-600/20' 
                          : 'bg-white border-slate-200 hover:border-purple-300 hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                          isSelected 
                            ? 'bg-purple-600 text-white shadow-xs' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {optKey}
                        </span>
                        <span className="text-xs sm:text-sm font-medium leading-snug">
                          {optText}
                        </span>
                      </div>

                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected 
                          ? 'border-purple-600 bg-purple-600 text-white' 
                          : 'border-slate-300 bg-white'
                      }`}>
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Action Buttons: Next Button or Final Submit Button */}
              <div className="pt-2">
                {currentIdx < activeQuestions.length - 1 ? (
                  // NEXT BUTTON
                  <button
                    type="button"
                    disabled={!selectedOption}
                    onClick={() => handleNextQuestion(false)}
                    className="w-full py-3.5 px-5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{isBn ? 'পরবর্তী প্রশ্ন' : 'Next Question'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  // FINAL SUBMIT BUTTON
                  <button
                    type="button"
                    disabled={!selectedOption}
                    onClick={() => handleNextQuestion(false)}
                    className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isBn ? 'কুইজ সাবমিট করুন (ফলাফল দেখুন)' : 'Submit Quiz (View Result)'}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 3. RESULT SCREEN (Complete Result Breakdown before 2nd Ad) */}
          {phase === 'result' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              {/* Celebration Icon & Header */}
              <div className="text-center space-y-1.5 py-2">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
                  <Trophy className="w-7 h-7" />
                </div>
                <h4 className="text-base sm:text-lg font-black text-slate-900">
                  {isBn ? 'কুইজ সম্পন্ন হয়েছে!' : 'Quiz Completed!'}
                </h4>
                <p className="text-xs text-slate-500">
                  {isBn ? 'আপনার উত্তরের ফলাফল এবং অর্জিত রিওয়ার্ড পয়েন্ট:' : 'Here is your performance summary:'}
                </p>
              </div>

              {/* Scorecard Box */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-emerald-700 uppercase">{isBn ? 'সঠিক উত্তর' : 'Correct'}</p>
                  <p className="text-lg font-black text-emerald-800">✓ {correctCount}</p>
                </div>
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-rose-700 uppercase">{isBn ? 'ভুল উত্তর' : 'Wrong'}</p>
                  <p className="text-lg font-black text-rose-800">✗ {wrongCount}</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-purple-700 uppercase">{isBn ? 'অর্জিত পয়েন্ট' : 'Reward'}</p>
                  <p className="text-lg font-black text-purple-800">+{settings.rewardPoints}</p>
                </div>
              </div>

              {/* Progress / Accuracy Badge */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">
                  {isBn ? 'মোট প্রশ্ন সম্পন্ন:' : 'Total Questions Answered:'} {activeQuestions.length}টি
                </span>
                <span className="font-bold text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded-md">
                  {Math.round((correctCount / (activeQuestions.length || 1)) * 100)}% {isBn ? 'নির্ভুলতা' : 'Accuracy'}
                </span>
              </div>

              {/* Next Action Call-To-Action */}
              <div className="space-y-2 pt-2">
                <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    {isBn 
                      ? `পরবর্তী ধাপে স্পন্সর বিজ্ঞাপনটি সম্পূর্ণ দেখলে +${settings.rewardPoints} Points সরাসরি আপনার মূল একাউন্টে যোগ হয়ে যাবে!`
                      : `Watch the sponsor ad in the next step to credit +${settings.rewardPoints} Points directly to your balance!`
                    }
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleProceedFromResults}
                  className="w-full py-3.5 px-5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-200 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  <span>
                    {(settings.afterQuizAdEnabled ?? settings.secondAd?.enabled ?? true)
                      ? (isBn ? 'বিজ্ঞাপন দেখুন ও রিওয়ার্ড নিন ➔' : 'Watch Ad & Claim Reward ➔')
                      : (isBn ? 'পয়েন্ট সংগ্রহ করুন ➔' : 'Claim Reward ➔')
                    }
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* 4. SECOND AD SCREEN (Direct Adsterra Official Integration) */}
          {phase === 'second_ad' && (
            <AdsterraQuizAdBox
              step={2}
              stepTitle={isBn ? 'ধাপ ২: রিওয়ার্ড আনলক বিজ্ঞাপন (শেষ ধাপ)' : 'Step 2: Reward Unlock Ad (Final Step)'}
              stepDescription={isBn 
                ? `বিজ্ঞাপনটি সম্পন্ন দেখার পরই +${settings.rewardPoints} পয়েন্ট সরাসরি আপনার অ্যাকাউন্টে যুক্ত হবে!`
                : `Points will be credited directly to your balance right after the ad finishes!`}
              durationSeconds={settings.secondAd?.durationSeconds || 15}
              rewardPoints={settings.rewardPoints}
              adsterraKey={settings.adsterraKey}
              adsterraDirectUrl={settings.adsterraDirectUrl}
              isCompleted={secondAdWatched}
              onAdCompleted={() => {
                setSecondAdWatched(true);
                showToast(isBn ? 'বিজ্ঞাপন দেখা সম্পন্ন! রিওয়ার্ড সংগ্রহ করুন।' : 'Ad completed! Ready to claim reward.');
              }}
              onProceed={async () => {
                setSecondAdWatched(true);
                await handleClaimReward();
              }}
            />
          )}

          {/* 5. & 6. REWARD CLAIMED / SUCCESS SCREEN */}
          {phase === 'reward_claimed' && (
            <div className="space-y-4 text-center py-4 animate-in zoom-in-95 duration-200">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <h4 className="text-lg sm:text-xl font-black text-slate-900">
                  {isBn ? 'অভিনন্দন! রিওয়ার্ড সফলভাবে যোগ হয়েছে' : 'Congratulations! Reward Claimed'}
                </h4>
                <p className="text-xs text-slate-500">
                  {isBn 
                    ? `কুইজ ও Ad Network বিজ্ঞাপন সফলভাবে সম্পন্ন করায় +${settings.rewardPoints} Points আপনার ব্যালেন্সে যোগ করা হয়েছে।` 
                    : `+${settings.rewardPoints} Points have been credited directly to your balance.`
                  }
                </p>
              </div>

              {/* Wallet Update Card */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-4 text-center space-y-2">
                <p className="text-[11px] text-purple-700 font-bold uppercase tracking-wider">
                  {isBn ? 'আপনার বর্তমান ব্যালেন্স' : 'Your Current Balance'}
                </p>
                <p className="text-2xl sm:text-3xl font-black text-purple-900">
                  ৳{(wallet?.balance || user?.balance || 0).toFixed(2)}
                </p>
                <div className="inline-flex items-center gap-1.5 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  <Gift className="w-3.5 h-3.5" />
                  <span>+{settings.rewardPoints} Points Added</span>
                </div>
              </div>

              {/* Transaction Verification Details */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-[11px] text-slate-500 space-y-1.5 text-left">
                <div className="flex justify-between">
                  <span>{isBn ? 'অ্যাটেম্পট আইডি:' : 'Attempt ID:'}</span>
                  <span className="font-mono text-purple-700 font-bold">{currentAttemptId}</span>
                </div>
                <div className="flex justify-between">
                  <span>{isBn ? 'ইউজার আইডি:' : 'User ID:'}</span>
                  <span className="font-mono text-slate-800">{user?.id || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>{isBn ? 'সঠিক উত্তর:' : 'Score:'}</span>
                  <span className="font-semibold text-emerald-600">{correctCount} / {activeQuestions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>{isBn ? 'স্ট্যাটাস:' : 'Status:'}</span>
                  <span className="text-emerald-600 font-bold">✅ Credited to User Balance</span>
                </div>
              </div>

              {/* Finish Action */}
              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="w-full py-3 px-6 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-200 transition-colors cursor-pointer"
                >
                  {isBn ? 'সম্পন্ন (ঠিক আছে)' : 'Done'}
                </button>
              </div>
            </div>
          )}

          {/* USER HISTORY VIEW */}
          {phase === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <History className="w-4 h-4 text-purple-600" />
                  <span>{isBn ? 'আপনার কুইজ হিস্ট্রি' : 'Your Quiz History'}</span>
                </h4>
                <button
                  onClick={() => setPhase(firstAdWatched ? 'question' : 'first_ad')}
                  className="text-xs font-bold text-purple-600 hover:underline cursor-pointer"
                >
                  {isBn ? 'ফিরে যান' : 'Back'}
                </button>
              </div>

              {userHistory.length === 0 ? (
                <div className="py-10 text-center text-slate-400">
                  <History className="w-8 h-8 mx-auto text-slate-300 mb-1" />
                  <p className="text-xs font-semibold">{isBn ? 'কোনো পূর্ববর্তী কুইজ রেকর্ড নেই' : 'No quiz attempts yet'}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {userHistory.map((att) => (
                    <div 
                      key={att.attemptId || att.id}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-slate-800">{att.quizTitle}</span>
                        <span className="text-amber-600">+{att.reward} Pts</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>সঠিক: {att.correctCount}/{att.totalQuestions}</span>
                        <span>{new Date(att.timestamp).toLocaleDateString('bn-BD')}</span>
                      </div>
                      <div className="text-[10px] font-mono text-purple-600">
                        ID: {att.attemptId}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

      </main>

      {/* Bottom Persistent Banner Ad */}
      <div className="w-full bg-slate-900 border-t border-slate-800 flex justify-center py-0.5 mt-auto">
        <PersistentAdBanner position="bottom" page="quiz_job" />
      </div>
    </div>
  );
};
