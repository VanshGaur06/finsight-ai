import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Receipt, 
  TrendingUp, 
  Sparkles, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Wallet,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { userProfile, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Transactions', path: '/transactions', icon: Receipt },
    { name: 'Analytics', path: '/analytics', icon: TrendingUp },
    { name: 'AI Assistant', path: '/ai-assistant', icon: Sparkles },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <>
      {/* Mobile Toggle Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 glass z-40 px-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-accent-purple to-accent-blue flex items-center justify-center shadow-lg shadow-accent-purple/20">
            <Wallet className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white text-lg tracking-tight">FinSight AI</span>
        </div>
        <button 
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-lg bg-white/5 border border-white/5 text-dark-200 hover:text-white"
        >
          {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <motion.aside 
        animate={{ width: isCollapsed ? '80px' : '260px' }}
        className="hidden lg:flex flex-col h-screen sticky top-0 left-0 bg-dark-950/80 border-r border-white/5 backdrop-blur-md z-30 shrink-0 select-none overflow-x-hidden justify-between"
      >
        {/* Toggle Button */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute right-[-12px] top-8 w-6 h-6 rounded-full bg-dark-800 border border-white/10 hover:border-accent-purple/50 flex items-center justify-center text-dark-300 hover:text-white transition-colors z-50 cursor-pointer"
        >
          {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>

        {/* Sidebar Header */}
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent-purple to-accent-blue flex items-center justify-center shadow-lg shadow-accent-purple/20 shrink-0">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-bold text-white text-xl tracking-tight"
              >
                FinSight AI
              </motion.span>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative group ${
                  isActive 
                    ? 'bg-gradient-to-r from-accent-purple/15 to-accent-blue/15 text-white border border-accent-purple/20' 
                    : 'text-dark-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`
              }
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span>{item.name}</span>}
              
              {/* Collapsed Tooltip */}
              {isCollapsed && (
                <div className="absolute left-20 bg-dark-800 text-white text-xs font-semibold px-3 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity border border-white/5 pointer-events-none whitespace-nowrap shadow-xl">
                  {item.name}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer / User Info */}
        <div className="p-4 border-t border-white/5">
          {!isCollapsed ? (
            <div className="glass-card rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-dark-800 border border-white/5 flex items-center justify-center font-bold text-gradient-purple">
                  {userProfile?.displayName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{userProfile?.displayName}</p>
                  <p className="text-xs text-dark-500 truncate">{userProfile?.email}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-accent-rose/10 hover:bg-accent-rose/20 text-accent-rose text-xs font-semibold transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-dark-800 border border-white/5 flex items-center justify-center font-bold text-gradient-purple">
                {userProfile?.displayName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 rounded-lg bg-accent-rose/10 hover:bg-accent-rose/20 text-accent-rose transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </motion.aside>

      {/* Mobile Drawer (Overlay and Menu) */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Drawer Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black z-40"
            ></motion.div>

            {/* Drawer Menu */}
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed top-0 bottom-0 left-0 w-72 bg-dark-950/95 border-r border-white/10 z-50 p-6 flex flex-col justify-between"
            >
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-accent-purple to-accent-blue flex items-center justify-center shadow-lg shadow-accent-purple/20">
                      <Wallet className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-white text-lg tracking-tight">FinSight AI</span>
                  </div>
                  <button 
                    onClick={() => setIsMobileOpen(false)}
                    className="p-1 rounded-lg text-dark-400 hover:text-white"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <nav className="space-y-1.5">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileOpen(false)}
                      className={({ isActive }) => 
                        `flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                          isActive 
                            ? 'bg-gradient-to-r from-accent-purple/15 to-accent-blue/15 text-white border border-accent-purple/20' 
                            : 'text-dark-400 hover:text-white hover:bg-white/5 border border-transparent'
                        }`
                      }
                    >
                      <item.icon className="w-5 h-5 shrink-0" />
                      <span>{item.name}</span>
                    </NavLink>
                  ))}
                </nav>
              </div>

              <div className="glass-card rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-dark-800 border border-white/5 flex items-center justify-center font-bold text-gradient-purple">
                    {userProfile?.displayName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{userProfile?.displayName}</p>
                    <p className="text-xs text-dark-500 truncate">{userProfile?.email}</p>
                  </div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-accent-rose/10 hover:bg-accent-rose/20 text-accent-rose text-xs font-semibold transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
export default Sidebar;
