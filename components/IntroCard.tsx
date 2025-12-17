import React from 'react';

interface IntroCardProps {
  children: React.ReactNode;
  index: number;
}

// --- Ancient Egyptian Icons ---

const PyramidIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2L2 22h20L12 2z" />
    <path d="M12 2v20" />
    <path d="M2 22h20" />
    <path d="M12 6l-5 16" opacity="0.5" />
    <path d="M12 6l5 16" opacity="0.5" />
  </svg>
);

const EyeIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
    <path d="M20 12c0 5-4 9-9 9 0 0-2 0-3-1" />
    <path d="M11 20v3" />
    <path d="M22 12c-1-3-4-7-10-7" opacity="0.5" />
  </svg>
);

const AnkhIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2c3 0 5 2.5 5 5.5S14.5 12 12 12s-5-2-5-5.5S9 2 12 2z" />
    <path d="M12 12v10" />
    <path d="M6 15h12" />
  </svg>
);

const ScarabIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 5c-3 0-6 3-6 8 0 5 2 9 6 9s6-4 6-9c0-5-3-8-6-8z" />
    <path d="M12 2v3" />
    <path d="M9 4l-3-2" />
    <path d="M15 4l3-2" />
    <path d="M12 13v9" />
    <path d="M12 5l-3 7h6l-3-7z" opacity="0.6" />
  </svg>
);

const LotusIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
     <path d="M12 21c-4-5-7-10-7-14a7 7 0 0 1 14 0c0 4-3 9-7 14z" />
     <path d="M12 21c4-5 8-8 10-9" opacity="0.5" />
     <path d="M12 21c-4-5-8-8-10-9" opacity="0.5" />
     <path d="M12 10a2 2 0 1 0 0-4 2 2 0 0 0 4z" />
  </svg>
);

const StarIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2l3 6 6 3-6 3-3 6-3-6-6-3 6-3 3-6z" />
    <circle cx="12" cy="12" r="3" />
    <circle cx="12" cy="12" r="6" opacity="0.3" />
  </svg>
);

const CylinderIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Cylinder Body */}
    <path d="M7 5h10" strokeLinecap="butt"/>
    <path d="M7 19h10" strokeLinecap="butt"/>
    <path d="M7 5c-1.66 0-3 3.13-3 7s1.34 7 3 7" />
    <path d="M17 5c1.66 0 3 3.13 3 7s-1.34 7-3 7" />
    <ellipse cx="7" cy="12" rx="3" ry="7" />
    
    {/* Engravings */}
    <path d="M11 10c0 0 2-2 4 0" opacity="0.8"/>
    <path d="M13 12c0 0-1 1-2 1" opacity="0.8"/>
    <circle cx="13" cy="10" r="0.5" fill="currentColor"/>
    
    <path d="M11 15h3" opacity="0.6"/>
    <path d="M11 8h1" opacity="0.6"/>
    <path d="M14 8h1" opacity="0.6"/>
  </svg>
);

const ICONS = [PyramidIcon, EyeIcon, AnkhIcon, ScarabIcon, LotusIcon, StarIcon, CylinderIcon];

const IntroCard: React.FC<IntroCardProps> = ({ children, index }) => {
  // Select icon based on index
  const IconComponent = ICONS[index % ICONS.length];

  return (
    <div 
      className="relative flex-none w-[60vw] sm:w-[260px] aspect-[3/2] overflow-hidden rounded-2xl bg-black border border-slate-800 shadow-2xl snap-center group isolate select-none transition-transform duration-500 hover:scale-[1.02]"
    >
      {/* Background Gradient */}
      <div className={`absolute inset-0 z-0 bg-gradient-to-br ${getGradient(index)} opacity-30`} />
      
      {/* Top Half: Centered Ancient Icon */}
      <div className="absolute top-0 left-0 right-0 h-1/2 flex items-center justify-center z-10 pointer-events-none">
          <div className="text-white/40 group-hover:text-white/60 transition-all duration-500 drop-shadow-[0_0_15px_rgba(255,255,255,0.15)] transform group-hover:scale-110">
             <IconComponent className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>
      </div>

      {/* Dark Polarised Gradient Overlay (Behind Text) */}
      <div className="absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-black via-slate-950/90 to-transparent pointer-events-none z-10" />
      
      {/* Text Overlay */}
      <div className="absolute inset-0 z-20 flex flex-col justify-end p-4 sm:p-5 pointer-events-none">
        <div className="transform transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-105 origin-bottom-left">
           <p className="text-sm sm:text-base font-bold text-white leading-snug tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
            {children}
           </p>
           {/* Decorative line */}
           <div className="w-10 h-0.5 bg-indigo-500 mt-3 rounded-full opacity-90 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
        </div>
      </div>
    </div>
  );
};

// Helper to generate distinct gradients for cards
function getGradient(index: number): string {
  const gradients = [
    'from-slate-900 via-indigo-950 to-slate-900',
    'from-slate-900 via-slate-800 to-indigo-950',
    'from-indigo-950 via-slate-900 to-black',
    'from-slate-900 via-purple-950/30 to-slate-900',
    'from-slate-800 via-slate-900 to-slate-800',
    'from-indigo-900 via-blue-900 to-slate-900',
    'from-emerald-950 via-slate-900 to-black'
  ];
  return gradients[index % gradients.length];
}

export default IntroCard;