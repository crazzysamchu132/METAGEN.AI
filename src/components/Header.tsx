import React from 'react';
import { Camera, Github, Info, Settings } from 'lucide-react';
import { motion } from 'motion/react';

interface HeaderProps {
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <div className="bg-gradient-to-br from-cyan-400 to-blue-600 p-2 rounded-lg">
            <Camera className="w-5 h-5 text-black" />
          </div>
          <span className="text-xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            METAGEN<span className="text-white">.AI</span>
          </span>
        </motion.div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
          <a href="#" className="hover:text-cyan-400 transition-colors">Home</a>
          <a href="#" className="hover:text-cyan-400 transition-colors">Tools</a>
          <a href="#" className="hover:text-cyan-400 transition-colors">History</a>
          <a href="#" className="hover:text-cyan-400 transition-colors">API</a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={onOpenSettings}
            className="p-2 text-gray-400 hover:text-white transition-colors hover:bg-white/5 rounded-lg"
            title="API Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-white transition-colors">
            <Info className="w-5 h-5" />
          </button>
          <button className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm hover:bg-white/10 transition-colors">
            <Github className="w-4 h-4" />
            GitHub
          </button>
        </div>
      </div>
    </header>
  );
};
