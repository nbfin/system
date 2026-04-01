import React from 'react';
import { X, FileText, Calendar, Hash, Package, Layers, DollarSign, Printer } from 'lucide-react';
import { Quotation, UserRole } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface QuotationDetailModalProps {
  quotation: Quotation | null;
  userRole: UserRole;
  onClose: () => void;
  onPrint: (quotation: Quotation) => void;
}

export default function QuotationDetailModal({ quotation, userRole, onClose, onPrint }: QuotationDetailModalProps) {
  if (!quotation) return null;

  const isAdmin = userRole === 'admin';
  const gp = ((quotation.amount - quotation.cost) / quotation.amount) * 100;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* 背景遮罩 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* 彈出視窗主體 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        >
          {/* 標題欄 */}
          <div className="bg-emerald-900 px-6 py-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-800 rounded-lg">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold">報價詳細資訊</h3>
                <p className="text-[10px] text-emerald-300 uppercase tracking-widest">Quotation Details</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-emerald-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 內容區域 */}
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <DetailItem icon={<Layers className="w-4 h-4" />} label="通路" value={quotation.channel} isBadge />
              <DetailItem icon={<Calendar className="w-4 h-4" />} label="報價日期" value={quotation.date} />
              <DetailItem icon={<Hash className="w-4 h-4" />} label="料號" value={quotation.partNumber} isBold />
              <DetailItem icon={<Package className="w-4 h-4" />} label="品名" value={quotation.productName} className="col-span-2" />
              <DetailItem icon={<Layers className="w-4 h-4" />} label="數量" value={quotation.moq.toLocaleString()} />
              <DetailItem 
                icon={<DollarSign className="w-4 h-4" />} 
                label="單價 (含稅)" 
                value={`$ ${formatCurrency(quotation.amount)}`} 
                isHighlight 
              />
              {isAdmin && (
                <>
                  <DetailItem 
                    icon={<DollarSign className="w-4 h-4" />} 
                    label="成本" 
                    value={`$ ${formatCurrency(quotation.cost)}`} 
                    isBold
                    className="text-amber-700"
                  />
                  <DetailItem 
                    icon={<FileText className="w-4 h-4" />} 
                    label="GP%" 
                    value={`${gp.toFixed(1)}%`} 
                    isBold
                    className={cn(
                      gp >= 30 ? "text-emerald-600" : gp >= 15 ? "text-amber-600" : "text-red-600"
                    )}
                  />
                </>
              )}
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => onPrint(quotation)}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold transition-all flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                報價單列印
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm font-bold transition-all"
              >
                關閉視窗
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function DetailItem({ 
  icon, 
  label, 
  value, 
  isBadge = false, 
  isBold = false, 
  isHighlight = false,
  className = "" 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string | number; 
  isBadge?: boolean;
  isBold?: boolean;
  isHighlight?: boolean;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center gap-2 text-slate-400">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <div className="pl-6">
        {isBadge ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
            {value}
          </span>
        ) : (
          <span className={`text-sm ${isBold ? 'font-bold text-slate-800' : 'text-slate-600'} ${isHighlight ? 'text-lg font-black text-emerald-700' : ''}`}>
            {value}
          </span>
        )}
      </div>
    </div>
  );
}
