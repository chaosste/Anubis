import React, { useEffect, useRef } from 'react';
import { TranscriptionItem } from '../types';

interface TranscriptProps {
  items: TranscriptionItem[];
}

const Transcript: React.FC<TranscriptProps> = ({ items }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [items]);

  if (items.length === 0) return null;

  return (
    <div className="w-full max-w-2xl mx-auto mt-4 sm:mt-8 p-3 sm:p-4 bg-slate-900/50 rounded-2xl sm:rounded-3xl border border-slate-800 h-64 sm:h-80 overflow-y-auto shadow-inner no-scrollbar">
      <div className="space-y-4 sm:space-y-6">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex ${
              item.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[80%] px-5 py-3.5 sm:px-6 sm:py-4 rounded-2xl text-sm leading-relaxed tracking-wide shadow-sm ${
                item.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-sm'
                  : 'bg-slate-800 text-slate-200 border border-slate-700/50 rounded-bl-sm'
              }`}
            >
              <p>{item.text}</p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default Transcript;