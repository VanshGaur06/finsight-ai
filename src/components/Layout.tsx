import React from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-dark-950 flex flex-col lg:flex-row relative overflow-hidden font-sans">
      {/* Ambient background blur blobs */}
      <div className="absolute top-[10%] left-[5%] w-[400px] h-[400px] bg-accent-purple/5 rounded-full blur-[100px] animate-pulse-glow pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] bg-accent-blue/5 rounded-full blur-[100px] animate-pulse-glow pointer-events-none" style={{ animationDelay: '-4s' }}></div>
      
      {/* Dynamic diagonal overlay mesh */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"></div>

      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col pt-16 lg:pt-0">
        <div className="flex-1 p-4 md:p-8 lg:p-10 overflow-y-auto max-w-7xl w-full mx-auto relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
};
export default Layout;
