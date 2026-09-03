import React from 'react';
import { UploadedFile } from '../types';
import { X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface ImageGridProps {
  files: UploadedFile[];
  onRemove: (id: string) => void;
}

export const ImageGrid: React.FC<ImageGridProps> = ({ files, onRemove }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
      <AnimatePresence initial={false}>
        {files.map((item, idx) => (
          <motion.div
            key={item.id ? `img-grid-${item.id}` : `img-grid-idx-${idx}`}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, type: 'spring' }}
            className="group relative aspect-square rounded-xl border border-white/10 bg-white/5 overflow-hidden"
          >
            <img 
              src={item.preview} 
              alt="Preview" 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            
            {/* Status Overlays */}
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {item.status === 'pending' && (
                <button 
                  onClick={() => onRemove(item.id)}
                  className="bg-red-500 p-2 rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Status Badges */}
            <div className="absolute bottom-2 left-2 right-2">
                {item.status === 'processing' && (
                    <div className="flex items-center gap-2 bg-black/80 backdrop-blur-md px-2 py-1 rounded text-[10px] text-cyan-400 border border-cyan-400/30">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Analyzing...
                    </div>
                )}
                {item.status === 'completed' && (
                    <div className="flex items-center gap-2 bg-green-500/90 backdrop-blur-md px-2 py-1 rounded text-[10px] text-white">
                        <CheckCircle2 className="w-3 h-3" />
                        Complete
                    </div>
                )}
                {item.status === 'error' && (
                    <div className="flex items-center gap-2 bg-red-500/90 backdrop-blur-md px-2 py-1 rounded text-[10px] text-white">
                        <AlertCircle className="w-3 h-3" />
                        Error
                    </div>
                )}
            </div>

            {/* Progress Bar */}
            {item.status === 'processing' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${item.progress}%` }}
                        className="h-full bg-cyan-400"
                    />
                </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
