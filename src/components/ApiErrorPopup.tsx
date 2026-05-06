import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, X, ExternalLink, Settings, RefreshCw } from 'lucide-react';

interface ApiErrorPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
  errorType: 'quota_exceeded' | 'invalid_key' | 'general';
}

export const ApiErrorPopup: React.FC<ApiErrorPopupProps> = ({ isOpen, onClose, onOpenSettings, errorType }) => {
  const content = {
    quota_exceeded: {
      title: "API Quota Exceeded",
      description: "You've reached the free usage limit for the shared Gemini API. To continue processing images immediately, you can provide your own API key in Settings.",
      icon: <RefreshCw className="w-8 h-8 text-orange-400 animate-spin" style={{ animationDuration: '3s' }} />,
      color: "text-orange-400",
      border: "border-orange-500/20"
    },
    invalid_key: {
      title: "Invalid API Key",
      description: "The API key provided is invalid or has expired. Please check your credentials in the Settings menu.",
      icon: <AlertCircle className="w-8 h-8 text-red-500" />,
      color: "text-red-500",
      border: "border-red-500/20"
    },
    general: {
      title: "Processing Error",
      description: "Something went wrong while communicating with the AI. Please try again in a few moments.",
      icon: <AlertCircle className="w-8 h-8 text-gray-400" />,
      color: "text-gray-400",
      border: "border-white/10"
    }
  }[errorType];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className={`relative w-full max-w-md glass-panel p-8 ${content.border} overflow-hidden`}
          >
            {/* Background Glow */}
            <div className={`absolute -top-24 -right-24 w-48 h-48 opacity-10 blur-[100px] rounded-full bg-cyan-500`} />

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 bg-white/5 rounded-2xl">
                {content.icon}
              </div>
              
              <div>
                <h3 className={`text-xl font-black uppercase tracking-widest ${content.color}`}>
                  {content.title}
                </h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Status Notification</p>
              </div>

              <p className="text-gray-300 text-sm leading-relaxed">
                {content.description}
              </p>

              <div className="grid grid-cols-2 gap-3 w-full pt-4">
                <button
                  onClick={onClose}
                  className="px-4 py-3 bg-white/5 border border-white/10 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onOpenSettings();
                  }}
                  className="px-4 py-3 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-cyan-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Settings
                </button>
              </div>

              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[9px] font-bold text-gray-500 uppercase tracking-widest hover:text-white transition-colors"
                title="Get your own free API Key from Google AI Studio"
              >
                Get your own API Key <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
