import React from 'react';

interface IntroCardProps {
  children: React.ReactNode;
  image?: string;
  index: number;
}

const IntroCard: React.FC<IntroCardProps> = ({ children, image, index }) => {
  return (
    <div 
      className="relative flex-none w-[85vw] sm:w-[400px] aspect-[3/4] sm:aspect-[4/3] overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl snap-center group isolate"
    >
      {/* Background */}
      {image ? (
        <div className="absolute inset-0 z-0">
          <img 
            src={image} 
            alt="Background" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80"
          />
          {/* Gradient Overlay for legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/90" />
        </div>
      ) : (
        <div className={`absolute inset-0 z-0 bg-gradient-to-br ${getGradient(index)} opacity-50`} />
      )}
      
      {/* Text Overlay */}
      <div className="absolute inset-0 z-10 flex flex-col justify-end p-6 sm:p-8">
        <div className="transform transition-transform duration-500 group-hover:-translate-y-2">
           <p className="text-2xl sm:text-3xl font-bold text-white leading-tight tracking-tight drop-shadow-md">
            {children}
           </p>
           {/* Decorative line */}
           <div className="w-12 h-1 bg-indigo-500 mt-4 rounded-full opacity-80" />
        </div>
      </div>
    </div>
  );
};

// Helper to generate distinct gradients for cards without images
function getGradient(index: number): string {
  const gradients = [
    'from-slate-900 via-indigo-950 to-slate-900',
    'from-slate-900 via-slate-800 to-indigo-950',
    'from-indigo-950 via-slate-900 to-black',
    'from-slate-900 via-purple-950/30 to-slate-900',
    'from-slate-800 via-slate-900 to-slate-800'
  ];
  return gradients[index % gradients.length];
}

export default IntroCard;