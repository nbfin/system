import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { CHANNELS } from '../constants';
import { QuotationFilters } from '../types';

interface SearchBarProps {
  filters: QuotationFilters;
  onFilterChange: (filters: QuotationFilters) => void;
  onClear: () => void;
}

export default function SearchBar({ filters, onFilterChange, onClear }: SearchBarProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-end">
      <div className="flex-1 min-w-[200px]">
        <label className="block text-xs font-medium text-slate-500 mb-1">關鍵字搜尋 (品名/料號)</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleChange}
            placeholder="輸入搜尋內容..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="w-40">
        <label className="block text-xs font-medium text-slate-500 mb-1">通路篩選</label>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <select
            name="channel"
            value={filters.channel}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm appearance-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
          >
            <option value="">全部通路</option>
            {CHANNELS.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="w-40">
        <label className="block text-xs font-medium text-slate-500 mb-1">起始日期</label>
        <input
          type="date"
          name="startDate"
          value={filters.startDate}
          onChange={handleChange}
          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
        />
      </div>

      <div className="w-40">
        <label className="block text-xs font-medium text-slate-500 mb-1">結束日期</label>
        <input
          type="date"
          name="endDate"
          value={filters.endDate}
          onChange={handleChange}
          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
        />
      </div>

      <button
        onClick={onClear}
        className="px-4 py-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
      >
        <X className="w-4 h-4" />
        清除
      </button>
    </div>
  );
}
