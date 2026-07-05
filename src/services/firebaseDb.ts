import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  onSnapshot,
  FirestoreError
} from 'firebase/firestore';
import { db } from '../firebase/config';

export interface Transaction {
  id?: string;
  title: string;
  amount: number;
  category: 'Food' | 'Travel' | 'Shopping' | 'Bills' | 'Education' | 'Investment' | 'Entertainment' | 'Others';
  date: string; // YYYY-MM-DD
  type: 'income' | 'expense';
  createdAt: string;
}

// Get transactions collection ref for a specific user
const getTransactionsRef = (uid: string) => {
  return collection(db, 'users', uid, 'transactions');
};

// Get transaction doc ref for a specific user & transaction ID
const getTransactionDocRef = (uid: string, transactionId: string) => {
  return doc(db, 'users', uid, 'transactions', transactionId);
};

// Add new transaction
export const dbAddTransaction = async (uid: string, transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
  const ref = getTransactionsRef(uid);
  const newTx = {
    ...transaction,
    createdAt: new Date().toISOString(),
  };
  return await addDoc(ref, newTx);
};

// Update existing transaction
export const dbUpdateTransaction = async (uid: string, transactionId: string, updates: Partial<Omit<Transaction, 'id'>>) => {
  const ref = getTransactionDocRef(uid, transactionId);
  return await updateDoc(ref, updates);
};

// Delete transaction
export const dbDeleteTransaction = async (uid: string, transactionId: string) => {
  const ref = getTransactionDocRef(uid, transactionId);
  return await deleteDoc(ref);
};

// Subscribe to real-time transactions
export const subscribeToTransactions = (
  uid: string, 
  onUpdate: (transactions: Transaction[]) => void,
  onError?: (error: FirestoreError) => void
) => {
  const ref = getTransactionsRef(uid);
  const q = query(ref, orderBy('date', 'desc'), orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const transactions: Transaction[] = [];
    snapshot.forEach((doc) => {
      transactions.push({
        id: doc.id,
        ...doc.data()
      } as Transaction);
    });
    onUpdate(transactions);
  }, (error) => {
    console.error("Error subscribing to transactions: ", error);
    if (onError) onError(error);
  });
};
