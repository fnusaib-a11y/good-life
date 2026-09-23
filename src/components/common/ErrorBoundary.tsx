import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetAndReload = () => {
    try {
      // Clear non-essential items in case of corrupted local storage
      const keepKeys = ['lg_user', 'lg_wallet', 'lg_logged_in'];
      Object.keys(localStorage).forEach(key => {
        if (!keepKeys.includes(key)) {
          localStorage.removeItem(key);
        }
      });
    } catch {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 text-center space-y-5">
            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto text-amber-500 border border-amber-200">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg sm:text-xl font-black text-gray-900">
                সাময়িক একটি ত্রুটি হয়েছে
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                অ্যাপ্লিকেশনে ডেটা প্রসেসিংয়ের সময় অপ্রত্যাশিত কোনো ত্রুটি দেখা দিয়েছে। নিচের বাটনে ক্লিক করে পেজটি রিলোড করুন।
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 bg-gray-50 rounded-xl text-[11px] text-gray-600 text-left font-mono break-all max-h-24 overflow-y-auto border border-gray-200">
                {this.state.error.message}
              </div>
            )}

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white text-xs sm:text-sm font-black rounded-2xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>পেজ রিলোড করুন (Reload)</span>
              </button>

              <button
                type="button"
                onClick={this.handleResetAndReload}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>ক্যাশ ক্লিয়ার করে রিলোড করুন</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
