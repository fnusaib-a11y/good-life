import React from 'react';
import { Clock } from 'lucide-react';
import { Transaction } from '../../types';

interface TransactionItemProps {
  tx: Transaction;
  isBn: boolean;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ tx, isBn }) => {
  return (
    <div 
      className="p-3 bg-white border border-gray-200/80 rounded-2xl flex items-center justify-between gap-3 shadow-2xs hover:border-sky-300 transition-colors"
    >
      <div className="min-w-0">
        <span className="text-xs font-bold text-gray-950 block truncate">
          {tx.description || (isBn ? 'আয় রিওয়ার্ড' : 'Reward Income')}
        </span>
        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-0.5">
          <Clock className="w-3 h-3 text-gray-400" />
          <span>{tx.date || (isBn ? 'আজ' : 'Today')}</span>
          <span>•</span>
          <span className="capitalize text-emerald-600 font-bold">{tx.status || 'completed'}</span>
        </div>
      </div>

      <div className="text-right shrink-0">
        <span className={`text-xs sm:text-sm font-black font-mono ${
          tx.type === 'withdrawal' || tx.type === 'job_payment' ? 'text-rose-600' : 'text-emerald-700'
        }`}>
          {tx.type === 'withdrawal' || tx.type === 'job_payment' ? '-' : '+'}৳{Number(tx.amount || 0).toFixed(2)}
        </span>
      </div>
    </div>
  );
};

export default TransactionItem;
