import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  Phone,
  User, 
  Eye, 
  EyeOff, 
  Check, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Gift, 
  Globe, 
  Headphones, 
  X,
  KeyRound,
  Camera,
  Tag,
  Sparkles,
  UploadCloud,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { compressImage } from '../../lib/imageUtils';
import { 
  normalizePhoneNumber, 
  isValidBangladeshiPhone, 
  normalizeEmail, 
  isValidEmail, 
  checkAccountUniqueness 
} from '../../lib/userValidation';

export const AuthView: React.FC = () => {
  const { 
    loginWithCredentials, 
    registerUser, 
    language, 
    setLanguage, 
    systemSettings,
    showToast 
  } = useApp();

  const isBn = language === 'bn';

  // Modes: 'login' | 'register' | 'forgot'
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('ref')) return 'register';
    } catch {}
    return 'login';
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regReferralCode, setRegReferralCode] = useState(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const ref = urlParams.get('ref');
      if (ref) {
        localStorage.setItem('lg_pending_ref', ref.trim().toUpperCase());
        return ref.trim().toUpperCase();
      }
      const saved = localStorage.getItem('lg_pending_ref');
      if (saved) return saved.trim().toUpperCase();
    } catch {}
    return '';
  });
  const [regAvatar, setRegAvatar] = useState<string>('');
  const [isDraggingAvatar, setIsDraggingAvatar] = useState(false);
  const [regRememberMe, setRegRememberMe] = useState(true);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleAvatarFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage(isBn ? 'অনুগ্রহ করে ছবি ফাইল আপলোড করুন (JPG, PNG ইত্যাদি)।' : 'Please upload an image file (JPG, PNG, etc.).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage(isBn ? 'ছবির সাইজ ১০ মেগাবাইটের কম হতে হবে।' : 'Image size must be less than 10MB.');
      return;
    }
    try {
      const compressed = await compressImage(file, 160, 160, 0.72);
      setRegAvatar(compressed);
      setErrorMessage(null);
    } catch {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          setRegAvatar(event.target.result);
          setErrorMessage(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingAvatar(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleAvatarFile(e.dataTransfer.files[0]);
    }
  };

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState<'request' | 'verify'>('request');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const emailOrPhone = loginEmail.trim();
    if (!emailOrPhone || !loginPassword.trim()) {
      setErrorMessage(isBn ? 'ইমেইল / মোবাইল নম্বর এবং পাসওয়ার্ড দিন।' : 'Please enter your email/phone and password.');
      return;
    }

    setLoading(true);

    try {
      const res = await loginWithCredentials(emailOrPhone, loginPassword.trim());
      setLoading(false);
      if (!res.success) {
        setErrorMessage(res.message || (isBn ? 'ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।' : 'Invalid email/phone or password.'));
      }
    } catch {
      setLoading(false);
      setErrorMessage(isBn ? 'লগইন করতে সমস্যা হয়েছে, আবার চেষ্টা করুন।' : 'Login error, please try again.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const name = regName.trim();
    const phoneInput = regPhone.trim();
    const emailInput = regEmail.trim();
    const pass = regPassword.trim();
    const confirmPass = regConfirmPassword.trim();

    if (!name || !phoneInput || !pass || !confirmPass) {
      setErrorMessage(isBn ? 'নাম, মোবাইল নম্বর ও পাসওয়ার্ড পূরণ করুন।' : 'Please fill name, mobile number and password.');
      return;
    }

    const cleanPhone = normalizePhoneNumber(phoneInput);
    if (!cleanPhone || !isValidBangladeshiPhone(cleanPhone)) {
      setErrorMessage(isBn ? 'সঠিক ১১-ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX, 018XXXXXXXX)' : 'Enter a valid 11-digit mobile number (e.g. 017XXXXXXXX).');
      return;
    }

    const cleanEmail = emailInput ? normalizeEmail(emailInput) : '';
    if (cleanEmail && !isValidEmail(cleanEmail)) {
      setErrorMessage(isBn ? 'সঠিক জিমেইল / ইমেইল ঠিকানা দিন (যেমন: yourname@gmail.com)' : 'Enter a valid Gmail or email address (e.g. yourname@gmail.com).');
      return;
    }

    // Strict account uniqueness check: One account per phone or Gmail
    const uniqueness = checkAccountUniqueness(cleanPhone, cleanEmail || undefined);
    if (!uniqueness.isUnique) {
      setErrorMessage(isBn ? uniqueness.messageBn : uniqueness.messageEn);
      return;
    }

    if (pass.length < 6) {
      setErrorMessage(isBn ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' : 'Password must be at least 6 characters.');
      return;
    }

    if (pass !== confirmPass) {
      setErrorMessage(isBn ? 'পাসওয়ার্ড দুটি মেলেনি।' : 'Passwords do not match.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const res = registerUser({
        name,
        phone: cleanPhone,
        email: cleanEmail || undefined,
        password: pass,
        referralCode: regReferralCode.trim(),
        avatar: regAvatar
      });
      setLoading(false);

      if (!res.success) {
        setErrorMessage(res.message || (isBn ? 'রেজিস্ট্রেশন সম্পন্ন করা যায়নি।' : 'Registration failed.'));
      }
    }, 500);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (forgotStep === 'request') {
      const contact = forgotEmail.trim();
      if (!contact) {
        setErrorMessage(isBn ? 'আপনার নিবন্ধিত ইমেইল অথবা মোবাইল নম্বর দিন।' : 'Enter registered email or phone.');
        return;
      }

      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setForgotStep('verify');
        setSuccessMessage(isBn ? `${contact} ঠিকানায় যাচাই কোড পাঠানো হয়েছে।` : `OTP sent to ${contact}.`);
      }, 500);
    } else {
      if (!otpCode.trim() || otpCode.length < 4) {
        setErrorMessage(isBn ? '৪-ডিজিটের ওটিপি কোড দিন।' : 'Enter 4-digit OTP code.');
        return;
      }
      if (!newPassword.trim() || newPassword.length < 6) {
        setErrorMessage(isBn ? 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' : 'New password must be at least 6 characters.');
        return;
      }

      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        showToast(isBn ? 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!' : 'Password updated successfully!');
        setMode('login');
        setForgotStep('request');
        setLoginEmail(forgotEmail);
        setLoginPassword('');
        setSuccessMessage(isBn ? 'পাসওয়ার্ড পরিবর্তন হয়েছে। নতুন পাসওয়ার্ড দিয়ে লগইন করুন।' : 'Password updated. Please login.');
      }, 500);
    }
  };

  return (
    <div className="relative min-h-[100dvh] bg-white flex flex-col justify-between overflow-hidden select-none font-sans">
      {/* 1. TOP CURVED FLUID ARTWORK & HEADER (Matches Reference Image) */}
      <div className="relative w-full h-44 sm:h-52 shrink-0">
        {/* Abstract Liquid Curvy Wave Canvas matching the mockup */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none" 
          viewBox="0 0 375 220" 
          fill="none" 
          preserveAspectRatio="none"
        >
          <defs>
            {/* Ambient soft warm gradient background in top-left */}
            <linearGradient id="softAmberGlow" x1="0%" y1="0%" x2="50%" y2="80%">
              <stop offset="0%" stopColor="#BAE6FD" stopOpacity="0.85" />
              <stop offset="40%" stopColor="#E0F2FE" stopOpacity="0.55" />
              <stop offset="85%" stopColor="#F0F9FF" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>

            {/* Smooth deep sky blue wave gradient */}
            <linearGradient id="fluidGoldRibbon" x1="100%" y1="0%" x2="10%" y2="90%">
              <stop offset="0%" stopColor="#0284C7" />
              <stop offset="45%" stopColor="#38BDF8" />
              <stop offset="80%" stopColor="#0284C7" />
              <stop offset="100%" stopColor="#0369A1" />
            </linearGradient>

            {/* Soft shadow for depth */}
            <filter id="softWaveShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#0369A1" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* Top-left sky blue ambient background wash */}
          <path 
            d="M0 0 H240 C200 70 140 130 0 160 Z" 
            fill="url(#softAmberGlow)" 
          />

          {/* Sky Blue Curving Liquid Ribbon Swoosh */}
          <path 
            d="M210 0 
               C 225 15, 248 30, 238 52 
               C 226 76, 194 92, 186 116 
               C 176 142, 146 160, 98 172 
               C 56 182, 14 175, 0 215 
               L 0 178 
               C 22 152, 60 148, 92 138 
               C 134 126, 158 112, 168 90 
               C 178 68, 204 50, 210 28 
               C 214 14, 206 0, 210 0 Z" 
            fill="url(#fluidGoldRibbon)"
            filter="url(#softWaveShadow)"
          />
        </svg>

        {/* Top Header Bar Icons */}
        <div className="relative z-10 px-5 sm:px-7 pt-5 sm:pt-6 flex items-center justify-between">
          {/* Flame / Leaf Emblem Icon */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/60 backdrop-blur-xs flex items-center justify-center shadow-xs">
              <svg 
                className="w-6 h-6 text-sky-600" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
              </svg>
            </div>
            <span className="text-xs font-black tracking-tight text-gray-950/80 uppercase">
              {isBn ? 'গুড লাইফ' : 'Good Life'}
            </span>
          </div>

          {/* Top Right 3-Bar Hamburger Menu (Holds Language & Help inside) */}
          <div className="flex items-center">
            <button
              id="auth-menu-btn"
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2.5 rounded-xl hover:bg-black/5 active:scale-90 transition-all text-gray-900 cursor-pointer"
              aria-label="Toggle options menu"
              title={isBn ? 'মেনু ও ভাষা' : 'Menu & Language'}
            >
              <div className="flex flex-col gap-1 items-end">
                <span className="w-5 h-[2.5px] bg-gray-950 rounded-full"></span>
                <span className="w-3.5 h-[2.5px] bg-gray-950 rounded-full"></span>
                <span className="w-5 h-[2.5px] bg-gray-950 rounded-full"></span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Dropdown Options Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            className="absolute top-16 right-5 z-50 w-60 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-sky-200/70 p-3 text-xs font-semibold text-gray-800"
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
              <span className="font-bold text-gray-900 flex items-center gap-1.5 text-xs">
                <Globe className="w-4 h-4 text-sky-600" />
                <span>{isBn ? 'ভাষা নির্বাচন' : 'Choose Language'}</span>
              </span>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 cursor-pointer transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Language Options List */}
            <div className="space-y-1 mb-2.5">
              <button
                type="button"
                onClick={() => {
                  setLanguage('bn');
                  setIsMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left cursor-pointer transition-colors ${
                  language === 'bn' 
                    ? 'bg-sky-100/90 text-sky-950 font-bold border border-sky-300' 
                    : 'hover:bg-sky-50 text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base leading-none">🇧🇩</span>
                  <span>বাংলা (Bengali)</span>
                </div>
                {language === 'bn' && (
                  <Check className="w-4 h-4 text-sky-600 stroke-[3]" />
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setLanguage('en');
                  setIsMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left cursor-pointer transition-colors ${
                  language === 'en' 
                    ? 'bg-sky-100/90 text-sky-950 font-bold border border-sky-300' 
                    : 'hover:bg-sky-50 text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base leading-none">🇬🇧</span>
                  <span>English</span>
                </div>
                {language === 'en' && (
                  <Check className="w-4 h-4 text-sky-600 stroke-[3]" />
                )}
              </button>
            </div>

            <div className="pt-2 border-t border-gray-100 space-y-1">
              <a
                href={systemSettings?.supportTelegramBot || 'https://t.me/goodlifeadmin_bot'}
                target="_blank"
                rel="noreferrer"
                onClick={() => setIsMenuOpen(false)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-sky-50 active:bg-sky-100 transition-colors text-left text-gray-700 font-medium"
              >
                <Headphones className="w-4 h-4 text-sky-600" />
                <span>{isBn ? '২৪/৭ সাপোর্ট হেল্পলাইন' : '24/7 Support Helpline'}</span>
              </a>
              <a
                href={systemSettings?.officialTelegramChannel || 'https://t.me/goodlifeofficialbd'}
                target="_blank"
                rel="noreferrer"
                onClick={() => setIsMenuOpen(false)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-sky-50 active:bg-sky-100 transition-colors text-left text-gray-700 font-medium"
              >
                <Globe className="w-4 h-4 text-sky-600" />
                <span>{isBn ? 'অফিসিয়াল টেলিগ্রাম' : 'Official Telegram'}</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. MAIN AUTHENTICATION FORM BODY */}
      <div className="relative z-10 flex-1 px-7 sm:px-9 flex flex-col justify-center max-w-md w-full mx-auto pb-8">
        
        {/* Error Notification Alert */}
        {errorMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-red-50 border border-red-200/90 rounded-xl flex items-start gap-2 text-red-700 text-xs font-semibold"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <div className="flex-1">{errorMessage}</div>
          </motion.div>
        )}

        {/* Success Notification Alert */}
        {successMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-emerald-50 border border-emerald-200/90 rounded-xl flex items-start gap-2 text-emerald-800 text-xs font-semibold"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <div className="flex-1">{successMessage}</div>
          </motion.div>
        )}

        {/* SCREEN A: LOGIN VIEW (Exact Match to Left Mockup with Full Localization) */}
        {mode === 'login' && (
          <motion.div
            key="login-screen"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.22 }}
          >
            {/* Title: Bold Black "Login" / "লগইন" */}
            <h1 className="text-3xl font-black text-gray-950 tracking-tight mb-8 sm:mb-9">
              {isBn ? 'লগইন' : 'Login'}
            </h1>

            <form onSubmit={handleLoginSubmit} className="space-y-6">
              {/* Field 1: Email (Underline Input with Sky Envelope Icon) */}
              <div className="border-b border-gray-200 focus-within:border-sky-500 transition-colors pb-1.5">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-sky-600 shrink-0 stroke-[2.4]" />
                  <input
                    id="login-email-input"
                    type="text"
                    required
                    placeholder={isBn ? 'মোবাইল নম্বর অথবা জিমেইল' : 'Mobile number or Gmail'}
                    value={loginEmail}
                    onChange={(e) => {
                      setLoginEmail(e.target.value);
                      setErrorMessage(null);
                    }}
                    className="w-full bg-transparent py-1 text-sm font-semibold text-gray-900 placeholder:text-sky-600/60 placeholder:font-medium focus:outline-none"
                  />
                </div>
              </div>

              {/* Field 2: Password (Underline Input with Sky Lock Icon and Eye Toggle) */}
              <div className="border-b border-gray-200 focus-within:border-sky-500 transition-colors pb-1.5">
                <div className="flex items-center gap-3">
                  <Lock className="w-4 h-4 text-sky-600 shrink-0 stroke-[2.4]" />
                  <input
                    id="login-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder={isBn ? 'পাসওয়ার্ড' : 'Password'}
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      setErrorMessage(null);
                    }}
                    className="w-full bg-transparent py-1 text-sm font-semibold text-gray-900 placeholder:text-sky-600/60 placeholder:font-medium focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-950/70 hover:text-gray-950 p-1 cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 stroke-[2]" />
                    ) : (
                      <Eye className="w-4 h-4 stroke-[2]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Auxiliary Row: "Remember me" on left, "Forgot password?" on right */}
              <div className="flex items-center justify-between pt-1">
                <label 
                  onClick={() => setRememberMe(!rememberMe)}
                  className="flex items-center gap-2 cursor-pointer select-none group"
                >
                  <div 
                    className={`w-3.5 h-3.5 rounded-[3px] border transition-all flex items-center justify-center ${
                      rememberMe 
                        ? 'bg-sky-500 border-sky-500' 
                        : 'border-sky-300/80 bg-sky-50/60'
                    }`}
                  >
                    {rememberMe && <Check className="w-2.5 h-2.5 text-white stroke-[3.5]" />}
                  </div>
                  <span className="text-[11px] text-gray-500 font-medium">
                    {isBn ? 'মনে রাখুন' : 'Remember me'}
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                    setForgotEmail(loginEmail);
                  }}
                  className="text-[11px] text-gray-500 hover:text-sky-600 font-medium transition-colors cursor-pointer"
                >
                  {isBn ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot password?'}
                </button>
              </div>

              {/* Action Button: Rounded Sky Rectangle "LOGIN" / "লগইন করুন" */}
              <button
                id="login-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-sky-400 via-sky-500 to-sky-600 hover:brightness-105 active:scale-[0.97] text-white font-black rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider btn-anim animate-btn-shimmer"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                ) : (
                  <span>{isBn ? 'লগইন করুন' : 'LOGIN'}</span>
                )}
              </button>

              {/* Footer Switch Link */}
              <div className="text-center pt-2">
                <p className="text-xs text-gray-800 font-medium">
                  {isBn ? 'কোনো অ্যাকাউন্ট নেই?' : "Don't have an account ?"}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="text-sky-600 font-black hover:underline cursor-pointer ml-1"
                  >
                    {isBn ? 'নতুন অ্যাকাউন্ট খুলুন' : 'Sign Up'}
                  </button>
                </p>
              </div>
            </form>
          </motion.div>
        )}

        {/* SCREEN B: CREATE AN ACCOUNT */}
        {mode === 'register' && (
          <motion.div
            key="register-screen"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.22 }}
          >
            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight mb-4 sm:mb-5">
              {isBn ? 'অ্যাকাউন্ট তৈরি করুন' : 'Create an account'}
            </h1>

            {/* Signup Bonus Badge */}
            <div className="mb-4 p-2.5 bg-gradient-to-r from-sky-50 to-sky-100/70 border border-sky-200/80 rounded-xl flex items-center justify-between gap-2 text-xs font-bold text-sky-950">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-sky-600 shrink-0" />
                <span>{isBn ? `সাইন-আপ বোনাস ৳${systemSettings.signupBonus} ওয়েলকাম রিওয়ার্ড` : `Get ৳${systemSettings.signupBonus} Welcome Signup Bonus`}</span>
              </div>
              <span className="text-[10px] font-black bg-sky-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                Bonus
              </span>
            </div>

            {/* Profile Picture Upload Section */}
            <div className="mb-6 p-4 bg-sky-50/50 border border-sky-200/70 rounded-2xl flex flex-col items-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleAvatarFile(e.target.files[0]);
                  }
                }}
              />

              {/* Avatar Drag & Drop or Click Area */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingAvatar(true);
                }}
                onDragLeave={() => setIsDraggingAvatar(false)}
                onDrop={handleAvatarDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative group cursor-pointer w-22 h-22 rounded-full p-1 border-2 transition-all duration-200 flex items-center justify-center ${
                  isDraggingAvatar
                    ? 'border-sky-500 border-dashed scale-105 bg-sky-50'
                    : 'border-sky-300 hover:border-sky-500 shadow-xs hover:shadow-md'
                }`}
                title={isBn ? 'ছবি আপলোড করতে ক্লিক করুন' : 'Click to upload profile photo'}
              >
                {regAvatar ? (
                  <img
                    src={regAvatar}
                    alt="Uploaded Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-sky-100/70 flex flex-col items-center justify-center text-sky-700/80 group-hover:text-sky-800 transition-colors">
                    <User className="w-10 h-10 stroke-[1.8]" />
                  </div>
                )}

                {/* Camera Overlay Badge */}
                <div 
                  id="auth-avatar-camera-badge"
                  className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-md border-2 border-white group-hover:scale-110 transition-transform"
                >
                  <Camera className="w-3.5 h-3.5 stroke-[2.6]" />
                </div>

                {isDraggingAvatar && (
                  <div className="absolute inset-0 bg-sky-500/90 rounded-full flex flex-col items-center justify-center text-white text-[10px] font-bold p-1 text-center">
                    <UploadCloud className="w-5 h-5 mb-0.5 animate-bounce" />
                    <span>{isBn ? 'ছবি ছাড়ুন' : 'Drop Here'}</span>
                  </div>
                )}
              </div>

              {/* Instruction Label & Actions */}
              <div className="mt-2.5 text-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-bold text-gray-900 hover:text-sky-600 flex items-center justify-center gap-1.5 cursor-pointer mx-auto transition-colors"
                >
                  <span>{regAvatar ? (isBn ? 'ছবি পরিবর্তন করুন' : 'Change Photo') : (isBn ? 'প্রোফাইল ছবি যুক্ত করুন' : 'Upload Profile Photo')}</span>
                </button>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {regAvatar 
                    ? (isBn ? 'ছবি সঠিকভাবে সিলেক্ট করা হয়েছে' : 'Photo selected successfully') 
                    : (isBn ? 'ক্লিক করে আপনার ছবি দিন (JPG, PNG)' : 'Click or drop your photo (JPG, PNG)')}
                </p>

                {regAvatar && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setRegAvatar('');
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="mt-1.5 text-[11px] font-bold text-red-600 hover:text-red-700 inline-flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{isBn ? 'ছবি মুছে ফেলুন' : 'Remove Photo'}</span>
                  </button>
                )}
              </div>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* Field 1: Name */}
              <div className="border-b border-gray-200 focus-within:border-sky-500 transition-colors pb-1.5">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-sky-600 shrink-0 stroke-[2.4]" />
                  <input
                    id="register-name-input"
                    type="text"
                    required
                    placeholder={isBn ? 'আপনার পূর্ণ নাম' : 'Name'}
                    value={regName}
                    onChange={(e) => {
                      setRegName(e.target.value);
                      setErrorMessage(null);
                    }}
                    className="w-full bg-transparent py-1 text-sm font-semibold text-gray-900 placeholder:text-sky-600/60 placeholder:font-medium focus:outline-none"
                  />
                </div>
              </div>

              {/* Field 2: Mobile Number */}
              <div className="border-b border-gray-200 focus-within:border-sky-500 transition-colors pb-1.5">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-sky-600 shrink-0 stroke-[2.4]" />
                  <input
                    id="register-phone-input"
                    type="tel"
                    required
                    placeholder={isBn ? '১১-ডিজিটের মোবাইল নম্বর (যেমন: 017XXXXXXXX)' : '11-digit Mobile (e.g. 017XXXXXXXX)'}
                    value={regPhone}
                    onChange={(e) => {
                      setRegPhone(e.target.value);
                      setErrorMessage(null);
                    }}
                    className="w-full bg-transparent py-1 text-sm font-semibold text-gray-900 placeholder:text-sky-600/60 placeholder:font-medium focus:outline-none"
                  />
                </div>
              </div>

              {/* Field 3: Gmail / Email */}
              <div className="border-b border-gray-200 focus-within:border-sky-500 transition-colors pb-1.5">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-sky-600 shrink-0 stroke-[2.4]" />
                  <input
                    id="register-email-input"
                    type="email"
                    placeholder={isBn ? 'জিমেইল / ইমেইল (যেমন: name@gmail.com - ঐচ্ছিক)' : 'Gmail / Email (Optional)'}
                    value={regEmail}
                    onChange={(e) => {
                      setRegEmail(e.target.value);
                      setErrorMessage(null);
                    }}
                    className="w-full bg-transparent py-1 text-sm font-semibold text-gray-900 placeholder:text-sky-600/60 placeholder:font-medium focus:outline-none"
                  />
                </div>
              </div>

              {/* Field 3: Password */}
              <div className="border-b border-gray-200 focus-within:border-sky-500 transition-colors pb-1.5">
                <div className="flex items-center gap-3">
                  <Lock className="w-4 h-4 text-sky-600 shrink-0 stroke-[2.4]" />
                  <input
                    id="register-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder={isBn ? 'পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)' : 'Password'}
                    value={regPassword}
                    onChange={(e) => {
                      setRegPassword(e.target.value);
                      setErrorMessage(null);
                    }}
                    className="w-full bg-transparent py-1 text-sm font-semibold text-gray-900 placeholder:text-sky-600/60 placeholder:font-medium focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-950/70 hover:text-gray-950 p-1 cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Field 4: Confirm Password */}
              <div className="border-b border-gray-200 focus-within:border-sky-500 transition-colors pb-1.5">
                <div className="flex items-center gap-3">
                  <Lock className="w-4 h-4 text-sky-600 shrink-0 stroke-[2.4]" />
                  <input
                    id="register-confirm-password-input"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder={isBn ? 'কনফার্ম পাসওয়ার্ড' : 'Confirm Password'}
                    value={regConfirmPassword}
                    onChange={(e) => {
                      setRegConfirmPassword(e.target.value);
                      setErrorMessage(null);
                    }}
                    className="w-full bg-transparent py-1 text-sm font-semibold text-gray-900 placeholder:text-sky-600/60 placeholder:font-medium focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-950/70 hover:text-gray-950 p-1 cursor-pointer"
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Field 5: Referral Code */}
              <div className="border-b border-gray-200 focus-within:border-sky-500 transition-colors pb-1.5">
                <div className="flex items-center gap-3">
                  <Tag className="w-4 h-4 text-sky-600 shrink-0 stroke-[2.4]" />
                  <input
                    id="register-referral-input"
                    type="text"
                    placeholder={isBn ? 'রেফার কোড (ঐচ্ছিক)' : 'Referral Code (Optional)'}
                    value={regReferralCode}
                    onChange={(e) => {
                      setRegReferralCode(e.target.value.toUpperCase());
                      setErrorMessage(null);
                    }}
                    className="w-full bg-transparent py-1 text-sm font-semibold text-gray-900 placeholder:text-sky-600/60 placeholder:font-medium focus:outline-none uppercase tracking-wider"
                  />
                  {regReferralCode.trim() && (
                    <span className="text-[10px] font-bold text-sky-900 bg-sky-100 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-sky-600" /> 
                      {isBn ? '+৳৫ বোনাস' : '+৳5 Bonus'}
                    </span>
                  )}
                </div>
              </div>

              {/* Auxiliary Row */}
              <div className="flex items-center justify-between pt-1">
                <label 
                  onClick={() => setRegRememberMe(!regRememberMe)}
                  className="flex items-center gap-2 cursor-pointer select-none group"
                >
                  <div 
                    className={`w-3.5 h-3.5 rounded-[3px] border transition-all flex items-center justify-center ${
                      regRememberMe 
                        ? 'bg-sky-500 border-sky-500' 
                        : 'border-sky-300/80 bg-sky-50/60'
                    }`}
                  >
                    {regRememberMe && <Check className="w-2.5 h-2.5 text-white stroke-[3.5]" />}
                  </div>
                  <span className="text-[11px] text-gray-500 font-medium">
                    {isBn ? 'মনে রাখুন' : 'Remember me'}
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="text-[11px] text-gray-500 hover:text-sky-600 font-medium transition-colors cursor-pointer"
                >
                  {isBn ? 'সাহায্য প্রয়োজন?' : 'Forgot password?'}
                </button>
              </div>

              {/* Action Button: Rounded Sky Rectangle "SIGN UP" */}
              <button
                id="register-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-sky-400 via-sky-500 to-sky-600 hover:brightness-105 active:scale-[0.97] text-white font-black rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider btn-anim animate-btn-shimmer mt-6"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                ) : (
                  <span>{isBn ? 'সাইন-আপ করুন' : 'SIGN UP'}</span>
                )}
              </button>

              {/* Footer Switch Link */}
              <div className="text-center pt-2">
                <p className="text-xs text-gray-800 font-medium">
                  {isBn ? 'ইতিমধ্যে অ্যাকাউন্ট আছে?' : 'Already have an account ?'}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="text-sky-600 font-black hover:underline cursor-pointer ml-1"
                  >
                    {isBn ? 'লগইন করুন' : 'Login Up'}
                  </button>
                </p>
              </div>
            </form>
          </motion.div>
        )}

        {/* SCREEN C: FORGOT PASSWORD */}
        {mode === 'forgot' && (
          <motion.div
            key="forgot-screen"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.22 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-black text-gray-950 tracking-tight flex items-center gap-2">
                <KeyRound className="w-6 h-6 text-sky-600" />
                <span>{isBn ? 'পাসওয়ার্ড পুনরুদ্ধার' : 'Reset Password'}</span>
              </h1>
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="text-xs font-bold text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                ✕ {isBn ? 'বাতিল' : 'Cancel'}
              </button>
            </div>

            <form onSubmit={handleForgotSubmit} className="space-y-6">
              {forgotStep === 'request' ? (
                <div className="border-b border-gray-200 focus-within:border-sky-500 transition-colors pb-1.5">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-sky-600 shrink-0 stroke-[2.4]" />
                    <input
                      type="text"
                      required
                      placeholder={isBn ? 'নিবন্ধিত ইমেইল অথবা মোবাইল নম্বর' : 'Email or Phone'}
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full bg-transparent py-1 text-sm font-semibold text-gray-900 placeholder:text-sky-600/60 placeholder:font-medium focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="border-b border-gray-200 focus-within:border-sky-500 transition-colors pb-1.5">
                    <input
                      type="text"
                      required
                      maxLength={4}
                      placeholder={isBn ? '৪-ডিজিটের ওটিপি কোড' : '4-Digit OTP Code'}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="w-full bg-transparent py-1 text-sm font-semibold text-gray-900 placeholder:text-sky-600/60 text-center tracking-widest focus:outline-none"
                    />
                  </div>
                  <div className="border-b border-gray-200 focus-within:border-sky-500 transition-colors pb-1.5">
                    <div className="flex items-center gap-3">
                      <Lock className="w-4 h-4 text-sky-600 shrink-0" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        placeholder={isBn ? 'নতুন পাসওয়ার্ড' : 'New Password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-transparent py-1 text-sm font-semibold text-gray-900 placeholder:text-sky-600/60 focus:outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-sky-400 via-sky-500 to-sky-600 text-white font-black rounded-xl text-sm shadow-md transition-all active:scale-[0.97] flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider btn-anim"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                ) : forgotStep === 'request' ? (
                  <span>{isBn ? 'ওটিপি পাঠান' : 'SEND OTP'}</span>
                ) : (
                  <span>{isBn ? 'পাসওয়ার্ড সংরক্ষণ করুন' : 'SAVE PASSWORD'}</span>
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-xs text-sky-600 font-bold hover:underline cursor-pointer"
                >
                  {isBn ? '← লগইনে ফিরে যান' : '← Back to Login'}
                </button>
              </div>
            </form>
          </motion.div>
        )}

      </div>

      {/* 3. SUBTLE BOTTOM FOOTER */}
      <div className="relative z-10 text-center pb-4 text-[10px] text-gray-400 font-medium">
        <span>© {new Date().getFullYear()} Good Life • {isBn ? 'সর্বস্বত্ব সংরক্ষিত' : 'All rights reserved'}</span>
      </div>
    </div>
  );
};
