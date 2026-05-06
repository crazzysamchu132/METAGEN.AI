import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface DropZoneProps {
  onFilesAdded: (files: File[]) => void;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFilesAdded }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files).filter((file: File) => 
        file.type.startsWith('image/')
      );
      onFilesAdded(files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesAdded(Array.from(e.target.files));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "relative group h-full min-h-[400px] flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all duration-300",
        isDragging 
          ? "border-cyan-400 bg-cyan-400/5 glow-cyan" 
          : "border-white/10 bg-white/5 hover:border-white/20"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      
      <div className="text-center space-y-4 pointer-events-none">
        <div className={cn(
            "mx-auto w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center transition-transform duration-500",
            isDragging ? "scale-110" : "group-hover:scale-110"
        )}>
            <div className="relative">
                <Upload className={cn(
                    "w-10 h-10 transition-colors duration-300",
                    isDragging ? "text-cyan-400" : "text-gray-400 group-hover:text-white"
                )} />
                <motion.div 
                    animate={isDragging ? { y: [0, -5, 0] } : {}}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full blur-[2px]"
                />
            </div>
        </div>
        
        <div className="space-y-1">
          <p className="text-xl font-bold text-white">Capture Reality</p>
          <p className="text-sm text-gray-400">Drag images or click to initialize link</p>
        </div>

        <div className="pt-4 flex flex-wrap justify-center gap-2">
            <span className="px-2 py-1 bg-white/5 rounded text-[10px] text-gray-500">JPG</span>
            <span className="px-2 py-1 bg-white/5 rounded text-[10px] text-gray-500">PNG</span>
            <span className="px-2 py-1 bg-white/5 rounded text-[10px] text-gray-500">WEBP</span>
        </div>
      </div>

      {/* Futuristic decorative corners */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400/30 rounded-tl-lg" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-red-400/30 rounded-tr-lg" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-red-400/30 rounded-bl-lg" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400/30 rounded-br-lg" />
    </motion.div>
  );
};
