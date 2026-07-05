import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { useTransactions } from '../hooks/useTransactions';
import { formatCurrency, formatDate } from '../utils/formatters';
import { TransactionModal } from '../components/TransactionModal';

import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit2, 
  Receipt,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  X
} from 'lucide-react';

const CATEGORIES = [
  'Food',
  'Travel',
  'Shopping',
  'Bills',
  'Education',
  'Investment',
  'Entertainment',
  'Others',
] as const;

export const Transactions: React.FC = () => {
  const { transactions, loading, addTransaction, updateTransaction, deleteTransaction } = useTransactions();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  
  // Filtering States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Handle Add/Edit triggers
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

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
    setSelectedCategory('all');
    setStartDate('');
    setEndDate('');
  };

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    // Search Term Filter
    const matchesSearch = tx.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Type Filter
    const matchesType = selectedType === 'all' || tx.type === selectedType;
    
    // Category Filter
    const matchesCategory = selectedCategory === 'all' || tx.category === selectedCategory;
    
    // Date Range Filter
    let matchesDate = true;
    if (startDate) {
      matchesDate = matchesDate && tx.date >= startDate;
    }
    if (endDate) {
      matchesDate = matchesDate && tx.date <= endDate;
    }
    
    return matchesSearch && matchesType && matchesCategory && matchesDate;
  });

  // Calculate filtered totals
  const filteredIncome = filteredTransactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const filteredExpense = filteredTransactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight m-0">
              Transactions
            </h1>
            <p className="text-dark-400 text-sm mt-1">
              Log, edit, and analyze your individual transactions.
            </p>
          </div>
          <button
            id="transactions-add-tx"
            onClick={handleOpenAddModal}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-accent-purple to-accent-blue hover:from-accent-purple/95 hover:to-accent-blue/95 text-white text-sm font-bold shadow-lg shadow-accent-purple/15 transition-all select-none self-start md:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="glass-card rounded-2xl p-5 border border-white/5 space-y-4">
          <div className="flex items-center gap-2 text-dark-300 text-sm font-semibold uppercase tracking-wider mb-2">
            <Filter className="w-4 h-4 text-accent-purple" />
            <span>Filter Transactions</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-dark-500">
                <Search className="w-4 h-4" />
              </span>
              <input
                id="filter-search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search transactions..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-xs"
              />
            </div>

            {/* Type Filter */}
            <select
              id="filter-type"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-xs appearance-none bg-dark-900"
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>

            {/* Category Filter */}
            <select
              id="filter-category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-xs appearance-none bg-dark-900"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Clear Filters */}
            <button
              onClick={clearFilters}
              className="w-full py-2.5 px-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-xs font-bold text-dark-200 hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Clear Filters</span>
            </button>
          </div>

          {/* Date range row */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <div className="w-full sm:w-auto flex items-center gap-2">
              <span className="text-[10px] font-bold text-dark-400 uppercase tracking-wider shrink-0">Date From</span>
              <input
                id="filter-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full sm:w-auto px-3 py-1.5 rounded-lg glass-input text-[11px]"
              />
            </div>
            <div className="w-full sm:w-auto flex items-center gap-2">
              <span className="text-[10px] font-bold text-dark-400 uppercase tracking-wider shrink-0">To</span>
              <input
                id="filter-end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full sm:w-auto px-3 py-1.5 rounded-lg glass-input text-[11px]"
              />
            </div>
          </div>
        </div>

        {/* Filter Summary Stats */}
        {filteredTransactions.length > 0 && (
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-dark-400">
            <span>Showing {filteredTransactions.length} of {transactions.length} records:</span>
            <span className="px-2.5 py-1 rounded-lg bg-accent-emerald/10 border border-accent-emerald/15 text-accent-emerald">
              Income: <b>{formatCurrency(filteredIncome)}</b>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-accent-rose/10 border border-accent-rose/15 text-accent-rose">
              Expense: <b>{formatCurrency(filteredExpense)}</b>
            </span>
          </div>
        )}

        {/* Transactions Listing */}
        <div className="glass-card rounded-2xl border border-white/5 p-6 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center py-20">
              <div className="w-10 h-10 border-2 border-accent-purple/30 border-t-accent-purple rounded-full animate-spin"></div>
              <p className="text-xs text-dark-500 mt-2 animate-pulse">Syncing transactions list...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-20">
              <Receipt className="w-12 h-12 text-dark-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-1">No transactions match filters</h3>
              <p className="text-xs text-dark-500 max-w-xs mx-auto mt-1">Try tweaking your search term, changing categories, or click "Add Transaction" to create a new log.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5 text-[10px] text-dark-500 font-bold uppercase tracking-wider text-left">
                      <th className="pb-4">Type</th>
                      <th className="pb-4">Title</th>
                      <th className="pb-4">Category</th>
                      <th className="pb-4">Date</th>
                      <th className="pb-4 text-right">Amount</th>
                      <th className="pb-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="text-sm text-dark-200 group hover:bg-white/[0.01]">
                        <td className="py-4">
                          <span className={`inline-flex items-center gap-1 p-1 px-2 rounded-lg font-bold text-[10px] uppercase tracking-wide border ${
                            tx.type === 'income' 
                              ? 'bg-accent-emerald/10 border-accent-emerald/15 text-accent-emerald' 
                              : 'bg-accent-rose/10 border-accent-rose/15 text-accent-rose'
                          }`}>
                            {tx.type === 'income' ? (
                              <>
                                <ArrowUpRight className="w-3 h-3" />
                                <span>Income</span>
                              </>
                            ) : (
                              <>
                                <ArrowDownLeft className="w-3 h-3" />
                                <span>Expense</span>
                              </>
                            )}
                          </span>
                        </td>
                        <td className="py-4 font-medium text-white max-w-[200px] truncate">{tx.title}</td>
                        <td className="py-4">
                          <span className="px-2 py-0.5 rounded-md bg-dark-900 border border-white/5 text-[10px] text-dark-300 font-semibold uppercase tracking-wide">
                            {tx.category}
                          </span>
                        </td>
                        <td className="py-4 text-xs text-dark-400">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-dark-500" />
                            {formatDate(tx.date)}
                          </span>
                        </td>
                        <td className="py-4 text-right font-semibold">
                          <span className={tx.type === 'income' ? 'text-accent-emerald' : 'text-accent-rose'}>
                            {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleOpenEditModal(tx)}
                              className="p-2 rounded-lg bg-white/5 border border-white/5 text-dark-400 hover:text-white hover:border-accent-purple/30 transition-all cursor-pointer"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDelete(tx.id!)}
                              className="p-2 rounded-lg bg-white/5 border border-white/5 text-dark-400 hover:text-accent-rose hover:border-accent-rose/30 transition-all cursor-pointer"
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

              {/* Mobile Card View */}
              <div className="grid grid-cols-1 gap-4 md:hidden">
                {filteredTransactions.map((tx) => (
                  <div key={tx.id} className="glass p-4 rounded-xl border border-white/5 flex flex-col gap-3 relative">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-white max-w-[180px] truncate">{tx.title}</h4>
                        <span className="inline-block px-2 py-0.5 rounded bg-dark-900 border border-white/5 text-[9px] text-dark-300 font-semibold uppercase tracking-wide">
                          {tx.category}
                        </span>
                      </div>
                      <span className={`text-base font-extrabold ${tx.type === 'income' ? 'text-accent-emerald' : 'text-accent-rose'}`}>
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-dark-400 border-t border-white/5 pt-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-dark-500" />
                        {formatDate(tx.date)}
                      </span>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleOpenEditModal(tx)}
                          className="px-2 py-1 rounded bg-white/5 border border-white/5 text-dark-400 hover:text-white flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(tx.id!)}
                          className="px-2 py-1 rounded bg-white/5 border border-white/5 text-dark-400 hover:text-accent-rose flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
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
export default Transactions;
