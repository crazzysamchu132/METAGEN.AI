import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shield, Zap, Target, Camera, Sparkles } from 'lucide-react';

interface AboutUsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutUs: React.FC<AboutUsProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl glass-panel p-8 border-cyan-500/20 overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 blur-[100px] rounded-full" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 blur-[100px] rounded-full" />

            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-[0.2em] text-white flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-cyan-400" />
                  About Us
                </h2>
                <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mt-1">Empowering Creators with AI</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white transition-colors bg-white/5 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 text-gray-300">
              <p className="text-sm leading-relaxed">
                Welcome to <span className="text-cyan-400 font-bold">Metadata Gen</span>, the ultimate companion for stock photographers and digital artists. We leverage advanced artificial intelligence to transform the tedious task of keywording and titling into a seamless, one-click experience.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400">
                    <Target className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-tighter">Precision SEO</span>
                  </div>
                  <p className="text-[11px] text-gray-400">Our algorithms are specifically tuned for Adobe Stock, ensuring your metadata matches exactly what buyers are searching for.</p>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-purple-400">
                    <Zap className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-tighter">Speed Optimization</span>
                  </div>
                  <p className="text-[11px] text-gray-400">Process dozens of images in seconds. Stop wasting hours on manual data entry and get back to creating art.</p>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-green-400">
                    <Camera className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-tighter">Creative Context</span>
                  </div>
                  <p className="text-[11px] text-gray-400">We don't just see pixels; we understand composition, mood, and subject matter to generate titles that sell.</p>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-orange-400">
                    <Shield className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-tighter">Admin Controlled</span>
                  </div>
                  <p className="text-[11px] text-gray-400">Built with security and management tools to ensure a safe, high-performance environment for all users.</p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 text-center">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest italic">
                  "Designed for the future of digital assets"
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
