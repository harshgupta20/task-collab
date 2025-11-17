import Navbar from './components/Navbar';
import { usePWA } from './hooks/usePWA';
import Home from './pages/Home';
import { Routes, Route } from 'react-router';
import Users from './pages/Users';
import { Toaster, toast } from 'sonner'
import KanbanPage from './pages/KanbanPage';
import Header from './components/Header';
import HelpCenter from './pages/HelpCenter';
import AskAI from './pages/AskAi';
import Projects from './pages/Projects';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginDialog from './components/LoginDialog';
import SplashScreen from "./components/SplashScreen";
import { useEffect, useState } from 'react';

function AppContent() {
  const { user, logout } = useAuth();

  return (
    <>
      {
        !user && (
          <div className="h-screen flex items-center justify-center bg-gray-100">
            <LoginDialog open={!user} />
          </div>
        )
      }

      {user && (
        <div className='h-screen flex'>
          <div className='w-[200px]'>
            <Navbar />
          </div>

          <div className="min-w-0 grow overflow-y-auto">
            <div className='h-[7dvh]'>
              <Header />
            </div>
            <div className='h-[90dvh] overflow-y-auto'>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/projects/:projectId" element={<KanbanPage />} />
                <Route path="/users" element={<Users />} />
                <Route path="/help-center" element={<HelpCenter />} />
                <Route path="/ask-ai" element={<AskAI />} />


              </Routes>
            </div>
          </div>

          <Toaster position="top-right" expand={false} richColors />
        </div>
      )}
    </>
  );
}

export default function App() {
  const { isInstallable, installApp, isOnline } = usePWA();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // const hasShown = sessionStorage.getItem("splashShown");

    // if (!hasShown) {
      // Show splash only on first load
      setLoading(true);
      // sessionStorage.setItem("splashShown", "true");

      // Animation duration
      const timer = setTimeout(() => {
        setLoading(false);
      }, 4000); // 3 seconds

      return () => clearTimeout(timer);
    // } else {
    //   // Skip splash on internal navigation
    //   setLoading(false);
    // }
  }, []);

  if (loading) return <SplashScreen />;

  return (
    <>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </>
  );
}