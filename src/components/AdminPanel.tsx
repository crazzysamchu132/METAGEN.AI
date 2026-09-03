import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, updateDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, ADMIN_EMAIL, ADMIN_UID } from '../lib/firebase';
import { UserProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, UserX, UserCheck, Search, AlertOctagon, X, Clock, Mail, Globe } from 'lucide-react';
import { format } from 'date-fns';

const formatDateSafe = (dateVal: any): string => {
  if (!dateVal) return 'N/A';
  try {
    if (typeof dateVal?.toDate === 'function') {
      return format(dateVal.toDate(), 'yyyy-MM-dd HH:mm');
    }
    const d = new Date(dateVal);
    if (!isNaN(d.getTime())) {
      return format(d, 'yyyy-MM-dd HH:mm');
    }
  } catch (e) {
    // fallback
  }
  return 'N/A';
};

export const AdminPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [banModalUser, setBanModalUser] = useState<UserProfile | null>(null);
  const [banReason, setBanReason] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('lastLogin', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userList = snapshot.docs.map(doc => ({
        ...doc.data(),
        uid: doc.id
      })) as UserProfile[];
      setUsers(userList);
      setLoading(false);
    }, (error) => {
      console.warn("Could not load users list from Firestore:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleToggleBan = async (user: UserProfile) => {
    if (!user.isBanned) {
      setBanModalUser(user);
      return;
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        isBanned: false,
        banReason: null,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const handleToggleAdmin = async (user: UserProfile) => {
    const isTargetAdmin = user.role === 'admin';
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        role: isTargetAdmin ? 'user' : 'admin',
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const confirmBan = async () => {
    if (!banModalUser || !banReason.trim()) return;

    try {
      const userRef = doc(db, 'users', banModalUser.uid);
      await updateDoc(userRef, {
        isBanned: true,
        banReason: banReason,
        bannedAt: serverTimestamp()
      });
      setBanModalUser(null);
      setBanReason('');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${banModalUser.uid}`);
    }
  };

  const handleAdjustPoints = async (user: UserProfile, amount: number) => {
    const currentPoints = user.points !== undefined ? user.points : 100;
    const newPoints = Math.max(0, currentPoints + amount);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        points: newPoints,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const handleSetPoints = async (user: UserProfile, value: number) => {
    const newPoints = Math.max(0, value);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        points: newPoints,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.uid.includes(searchTerm)
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-5xl h-[80vh] bg-neutral-900 border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-cyan-500/10 to-transparent">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-500/20 rounded-2xl">
              <Shield className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">ADMIN COMMAND CENTER</h2>
              <p className="text-xs text-cyan-400/60 font-mono">AUTHORIZED PERSONNEL ONLY • SESSION SECURE</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 bg-black/20 border-b border-white/5">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text"
              placeholder="SEARCH USER BY EMAIL, NAME OR UID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors font-mono"
            />
          </div>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-4">
              <AlertOctagon className="w-12 h-12 opacity-20" />
              <p className="font-mono text-sm tracking-widest uppercase">No matching users found</p>
            </div>
          ) : (
            <table className="w-full border-separate border-spacing-y-2">
              <thead>
                <tr className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black">
                  <th className="px-4 text-left">Entity</th>
                  <th className="px-4 text-left">Security Status</th>
                  <th className="px-4 text-left">Activity</th>
                  <th className="px-4 text-left">Points Balance</th>
                  <th className="px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, uIdx) => (
                  <tr key={user.uid ? `admin-user-${user.uid}` : `admin-user-idx-${uIdx}`} className="group bg-white/5 hover:bg-white/10 transition-colors rounded-xl overflow-hidden">
                    <td className="px-4 py-3 first:rounded-l-xl">
                      <div className="flex items-center gap-3">
                        <img 
                          src={user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`} 
                          className="w-10 h-10 rounded-lg border border-white/10" 
                          alt="" 
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-white leading-none mb-1">
                            {user.displayName || 'Anonymous Agent'}
                          </span>
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-mono uppercase tracking-tight">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {user.isBanned ? (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest border border-red-500/30">
                          <UserX className="w-3 h-3" />
                          Banned
                        </div>
                      ) : user.role === 'admin' ? (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-widest border border-cyan-500/30">
                          <Shield className="w-3 h-3" />
                          Master Admin
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-[10px] font-black uppercase tracking-widest border border-green-500/30">
                          <UserCheck className="w-3 h-3" />
                          Active
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-mono">
                          <Clock className="w-3 h-3" />
                          {formatDateSafe(user.lastLogin)}
                        </div>
                        {user.domain && (
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-mono lowercase">
                            <Globe className="w-3 h-3" />
                            {user.domain}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-cyan-400 font-bold bg-cyan-950/40 border border-cyan-500/20 px-2 py-0.5 rounded-lg text-xs min-w-[50px] text-center">
                            {user.points !== undefined ? user.points : 100} pts
                          </span>
                        </div>
                        <div className="flex items-center gap-1 bg-black/40 border border-white/5 p-1 rounded-lg w-max shadow-inner">
                          <button
                            onClick={() => handleAdjustPoints(user, -10)}
                            className="w-8 h-6 flex items-center justify-center text-[10px] font-mono text-red-500 hover:bg-white/10 rounded transition-colors"
                            title="Deduct 10 points"
                          >
                            -10
                          </button>
                          <button
                            onClick={() => handleAdjustPoints(user, -1)}
                            className="w-6 h-6 flex items-center justify-center text-[10px] font-mono text-red-400 hover:bg-white/10 rounded transition-colors"
                            title="Deduct 1 point"
                          >
                            -1
                          </button>
                          <button
                            onClick={() => handleAdjustPoints(user, 1)}
                            className="w-6 h-6 flex items-center justify-center text-[10px] font-mono text-emerald-400 hover:bg-white/10 rounded transition-colors"
                            title="Add 1 point"
                          >
                            +1
                          </button>
                          <button
                            onClick={() => handleAdjustPoints(user, 10)}
                            className="w-8 h-6 flex items-center justify-center text-[10px] font-mono text-emerald-500 hover:bg-white/10 rounded transition-colors"
                            title="Add 10 points"
                          >
                            +10
                          </button>
                          <button
                            onClick={() => {
                              const val = prompt(`Reset points balance for ${user.displayName || user.email}:`, String(user.points !== undefined ? user.points : 100));
                              if (val !== null) {
                                const parsed = parseInt(val, 10);
                                if (!isNaN(parsed)) {
                                  handleSetPoints(user, parsed);
                                }
                              }
                            }}
                            className="px-1.5 h-6 flex items-center justify-center text-[9px] uppercase font-mono text-gray-400 hover:text-white hover:bg-white/5 rounded transition-colors"
                            title="Set Custom Point Value"
                          >
                            Set
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 last:rounded-r-xl text-right">
                      <div className="flex items-center justify-end gap-2">
                        {user.email !== ADMIN_EMAIL && user.uid !== ADMIN_UID && (
                          <>
                            <button 
                              onClick={() => handleToggleAdmin(user)}
                              className={`p-2 rounded-lg transition-all ${
                                user.role === 'admin'
                                  ? 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20'
                                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
                              }`}
                              title={user.role === 'admin' ? "Remove Admin Privileges" : "Assign Admin Privileges"}
                            >
                              <Shield className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleToggleBan(user)}
                              className={`p-2 rounded-lg transition-all ${
                                user.isBanned 
                                  ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                                  : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                              }`}
                              title={user.isBanned ? "Revoke Ban" : "Execute Ban"}
                            >
                              {user.isBanned ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>

      {/* Ban Reason Modal */}
      <AnimatePresence>
        {banModalUser && (
          <div key="ban-reason-modal-overlay" className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setBanModalUser(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-neutral-900 border border-white/20 rounded-3xl p-8 shadow-3xl"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-red-500/20 rounded-2xl">
                  <AlertOctagon className="w-8 h-8 text-red-500" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white italic">EXECUTE BAN</h3>
                  <p className="text-xs text-red-500/60 font-mono tracking-widest">USER PROTOCOL VIOLATION</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="text-[10px] text-gray-500 uppercase tracking-tighter mb-1">Target User</div>
                  <div className="text-sm font-bold text-white">{banModalUser.email}</div>
                </div>

                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-tighter mb-2 block">Violation Description</label>
                  <textarea 
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    placeholder="ENTER BAN REASON..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white placeholder:text-gray-700 min-h-[120px] focus:outline-none focus:border-red-500/50 transition-colors font-mono"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setBanModalUser(null)}
                    className="flex-1 py-4 px-6 bg-white/5 text-gray-400 font-bold rounded-2xl hover:bg-white/10 transition-all uppercase text-xs"
                  >
                    Abort
                  </button>
                  <button 
                    onClick={confirmBan}
                    disabled={!banReason.trim()}
                    className="flex-1 py-4 px-6 bg-red-600 text-white font-black rounded-2xl hover:bg-red-500 transition-all shadow-lg shadow-red-600/20 uppercase text-xs disabled:opacity-50 disabled:grayscale"
                  >
                    Confirm Ban
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
