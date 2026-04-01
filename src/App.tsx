import { useState, useMemo, useEffect } from 'react';
import { Download, LayoutDashboard, FileText, Settings, PlusCircle, Printer, LogOut, Shield, ShieldOff, User, Users } from 'lucide-react';
import { Quotation, QuotationFilters, SortKey, SortOrder, UserRole, UserProfile } from './types';
import { exportToCSV, cn } from './lib/utils';
import QuotationForm from './components/QuotationForm';
import QuotationTable from './components/QuotationTable';
import SearchBar from './components/SearchBar';
import QuotationDetailModal from './components/QuotationDetailModal';
import OrderFormPrint from './components/OrderFormPrint';
import Dashboard from './components/Dashboard';
import UserManagement from './components/UserManagement';
import Login from './components/Login';
import ErrorBoundary from './components/ErrorBoundary';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  addDoc
} from 'firebase/firestore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default function App() {
  // 權限與使用者狀態
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [loading, setLoading] = useState(true);

  // 頁面分頁狀態
  const [activeTab, setActiveTab] = useState<'dashboard' | 'list' | 'users'>('list');

  // 報價資料狀態
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  
  // 篩選狀態
  const [filters, setFilters] = useState<QuotationFilters>({
    search: '',
    channel: '',
    startDate: '',
    endDate: '',
  });

  // 排序狀態
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; order: SortOrder }>({
    key: 'date',
    order: 'desc',
  });

  // 編輯中的資料
  const [editingItem, setEditingItem] = useState<Quotation | null>(null);

  // 預覽中的資料
  const [previewItem, setPreviewItem] = useState<Quotation | null>(null);

  // 是否正在列印
  const [isPrinting, setIsPrinting] = useState(false);

  // 監聽 Auth 狀態
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUserProfile(userSnap.data() as UserProfile);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
        }
      } else {
        setUserProfile(null);
      }
      setIsAuthReady(true);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 監聽 Firestore 報價資料
  useEffect(() => {
    if (!isAuthReady || !userProfile) return;

    const q = query(collection(db, 'quotations'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Quotation[];
      setQuotations(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'quotations');
    });

    return () => unsubscribe();
  }, [isAuthReady, userProfile]);

  // 處理新增或更新
  const handleSubmit = async (data: Omit<Quotation, 'id' | 'createdAt' | 'authorUid'>) => {
    if (!userProfile) return;

    try {
      if (editingItem) {
        const docRef = doc(db, 'quotations', editingItem.id);
        await updateDoc(docRef, { ...data });
        setEditingItem(null);
      } else {
        const newItem = {
          ...data,
          authorUid: userProfile.uid,
          createdAt: Date.now(),
        };
        await addDoc(collection(db, 'quotations'), newItem);
      }
    } catch (error) {
      handleFirestoreError(error, editingItem ? OperationType.UPDATE : OperationType.CREATE, 'quotations');
    }
  };

  // 處理刪除
  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'quotations', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `quotations/${id}`);
    }
  };

  // 處理排序切換
  const handleSort = (key: SortKey) => {
    setSortConfig(prev => ({
      key,
      order: prev.key === key && prev.order === 'asc' ? 'desc' : 'asc',
    }));
  };

  // 處理匯出 CSV
  const handleExport = () => {
    const exportData = filteredAndSortedData.map(({ id, createdAt, authorUid, ...rest }) => ({
      '通路': rest.channel,
      '報價日期': rest.date,
      '料號': rest.partNumber,
      '品名': rest.productName,
      '數量': rest.moq,
      '單價(含稅)': rest.amount,
    }));
    exportToCSV(exportData, `自然美報價單_${new Date().toISOString().split('T')[0]}.csv`);
  };

  // 篩選與排序後的資料
  const filteredAndSortedData = useMemo(() => {
    return quotations
      .filter(item => {
        const matchesSearch = 
          item.productName.toLowerCase().includes(filters.search.toLowerCase()) ||
          item.partNumber.toLowerCase().includes(filters.search.toLowerCase());
        const matchesChannel = !filters.channel || item.channel === filters.channel;
        const matchesStartDate = !filters.startDate || item.date >= filters.startDate;
        const matchesEndDate = !filters.endDate || item.date <= filters.endDate;
        return matchesSearch && matchesChannel && matchesStartDate && matchesEndDate;
      })
      .sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        if (valA < valB) return sortConfig.order === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.order === 'asc' ? 1 : -1;
        return 0;
      });
  }, [quotations, filters, sortConfig]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!userProfile) {
    return <Login />;
  }

  const userRole = userProfile.role;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        {/* 預覽彈窗 */}
        <QuotationDetailModal
          quotation={previewItem}
          userRole={userRole}
          onClose={() => setPreviewItem(null)}
          onPrint={(item) => {
            setPreviewItem(null);
            setIsPrinting(true);
          }}
        />

        {/* 列印視窗 */}
        {isPrinting && (
          <OrderFormPrint
            items={filteredAndSortedData}
            onClose={() => setIsPrinting(false)}
          />
        )}

        {/* 側邊欄裝飾 (僅桌面端) */}
        <div className="fixed left-0 top-0 bottom-0 w-16 bg-emerald-900 hidden lg:flex flex-col items-center py-8 gap-8 z-10">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-emerald-900 font-black text-xl">NB</span>
          </div>
          <div className="flex flex-col gap-6">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={cn(
                "p-3 rounded-xl transition-all",
                activeTab === 'dashboard' ? "bg-emerald-800 text-white shadow-inner" : "text-emerald-300 hover:text-white hover:bg-emerald-800"
              )}
              title="儀表板"
            >
              <LayoutDashboard className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setActiveTab('list')}
              className={cn(
                "p-3 rounded-xl transition-all",
                activeTab === 'list' ? "bg-emerald-800 text-white shadow-inner" : "text-emerald-300 hover:text-white hover:bg-emerald-800"
              )}
              title="報價清單"
            >
              <FileText className="w-5 h-5" />
            </button>
            {userRole === 'admin' && (
              <button 
                onClick={() => setActiveTab('users')}
                className={cn(
                  "p-3 rounded-xl transition-all",
                  activeTab === 'users' ? "bg-emerald-800 text-white shadow-inner" : "text-emerald-300 hover:text-white hover:bg-emerald-800"
                )}
                title="權限管理"
              >
                <Users className="w-5 h-5" />
              </button>
            )}
            <button className="p-3 text-emerald-300 hover:text-white hover:bg-emerald-800 rounded-xl transition-colors"><Settings className="w-5 h-5" /></button>
          </div>
        </div>

        <main className="lg:pl-16">
          {/* 頂部導航 */}
          <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-black tracking-tight text-slate-800">自然美報價系統</h1>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded uppercase tracking-widest">
                  {activeTab === 'dashboard' ? 'Dashboard' : activeTab === 'users' ? 'Admin' : 'Management'}
                </span>
              </div>
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border",
                    userRole === 'admin' 
                      ? "bg-amber-50 text-amber-700 border-amber-200" 
                      : "bg-slate-50 text-slate-500 border-slate-200"
                  )}>
                    {userRole === 'admin' ? <Shield className="w-3 h-3" /> : <ShieldOff className="w-3 h-3" />}
                    {userRole === 'admin' ? '管理員模式' : '一般模式'}
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-slate-800">{userProfile.displayName || '使用者'} / {userRole === 'admin' ? '報價管理員' : '一般人員'}</p>
                    <p className="text-[10px] text-slate-400">{userProfile.email}</p>
                  </div>
                <button 
                  onClick={() => signOut(auth)}
                  className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-xs hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                  title="登出"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </header>

          <div className="max-w-7xl mx-auto px-6 py-8">
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' ? (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black text-slate-800">數據儀表板</h2>
                    <button 
                      onClick={() => setActiveTab('list')}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold shadow-md shadow-emerald-200 hover:bg-emerald-700 transition-all"
                    >
                      <PlusCircle className="w-4 h-4" />
                      新增報價
                    </button>
                  </div>
                  <Dashboard data={quotations} userRole={userRole} />
                </motion.div>
              ) : activeTab === 'users' ? (
                <motion.div
                  key="users"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <UserManagement currentUserRole={userRole} />
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  {/* 報價表單區塊 */}
                  <section>
                    <QuotationForm
                      initialData={editingItem}
                      userRole={userRole}
                      onSubmit={handleSubmit}
                      onCancel={() => setEditingItem(null)}
                    />
                  </section>

                  {/* 報價清單區塊 */}
                  <section className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        報價紀錄清單
                        <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                          共 {filteredAndSortedData.length} 筆
                        </span>
                      </h2>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsPrinting(true)}
                          disabled={filteredAndSortedData.length === 0}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold shadow-md shadow-emerald-200 hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Printer className="w-4 h-4" />
                          報價單列印
                        </button>
                        <button
                          onClick={handleExport}
                          disabled={filteredAndSortedData.length === 0}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-600 text-slate-600 rounded-lg text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                          <Download className="w-4 h-4" />
                          匯出 CSV
                        </button>
                      </div>
                    </div>

                    <SearchBar
                      filters={filters}
                      onFilterChange={setFilters}
                      onClear={() => setFilters({ search: '', channel: '', startDate: '', endDate: '' })}
                    />

                    <QuotationTable
                      data={filteredAndSortedData}
                      sortKey={sortConfig.key}
                      sortOrder={sortConfig.order}
                      userRole={userRole}
                      onSort={handleSort}
                      onEdit={setEditingItem}
                      onDelete={handleDelete}
                      onPreview={setPreviewItem}
                    />
                  </section>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 頁尾 */}
          <footer className="max-w-7xl mx-auto px-6 py-8 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-400">© 2024 自然美生物科技股份有限公司 - 內部系統</p>
          </footer>
        </main>
      </div>
    </ErrorBoundary>
  );
}
