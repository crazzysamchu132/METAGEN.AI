import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { DropZone } from './components/DropZone';
import { ImageGrid } from './components/ImageGrid';
import { MetadataDisplay } from './components/MetadataDisplay';
import { SettingsModal } from './components/SettingsModal';
import { UploadedFile, ImageMetadata } from './types';
import { analyzeImage } from './services/geminiService';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Trash2, Play, Download, History as HistoryIcon, Camera, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { cn } from './lib/utils';

export default function App() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<UploadedFile[]>([]);
  const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate');
  const [apiKey, setApiKey] = useState(localStorage.getItem('metagen_api_key') || '');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Load history from local storage
  useEffect(() => {
    const savedHistory = localStorage.getItem('metagen_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  const saveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('metagen_api_key', key);
  };

  const handleFilesAdded = useCallback((newFiles: File[]) => {
    const uploadedFiles: UploadedFile[] = newFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      status: 'pending',
      progress: 0
    }));
    setFiles(prev => [...prev, ...uploadedFiles]);
  }, []);

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const clearAll = () => {
    setFiles([]);
  };

  const processAll = async () => {
    if (files.length === 0) return;
    
    if (!apiKey && !process.env.GEMINI_API_KEY) {
        setIsSettingsOpen(true);
        return;
    }

    setIsProcessing(true);

    const updatedFiles = [...files];
    
    for (let i = 0; i < updatedFiles.length; i++) {
        if (updatedFiles[i].status === 'completed') continue;

        try {
            updatedFiles[i].status = 'processing';
            updatedFiles[i].progress = 10;
            setFiles([...updatedFiles]);

            const metadata = await analyzeImage(updatedFiles[i].file, apiKey);
            
            updatedFiles[i].status = 'completed';
            updatedFiles[i].progress = 100;
            updatedFiles[i].metadata = metadata;
            setFiles([...updatedFiles]);
        } catch (error) {
            console.error(error);
            updatedFiles[i].status = 'error';
            updatedFiles[i].error = error instanceof Error ? error.message : "Unknown error";
            setFiles([...updatedFiles]);
        }
    }

    setIsProcessing(false);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00f3ff', '#ff003c', '#ffffff']
    });

    // Save to history
    const completed = updatedFiles.filter(f => f.status === 'completed');
    if (completed.length > 0) {
        const newHistory = [...completed, ...history].slice(0, 50);
        setHistory(newHistory);
        localStorage.setItem('metagen_history', JSON.stringify(newHistory));
    }
  };

  const downloadAllCSV = () => {
    const completed = files.filter(f => f.status === 'completed' && f.metadata);
    if (completed.length === 0) return;

    const headers = ["File Name", "Title", "Description", "Keywords", "Category", "Colors", "Objects", "Mood", "Suggestions"];
    const rows = completed.map(f => {
        const m = f.metadata!;
        return [
            m.file_name,
            m.title,
            `"${m.description.replace(/"/g, '""')}"`,
            `"${m.keywords.join(', ')}"`,
            m.category,
            `"${m.dominant_colors.join(', ')}"`,
            `"${m.objects_detected.join(', ')}"`,
            m.mood,
            `"${m.usage_suggestions.replace(/"/g, '""')}"`
        ];
    });

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `metadata_export_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen pb-20">
      <Header onOpenSettings={() => setIsSettingsOpen(true)} />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col gap-12">
          
          {/* Main Hero & Tabs */}
          <section className="text-center space-y-6 pt-8">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-black tracking-tight leading-none"
            >
              CRYSTALIZE YOUR <br />
              <span className="text-[#00f3ff] drop-shadow-[0_0_15px_rgba(0,243,255,0.5)]">VISUAL DATA</span>
            </motion.h1>
            
            {(!apiKey && !process.env.GEMINI_API_KEY) && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-3 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-sm"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>API Key required to process images</span>
                <button 
                  onClick={() => setIsSettingsOpen(true)}
                  className="font-bold underline ml-2 hover:text-red-300"
                >
                  Configure Now
                </button>
              </motion.div>
            )}

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-gray-400 max-w-xl mx-auto text-lg"
            >
              The ultimate AI-powered metadata architect for designers, photographers, and content creators.
            </motion.p>

            <div className="flex justify-center gap-4 pt-4">
              <button 
                onClick={() => setActiveTab('generate')}
                className={cn(
                  "flex items-center gap-2 px-6 py-2 rounded-full transition-all duration-300 border",
                  activeTab === 'generate' 
                    ? "bg-cyan-500/10 border-cyan-400 text-cyan-400 neon-cyan-glow" 
                    : "border-white/10 text-gray-500 hover:text-white"
                )}
              >
                <Sparkles className="w-4 h-4" />
                Generator
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={cn(
                  "flex items-center gap-2 px-6 py-2 rounded-full transition-all duration-300 border",
                  activeTab === 'history' 
                    ? "bg-red-500/10 border-red-400 text-red-400 neon-red-glow" 
                    : "border-white/10 text-gray-500 hover:text-white"
                )}
              >
                <HistoryIcon className="w-4 h-4" />
                History
              </button>
            </div>
          </section>

          <AnimatePresence mode="wait">
            {activeTab === 'generate' ? (
              <motion.div
                key="generate-tab"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-8"
              >
                {/* Upload Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1">
                    <DropZone onFilesAdded={handleFilesAdded} />
                  </div>
                  <div className="lg:col-span-2">
                    <div className="glass-panel p-6 min-h-[400px] flex flex-col">
                      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                          Queue <span className="bg-white/10 text-xs px-2 py-0.5 rounded-full">{files.length}</span>
                        </h3>
                        {files.length > 0 && (
                          <div className="flex gap-2">
                            <button 
                              onClick={clearAll}
                              className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" /> Clear
                            </button>
                            <button 
                                onClick={processAll}
                                disabled={isProcessing || files.every(f => f.status === 'completed')}
                                className="btn-primary flex items-center gap-2 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Play className="w-4 h-4 fill-current" />
                                {isProcessing ? "Processing..." : "Generate Web3 Metadata"}
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {files.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 space-y-2 opacity-50">
                          <Camera className="w-12 h-12 stroke-[1]" />
                          <p>Upload images to begin processing</p>
                        </div>
                      ) : (
                        <ImageGrid files={files} onRemove={removeFile} />
                      )}
                    </div>
                  </div>
                </div>

                {/* Results Section */}
                <AnimatePresence>
                  {files.some(f => f.status === 'completed') && (
                    <motion.section
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center justify-between uppercase tracking-widest text-xs font-black text-cyan-400">
                        <span>Analysis Results</span>
                        <button 
                          onClick={downloadAllCSV}
                          className="flex items-center gap-2 text-white bg-cyan-600 hover:bg-cyan-500 px-4 py-2 rounded-lg transition-colors"
                        >
                          <Download className="w-4 h-4" /> Export CSV
                        </button>
                      </div>
                      <MetadataDisplay files={files.filter(f => f.status === 'completed')} />
                    </motion.section>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                key="history-tab"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Recent Extractions</h2>
                    <button 
                        onClick={() => { setHistory([]); localStorage.removeItem('metagen_history'); }}
                        className="text-sm text-red-500 hover:bg-red-500/10 px-3 py-1 rounded-md transition-all"
                    >
                        Clear History
                    </button>
                </div>

                {history.length === 0 ? (
                    <div className="glass-panel p-20 text-center opacity-50 space-y-4">
                        <HistoryIcon className="w-16 h-16 mx-auto" />
                        <p className="text-xl">Your archive is empty.</p>
                    </div>
                ) : (
                    <MetadataDisplay files={history} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Futuristic Background Particles (CSS only) */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] left-[10%] w-64 h-64 bg-cyan-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-red-500/10 blur-[150px] rounded-full animate-pulse [animation-delay:2s]" />
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        apiKey={apiKey} 
        onSave={saveApiKey} 
      />

    </div>
  );
}
