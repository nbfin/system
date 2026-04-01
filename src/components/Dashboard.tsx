import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  TrendingUp, Users, DollarSign, Package, ArrowUpRight, ArrowDownRight 
} from 'lucide-react';
import { Quotation, UserRole } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { motion } from 'motion/react';

interface DashboardProps {
  data: Quotation[];
  userRole: UserRole;
}

const COLORS = ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'];

export default function Dashboard({ data, userRole }: DashboardProps) {
  const isAdmin = userRole === 'admin';

  const stats = useMemo(() => {
    const totalCount = data.length;
    const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);
    const totalCost = data.reduce((sum, item) => sum + (item.cost || 0), 0);
    const totalProfit = totalAmount - totalCost;
    const avgGP = totalAmount > 0 ? (totalProfit / totalAmount) * 100 : 0;
    
    const avgAmount = totalCount > 0 ? totalAmount / totalCount : 0;
    const maxAmount = totalCount > 0 ? Math.max(...data.map(i => i.amount)) : 0;

    // 按通路統計
    const channelDataMap: Record<string, { name: string; count: number; amount: number; profit: number }> = {};
    data.forEach(item => {
      if (!channelDataMap[item.channel]) {
        channelDataMap[item.channel] = { name: item.channel, count: 0, amount: 0, profit: 0 };
      }
      channelDataMap[item.channel].count += 1;
      channelDataMap[item.channel].amount += item.amount;
      channelDataMap[item.channel].profit += (item.amount - (item.cost || 0));
    });

    const channelData = Object.values(channelDataMap);

    return {
      totalCount,
      totalAmount,
      totalProfit,
      avgGP,
      avgAmount,
      maxAmount,
      channelData
    };
  }, [data]);

  return (
    <div className="space-y-6">
      {/* 數據概覽卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="總報價筆數" 
          value={stats.totalCount} 
          icon={<Package className="w-5 h-5" />} 
          color="bg-blue-50 text-blue-600"
          trend="+12%"
          isUp={true}
        />
        <StatCard 
          title="總報價金額 (含稅)" 
          value={`$ ${formatCurrency(stats.totalAmount)}`} 
          icon={<DollarSign className="w-5 h-5" />} 
          color="bg-emerald-50 text-emerald-600"
          trend="+8.5%"
          isUp={true}
        />
        {isAdmin ? (
          <>
            <StatCard 
              title="總預估毛利" 
              value={`$ ${formatCurrency(stats.totalProfit)}`} 
              icon={<TrendingUp className="w-5 h-5" />} 
              color="bg-amber-50 text-amber-600"
              trend="+15.2%"
              isUp={true}
            />
            <StatCard 
              title="平均 GP%" 
              value={`${stats.avgGP.toFixed(1)}%`} 
              icon={<ArrowUpRight className="w-5 h-5" />} 
              color="bg-purple-50 text-purple-600"
              trend="穩定"
              isUp={true}
            />
          </>
        ) : (
          <>
            <StatCard 
              title="平均報價單價" 
              value={`$ ${formatCurrency(stats.avgAmount)}`} 
              icon={<TrendingUp className="w-5 h-5" />} 
              color="bg-amber-50 text-amber-600"
              trend="-2.1%"
              isUp={false}
            />
            <StatCard 
              title="最高報價單價" 
              value={`$ ${formatCurrency(stats.maxAmount)}`} 
              icon={<ArrowUpRight className="w-5 h-5" />} 
              color="bg-purple-50 text-purple-600"
              trend="新高"
              isUp={true}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 通路報價金額分佈 (柱狀圖) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
            <BarChart className="w-4 h-4 text-emerald-600" />
            各通路報價總額分析
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.channelData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="amount" fill="#059669" radius={[4, 4, 0, 0]} barSize={40} name="報價總額" />
                {isAdmin && <Bar dataKey="profit" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={40} name="預估毛利" />}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 通路佔比 (圓餅圖) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" />
            各通路報價筆數佔比
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.channelData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {stats.channelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend: string;
  isUp: boolean;
}

function StatCard({ title, value, icon, color, trend, isUp }: StatCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className="bg-white p-5 rounded-xl shadow-sm border border-slate-200"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2.5 rounded-lg ${color}`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
          {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {trend}
        </div>
      </div>
      <p className="text-xs font-medium text-slate-500 mb-1">{title}</p>
      <h4 className="text-xl font-black text-slate-800">{value}</h4>
    </motion.div>
  );
}
