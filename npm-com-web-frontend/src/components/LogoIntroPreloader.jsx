import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';

const LogoIntroPreloader = ({ isOpen, mode = 'initial', onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      return;
    }

    if (mode === 'transition') {
      // Faster page transition loader (approx 450ms)
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 500);
      return () => clearTimeout(timer);
    }

    // Initial entrance loader (progress from 0 to 100 over ~1.6s)
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 300);
          return 100;
        }
        return prev + 3;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [isOpen, mode, onComplete]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key={mode}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04, filter: 'blur(6px)' }}
          transition={{ duration: 0.45, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 select-none overflow-hidden"
        >
          {/* Ambient Radial Lights */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(14,165,233,0.18),transparent_65%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_60%,rgba(234,179,8,0.14),transparent_55%)] pointer-events-none" />
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none" />

          {/* Top Skip button for initial entrance */}
          {mode === 'initial' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="absolute top-6 right-6 z-20"
            >
              <button
                onClick={onComplete}
                className="group flex items-center space-x-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-teal-400/50 text-slate-300 hover:text-white px-4 py-2 rounded-full text-xs font-bold transition-all shadow-lg"
              >
                <span>Skip / පිවිසෙන්න</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-teal-400" />
              </button>
            </motion.div>
          )}

          {/* Centerpiece Emblem Container */}
          <div className="relative flex flex-col items-center max-w-lg mx-auto text-center z-10">
            
            {/* Rotating Orbital Rings */}
            <div className={`relative ${mode === 'transition' ? 'w-44 h-44 sm:w-48 sm:h-48 mb-4' : 'w-60 h-60 sm:w-68 sm:h-68 mb-6'} flex items-center justify-center transition-all duration-300`}>
              
              {/* Outer Golden Dashed Ring */}
              <div className="absolute inset-0 rounded-full border border-dashed border-amber-400/35 animate-spin-slow" />
              
              {/* Middle Cyan Ring */}
              <div className="absolute inset-2 sm:inset-3 rounded-full border border-teal-400/30 animate-spin-reverse-slow">
                <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-teal-400 shadow-[0_0_10px_#2dd4bf]" />
                <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
              </div>

              {/* Pulsing Aura Glow Behind Logo */}
              <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-amber-500/25 via-teal-500/20 to-blue-600/30 blur-xl animate-pulse-glow" />

              {/* Emblem Pedestal */}
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 140, damping: 15 }}
                className={`relative z-10 ${mode === 'transition' ? 'w-28 h-28 sm:w-32 sm:h-32 p-3' : 'w-36 h-36 sm:w-40 sm:h-40 p-4'} rounded-full bg-gradient-to-b from-slate-800 to-slate-950 shadow-2xl border-2 border-amber-400/50 flex items-center justify-center overflow-hidden`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" />
                <img
                  src="/emblem.png"
                  alt="NCP Emblem"
                  className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]"
                />
              </motion.div>
            </div>

            {/* Typography */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="space-y-2"
            >
              {mode === 'initial' && (
                <div className="inline-flex items-center space-x-1.5 bg-amber-500/15 border border-amber-400/30 px-3 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold text-amber-300 tracking-wider uppercase mb-1">
                  <ShieldCheck className="w-3 h-3 text-amber-400" />
                  <span>ශ්‍රී ලංකා ප්‍රජාතාන්ත්‍රික සමාජවාදී ජනරජය</span>
                </div>
              )}

              <h2 className={`${mode === 'transition' ? 'text-sm sm:text-base' : 'text-lg sm:text-xl'} font-black text-white tracking-tight`}>
                පළාත් අධ්‍යාපන දෙපාර්තමේන්තුව — උතුරු මැද පළාත
              </h2>
              <p className="text-[11px] sm:text-xs font-bold text-teal-300 uppercase tracking-wider">
                COMMERCE EDUCATION BRANCH • වාණිජ අධ්‍යාපන අංශය
              </p>
            </motion.div>

            {/* Dynamic Loading Progress Bar */}
            <div className="w-56 sm:w-64 mt-6 space-y-1.5">
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60 p-0.5">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-400 via-teal-400 to-cyan-400 rounded-full shadow-[0_0_8px_#2dd4bf]"
                  style={{ width: mode === 'transition' ? '100%' : `${progress}%` }}
                  transition={mode === 'transition' ? { duration: 0.45, ease: 'linear' } : undefined}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 px-1">
                <span className="flex items-center space-x-1 text-teal-400">
                  <Sparkles className="w-3 h-3 animate-spin" />
                  <span>{mode === 'transition' ? 'පිටුව පූරණය වෙමින් පවතී...' : 'ද්වාරයට පිවිසෙමින් පවතී...'}</span>
                </span>
                {mode === 'initial' && <span className="text-amber-400 font-mono">{progress}%</span>}
              </div>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LogoIntroPreloader;
