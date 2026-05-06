import React, { useState } from 'react';
import { UploadedFile, ImageMetadata } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Maximize2, Copy, Download, Tag, Box, Palette, 
    Smile, Lightbulb, FileText, Check, ChevronDown, ChevronUp 
} from 'lucide-react';
import { cn } from '../lib/utils';

interface MetadataDisplayProps {
  files: UploadedFile[];
}

export const MetadataDisplay: React.FC<MetadataDisplayProps> = ({ files }) => {
  const [expandedId, setExpandedId] = useState<string | null>(files[0]?.id || null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadOneJSON = (metadata: ImageMetadata) => {
    const blob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${metadata.file_name}_metadata.json`;
    link.click();
  };

  return (
    <div className="space-y-4">
      {files.map((file) => {
        if (!file.metadata) return null;
        const isExpanded = expandedId === file.id;
        const m = file.metadata;

        return (
          <motion.div
            key={file.id}
            layout
            className={cn(
                "glass-panel overflow-hidden transition-all duration-300",
                isExpanded ? "ring-1 ring-cyan-500/50" : "hover:border-white/20"
            )}
          >
            {/* Summary Bar */}
            <div 
                onClick={() => setExpandedId(isExpanded ? null : file.id)}
                className="flex items-center gap-4 p-4 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                <img src={file.preview} alt="Thumb" className="w-full h-full object-cover" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-white truncate">{m.title}</h4>
                <div className="flex items-center gap-3 text-[10px] uppercase tracking-wider text-gray-500">
                    <span className="text-cyan-400 font-bold">{m.category}</span>
                    <span>•</span>
                    <span className="truncate">{m.file_name}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); downloadOneJSON(m); }}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  title="Download JSON"
                >
                  <Download className="w-4 h-4" />
                </button>
                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            </div>

            {/* Expandable Content */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="p-6 pt-0 border-t border-white/5 grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Visual Section */}
                    <div className="lg:col-span-3 space-y-4">
                        <div className="aspect-[3/4] rounded-xl overflow-hidden border border-white/10 group relative">
                            <img src={file.preview} alt="Full" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white">
                                    <Maximize2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <p className="text-[10px] uppercase font-bold text-gray-500 flex items-center gap-2">
                                <Palette className="w-3 h-3 text-cyan-400" /> Dominant Colors
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {m.dominant_colors.map((color, i) => (
                                    <div key={i} className="flex items-center gap-1.5 bg-white/5 rounded-full px-2 py-1 text-[10px] border border-white/10">
                                        <div className="w-2 h-2 rounded-full shadow-[0_0_5px_rgba(255,255,255,0.3)]" style={{ backgroundColor: color }} />
                                        {color}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Data Section */}
                    <div className="lg:col-span-9 space-y-6">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Description */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <h5 className="text-xs uppercase font-bold text-gray-500 flex items-center gap-2">
                                        <FileText className="w-3 h-3 text-cyan-400" /> AI Description
                                    </h5>
                                    <button 
                                        onClick={() => copyToClipboard(m.description, `desc-${file.id}`)}
                                        className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
                                    >
                                        {copiedId === `desc-${file.id}` ? <Check className="w-2 h-2" /> : <Copy className="w-2 h-2" />}
                                        {copiedId === `desc-${file.id}` ? "Copied" : "Copy"}
                                    </button>
                                </div>
                                <p className="text-sm leading-relaxed text-gray-300 italic">"{m.description}"</p>
                            </div>

                            {/* Keywords */}
                            <div className="space-y-2">
                                <h5 className="text-xs uppercase font-bold text-gray-500 flex items-center gap-2">
                                    <Tag className="w-3 h-3 text-red-400" /> Keywords
                                </h5>
                                <div className="flex flex-wrap gap-2">
                                    {m.keywords.map((tag, i) => (
                                        <span key={i} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-gray-400 hover:text-white transition-colors cursor-default">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-white/5">
                            {/* Objects */}
                            <div className="space-y-2">
                                <h5 className="text-xs uppercase font-bold text-gray-500 flex items-center gap-2">
                                    <Box className="w-3 h-3 text-blue-400" /> Detected Entities
                                </h5>
                                <div className="flex flex-wrap gap-2">
                                    {m.objects_detected.map((obj, i) => (
                                        <span key={i} className="px-2 py-1 rounded bg-blue-500/10 text-blue-400 text-[10px] font-medium border border-blue-500/20">
                                            {obj}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Mood */}
                            <div className="space-y-2">
                                <h5 className="text-xs uppercase font-bold text-gray-500 flex items-center gap-2">
                                    <Smile className="w-3 h-3 text-yellow-400" /> Visual Mood
                                </h5>
                                <p className="text-sm text-white font-semibold">{m.mood}</p>
                            </div>

                            {/* Suggestions */}
                            <div className="space-y-2">
                                <h5 className="text-xs uppercase font-bold text-gray-500 flex items-center gap-2">
                                    <Lightbulb className="w-3 h-3 text-purple-400" /> Implementation Tip
                                </h5>
                                <p className="text-[11px] leading-snug text-gray-400">{m.usage_suggestions}</p>
                            </div>
                        </div>

                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
};
