import React from 'react';
import { Camera, Facebook, Info, Settings, LogIn, LogOut, User, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { signInWithGoogle, logout, ADMIN_EMAIL, ADMIN_UID } from '../lib/firebase';
import { User as FirebaseUser } from 'firebase/auth';
import { UserProfile } from '../types';

interface HeaderProps {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  onOpenSettings: () => void;
  onOpenAdmin: () => void;
  onOpenAbout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, userProfile, onOpenSettings, onOpenAdmin, onOpenAbout }) => {
  const isAdmin = user?.email === ADMIN_EMAIL || 
                  user?.uid === ADMIN_UID || 
                  userProfile?.role === 'admin';

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

        <nav className="flex items-center gap-3 sm:gap-8 text-[10px] sm:text-sm font-bold uppercase tracking-widest text-gray-400">
          <a href="#" className="hover:text-cyan-400 transition-colors hidden sm:block">Home</a>
          <button 
            onClick={onOpenAbout}
            className="hover:text-cyan-400 transition-colors cursor-pointer"
          >
            About Us
          </button>
        </nav>

        <div className="flex items-center gap-1 sm:gap-4">
          {isAdmin && (
            <button 
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-cyan-500/20 transition-all"
            >
              <Shield className="w-3 h-3" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          )}

          <button 
            onClick={onOpenSettings}
            className="p-1 sm:p-2 text-gray-400 hover:text-white transition-colors hover:bg-white/5 rounded-lg"
            title="API Settings"
          >
            <Settings className="w-4 h-4 sm:w-5 h-5" />
          </button>
          
          <div className="hidden sm:block h-6 w-px bg-white/10 mx-1" />

          {user ? (
            <div className="flex items-center gap-1.5 sm:gap-3">
               <div className="flex flex-col items-end bg-cyan-500/5 border border-cyan-500/10 px-2.5 py-1 rounded-lg">
                  <span className="text-[10px] text-cyan-400 font-black tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8.0px_#00f3ff]" />
                    {userProfile?.points !== undefined ? userProfile.points : 100} PTS
                  </span>
                  <span className="text-[8px] text-gray-400/80 font-mono tracking-widest">CREDITS</span>
               </div>

               <div className="hidden lg:flex flex-col items-end">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Authenticated</span>
                  <span className="text-xs text-white max-w-[100px] truncate">{user.displayName || user.email}</span>
               </div>
               <div className="flex items-center gap-1 sm:gap-2">
                  <button className="hidden sm:flex w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 items-center justify-center overflow-hidden border border-white/20">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="User" />
                    ) : (
                      <User className="w-4 h-4 sm:w-5 h-5" />
                    )}
                  </button>
                  <button 
                    onClick={() => logout()}
                    className="flex items-center gap-1 sm:gap-2 px-1.5 sm:px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-red-500/30 transition-all"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5 sm:w-4 h-4" />
                    <span className="hidden sm:inline">LogOut</span>
                  </button>
               </div>
            </div>
          ) : (
            <button 
              onClick={() => signInWithGoogle()}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg bg-white text-black text-[10px] sm:text-sm font-bold hover:bg-gray-200 transition-colors"
            >
              <LogIn className="w-3.5 h-3.5 sm:w-4 h-4" />
              Sign In
            </button>
          )}

          <a 
            href="https://www.facebook.com/share/1Gp3obVFo7/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] sm:text-sm hover:bg-[#1877F2]/20 hover:border-[#1877F2]/50 hover:text-[#1877F2] transition-all"
          >
            <Facebook className="w-3.5 h-3.5 sm:w-4 h-4 fill-current" />
            <span className="hidden sm:inline">Facebook</span>
          </a>
        </div>
      </div>
    </header>
  );
};
