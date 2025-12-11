import React, { useState } from 'react';
import { ImageOff } from 'lucide-react';

interface IntroCardProps {
  children: React.ReactNode;
  image?: string;
  index: number;
}

const IntroCard: React.FC<IntroCardProps> = ({ children, image, index }) => {
  const [hasError, setHasError] = useState(false);

  // Use image if provided and no error occurred loading it
  const showImage = image && !hasError;

  const handleImageError = () => {
    // Only log if we haven't already marked it as errored to prevent console spam
    if (!hasError) {
      console.warn(`Failed to load image at path: ${image}`);
      setHasError(true);
    }
  };

  return (
    <div 
      className="relative flex-none w-[85vw] sm:w-[350px] aspect-[3/4] overflow-hidden rounded-3xl bg-black border border-slate-800 shadow-2xl snap-center group isolate"
    >
      {/* Background */}
      {showImage ? (
        <div className="absolute inset-0 z-0">
          <img 
            src={image} 
            alt="Visual context for microphenomenology" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90"
            onError={handleImageError}
          />
          {/* Gradient Overlay for legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        </div>
      ) : (
        <div className={`absolute inset-0 z-0 bg-gradient-to-br ${getGradient(index)} opacity-50`}>
           {/* Fallback pattern or icon if image failed */}
           {hasError && (
             <div className="absolute inset-0 flex items-center justify-center opacity-10">
                <ImageOff className="w-24 h-24 text-white" />
             </div>
           )}
        </div>
      )}
      
      {/* Text Overlay */}
      <div className="absolute inset-0 z-10 flex flex-col justify-end p-6 sm:p-8 pointer-events-none">
        <div className="transform transition-transform duration-500 group-hover:-translate-y-2">
           <p className="text-xl sm:text-2xl font-bold text-white leading-snug tracking-tight drop-shadow-lg shadow-black">
            {children}
           </p>
           {/* Decorative line */}
           <div className="w-12 h-1 bg-indigo-500 mt-4 rounded-full opacity-90" />
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