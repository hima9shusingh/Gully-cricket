import { motion } from 'framer-motion';

export default function Logo({ className = '', iconSize = 28, textSize = 'text-2xl', animated = false }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img 
        src="/logo.png" 
        alt="Gully Cricket Logo" 
        style={{ width: iconSize, height: iconSize }} 
        className={`object-contain ${animated ? 'animate-pulse' : ''}`} 
      />
      <span className={`${textSize} font-black uppercase tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300`}>
        Gully Cricket
      </span>
    </div>
  );
}
