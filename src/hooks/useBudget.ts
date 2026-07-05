import { useAuth } from '../context/AuthContext';
import { useTransactions } from './useTransactions';

export const useBudget = () => {
  const { userProfile, updateBudget } = useAuth();
  const { transactions } = useTransactions();

  const monthlyBudget = userProfile?.monthlyBudget || 0;

  // Filter expenses belonging to the current calendar month
  const currentMonthExpenses = transactions
    .filter((tx) => {
      if (tx.type !== 'expense') return false;
      
      const txDate = new Date(tx.date);
      const currentDate = new Date();
      
      return (
        txDate.getMonth() === currentDate.getMonth() &&
        txDate.getFullYear() === currentDate.getFullYear()
      );
    });

  const totalExpenses = currentMonthExpenses.reduce((sum, tx) => sum + tx.amount, 0);
  const remainingBudget = monthlyBudget > 0 ? monthlyBudget - totalExpenses : 0;
  const spendingPercentage = monthlyBudget > 0 ? (totalExpenses / monthlyBudget) * 100 : 0;
  const isOverBudget = monthlyBudget > 0 && totalExpenses > monthlyBudget;

  return {
    monthlyBudget,
    totalExpenses,
    remainingBudget,
    spendingPercentage,
    isOverBudget,
    updateBudget,
  };
};
export default useBudget;
