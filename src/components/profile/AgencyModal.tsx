import React from 'react';
import { X, Briefcase, Clock, Building2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AgencyModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { isBn } = useApp();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-scale-up border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-500 to-sky-600 px-4 py-3.5 flex items-center justify-between text-white shadow-xs">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-white" />
            <h3 className="font-extrabold text-base text-white">
              {isBn ? 'এজেন্সি হাব ও ড্যাশবোর্ড' : 'Agency Hub & Dashboard'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition-colors text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Coming Soon Body */}
        <div className="p-6 text-center space-y-4 flex flex-col items-center">
          <div className="w-18 h-18 rounded-3xl bg-purple-50 border border-purple-200/80 flex items-center justify-center text-purple-600 shadow-xs">
            <Building2 className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <span className="inline-block px-3.5 py-1 bg-purple-100 text-purple-900 font-black text-xs rounded-full uppercase tracking-wider">
              Coming soon ...
            </span>
            <h3 className="font-black text-lg text-gray-900 pt-1">
              {isBn ? 'এজেন্সি পার্টনারশিপ হাব' : 'Agency Partnership Hub'}
            </h3>
            <p className="text-xs text-gray-600 font-semibold max-w-xs mx-auto leading-relaxed">
              {isBn 
                ? 'জেলা ও উপজেলাভিত্তিক অফিসিয়াল এজেন্সি নিয়োগ ও নেটওয়ার্ক ম্যানেজমেন্ট সিস্টেম।'
                : 'District-wise agency manager appointment and partner network management.'}
            </p>
          </div>

          <div className="w-full bg-purple-50/60 border border-purple-200/60 rounded-2xl p-3.5 text-left text-xs space-y-1">
            <div className="flex items-center gap-2 font-black text-purple-950">
              <Clock className="w-4 h-4 text-purple-600" />
              <span>{isBn ? 'স্ট্যাটাস: সিস্টেম ইন্টিগ্রেশন চলমান' : 'Status: System Integration in Progress'}</span>
            </div>
            <p className="text-[11px] text-purple-900/80 font-medium pl-6 leading-normal">
              {isBn 
                ? 'এজেন্সি আবেদন এবং অনুমোদন মডিউল খুব শীঘ্রই সক্রিয় করা হবে।'
                : 'Agency application and management modules will be activated shortly.'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3.5 bg-sky-500 hover:bg-sky-600 text-white font-black rounded-2xl text-xs shadow-md active:scale-95 transition-all cursor-pointer"
          >
            {isBn ? 'ঠিক আছে / ফিরে যান' : 'Got it / Go Back'}
          </button>
        </div>
      </div>
    </div>
  );
};
