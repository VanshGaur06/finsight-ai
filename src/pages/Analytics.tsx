import React from 'react';
import { Layout } from '../components/Layout';
import { useTransactions } from '../hooks/useTransactions';
import { formatCurrency } from '../utils/formatters';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area,
  CartesianGrid
} from 'recharts';
import { motion } from 'framer-motion';
import { PieChart as PieIcon, BarChart3, TrendingUp, AlertCircle } from 'lucide-react';

const CATEGORY_COLORS: { [key: string]: string } = {
  Food: '#f43f5e',       // Rose
  Travel: '#3b82f6',     // Blue
  Shopping: '#ec4899',   // Pink
  Bills: '#eab308',      // Yellow
  Education: '#8b5cf6',  // Purple
  Investment: '#10b981', // Emerald
  Entertainment: '#a855f7', // Violet
  Others: '#64748b',     // Slate
};

export const Analytics: React.FC = () => {
  const { transactions, loading } = useTransactions();

  // 1. Process Monthly Data (Income vs Expense & Savings Trend)
  // Let's group transactions by YYYY-MM
  const getMonthlyStats = () => {
    const monthlyGroups: { [key: string]: { month: string, income: number, expense: number, savings: number } } = {};
    
    // Sort transactions chronologically to generate chronological trend
    const chronTransactions = [...transactions].reverse();

    chronTransactions.forEach((tx) => {
      if (!tx.date) return;
      const dateObj = new Date(tx.date);
      // Format: "MMM YY" (e.g. "Jul 26")
      const monthYear = dateObj.toLocaleDateString('en-US', {
        month: 'short',
        year: '2-digit',
        timeZone: 'UTC'
      });

      if (!monthlyGroups[monthYear]) {
        monthlyGroups[monthYear] = {
          month: monthYear,
          income: 0,
          expense: 0,
          savings: 0,
        };
      }

      if (tx.type === 'income') {
        monthlyGroups[monthYear].income += tx.amount;
      } else {
        monthlyGroups[monthYear].expense += tx.amount;
      }
      monthlyGroups[monthYear].savings = monthlyGroups[monthYear].income - monthlyGroups[monthYear].expense;
    });

    // Return array sorted or in the order of insertion (already chronological)
    return Object.values(monthlyGroups);
  };

  const monthlyData = getMonthlyStats();

  // 2. Process Category Data (Expenses only)
  const getCategoryStats = () => {
    const categoryTotals: { [key: string]: number } = {};
    let totalExpense = 0;

    transactions.forEach((tx) => {
      if (tx.type === 'expense') {
        categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
        totalExpense += tx.amount;
      }
    });

    return Object.keys(categoryTotals).map((cat) => ({
      name: cat,
      value: categoryTotals[cat],
      percentage: totalExpense > 0 ? Math.round((categoryTotals[cat] / totalExpense) * 100) : 0,
    }));
  };

  const categoryData = getCategoryStats();

  // Custom Chart Tooltip styling
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass p-3.5 rounded-xl border border-white/10 shadow-xl text-xs space-y-1.5">
          <p className="font-bold text-white mb-1 uppercase tracking-wide text-[10px] text-dark-400">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color || entry.fill }} className="font-semibold">
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight m-0">
            Financial Analytics
          </h1>
          <p className="text-dark-400 text-sm mt-1">
            Visual reports of your income, expenses, categories, and savings trends.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-24">
            <div className="w-10 h-10 border-2 border-accent-purple/30 border-t-accent-purple rounded-full animate-spin"></div>
            <p className="text-xs text-dark-500 mt-2 animate-pulse">Analyzing accounts...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center border border-white/5">
            <AlertCircle className="w-12 h-12 text-dark-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-1">No transaction data available</h3>
            <p className="text-xs text-dark-500 mt-1 max-w-sm mx-auto">
              We need logged transaction data to build your visual reports. Add some incomes and expenses first!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Chart 1: Income vs Expense Comparison */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-6 border border-white/5 space-y-6"
            >
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-accent-blue/10 text-accent-blue">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Income vs Expenses</h3>
              </div>
              
              <div className="h-80 w-full text-xs">
                {monthlyData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-dark-500">No monthly data</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                      <XAxis dataKey="month" stroke="#64748b" tickLine={false} />
                      <YAxis stroke="#64748b" tickLine={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                      <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ color: '#fff' }} />
                      <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </motion.div>

            {/* Chart 2: Category wise spending Pie Chart */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card rounded-2xl p-6 border border-white/5 space-y-6"
            >
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-accent-purple/10 text-accent-purple">
                  <PieIcon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Expense Distribution</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                {/* Donut Chart */}
                <div className="h-60 w-full text-xs relative flex items-center justify-center">
                  {categoryData.length === 0 ? (
                    <div className="text-dark-500">No expense logs</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip content={<CustomTooltip />} />
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || '#64748b'} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                  {categoryData.length > 0 && (
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-[10px] font-bold text-dark-500 uppercase tracking-wide">Total Expenses</span>
                      <span className="text-lg font-extrabold text-white">
                        {formatCurrency(transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0))}
                      </span>
                    </div>
                  )}
                </div>

                {/* Legends & Percentages */}
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-2">
                  {categoryData.length === 0 ? (
                    <p className="text-xs text-dark-500">Log expenses to see split</p>
                  ) : (
                    categoryData
                      .sort((a, b) => b.value - a.value)
                      .map((entry) => (
                        <div key={entry.name} className="flex justify-between items-center text-xs">
                          <div className="flex items-center gap-2">
                            <span 
                              className="w-2.5 h-2.5 rounded-full shrink-0" 
                              style={{ backgroundColor: CATEGORY_COLORS[entry.name] || '#64748b' }}
                            ></span>
                            <span className="font-medium text-dark-200">{entry.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-dark-400 font-semibold">{entry.percentage}%</span>
                            <span className="text-white font-bold">{formatCurrency(entry.value)}</span>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </motion.div>

            {/* Chart 3: Savings Trend */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-2xl p-6 border border-white/5 space-y-6 lg:col-span-2"
            >
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-accent-purple/10 text-accent-purple">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Savings Trend</h3>
              </div>

              <div className="h-80 w-full text-xs">
                {monthlyData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-dark-500">No monthly savings data</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="savingsColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                      <XAxis dataKey="month" stroke="#64748b" tickLine={false} />
                      <YAxis stroke="#64748b" tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend verticalAlign="top" height={36} iconType="circle" />
                      <Area 
                        type="monotone" 
                        dataKey="savings" 
                        name="Net Savings" 
                        stroke="#8b5cf6" 
                        fillOpacity={1} 
                        fill="url(#savingsColor)" 
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </Layout>
  );
};
export default Analytics;
