
import React, { useState, useEffect } from 'react';
import { AppRoute } from '../types';
import { Home, Scissors, Shirt, MessageCircle, User, LogOut, Moon, Sun } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  onLogout?: () => void;
  userEmail?: string | null;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentRoute, onNavigate, onLogout, userEmail }) => {
  const [isDark, setIsDark] = useState(false);

  // Initialize Dark Mode
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };
  
  const navItems = [
    { id: AppRoute.HOME, icon: <Home size={24} />, label: 'Home' },
    { id: AppRoute.TRY_CLOTHES, icon: <Shirt size={24} />, label: 'Clothes' },
    { id: AppRoute.TRY_HAIR, icon: <Scissors size={24} />, label: 'Hair' },
    { id: AppRoute.CHAT, icon: <MessageCircle size={24} />, label: 'Ask AI' },
    { id: AppRoute.MY_LOOKS, icon: <User size={24} />, label: 'Saved' },
  ];

  const getInitials = (email?: string | null) => {
      if(!email) return 'G'; // Guest
      return email.substring(0, 2).toUpperCase();
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 pb-20 sm:pb-0 transition-colors duration-200">
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-30 border-b border-gray-100 dark:border-gray-800 transition-colors duration-200">
        <div className="max-w-md mx-auto px-4 py-3 flex justify-between items-center">
           <h1 className="text-xl font-heading font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
             RoopAI
           </h1>
           
           <div className="flex items-center gap-3">
               <button 
                  onClick={toggleTheme} 
                  className="p-2 text-gray-400 hover:text-primary dark:text-gray-400 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  title="Toggle Theme"
               >
                   {isDark ? <Sun size={18} /> : <Moon size={18} />}
               </button>

               {onLogout && (
                   <button onClick={onLogout} className="text-gray-400 hover:text-red-500 transition-colors" title="Logout">
                       <LogOut size={18} />
                   </button>
               )}
               <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-xs font-bold text-primary border border-gray-200 dark:border-gray-700">
                 {getInitials(userEmail)}
               </div>
           </div>
        </div>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full p-4 space-y-6">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 pb-safe z-40 sm:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.05)] transition-colors duration-200">
        <div className="flex justify-around items-center px-2 py-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-1 p-2 transition-colors ${
                currentRoute === item.id 
                  ? 'text-primary' 
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              {item.icon}
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Desktop Notice */}
      <div className="hidden sm:flex fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-w-xs text-sm text-gray-500 dark:text-gray-400">
        👋 Tip: Resize your browser to mobile width for the best experience!
      </div>
    </div>
  );
};
