
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { HairstyleStudio } from './pages/HairstyleStudio';
import { ClothingTryOn } from './pages/ClothingTryOn';
import { ChatBot } from './pages/ChatBot';
import { MyLooks } from './pages/MyLooks';
import { AuthPage } from './pages/AuthPage';
import { AppRoute, GeneratedImage } from './types';
import { Toaster, toast } from 'react-hot-toast';
import { auth } from './firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { saveLookToFirebase, deleteLookFromFirebase, subscribeToLooks } from './services/firebaseService';
import { WifiOff } from 'lucide-react';

const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(AppRoute.HOME);
  const [savedLooks, setSavedLooks] = useState<GeneratedImage[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true); // Initial load state
  const [isGuestMode, setIsGuestMode] = useState(false);

  // 1. Handle Authentication State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthChecking(false);
      
      if (currentUser) {
        setIsGuestMode(false); // If we have a user, we are definitely online/authed
        if (!currentUser.isAnonymous) {
             // Only show toast for real logins to avoid spam
            // toast.success(`Welcome back, ${currentUser.displayName || 'User'}`);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Sync Data (Cloud or Local)
  useEffect(() => {
    // Cloud Mode
    if (user && !isGuestMode) {
        const unsubscribeDocs = subscribeToLooks(user.uid, (looks) => {
            setSavedLooks(looks);
        });
        return () => unsubscribeDocs();
    } 
    
    // Offline/Guest Mode - Read from LocalStorage
    if (isGuestMode) {
        try {
            const localData = localStorage.getItem('roopai_looks');
            if (localData) {
                setSavedLooks(JSON.parse(localData));
            } else {
                setSavedLooks([]); // Clear state if nothing local
            }
        } catch (e) {
            console.error("Local storage load error", e);
        }
    }
  }, [user, isGuestMode]);

  const handleGuestLogin = () => {
      setIsGuestMode(true);
      setIsAuthChecking(false);
      toast("Guest Mode Active", { icon: '👤' });
  };

  const handleLogout = async () => {
      try {
          if (user) {
            await signOut(auth);
            toast.success("Logged out");
          } else {
              // Guest logout
              setIsGuestMode(false);
              setSavedLooks([]);
          }
          setCurrentRoute(AppRoute.HOME); // Reset route
      } catch (error) {
          toast.error("Logout failed");
      }
  };

  const handleSaveLook = async (look: GeneratedImage) => {
      if (user && !isGuestMode) {
          // Online Save
          try {
             await saveLookToFirebase(user.uid, look);
          } catch (error) {
             console.error(error);
             toast.error("Cloud save failed, trying local backup...");
             saveLocal(look);
          }
      } else {
          // Offline Save
          saveLocal(look);
      }
  };

  const saveLocal = (look: GeneratedImage) => {
      try {
          const newLooks = [look, ...savedLooks];
          const stringified = JSON.stringify(newLooks);
          if (stringified.length > 4500000) { 
              toast.error("Storage full! Please delete old looks.");
              return;
          }
          localStorage.setItem('roopai_looks', stringified);
          setSavedLooks(newLooks);
          toast.success("Saved to Device");
      } catch (e) {
          console.error(e);
          toast.error("Storage full. Delete old looks to save.");
      }
  };

  const handleDeleteLook = async (id: string) => {
      if (user && !isGuestMode) {
          const lookToDelete = savedLooks.find(l => l.id === id);
          // @ts-ignore
          const path = lookToDelete?.storagePath;
          try {
              await deleteLookFromFirebase(user.uid, id, path);
          } catch (error) {
              toast.error("Cloud delete failed");
          }
      } else {
          const newLooks = savedLooks.filter(l => l.id !== id);
          setSavedLooks(newLooks);
          localStorage.setItem('roopai_looks', JSON.stringify(newLooks));
          toast.success("Deleted from device");
      }
  };

  // 3. Render Logic
  if (isAuthChecking) {
      return (
        <div className="h-screen flex items-center justify-center flex-col gap-4 bg-gray-50 dark:bg-gray-900 transition-colors">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse font-medium">Starting RoopAI Engine...</p>
        </div>
      );
  }

  // Not authenticated and not in guest mode -> Show Auth Page
  if (!user && !isGuestMode) {
      return (
        <>
          <Toaster position="top-center" toastOptions={{
            style: { borderRadius: '12px', background: '#333', color: '#fff', fontFamily: 'Inter', fontSize: '14px' }
          }}/>
          <AuthPage onGuestLogin={handleGuestLogin} />
        </>
      );
  }

  // Authenticated App
  const renderContent = () => {
    switch (currentRoute) {
      case AppRoute.HOME:
        return <Dashboard onNavigate={setCurrentRoute} />;
      case AppRoute.TRY_HAIR:
        return <HairstyleStudio onSave={handleSaveLook} />;
      case AppRoute.TRY_CLOTHES:
        return <ClothingTryOn onSave={handleSaveLook} />;
      case AppRoute.CHAT:
        return <ChatBot />;
      case AppRoute.MY_LOOKS:
        return <MyLooks looks={savedLooks} onNavigate={setCurrentRoute} onDelete={handleDeleteLook} />;
      default:
        return <Dashboard onNavigate={setCurrentRoute} />;
    }
  };

  return (
    <>
      <Toaster position="top-center" toastOptions={{
        style: {
          borderRadius: '12px',
          background: '#333',
          color: '#fff',
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px'
        }
      }}/>
      
      <Layout currentRoute={currentRoute} onNavigate={setCurrentRoute} onLogout={handleLogout} userEmail={user?.email}>
        {/* Guest Mode Indicator */}
        {isGuestMode && (
            <div className="bg-yellow-50 dark:bg-yellow-900/30 border-b border-yellow-100 dark:border-yellow-900/50 px-4 py-1 text-[10px] text-yellow-700 dark:text-yellow-400 flex items-center justify-center gap-2 sticky top-[57px] z-20 transition-colors">
                <WifiOff size={10} />
                <span>Guest Mode: Looks saved to device only</span>
            </div>
        )}
        {renderContent()}
      </Layout>
    </>
  );
};

export default App;
