import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import type { Transaction } from '../services/firebaseDb';
import { 
  dbAddTransaction, 
  dbUpdateTransaction, 
  dbDeleteTransaction, 
  subscribeToTransactions 
} from '../services/firebaseDb';

export const useTransactions = () => {
  const { user, loading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }

    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToTransactions(
      user.uid,
      (updatedTxs) => {
        setTransactions(updatedTxs);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, authLoading]);

  const addTransaction = async (tx: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (!user) throw new Error('User must be logged in to add transactions');
    setError(null);
    try {
      await dbAddTransaction(user.uid, tx);
    } catch (err: any) {
      setError(err.message || 'Failed to add transaction');
      throw err;
    }
  };

  const updateTransaction = async (txId: string, updates: Partial<Omit<Transaction, 'id'>>) => {
    if (!user) throw new Error('User must be logged in to update transactions');
    setError(null);
    try {
      await dbUpdateTransaction(user.uid, txId, updates);
    } catch (err: any) {
      setError(err.message || 'Failed to update transaction');
      throw err;
    }
  };

  const deleteTransaction = async (txId: string) => {
    if (!user) throw new Error('User must be logged in to delete transactions');
    setError(null);
    try {
      await dbDeleteTransaction(user.uid, txId);
    } catch (err: any) {
      setError(err.message || 'Failed to delete transaction');
      throw err;
    }
  };

  return {
    transactions,
    loading,
    error,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };
};
export default useTransactions;
