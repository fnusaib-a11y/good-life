import React from 'react';

export const MobileFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-[#F0F9FF] flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      <div className="w-full max-w-5xl lg:max-w-6xl mx-auto flex-1 flex flex-col shadow-xs bg-[#F0F9FF]">
        {children}
      </div>
    </div>
  );
};

export default MobileFrame;
