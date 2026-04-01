import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { UserProfile, UserRole } from '../types';
import { Shield, User, Search, Check, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface UserManagementProps {
  currentUserRole: UserRole;
}

export default function UserManagement({ currentUserRole }: UserManagementProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingUid, setUpdatingUid] = useState<string | null>(null);

  useEffect(() => {
    if (currentUserRole !== 'admin') return;

    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as UserProfile);
      setUsers(data);
    }, (error) => {
      console.error("Error fetching users:", error);
    });

    return () => unsubscribe();
  }, [currentUserRole]);

  const handleUpdateRole = async (uid: string, newRole: UserRole) => {
    setUpdatingUid(uid);
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, { role: newRole });
    } catch (error) {
      console.error("Error updating role:", error);
      alert("更新權限失敗，請確認您是否有管理員權限。");
    } finally {
      setUpdatingUid(null);
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.displayName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (currentUserRole !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">權限不足</h2>
        <p className="text-slate-500 max-w-xs">只有系統管理員可以進入此頁面進行權限管理。</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-slate-800">使用者權限管理</h2>
          <p className="text-sm text-slate-500">管理系統使用者的存取權限與角色設定</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="搜尋姓名或 Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all w-full sm:w-64"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">使用者資訊</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">目前角色</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">權限設定</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">加入時間</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.map((user) => (
                <motion.tr 
                  layout
                  key={user.uid} 
                  className="hover:bg-slate-50/30 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center overflow-hidden">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <User className="w-5 h-5 text-emerald-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{user.displayName || '未設定姓名'}</p>
                        <p className="text-xs text-slate-400 font-medium">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      user.role === 'admin' 
                        ? "bg-amber-50 text-amber-700 border border-amber-100" 
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    )}>
                      {user.role === 'admin' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                      {user.role === 'admin' ? '管理員' : '一般人員'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleUpdateRole(user.uid, 'staff')}
                        disabled={updatingUid === user.uid || user.role === 'staff'}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
                          user.role === 'staff'
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-white text-slate-400 border-slate-200 hover:border-emerald-500 hover:text-emerald-600"
                        )}
                      >
                        {user.role === 'staff' && <Check className="w-3 h-3 inline mr-1" />}
                        一般人員
                      </button>
                      <button
                        onClick={() => handleUpdateRole(user.uid, 'admin')}
                        disabled={updatingUid === user.uid || user.role === 'admin'}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
                          user.role === 'admin'
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-white text-slate-400 border-slate-200 hover:border-amber-500 hover:text-amber-600"
                        )}
                      >
                        {user.role === 'admin' && <Check className="w-3 h-3 inline mr-1" />}
                        管理員
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400 font-medium">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-slate-400 text-sm font-medium">查無符合條件的使用者</p>
          </div>
        )}
      </div>
    </div>
  );
}
