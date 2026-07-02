import { motion } from 'framer-motion';
import { useMemo, useEffect } from 'react';

export default function SplashScreen({ onComplete }) {
  const brandName = "GULLY CRICKET".split("");

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const particles = useMemo(() => {
    return [...Array(15)].map(() => ({
      x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
      scale: Math.random() * 0.5 + 0.5,
      delay: Math.random() * 2,
      duration: Math.random() * 3 + 2,
      xOffset: Math.random() * 200 - 100,
    }));
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950 overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.6, ease: "easeInOut" } }}
    >
      {/* Background Gradients & Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cricket/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-slate-900 to-transparent opacity-50" />
      
      {/* Particles */}
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-white/10"
          initial={{
            x: p.x,
            y: window.innerHeight + 100,
            scale: p.scale,
          }}
          animate={{
            y: -100,
            x: `+=${p.xOffset}`,
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "linear",
            delay: p.delay,
          }}
        />
      ))}

      {/* Main Animation Container */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Ball Animation */}
        <motion.div
          initial={{ scale: 0, y: 50, rotate: -180 }}
          animate={{ scale: 1, y: 0, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 20,
            duration: 0.8,
          }}
          className="mb-8 relative"
        >
          <div className="absolute inset-0 bg-cricket rounded-full blur-xl opacity-50 scale-150 animate-pulse" />
          <motion.div
            className="w-40 h-40 flex items-center justify-center relative z-10"
          >
            <img src="/logo.png" alt="Gully Cricket Logo" className="w-full h-full object-contain drop-shadow-2xl" />
          </motion.div>
        </motion.div>

        {/* Text Animation */}
        <div className="flex space-x-1 mb-4 overflow-hidden">
          {brandName.map((letter, index) => (
            <motion.span
              key={index}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                delay: 0.5 + index * 0.05,
                type: "spring",
                stiffness: 150,
                damping: 12,
              }}
              className="text-4xl md:text-5xl font-black text-white uppercase tracking-wider drop-shadow-lg"
            >
              {letter === " " ? "\u00A0" : letter}
            </motion.span>
          ))}
        </div>

        {/* Tagline Animation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="px-6 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10"
        >
          <p className="text-sm md:text-base font-bold text-slate-300 tracking-widest uppercase">
            Track Every Ball. <span className="text-cricket-200">Own Every Match.</span>
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
