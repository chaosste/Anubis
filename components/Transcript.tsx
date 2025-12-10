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
    <div className="w-full max-w-2xl mx-auto mt-8 p-4 bg-slate-900/50 rounded-2xl border border-slate-800 h-64 overflow-y-auto shadow-inner no-scrollbar">
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex ${
              item.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm leading-relaxed ${
                item.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none'
                  : 'bg-slate-800 text-slate-200 border border-slate-700 shadow-sm rounded-bl-none'
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