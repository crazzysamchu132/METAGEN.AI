import React, { useState } from 'react';
import { UploadedFile, ImageMetadata } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Maximize2, Copy, Download, Tag, Box, Palette, 
    Smile, Lightbulb, FileText, Check, ChevronDown, ChevronUp, Camera,
    ArrowUp, ArrowDown, X, Plus, Edit2, Sparkles, Award, Play
} from 'lucide-react';
import { cn } from '../lib/utils';

interface MetadataDisplayProps {
  files: UploadedFile[];
  onUpdateFileMetadata?: (id: string, updatedMetadata: ImageMetadata) => void;
}

export const MetadataDisplay: React.FC<MetadataDisplayProps> = ({ files, onUpdateFileMetadata }) => {
  const [expandedId, setExpandedId] = useState<string | null>(files[0]?.id || null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newTagText, setNewTagText] = useState<{ [fileId: string]: string }>({});
  const [editingTagIndex, setEditingTagIndex] = useState<{ fileId: string; index: number } | null>(null);
  const [editingTagValue, setEditingTagValue] = useState("");

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const copyKeywordsAsCSV = (keywords: string[], id: string) => {
    copyToClipboard(keywords.join(', '), id);
  };

  const downloadAdobeStockCSV = (filesToExport: UploadedFile[]) => {
    const headers = ["Filename", "Title", "Keywords"];
    const rows = filesToExport.map(file => {
      const m = file.metadata;
      if (!m) return null;
      const keywordsString = m.keywords.join(', ');
      return [
        m.file_name,
        `"${m.title.replace(/"/g, '""')}"`,
        `"${keywordsString.replace(/"/g, '""')}"`
      ].join(',');
    }).filter(Boolean);

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `adobe_stock_metadata_${new Date().getTime()}.csv`;
    link.click();
  };

  const downloadOneCSV = (file: UploadedFile) => {
    downloadAdobeStockCSV([file]);
  };

  // SEO Score Calculator
  const getSeoScoreInfo = (title: string, keywords: string[]) => {
    let score = 0;
    const checks = {
      titleLen: false,
      keywordCount: false,
      top5Pinned: false,
      comprehensive: true
    };

    // 1. Title optimization check (Sweet spot is 45 to 110 characters for Adobe Stock index visibility)
    const titleLen = title.trim().length;
    if (titleLen >= 45 && titleLen <= 110) {
      score += 30;
      checks.titleLen = true;
    } else if (titleLen > 0) {
      score += 15;
    }

    // 2. Keyword density (Adobe Stock allows 5-50. Maximum density sweet spot is 25 to 45 keywords)
    const tagCount = keywords.length;
    if (tagCount >= 25 && tagCount <= 45) {
      score += 35;
      checks.keywordCount = true;
    } else if (tagCount >= 10 && tagCount <= 50) {
      score += 20;
    } else if (tagCount > 0) {
      score += 10;
    }

    // 3. Top 5 Prioritization check (Crucial for search engines)
    if (tagCount >= 5) {
      score += 25;
      checks.top5Pinned = true;
    } else if (tagCount > 0) {
      score += 10;
    }

    // 4. Description depth & format
    score += 10; // Auto-allocated base for category and objects sync

    return { score, checks };
  };

  // Handler to push updates back up
  const handleUpdate = (fileId: string, updatedFields: Partial<ImageMetadata>) => {
    const file = files.find(f => f.id === fileId);
    if (file && file.metadata && onUpdateFileMetadata) {
      onUpdateFileMetadata(fileId, {
        ...file.metadata,
        ...updatedFields
      });
    }
  };

  // Promote a tag to index 0 (Top Rank #1)
  const promoteTagToTop = (fileId: string, index: number, keywords: string[]) => {
    if (index === 0) return;
    const updated = [...keywords];
    const [tag] = updated.splice(index, 1);
    updated.unshift(tag);
    handleUpdate(fileId, { keywords: updated });
  };

  // Move tag Up on list
  const shiftTagUp = (fileId: string, index: number, keywords: string[]) => {
    if (index === 0) return;
    const updated = [...keywords];
    const prev = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = prev;
    handleUpdate(fileId, { keywords: updated });
  };

  // Move tag Down on list
  const shiftTagDown = (fileId: string, index: number, keywords: string[]) => {
    if (index === keywords.length - 1) return;
    const updated = [...keywords];
    const next = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = next;
    handleUpdate(fileId, { keywords: updated });
  };

  // Demote a tag from top to bottom
  const demoteTag = (fileId: string, index: number, keywords: string[]) => {
    const updated = [...keywords];
    const [tag] = updated.splice(index, 1);
    updated.push(tag);
    handleUpdate(fileId, { keywords: updated });
  };

  // Delete a tag
  const deleteTag = (fileId: string, index: number, keywords: string[]) => {
    const updated = keywords.filter((_, i) => i !== index);
    handleUpdate(fileId, { keywords: updated });
  };

  // Add custom tag
  const addCustomTag = (fileId: string, keywords: string[]) => {
    const text = (newTagText[fileId] || "").trim().toLowerCase();
    if (!text) return;
    
    // Split by commas to allow batch insertion
    const tagsToAdd = text.split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0 && !keywords.includes(t));

    if (tagsToAdd.length > 0) {
      const updated = [...keywords, ...tagsToAdd];
      handleUpdate(fileId, { keywords: updated });
    }
    
    setNewTagText(prev => ({ ...prev, [fileId]: "" }));
  };

  // Start double-click editing a tag
  const startEditingTag = (fileId: string, index: number, val: string) => {
    setEditingTagIndex({ fileId, index });
    setEditingTagValue(val);
  };

  const saveEditedTag = (fileId: string, index: number, keywords: string[]) => {
    const cleaned = editingTagValue.trim().toLowerCase();
    if (cleaned && !keywords.includes(cleaned)) {
      const updated = [...keywords];
      updated[index] = cleaned;
      handleUpdate(fileId, { keywords: updated });
    }
    setEditingTagIndex(null);
  };

  return (
    <div className="space-y-4">
      {files.some(f => f.metadata) && (
        <div className="flex justify-end mb-4">
          <button 
            onClick={() => downloadAdobeStockCSV(files)}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/10 text-xs font-bold uppercase tracking-widest text-cyan-400 rounded-xl transition-all"
          >
            <Download className="w-4 h-4" />
            Bulk Export (Adobe Stock CSV)
          </button>
        </div>
      )}
      {files.map((file, fileIdx) => {
        if (!file.metadata) return null;
        const isExpanded = expandedId === file.id;
        const m = file.metadata;

        const { score: seoScore, checks: seoChecks } = getSeoScoreInfo(m.title, m.keywords);
        const strokeDashoffset = 251.2 - (251.2 * seoScore) / 100;

        return (
          <motion.div
            key={file.id ? `metadata-card-${file.id}` : `metadata-card-idx-${fileIdx}`}
            layout
            className={cn(
                "glass-panel overflow-hidden transition-all duration-300",
                isExpanded ? "ring-1 ring-cyan-500/50 border-cyan-500/30" : "hover:border-white/20"
            )}
          >
            {/* Header Summary Tab */}
            <div 
                onClick={() => setExpandedId(isExpanded ? null : file.id)}
                className="flex items-center gap-4 p-4 cursor-pointer select-none"
            >
              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-white/10 bg-white/5 flex items-center justify-center">
                {file.preview ? (
                  <img src={file.preview} alt="Thumb" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-5 h-5 text-gray-600" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-black tracking-widest text-cyan-400 uppercase bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20 mr-2">
                  {m.category || "Uncategorized"}
                </span>
                <span className="text-[10px] items-center font-mono text-gray-500 mr-2">{m.file_name}</span>
                <h4 className="font-bold text-white text-sm sm:text-base truncate mt-1">{m.title}</h4>
              </div>

              {/* Minimal SEO Badge on outer header */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-lg border border-white/5">
                  <span className="text-[8px] font-bold text-gray-500 tracking-wider">SEO SCORE:</span>
                  <span className={cn(
                    "text-[10px] font-bold font-mono",
                    seoScore > 80 ? "text-emerald-400" : seoScore > 50 ? "text-yellow-400" : "text-amber-500"
                  )}>
                    {seoScore}%
                  </span>
                </div>
                
                <button 
                  onClick={(e) => { e.stopPropagation(); downloadOneCSV(file); }}
                  className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-cyan-500/20 transition-all flex items-center gap-1.5"
                  title="Download Adobe CSV"
                >
                  <Download className="w-3 h-3" />
                  CSV
                </button>
                {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </div>
            </div>

            {/* Expandable SEO Workspace */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  key={`seo-workspace-${file.id || fileIdx}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="p-6 pt-0 border-t border-white/5 grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* LEFT SIDEBAR: Visual Preview, Dominant Colors & Live Smart SEO Gauge */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="aspect-[3/4] rounded-xl overflow-hidden border border-white/10 group relative bg-white/5 flex items-center justify-center shadow-lg">
                            {file.preview ? (
                                <>
                                    <img src={file.preview} alt="Full" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white">
                                            <Maximize2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-gray-600">
                                    <Camera className="w-10 h-10" />
                                    <span className="text-[10px] uppercase font-bold">No Preview</span>
                                </div>
                            )}
                        </div>

                        {/* Interactive Spark SEO Ring Gauge */}
                        <div className="bg-cyan-950/15 border border-cyan-500/10 rounded-2xl p-4 flex flex-col items-center text-center relative overflow-hidden shadow-inner">
                            <div className="absolute top-0 right-0 w-12 h-12 bg-cyan-400/5 blur-2xl rounded-full" />
                            
                            <span className="text-[9px] font-black tracking-widest text-cyan-400 uppercase mb-3">SEO OPTIMIZATION GAUGE</span>
                            
                            <div className="relative w-24 h-24 mb-3 flex items-center justify-center">
                              <svg className="w-24 h-24 transform -rotate-90">
                                <circle 
                                  cx="48" 
                                  cy="48" 
                                  r="40" 
                                  stroke="currentColor" 
                                  className="text-white/5" 
                                  strokeWidth="6" 
                                  fill="transparent" 
                                />
                                <circle 
                                  cx="48" 
                                  cy="48" 
                                  r="40" 
                                  stroke="currentColor" 
                                  className={cn(
                                    "transition-all duration-700 ease-out",
                                    seoScore > 80 ? "text-emerald-400" : seoScore > 50 ? "text-cyan-400 animation-pulse" : "text-amber-500"
                                  )} 
                                  strokeWidth="6" 
                                  fill="transparent"
                                  strokeDasharray="251.2" 
                                  strokeDashoffset={strokeDashoffset} 
                                  strokeLinecap="round"
                                />
                              </svg>
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-xl font-black text-white leading-none">{seoScore}%</span>
                                <span className="text-[7px] text-gray-400 uppercase tracking-widest font-mono mt-0.5">READINESS</span>
                              </div>
                            </div>

                            {/* Checklist checklist items */}
                            <div className="w-full text-left space-y-1.5 pt-2 border-t border-white/5 text-[10px] font-mono text-gray-400">
                              <div className="flex items-center justify-between">
                                <span>🎯 Optimal Title Link</span>
                                <span className={seoChecks.titleLen ? "text-emerald-400 font-bold" : "text-gray-600"}>
                                  {seoChecks.titleLen ? "✔ Perfect" : "Short / Long"}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span>🏷 Keyword Volume (25+)</span>
                                <span className={seoChecks.keywordCount ? "text-emerald-400 font-bold" : "text-gray-600"}>
                                  {seoChecks.keywordCount ? `✔ ${m.keywords.length}` : `${m.keywords.length} tags`}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span>👑 Gold Star Priority (5+)</span>
                                <span className={seoChecks.top5Pinned ? "text-emerald-400 font-bold" : "text-gray-600"}>
                                  {seoChecks.top5Pinned ? "✔ Synced" : "Pending"}
                                </span>
                              </div>
                            </div>
                        </div>
                        
                        {/* Dominant Colors display */}
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

                    {/* RIGHT CONTENT: Interactive Metadata Workspace Editors & Priority Sorter */}
                    <div className="lg:col-span-9 space-y-6">
                        
                        {/* Interactive Text Fields */}
                        <div className="space-y-4 bg-black/20 p-5 border border-white/5 rounded-2xl shadow-inner">
                            <h5 className="text-[10px] font-black tracking-widest text-[#00f3ff] uppercase flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5" /> Core Metadata Editor
                            </h5>
                            
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                              {/* Title Input field */}
                              <div className="md:col-span-12 space-y-1">
                                <div className="flex items-center justify-between">
                                  <label className="text-[9px] uppercase font-bold text-gray-500 flex items-center gap-1">TITLE</label>
                                  <span className={cn("text-[9px] font-mono", m.title.length > 120 || m.title.length < 40 ? "text-yellow-500" : "text-emerald-400")}>
                                    {m.title.length} / 200 chars (Optimal: 45-110)
                                  </span>
                                </div>
                                <input
                                  type="text"
                                  value={m.title}
                                  onChange={(e) => handleUpdate(file.id, { title: e.target.value })}
                                  className="w-full text-sm bg-white/5 border border-white/10 hover:border-white/20 focus:border-cyan-500 focus:bg-black/40 text-white rounded-xl px-4 py-2.5 outline-none transition-all"
                                  placeholder="Commercial title..."
                                />
                              </div>

                              {/* Filename Input field */}
                              <div className="md:col-span-6 space-y-1">
                                <label className="text-[9px] uppercase font-bold text-gray-500">ADOBE STOCK FILENAME</label>
                                <input
                                  type="text"
                                  value={m.file_name}
                                  onChange={(e) => handleUpdate(file.id, { file_name: e.target.value })}
                                  className="w-full text-xs font-mono bg-white/5 border border-white/10 focus:border-cyan-500 text-gray-300 rounded-xl px-4 py-2 outline-none transition-all"
                                />
                              </div>

                              {/* Category selection */}
                              <div className="md:col-span-6 space-y-1">
                                <label className="text-[9px] uppercase font-bold text-gray-500">CATEGORY CLASSIFIER</label>
                                <input
                                  type="text"
                                  value={m.category}
                                  onChange={(e) => handleUpdate(file.id, { category: e.target.value })}
                                  className="w-full text-xs bg-white/5 border border-white/10 focus:border-cyan-500 text-gray-300 rounded-xl px-4 py-2 outline-none transition-all"
                                />
                              </div>
                            </div>
                        </div>

                        {/* Description field block */}
                        <div className="space-y-1 bg-black/20 p-4 border border-white/5 rounded-2xl">
                          <div className="flex items-center justify-between mb-1">
                              <h5 className="text-[9px] uppercase font-bold text-gray-500 flex items-center gap-2">
                                  <FileText className="w-3 h-3 text-cyan-400" /> AI Description
                              </h5>
                              <button 
                                  onClick={() => copyToClipboard(m.description, `desc-${file.id}`)}
                                  className="text-[9px] text-cyan-400 hover:underline flex items-center gap-1 font-bold"
                              >
                                  {copiedId === `desc-${file.id}` ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
                                  {copiedId === `desc-${file.id}` ? "COPIED" : "COPY TEXT"}
                              </button>
                          </div>
                          <textarea
                            value={m.description}
                            onChange={(e) => handleUpdate(file.id, { description: e.target.value })}
                            className="w-full text-xs text-gray-300 italic bg-transparent border-0 outline-none focus:ring-0 leading-relaxed resize-none h-16"
                          />
                        </div>

                        {/* INTERACTIVE KEYWORDS ZONE with Priority Sorters */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h5 className="text-xs uppercase font-black text-white flex items-center gap-2">
                                <Tag className="w-3.5 h-3.5 text-red-400" /> 
                                Keywords Sorting Workspace
                              </h5>
                              <button 
                                  onClick={() => copyKeywordsAsCSV(m.keywords, `tags-${file.id}`)}
                                  className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 font-black tracking-wider uppercase bg-cyan-950/40 px-3 py-1 border border-cyan-500/20 rounded-lg shadow-inner"
                              >
                                  {copiedId === `tags-${file.id}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                  {copiedId === `tags-${file.id}` ? "COPIED CSV" : "COPY ALL AS CSV"}
                              </button>
                            </div>

                            <p className="text-[11px] text-gray-400 leading-snug">
                              Adobe Stock rank weighting algorithm gives extreme search relevance to your <span className="text-yellow-400 font-bold">first 5 keywords</span>. Promote tags to gold crown slots, inject custom words, or shift order!
                            </p>

                            {/* SPECIAL: Crown Rank Pin Slots (Gold Gradient Glow) */}
                            <div className="bg-gradient-to-br from-yellow-500/5 to-amber-500/5 border border-yellow-500/25 p-4 rounded-2xl relative shadow-md">
                              <div className="absolute top-2 right-4 flex items-center gap-1 text-[9px] font-black text-yellow-500">
                                <Award className="w-3.5 h-3.5" /> GOLD SEED RANK (FIRST 5 WEIGHTED TAGS)
                              </div>
                              
                              <div className="flex flex-wrap gap-2.5 mt-4">
                                {m.keywords.slice(0, 5).map((tag, i) => (
                                  <div 
                                    key={`crown-${tag}-${i}`} 
                                    className="group relative flex items-center bg-yellow-950/45 border-2 border-yellow-500/50 rounded-xl px-3 py-1.5 text-xs text-yellow-300 font-bold shadow-[0_0_10px_rgba(234,179,8,0.1)] hover:border-yellow-400 transition-all cursor-default"
                                  >
                                    <span className="font-mono text-yellow-500 shrink-0 mr-1.5 text-[10px]">#{i + 1}</span>
                                    {editingTagIndex?.fileId === file.id && editingTagIndex?.index === i ? (
                                      <input
                                        type="text"
                                        value={editingTagValue}
                                        onChange={(e) => setEditingTagValue(e.target.value)}
                                        onBlur={() => saveEditedTag(file.id, i, m.keywords)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') saveEditedTag(file.id, i, m.keywords);
                                          if (e.key === 'Escape') setEditingTagIndex(null);
                                        }}
                                        autoFocus
                                        className="bg-black/60 text-white outline-none border border-yellow-500/30 rounded px-1 max-w-[80px]"
                                      />
                                    ) : (
                                      <span onDoubleClick={() => startEditingTag(file.id, i, tag)} title="Double click to edit">{tag}</span>
                                    )}

                                    {/* Action items inside crown tags */}
                                    <div className="ml-2 flex items-center gap-1 transition-all opacity-40 group-hover:opacity-100 scale-95 origin-right">
                                      <button 
                                        onClick={() => shiftTagDown(file.id, i, m.keywords)}
                                        className="p-0.5 hover:bg-yellow-500/20 text-yellow-400 rounded"
                                        title="Shift priority down"
                                      >
                                        <ArrowDown className="w-3 h-3" />
                                      </button>
                                      <button 
                                        onClick={() => demoteTag(file.id, i, m.keywords)}
                                        className="p-0.5 hover:bg-yellow-500/20 text-yellow-400 rounded"
                                        title="Demote from Gold Seed zone"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                ))}

                                {m.keywords.length < 5 && (
                                  <div className="px-3 py-1.5 border border-dashed border-yellow-500/20 rounded-xl text-yellow-500/40 text-xs italic">
                                    Promote more keywords to unlock maximum SEO reach
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* STANDARD KEYWORDS ZONE */}
                            <div className="bg-black/15 border border-white/5 p-4 rounded-2xl">
                              <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold block mb-3">Regular Keyword Pool (Click a tag to instantly promote to Top 5 #1!)</span>
                              
                              <div className="flex flex-wrap gap-2.5 max-h-[160px] overflow-y-auto pr-1">
                                {m.keywords.slice(5).map((tag, originIdx) => {
                                  const realIdx = originIdx + 5;
                                  return (
                                    <div 
                                      key={`regular-${tag}-${realIdx}`} 
                                      className="group relative flex items-center bg-white/5 border border-white/10 hover:border-cyan-500/45 rounded-xl px-2.5 py-1 text-xs text-gray-300 hover:text-white transition-all cursor-pointer shadow-sm select-none"
                                      onClick={() => promoteTagToTop(file.id, realIdx, m.keywords)}
                                    >
                                      {editingTagIndex?.fileId === file.id && editingTagIndex?.index === realIdx ? (
                                        <input
                                          type="text"
                                          value={editingTagValue}
                                          onChange={(e) => setEditingTagValue(e.target.value)}
                                          onClick={(e) => e.stopPropagation()}
                                          onBlur={() => saveEditedTag(file.id, realIdx, m.keywords)}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') saveEditedTag(file.id, realIdx, m.keywords);
                                            if (e.key === 'Escape') setEditingTagIndex(null);
                                          }}
                                          autoFocus
                                          className="bg-black/60 text-white outline-none border border-cyan-500/30 rounded px-1 max-w-[80px]"
                                        />
                                      ) : (
                                        <span 
                                          onDoubleClick={(e) => { 
                                            e.stopPropagation(); 
                                            startEditingTag(file.id, realIdx, tag); 
                                          }}
                                          title="Click to PROMOTE to #1 slot, Double-Click to Edit"
                                        >
                                          {tag}
                                        </span>
                                      )}

                                      {/* Tags utility tools */}
                                      <div className="ml-1.5 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all scale-90 origin-right">
                                        <button 
                                          onClick={(e) => { e.stopPropagation(); shiftTagUp(file.id, realIdx, m.keywords); }}
                                          className="p-0.5 hover:bg-white/10 text-gray-400 hover:text-white rounded"
                                          title="Shift tag up"
                                        >
                                          <ArrowUp className="w-3 h-3" />
                                        </button>
                                        <button 
                                          onClick={(e) => { e.stopPropagation(); deleteTag(file.id, realIdx, m.keywords); }}
                                          className="p-0.5 hover:bg-white/10 text-red-400 rounded"
                                          title="Delete keyword tag"
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* QUICK INLINE TAG INJECTOR BAR */}
                              <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
                                <input
                                  type="text"
                                  value={newTagText[file.id] || ""}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setNewTagText(prev => ({ ...prev, [file.id]: val }));
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      addCustomTag(file.id, m.keywords);
                                    }
                                  }}
                                  className="flex-1 bg-white/5 border border-white/10 focus:border-cyan-500 text-xs px-3.5 py-2.5 rounded-xl text-white placeholder-gray-500 outline-none transition-all"
                                  placeholder="Type keywords (comma separated) to add..."
                                />
                                <button
                                  onClick={() => addCustomTag(file.id, m.keywords)}
                                  className="bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-2.5 rounded-xl font-bold flex items-center gap-1 text-xs transition-all tracking-wider"
                                >
                                  <Plus className="w-4 h-4 text-black" />
                                  ADD TAG
                                </button>
                              </div>
                            </div>
                        </div>

                        {/* Extra bottom panels: Detected Objects, Mood, Suggestions */}
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
