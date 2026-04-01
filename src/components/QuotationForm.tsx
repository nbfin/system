import React, { useState, useEffect } from 'react';
import { Plus, Save, RotateCcw } from 'lucide-react';
import { CHANNELS } from '../constants';
import { Quotation, Channel, UserRole } from '../types';
import { cn } from '../lib/utils';

interface QuotationFormProps {
  initialData?: Quotation | null;
  userRole: UserRole;
  onSubmit: (data: Omit<Quotation, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export default function QuotationForm({ initialData, userRole, onSubmit, onCancel }: QuotationFormProps) {
  const isAdmin = userRole === 'admin';

  const [formData, setFormData] = useState({
    channel: '電商' as Channel,
    date: new Date().toISOString().split('T')[0],
    partNumber: '',
    productName: '',
    moq: 0,
    amount: 0,
    cost: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        channel: initialData.channel,
        date: initialData.date,
        partNumber: initialData.partNumber,
        productName: initialData.productName,
        moq: initialData.moq,
        amount: initialData.amount,
        cost: initialData.cost || 0,
      });
    }
  }, [initialData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.partNumber) newErrors.partNumber = '料號為必填';
    if (!formData.productName) newErrors.productName = '品名為必填';
    if (formData.moq <= 0) newErrors.moq = '數量 必須大於 0';
    if (formData.amount <= 0) newErrors.amount = '金額必須大於 0';
    if (isAdmin && formData.cost <= 0) newErrors.cost = '成本必須大於 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
      if (!initialData) {
        setFormData({
          ...formData,
          partNumber: '',
          productName: '',
          moq: 0,
          amount: 0,
          cost: 0,
        });
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'moq' || name === 'amount' || name === 'cost' ? Number(value) : value,
    }));
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          {initialData ? (
            <>
              <Save className="w-5 h-5 text-emerald-600" />
              編輯報價資料
            </>
          ) : (
            <>
              <Plus className="w-5 h-5 text-emerald-600" />
              新增報價資料
            </>
          )}
        </h2>
        {initialData && (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
          >
            <RotateCcw className="w-4 h-4" />
            取消編輯
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">通路</label>
          <select
            name="channel"
            value={formData.channel}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            {CHANNELS.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">報價日期</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">料號</label>
          <input
            type="text"
            name="partNumber"
            value={formData.partNumber}
            onChange={handleChange}
            placeholder="例如: NB-001"
            className={cn(
              "w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none",
              errors.partNumber ? "border-red-500" : "border-slate-200"
            )}
          />
          {errors.partNumber && <p className="text-[10px] text-red-500 mt-1">{errors.partNumber}</p>}
        </div>

        <div className="space-y-1 md:col-span-1 lg:col-span-2">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">品名</label>
          <input
            type="text"
            name="productName"
            value={formData.productName}
            onChange={handleChange}
            placeholder="輸入產品名稱"
            className={cn(
              "w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none",
              errors.productName ? "border-red-500" : "border-slate-200"
            )}
          />
          {errors.productName && <p className="text-[10px] text-red-500 mt-1">{errors.productName}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">數量</label>
          <input
            type="number"
            name="moq"
            value={formData.moq}
            onChange={handleChange}
            min="0"
            className={cn(
              "w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none",
              errors.moq ? "border-red-500" : "border-slate-200"
            )}
          />
          {errors.moq && <p className="text-[10px] text-red-500 mt-1">{errors.moq}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">單價 (含稅)</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            min="0"
            className={cn(
              "w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-emerald-700",
              errors.amount ? "border-red-500" : "border-slate-200"
            )}
          />
          {errors.amount && <p className="text-[10px] text-red-500 mt-1">{errors.amount}</p>}
        </div>

        {isAdmin && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">成本</label>
            <input
              type="number"
              name="cost"
              value={formData.cost}
              onChange={handleChange}
              min="0"
              className={cn(
                "w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-amber-700",
                errors.cost ? "border-red-500" : "border-slate-200"
              )}
            />
            {errors.cost && <p className="text-[10px] text-red-500 mt-1">{errors.cost}</p>}
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold shadow-md shadow-emerald-200 transition-all active:scale-95"
        >
          {initialData ? '更新報價' : '新增報價'}
        </button>
      </div>
    </form>
  );
}
