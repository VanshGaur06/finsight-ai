import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useBudget } from '../hooks/useBudget';
import { useTransactions } from '../hooks/useTransactions';
import { formatCurrency } from '../utils/formatters';
import { motion } from 'framer-motion';
import { 
  Settings, 
  PiggyBank, 
  Trash2, 
  Check, 
  AlertTriangle,
  Mail,
  Calendar,
  Layers,
  LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc, writeBatch } from 'firebase/firestore';
import { db, auth } from '../firebase/config';

export const Profile: React.FC = () => {
  const { user, userProfile, logout, refreshProfile } = useAuth();
  const { monthlyBudget, updateBudget } = useBudget();
  const { transactions } = useTransactions();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState('');
  const [budgetVal, setBudgetVal] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingBudget, setIsUpdatingBudget] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  
  const [profileMessage, setProfileMessage] = useState({ text: '', type: '' });
  const [budgetMessage, setBudgetMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
      setBudgetVal(userProfile.monthlyBudget ? userProfile.monthlyBudget.toString() : '');
    }
  }, [userProfile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setProfileMessage({ text: 'Display name cannot be empty.', type: 'error' });
      return;
    }

    setIsUpdatingProfile(true);
    setProfileMessage({ text: '', type: '' });

    try {
      if (auth.currentUser) {
        // 1. Update auth profile
        await updateProfile(auth.currentUser, { displayName: displayName.trim() });
        
        // 2. Update firestore profile
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await setDoc(userRef, { displayName: displayName.trim() }, { merge: true });
        
        // 3. Refresh Context state
        await refreshProfile();
        setProfileMessage({ text: 'Profile updated successfully!', type: 'success' });
      }
    } catch (err: any) {
      console.error(err);
      setProfileMessage({ text: err.message || 'Failed to update profile.', type: 'error' });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    const budgetNum = parseFloat(budgetVal);
    if (isNaN(budgetNum) || budgetNum < 0) {
      setBudgetMessage({ text: 'Please enter a valid budget of 0 or more.', type: 'error' });
      return;
    }

    setIsUpdatingBudget(true);
    setBudgetMessage({ text: '', type: '' });

    try {
      await updateBudget(budgetNum);
      setBudgetMessage({ text: 'Budget updated successfully!', type: 'success' });
    } catch (err: any) {
      console.error(err);
      setBudgetMessage({ text: err.message || 'Failed to update budget.', type: 'error' });
    } finally {
      setIsUpdatingBudget(false);
    }
  };

  const handleResetData = async () => {
    if (!user) return;
    const confirmMessage = 'WARNING: This will permanently delete all your logged transaction history. This action cannot be undone. Are you sure you want to proceed?';
    if (!window.confirm(confirmMessage)) return;

    setIsResetting(true);
    try {
      // Create batch deletion for all transactions
      const batch = writeBatch(db);
      transactions.forEach((tx) => {
        const txDocRef = doc(db, 'users', user.uid, 'transactions', tx.id!);
        batch.delete(txDocRef);
      });
      await batch.commit();
      alert('Your transaction history has been cleared.');
    } catch (err: any) {
      console.error(err);
      alert('Failed to reset account data: ' + err.message);
    } finally {
      setIsResetting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Format creation date
  const creationDate = user?.metadata.creationTime 
    ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : 'N/A';

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight m-0">
            Profile Settings
          </h1>
          <p className="text-dark-400 text-sm mt-1">
            Configure your personal details, budget preferences, and manage account options.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Column 1 & 2: Forms */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Info Form */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-6 border border-white/5"
            >
              <div className="flex items-center gap-2 mb-6 text-white font-bold">
                <Settings className="w-5 h-5 text-accent-purple" />
                <h3 className="text-sm uppercase tracking-wider">Account Details</h3>
              </div>

              {profileMessage.text && (
                <div className={`mb-4 p-3 rounded-lg text-xs font-semibold ${
                  profileMessage.type === 'success' 
                    ? 'bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald'
                    : 'bg-accent-rose/10 border border-accent-rose/20 text-accent-rose'
                }`}>
                  {profileMessage.text}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider block">Full Name</label>
                    <input
                      id="profile-name"
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                      disabled={isUpdatingProfile}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider block">Email Address (Read-only)</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      readOnly
                      className="w-full px-4 py-2.5 rounded-xl glass-input text-sm opacity-50 cursor-not-allowed bg-dark-900 border-white/5"
                    />
                  </div>
                </div>

                <button
                  id="profile-update"
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="px-6 py-2.5 rounded-xl bg-accent-purple hover:bg-accent-purple/90 text-white text-xs font-bold transition-all shadow-md shadow-accent-purple/10 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isUpdatingProfile ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save Profile Changes</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>

            {/* Budget Configuration Form */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card rounded-2xl p-6 border border-white/5"
            >
              <div className="flex items-center gap-2 mb-6 text-white font-bold">
                <PiggyBank className="w-5 h-5 text-accent-purple" />
                <h3 className="text-sm uppercase tracking-wider">Budget Management</h3>
              </div>

              {budgetMessage.text && (
                <div className={`mb-4 p-3 rounded-lg text-xs font-semibold ${
                  budgetMessage.type === 'success' 
                    ? 'bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald'
                    : 'bg-accent-rose/10 border border-accent-rose/20 text-accent-rose'
                }`}>
                  {budgetMessage.text}
                </div>
              )}

              <form onSubmit={handleUpdateBudget} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider block">
                    Monthly Budget Cap (₹)
                  </label>
                  <p className="text-[11px] text-dark-400">Set a monthly limit. Set to 0 to disable budget tracking.</p>
                  <input
                    id="profile-budget"
                    type="number"
                    value={budgetVal}
                    onChange={(e) => setBudgetVal(e.target.value)}
                    placeholder="e.g. 15000"
                    className="w-full max-w-md px-4 py-2.5 rounded-xl glass-input text-sm"
                    disabled={isUpdatingBudget}
                  />
                </div>

                <button
                  id="budget-update"
                  type="submit"
                  disabled={isUpdatingBudget}
                  className="px-6 py-2.5 rounded-xl bg-accent-purple hover:bg-accent-purple/90 text-white text-xs font-bold transition-all shadow-md shadow-accent-purple/10 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isUpdatingBudget ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Set Monthly Budget</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>

          {/* Column 3: Account Stats & Actions */}
          <div className="space-y-8">
            {/* Overview stats */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-2xl p-6 border border-white/5 space-y-4"
            >
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Account Overview</h3>
              
              <div className="divide-y divide-white/5 space-y-3.5 pt-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-2 text-dark-400">
                    <Mail className="w-4 h-4 text-dark-500" />
                    <span>User Login</span>
                  </span>
                  <span className="font-semibold text-white truncate max-w-[120px]">{userProfile?.email}</span>
                </div>

                <div className="flex justify-between items-center text-xs pt-3.5">
                  <span className="flex items-center gap-2 text-dark-400">
                    <Calendar className="w-4 h-4 text-dark-500" />
                    <span>Member Since</span>
                  </span>
                  <span className="font-semibold text-white">{creationDate}</span>
                </div>

                <div className="flex justify-between items-center text-xs pt-3.5">
                  <span className="flex items-center gap-2 text-dark-400">
                    <Layers className="w-4 h-4 text-dark-500" />
                    <span>Total Logs</span>
                  </span>
                  <span className="font-semibold text-white">{transactions.length} records</span>
                </div>

                <div className="flex justify-between items-center text-xs pt-3.5">
                  <span className="flex items-center gap-2 text-dark-400">
                    <PiggyBank className="w-4 h-4 text-dark-500" />
                    <span>Target Cap</span>
                  </span>
                  <span className="font-semibold text-white">
                    {monthlyBudget > 0 ? formatCurrency(monthlyBudget) : 'Disabled'}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Danger Zone Actions */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="glass-card rounded-2xl p-6 border border-accent-rose/10 bg-accent-rose/5 space-y-4"
            >
              <div className="flex items-center gap-2 text-accent-rose">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Danger Zone</h3>
              </div>
              <p className="text-[11px] text-dark-400 leading-relaxed">
                Actions in this section are destructive and permanent. Use with caution.
              </p>
              
              <div className="space-y-3 pt-2">
                <button
                  id="profile-reset-data"
                  onClick={handleResetData}
                  disabled={isResetting}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-accent-rose/20 bg-accent-rose/10 hover:bg-accent-rose/25 text-accent-rose text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isResetting ? 'Resetting Data...' : 'Reset All Transactions'}</span>
                </button>

                <button
                  id="profile-logout"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-dark-200 hover:text-white text-xs font-bold transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out of Account</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
export default Profile;
