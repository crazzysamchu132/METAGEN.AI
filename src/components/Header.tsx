import React, { useEffect, useState } from 'react';
import { Camera, Facebook, Info, Settings, LogIn, LogOut, User, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { auth, signInWithGoogle, logout, ADMIN_EMAIL } from '../lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings, onOpenAdmin }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
  }, []);

  const isAdmin = user?.email === ADMIN_EMAIL;

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
          <a href="#" className="hover:text-cyan-400 transition-colors">Archive</a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-4">
          {isAdmin && (
            <button 
              onClick={onOpenAdmin}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-cyan-500/20 transition-all"
            >
              <Shield className="w-3 h-3" />
              Admin
            </button>
          )}

          <button 
            onClick={onOpenSettings}
            className="p-2 text-gray-400 hover:text-white transition-colors hover:bg-white/5 rounded-lg"
            title="API Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
          
          <div className="h-6 w-px bg-white/10 mx-1" />

          {user ? (
            <div className="flex items-center gap-3">
               <div className="hidden sm:flex flex-col items-end">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Authenticated</span>
                  <span className="text-xs text-white max-w-[100px] truncate">{user.displayName || user.email}</span>
               </div>
               <div className="relative group">
                  <button className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/20">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="User" />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </button>
                  <div className="absolute top-full right-0 mt-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-50">
                    <button 
                      onClick={() => logout()}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg whitespace-nowrap shadow-xl"
                    >
                      <LogOut className="w-3 h-3" /> Sign Out
                    </button>
                  </div>
               </div>
            </div>
          ) : (
            <button 
              onClick={() => signInWithGoogle()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black text-sm font-bold hover:bg-gray-200 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
          )}

          <a 
            href="https://www.facebook.com/share/1Gp3obVFo7/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm hover:bg-[#1877F2]/20 hover:border-[#1877F2]/50 hover:text-[#1877F2] transition-all"
          >
            <Facebook className="w-4 h-4 fill-current" />
            Facebook
          </a>
        </div>
      </div>
    </header>
  );
};
