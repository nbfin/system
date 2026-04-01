import { ArrowUpDown, Edit2, Trash2, Eye } from 'lucide-react';
import { Quotation, SortKey, SortOrder, UserRole } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface QuotationTableProps {
  data: Quotation[];
  sortKey: SortKey;
  sortOrder: SortOrder;
  userRole: UserRole;
  onSort: (key: SortKey) => void;
  onEdit: (quotation: Quotation) => void;
  onDelete: (id: string) => void;
  onPreview: (quotation: Quotation) => void;
}

export default function QuotationTable({
  data,
  sortKey,
  sortOrder,
  userRole,
  onSort,
  onEdit,
  onDelete,
  onPreview,
}: QuotationTableProps) {
  const isAdmin = userRole === 'admin';

  const columns: { key: SortKey; label: string; adminOnly?: boolean }[] = [
    { key: 'channel', label: '通路' },
    { key: 'date', label: '報價日期' },
    { key: 'partNumber', label: '料號' },
    { key: 'productName', label: '品名' },
    { key: 'moq', label: '數量' },
    { key: 'amount', label: '單價 (含稅)' },
    { key: 'cost', label: '成本', adminOnly: true },
  ];

  const visibleColumns = columns.filter(col => !col.adminOnly || isAdmin);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-bottom border-slate-200">
              {visibleColumns.map(col => (
                <th
                  key={col.key}
                  onClick={() => onSort(col.key)}
                  className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    {col.label}
                    <ArrowUpDown className={`w-3 h-3 transition-opacity ${sortKey === col.key ? 'opacity-100 text-emerald-600' : 'opacity-0 group-hover:opacity-50'}`} />
                  </div>
                </th>
              ))}
              {isAdmin && (
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">GP%</th>
              )}
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <AnimatePresence mode="popLayout">
              {data.length > 0 ? (
                data.map(item => (
                  <motion.tr
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={item.id}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {item.channel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-mono">{item.date}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-800">{item.partNumber}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.productName}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.moq.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-bold text-emerald-700">
                      $ {formatCurrency(item.amount)}
                    </td>
                    {isAdmin && (
                      <>
                        <td className="px-6 py-4 text-sm text-amber-700 font-bold">
                          $ {formatCurrency(item.cost)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {(() => {
                            const gp = ((item.amount - item.cost) / item.amount) * 100;
                            return (
                              <span className={cn(
                                "font-bold",
                                gp >= 30 ? "text-emerald-600" : gp >= 15 ? "text-amber-600" : "text-red-600"
                              )}>
                                {gp.toFixed(1)}%
                              </span>
                            );
                          })()}
                        </td>
                      </>
                    )}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onPreview(item)}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                          title="預覽"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEdit(item)}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                          title="編輯"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`確定要刪除「${item.productName}」的報價嗎？`)) {
                              onDelete(item.id);
                            }
                          }}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="刪除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isAdmin ? 9 : 7} className="px-6 py-12 text-center text-slate-400 italic">
                    查無符合條件的報價資料
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
