import React, { useState } from 'react';
import { X, Key, ShieldCheck, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSave: (key: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, apiKey, onSave }) => {
  const [tempKey, setTempKey] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);

  const handleSave = () => {
    onSave(tempKey);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div key="settings-modal-overlay" className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="glass-panel w-full max-w-md relative z-10 overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Key className="w-5 h-5 text-cyan-400" />
                API Configuration
              </h3>
              <button 
                onClick={onClose}
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">
                    Google Gemini API Key
                  </label>
                  <div className="relative">
                    <input 
                      type={showKey ? "text" : "password"}
                      value={tempKey}
                      onChange={(e) => setTempKey(e.target.value)}
                      placeholder="Enter your API key..."
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                    <button 
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-cyan-400/5 rounded-xl border border-cyan-400/20">
                  <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
                  <div className="text-xs text-cyan-400/80 space-y-2">
                    <p>Your API key is stored locally in your browser and is only sent to Google Gemini.</p>
                    <a 
                      href="https://aistudio.google.com/app/apikey" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-white hover:underline font-bold"
                    >
                      Get your key from Google AI Studio <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleSave}
                  className="btn-primary w-full py-4 text-sm"
                >
                  Save Configuration
                </button>
                <button 
                  onClick={onClose}
                  className="w-full py-2 text-xs text-gray-500 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Decorative line */}
            <div className="h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-red-500" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
