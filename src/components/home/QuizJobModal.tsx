import React from 'react';
import { QuizPlayerModal } from '../quiz/QuizPlayerModal';

interface QuizJobModalProps {
  onClose: () => void;
}

export const QuizJobModal: React.FC<QuizJobModalProps> = ({ onClose }) => {
  return <QuizPlayerModal onClose={onClose} />;
};
