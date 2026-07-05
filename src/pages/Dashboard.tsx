import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { useTransactions } from '../hooks/useTransactions';
import { useBudget } from '../hooks/useBudget';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { TransactionModal } from '../components/TransactionModal';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ArrowUpRight, 
  Percent, 
  Plus, 
  AlertTriangle,
  Receipt,
  Edit2,
  Trash2,
  Calendar,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { transactions, loading, addTransaction, updateTransaction, deleteTransaction } = useTransactions();
  const { monthlyBudget, totalExpenses: currentMonthExpenses, remainingBudget, spendingPercentage, isOverBudget } = useBudget();
  const { userProfile } = useAuth();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);

  // Stats Calculations (All-time vs current month)
  const totalIncome = transactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpenses = transactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalBalance = totalIncome - totalExpenses;

  // Monthly Savings (Current Month Income - Current Month Expense)
  const currentDate = new Date();
  const currentMonthIncome = transactions
    .filter(tx => {
      if (tx.type !== 'income') return false;
      const txDate = new Date(tx.date);
      return txDate.getMonth() === currentDate.getMonth() && txDate.getFullYear() === currentDate.getFullYear();
    })
    .reduce((sum, tx) => sum + tx.amount, 0);

  const monthlySavings = currentMonthIncome - currentMonthExpenses;

  // Recent 5 transactions
  const recentTransactions = transactions.slice(0, 5);

  const handleOpenAddModal = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tx: any) => {
    setEditingTransaction(tx);
    setIsModalOpen(true);
  };

  const handleSaveTransaction = async (txData: any) => {
    if (editingTransaction) {
      await updateTransaction(editingTransaction.id, txData);
    } else {
      await addTransaction(txData);
    }
  };

  const handleDelete = async (txId: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await deleteTransaction(txId);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight m-0">
              Dashboard
            </h1>
            <p className="text-dark-400 text-sm mt-1">
              Welcome back, <span className="text-white font-medium">{userProfile?.displayName}</span>! Here's your financial overview.
            </p>
          </div>
          <button
            id="dashboard-add-tx"
            onClick={handleOpenAddModal}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-accent-purple to-accent-blue hover:from-accent-purple/95 hover:to-accent-blue/95 text-white text-sm font-bold shadow-lg shadow-accent-purple/15 transition-all select-none self-start md:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>

        {/* Budget Warning Banner */}
        {isOverBudget && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-accent-rose/10 border border-accent-rose/20 flex items-center gap-4 text-accent-rose shadow-lg shadow-accent-rose/5"
          >
            <div className="p-2 rounded-xl bg-accent-rose/20 text-accent-rose shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold">Budget Limit Exceeded!</p>
              <p className="text-xs text-dark-300 mt-0.5">
                Your monthly expenses (<b>{formatCurrency(currentMonthExpenses)}</b>) have exceeded your budget of <b>{formatCurrency(monthlyBudget)}</b> by <b>{formatCurrency(currentMonthExpenses - monthlyBudget)}</b>.
              </p>
            </div>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Total Balance */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="glass-card rounded-2xl p-5 border border-white/5 flex flex-col justify-between group hover:border-white/10 transition-all duration-300"
          >
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-dark-400 uppercase tracking-wider">Total Balance</span>
              <div className="p-2 rounded-lg bg-accent-blue/15 text-accent-blue">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className={`text-2xl font-extrabold tracking-tight ${totalBalance >= 0 ? 'text-white' : 'text-accent-rose'}`}>
                {formatCurrency(totalBalance)}
              </h3>
              <p className="text-[10px] text-dark-500 mt-1">All-time net balance</p>
            </div>
          </motion.div>

          {/* Total Income */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-5 border border-white/5 flex flex-col justify-between hover:border-white/10 transition-all duration-300"
          >
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-dark-400 uppercase tracking-wider">Total Income</span>
              <div className="p-2 rounded-lg bg-accent-emerald/15 text-accent-emerald">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-extrabold text-white tracking-tight">
                {formatCurrency(totalIncome)}
              </h3>
              <p className="text-[10px] text-accent-emerald font-semibold mt-1">All-time earnings</p>
            </div>
          </motion.div>

          {/* Total Expenses */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card rounded-2xl p-5 border border-white/5 flex flex-col justify-between hover:border-white/10 transition-all duration-300"
          >
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-dark-400 uppercase tracking-wider">Total Expenses</span>
              <div className="p-2 rounded-lg bg-accent-rose/15 text-accent-rose">
                <TrendingDown className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-extrabold text-white tracking-tight">
                {formatCurrency(totalExpenses)}
              </h3>
              <p className="text-[10px] text-accent-rose font-semibold mt-1">All-time spending</p>
            </div>
          </motion.div>

          {/* Monthly Savings */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-5 border border-white/5 flex flex-col justify-between hover:border-white/10 transition-all duration-300"
          >
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-dark-400 uppercase tracking-wider">Monthly Savings</span>
              <div className="p-2 rounded-lg bg-accent-purple/15 text-accent-purple">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className={`text-2xl font-extrabold tracking-tight ${monthlySavings >= 0 ? 'text-white' : 'text-accent-rose'}`}>
                {formatCurrency(monthlySavings)}
              </h3>
              <p className="text-[10px] text-dark-500 mt-1">For {currentDate.toLocaleString('default', { month: 'long' })}</p>
            </div>
          </motion.div>

          {/* Spending Percentage */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-card rounded-2xl p-5 border border-white/5 flex flex-col justify-between hover:border-white/10 transition-all duration-300"
          >
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-dark-400 uppercase tracking-wider">Budget Util.</span>
              <div className="p-2 rounded-lg bg-accent-purple/15 text-accent-purple">
                <Percent className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-extrabold text-white tracking-tight">
                {monthlyBudget > 0 ? `${Math.round(spendingPercentage)}%` : 'N/A'}
              </h3>
              <p className="text-[10px] text-dark-500 mt-1">
                {monthlyBudget > 0 
                  ? `${formatCurrency(currentMonthExpenses)} of ${formatCurrency(monthlyBudget)}`
                  : 'Budget not set'
                }
              </p>
            </div>
          </motion.div>
        </div>

        {/* Middle Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left / Center: Recent Transactions & Budget Progress */}
          <div className="lg:col-span-2 space-y-8">
            {/* Budget Progress Widget */}
            {monthlyBudget > 0 && (
              <div className="glass-card rounded-2xl p-6 border border-white/5">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                    Monthly Budget Progress
                  </h4>
                  <span className="text-xs text-dark-400">
                    {formatCurrency(currentMonthExpenses)} / {formatCurrency(monthlyBudget)}
                  </span>
                </div>
                {/* Progress bar container */}
                <div className="w-full h-3 rounded-full bg-dark-900 overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(spendingPercentage, 100)}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full rounded-full bg-gradient-to-r ${
                      isOverBudget 
                        ? 'from-accent-rose to-red-500' 
                        : spendingPercentage > 85 
                        ? 'from-yellow-500 to-accent-rose'
                        : 'from-accent-purple to-accent-blue'
                    }`}
                  ></motion.div>
                </div>
                <div className="flex justify-between text-[11px] text-dark-500 mt-2 font-medium">
                  <span>{Math.round(spendingPercentage)}% Spent</span>
                  <span>{remainingBudget >= 0 ? `${formatCurrency(remainingBudget)} remaining` : `${formatCurrency(Math.abs(remainingBudget))} over limit`}</span>
                </div>
              </div>
            )}

            {/* Recent Transactions List */}
            <div className="glass-card rounded-2xl p-6 border border-white/5">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  Recent Transactions
                </h4>
                <Link 
                  to="/transactions" 
                  className="text-xs font-semibold text-accent-purple hover:text-accent-purple/80 transition-colors"
                >
                  View All
                </Link>
              </div>

              {loading ? (
                <div className="flex flex-col items-center py-10">
                  <div className="w-8 h-8 border-2 border-accent-purple/30 border-t-accent-purple rounded-full animate-spin"></div>
                  <p className="text-xs text-dark-500 mt-2 animate-pulse">Fetching transactions...</p>
                </div>
              ) : recentTransactions.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-white/5 rounded-xl">
                  <Receipt className="w-8 h-8 text-dark-600 mx-auto mb-2" />
                  <p className="text-sm text-dark-400 font-medium">No transactions yet</p>
                  <p className="text-xs text-dark-500 mt-1 max-w-xs mx-auto">Click "Add Transaction" to log your first income or expense.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/5 text-[10px] text-dark-500 font-bold uppercase tracking-wider text-left">
                        <th className="pb-3">Title</th>
                        <th className="pb-3">Category</th>
                        <th className="pb-3">Date</th>
                        <th className="pb-3 text-right">Amount</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {recentTransactions.map((tx) => (
                        <tr key={tx.id} className="text-sm text-dark-200 group hover:bg-white/[0.01]">
                          <td className="py-3.5 pr-2 font-medium text-white max-w-[150px] truncate">{tx.title}</td>
                          <td className="py-3.5 pr-2">
                            <span className="px-2 py-0.5 rounded-md bg-dark-900 border border-white/5 text-[10px] text-dark-300 font-semibold uppercase tracking-wide">
                              {tx.category}
                            </span>
                          </td>
                          <td className="py-3.5 text-xs text-dark-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-dark-500" />
                              {formatDate(tx.date)}
                            </span>
                          </td>
                          <td className="py-3.5 text-right font-semibold">
                            <span className={tx.type === 'income' ? 'text-accent-emerald' : 'text-accent-rose'}>
                              {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                            </span>
                          </td>
                          <td className="py-3.5 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => handleOpenEditModal(tx)}
                                className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-dark-400 hover:text-white hover:border-accent-purple/30 transition-all"
                                title="Edit"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => handleDelete(tx.id!)}
                                className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-dark-400 hover:text-accent-rose hover:border-accent-rose/30 transition-all"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: AI quick widget and Budget configuration */}
          <div className="space-y-8">
            {/* AI Assistant Quick Insight Card */}
            <div className="glass-card rounded-2xl p-6 border border-white/5 relative overflow-hidden flex flex-col justify-between h-full min-h-[300px]">
              <div className="absolute top-0 right-0 w-24 h-24 bg-accent-purple/10 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-accent-purple">
                  <div className="p-2 rounded-xl bg-accent-purple/15">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-white">AI Financial Coach</h4>
                </div>
                
                <p className="text-xs text-dark-300 leading-relaxed">
                  FinSight AI audits your transactions to detect spending habits and recommend smart budget targets.
                </p>

                <div className="glass-accent-purple p-4 rounded-xl border border-accent-purple/10 text-xs text-dark-200 mt-2 italic leading-relaxed">
                  "Looks like you have active transactions logged. Go to the AI Assistant tab to run a full health check of your budget."
                </div>
              </div>

              <Link
                to="/ai-assistant"
                className="w-full mt-6 py-2.5 px-4 rounded-xl bg-accent-purple/10 hover:bg-accent-purple/20 text-accent-purple text-xs font-bold text-center border border-accent-purple/10 transition-colors block"
              >
                Ask FinSight AI
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTransaction}
        transactionToEdit={editingTransaction}
      />
    </Layout>
  );
};
export default Dashboard;
