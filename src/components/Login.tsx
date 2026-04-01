import { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { LogIn, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user profile exists in Firestore
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // Create initial profile with 'staff' role
        // Note: The first user could be 'admin' if we want, 
        // but for safety, let's default to 'staff'.
        // The prompt context says nbfd2024@gmail.com is the user.
        const isAdmin = user.email === 'nbfd2024@gmail.com';
        
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          role: isAdmin ? 'admin' : 'staff',
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: Date.now()
        });
      }
    } catch (err: any) {
      console.error("Login Error:", err);
      setError(err.message || "登入失敗，請稍後再試。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        <div className="bg-emerald-900 p-10 text-center text-white">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-6">
            <span className="text-emerald-900 font-black text-3xl">NB</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight mb-2">自然美報價系統</h1>
          <p className="text-emerald-300 text-sm uppercase tracking-widest font-medium">Internal Management System</p>
        </div>

        <div className="p-10 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-slate-800">歡迎回來</h2>
            <p className="text-slate-500 text-sm">請使用公司 Google 帳號登入系統</p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center">
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 hover:border-emerald-500 hover:text-emerald-600 text-slate-700 font-bold py-4 px-6 rounded-2xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                使用 Google 帳號登入
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-medium uppercase tracking-widest">
            <ShieldCheck className="w-3 h-3" />
            安全加密連線
          </div>
        </div>
      </motion.div>
    </div>
  );
}
