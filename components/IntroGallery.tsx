import React from 'react';
import IntroCard from './IntroCard';
import { useDraggableScroll } from '../hooks/useDraggableScroll';

interface IntroGalleryProps {
    onLoginClick: () => void;
}

const IntroGallery: React.FC<IntroGalleryProps> = ({ onLoginClick }) => {
    const { ref, isDragging, events } = useDraggableScroll();

    const CARDS = [
        { id: 1, content: <>Granular witnessing empowered by <span className="text-indigo-400">neurophenomenology</span> interview techniques.</> },
        { id: 2, content: <>Anubis listens, aiding meaningful integration of <span className="text-indigo-300">anomalous experiences</span>.</> },
        { id: 3, content: <>Explore the meaning, sensation, accents, atmosphere, shifts and ambiguity of your <span className="text-indigo-400">visionary states</span>.</> },
        { id: 4, content: <>Anubis gently encourages <span className="text-indigo-300">scrutiny</span>: memory gathers momentum and vision flows more clearly.</> },
        { id: 5, content: <>Each trip is <span className="text-indigo-400">unique</span>: it can be elusive, ecstatic, bizarre, sombre, adoring, contrary, all at once.</> },
        { id: 6, content: <>Choose from two guides, psychopomp Anubis or goddess <span className="text-indigo-400">Ishtar</span>.</> },
        { id: 7, content: <>Experiences are not recorded. You can <button onClick={onLoginClick} className="text-indigo-400 hover:text-indigo-300 font-medium underline underline-offset-4 decoration-indigo-500/30 hover:decoration-indigo-400 transition-all pointer-events-auto">log in</button> to store them safely on your computer.</> }
    ];

    return (
        <div className="w-full mb-2 sm:mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <div className="px-4 mb-2 sm:mb-6">
                <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                  Anubis hears you.
                </h2>
             </div>
             
             <div 
               ref={ref}
               {...events}
               style={{ scrollSnapType: isDragging ? 'none' : 'x mandatory' }}
               className={`w-full overflow-x-auto pb-4 pt-1 px-4 flex gap-4 snap-x snap-mandatory no-scrollbar transition-all ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
             >
                {CARDS.map((card, index) => (
                  <IntroCard key={card.id} index={index}>
                    {card.content}
                  </IntroCard>
                ))}
                <div className="w-1 flex-none" />
             </div>
        </div>
    );
}

export default IntroGallery;