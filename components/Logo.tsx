import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className }) => (
  <div className={className}>
    <img 
      src="https://raw.githubusercontent.com/chaosste/Anubis/main/beetle-1.png" 
      alt="Anubis Beetle Logo" 
      className="w-full h-full object-contain"
    />
  </div>
);

export default Logo;