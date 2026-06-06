import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Image, Shield, ArrowRight, CheckCircle2, Sliders, FileSpreadsheet } from 'lucide-react';

interface WelcomePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WelcomePopup: React.FC<WelcomePopupProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          id="welcome-popup-overlay"
          className="fixed inset-0 z-[120] flex items-center justify-center p-4"
        >
          {/* Backdrop Blur */}
          <motion.div
            id="welcome-popup-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
          />
          
          {/* Modal Container */}
          <motion.div
            id="welcome-popup-container"
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-2xl glass-panel p-6 sm:p-10 border-cyan-500/30 overflow-hidden shadow-[0_0_50px_rgba(0,243,255,0.15)] bg-neutral-950/90"
          >
            {/* Animated Cyber Ambient Light */}
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-cyan-500/10 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-500/10 blur-[120px] rounded-full animate-pulse [animation-delay:2s]" />

            {/* Close Button */}
            <button 
              id="welcome-popup-close-btn"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors z-10"
              aria-label="Close Welcome Dialog"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Glowing Tech Accent line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />

            <div className="space-y-8 relative">
              {/* Header */}
              <div className="text-center space-y-3">
                <motion.div 
                  initial={{ scale: 0.8, y: -10 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ delay: 0.1, type: "spring" }}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full"
                >
                  <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-cyan-300">SYSTEM ENGAGED v2.0</span>
                </motion.div>
                
                <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-widest text-white">
                  Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">METAGEN.AI</span>
                </h2>
                
                <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto">
                  The ultimate AI-powered metadata companion engineered to auto-generate precise SEO titles & keywords optimized for stock photography.
                </p>
              </div>

              {/* Core Features Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5 text-cyan-400">
                      <Image className="w-4 h-4" />
                      <h4 className="text-xs font-black uppercase tracking-widest text-white">Massive Batches</h4>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Upload and process up to <span className="text-white font-bold">50 high-resolution images</span> simultaneously. Ideal for managing large daily shoots effortlessly.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500" />
                    <span className="text-[9px] uppercase font-bold text-gray-500">Fully Supported</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5 text-purple-400">
                      <Sliders className="w-4 h-4" />
                      <h4 className="text-xs font-black uppercase tracking-widest text-white">Dynamic Controls</h4>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Customize target <span className="text-white font-bold">title word-counts</span> and exact <span className="text-white font-bold">keyword tag counts</span> on-the-fly before launching prompt analyses.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-500" />
                    <span className="text-[9px] uppercase font-bold text-gray-500">Real-time parameters</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5 text-emerald-400">
                      <FileSpreadsheet className="w-4 h-4" />
                      <h4 className="text-xs font-black uppercase tracking-widest text-white">Streamlined Exports</h4>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Get exactly what you need. Downloads a perfectly structured CSV featuring only <span className="text-white font-bold">Filename, Title, and Keywords</span> columns.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[9px] uppercase font-bold text-gray-500">Direct Stock Import File</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5 text-blue-400">
                      <Shield className="w-4 h-4" />
                      <h4 className="text-xs font-black uppercase tracking-widest text-white">Admin Approved Auth</h4>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Safely sign in with your Google Workspace credentials to sync analysis sessions, view historical archives, and toggle permissions seamlessly.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-[9px] uppercase font-bold text-gray-500">Google Secure Sign-in</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/5">
                <div className="text-left">
                  <p className="text-[10px] text-gray-500 uppercase font-black tracking-wider">No obligation • AI Assisted</p>
                  <p className="text-xs text-cyan-400/80">Input custom keys in settings for unlimited operations.</p>
                </div>
                
                <button
                  id="welcome-popup-start-button"
                  onClick={onClose}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-black text-xs font-black uppercase tracking-widest rounded-xl hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 shadow-[0_10px_30px_rgba(6,182,212,0.3)] hover:scale-[1.02] cursor-pointer"
                >
                  Initialize System
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
