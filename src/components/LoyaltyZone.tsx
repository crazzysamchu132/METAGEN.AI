import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, Zap, Award, Flame, CheckCircle, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile } from '../types';
import { db } from '../lib/firebase';
import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';

interface LoyaltyZoneProps {
  currentUser: any;
  userProfile: UserProfile | null;
  onRefreshProfile: () => void;
}

export const LoyaltyZone: React.FC<LoyaltyZoneProps> = ({ 
  currentUser, 
  userProfile,
  onRefreshProfile
}) => {
  const [isClaimedToday, setIsClaimedToday] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [claimedValue, setClaimedValue] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);

  // Helper: Get today's local date YYYY-MM-DD
  const getTodayDateStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const date = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${date}`;
  };

  // Helper: Get yesterday's local date YYYY-MM-DD
  const getYesterdayDateStr = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const date = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${date}`;
  };

  useEffect(() => {
    const todayStr = getTodayDateStr();
    const yesterdayStr = getYesterdayDateStr();

    if (currentUser && userProfile) {
      // 1. Sync claim status for signed-in user
      const lastClaimed = userProfile.lastDailyClaim || "";
      setIsClaimedToday(lastClaimed === todayStr);

      // 2. Sync / calculate streak for signed-in user
      const lastLoginDate = localStorage.getItem(`metagen_last_login_date_${currentUser.uid}`);
      let currentStreak = userProfile.streak || 0;

      if (!lastLoginDate) {
        // First login tracked locally
        localStorage.setItem(`metagen_last_login_date_${currentUser.uid}`, todayStr);
        if (currentStreak === 0) {
          currentStreak = 1;
          updateStreakOnDb(1);
        }
      } else if (lastLoginDate !== todayStr) {
        if (lastLoginDate === yesterdayStr) {
          currentStreak += 1;
        } else {
          currentStreak = 1; // reset streak if gap exists
        }
        localStorage.setItem(`metagen_last_login_date_${currentUser.uid}`, todayStr);
        updateStreakOnDb(currentStreak);
      }
      setStreak(currentStreak);
    } else {
      // Guest users (localStorage backup)
      const localDataStr = localStorage.getItem('metagen_guest_loyalty');
      if (localDataStr) {
        try {
          const localData = JSON.parse(localDataStr);
          const claimDate = localData.lastDailyClaim || "";
          setIsClaimedToday(claimDate === todayStr);

          let currentStreak = localData.streak || 0;
          const lastVisit = localData.lastLogin || "";

          if (lastVisit !== todayStr) {
            if (lastVisit === yesterdayStr) {
              currentStreak += 1;
            } else {
              currentStreak = 1;
            }
            localData.streak = currentStreak;
            localData.lastLogin = todayStr;
            localStorage.setItem('metagen_guest_loyalty', JSON.stringify(localData));
          }
          setStreak(currentStreak);
        } catch (e) {
          console.error("Local loyalty parse error", e);
        }
      } else {
        const freshData = {
          streak: 1,
          lastDailyClaim: "",
          lastLogin: todayStr
        };
        localStorage.setItem('metagen_guest_loyalty', JSON.stringify(freshData));
        setStreak(1);
      }
    }
  }, [currentUser, userProfile]);

  const updateStreakOnDb = async (newStreak: number) => {
    if (!currentUser) return;
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        streak: newStreak,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.warn("Failed to sync streak to firestore", err);
    }
  };

  const handleClaimDailyBooster = async () => {
    if (isClaimedToday || isRolling) return;
    setIsRolling(true);

    // Roll random bonus balance between 10 and 25 points
    const rolledPoints = Math.floor(Math.random() * 16) + 10; // min 10, max 25

    // Visual thrill roll effects
    let ticks = 0;
    const interval = setInterval(() => {
      setClaimedValue(Math.floor(Math.random() * 16) + 10);
      ticks++;
      if (ticks > 15) {
        clearInterval(interval);
        finalizeClaim(rolledPoints);
      }
    }, 70);
  };

  const finalizeClaim = async (pointsValue: number) => {
    const todayStr = getTodayDateStr();

    if (currentUser && userProfile) {
      const currentPoints = userProfile.points !== undefined ? userProfile.points : 100;
      const newPoints = currentPoints + pointsValue;
      
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          points: newPoints,
          lastDailyClaim: todayStr,
          updatedAt: serverTimestamp()
        });
        
        setClaimedValue(pointsValue);
        setIsClaimedToday(true);
        setIsRolling(false);
        onRefreshProfile();

        // Burst confetti
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#eab308', '#00f3ff', '#3b82f6', '#ffffff']
        });
      } catch (err) {
        setIsRolling(false);
        alert("Failed to submit claim to server. Please try again! Error: " + (err instanceof Error ? err.message : String(err)));
      }
    } else {
      // Guest claim persistence
      const localDataStr = localStorage.getItem('metagen_guest_loyalty') || "{}";
      try {
        const localData = JSON.parse(localDataStr);
        localData.lastDailyClaim = todayStr;
        localStorage.setItem('metagen_guest_loyalty', JSON.stringify(localData));

        setClaimedValue(pointsValue);
        setIsClaimedToday(true);
        setIsRolling(false);

        // Guest alert explaining they need auth to claim real persistent points
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#eab308', '#ffffff']
        });
      } catch (e) {
        setIsRolling(false);
      }
    }
  };

  return (
    <div className="glass-panel p-6 border-cyan-500/20 flex flex-col justify-between h-full group relative overflow-hidden">
      {/* Holographic scanner active styling */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent animate-[scan_3s_linear_infinite]" />
      
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-yellow-400" />
            <h4 className="text-sm font-black uppercase tracking-widest text-white">
              Loyalty Arena & Streaks
            </h4>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-500 text-[10px] font-black">
            <Flame className="w-3 h-3 fill-current text-yellow-500 animate-[pulse_1.5s_infinite]" />
            {streak} DAY STREAK
          </div>
        </div>

        <p className="text-xs text-gray-400 leading-relaxed mb-6">
          Maximize your stock indexing potential. Claim your daily randomized loyalty bonus credits <span className="text-cyan-400 font-bold">(+10 to +25 PTS)</span> and sustain your visit streak to dominate the stock ranks!
        </p>

        {/* Claim Container / visual box */}
        <div className="bg-black/35 border border-white/5 p-4 rounded-xl mb-6 relative overflow-hidden flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${isClaimedToday ? 'bg-cyan-500/10 text-cyan-400' : 'bg-yellow-500/10 text-yellow-400'} border ${isClaimedToday ? 'border-cyan-500/20' : 'border-yellow-500/20 animate-pulse'}`}>
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block">Daily Reward Lootbox</span>
              <span className="text-xs text-white font-black uppercase">
                {isClaimedToday ? "Claimed & Deployed Today" : "Ready to Claim Booster"}
              </span>
            </div>
          </div>

          <div className="text-right">
            {isClaimedToday ? (
              <span className="text-xs text-cyan-400 font-mono font-bold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                +{claimedValue || '15'} PTS ADDED
              </span>
            ) : (
              <span className="text-xs text-yellow-500 font-mono font-black animate-pulse">
                AVAILABLE NOW
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {!currentUser && (
          <div className="text-center text-[10px] uppercase font-bold text-gray-500 py-1 flex items-center justify-center gap-1">
            <Lock className="w-3 h-3 text-red-500" /> Authenticate to save points permanently
          </div>
        )}

        <button
          onClick={handleClaimDailyBooster}
          disabled={isClaimedToday || isRolling}
          className={`w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 ${
            isClaimedToday
              ? 'bg-white/5 border border-white/10 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          {isClaimedToday ? (
            'Booster Deployed - Come Back Tomorrow'
          ) : isRolling ? (
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4 animate-spin text-black" />
              Rolling: {claimedValue || '0'} PTS...
            </span>
          ) : (
            <>
              <Zap className="w-4 h-4 fill-current animate-bounce text-black" />
              Activate Daily Booster
            </>
          )}
        </button>
      </div>
    </div>
  );
};
