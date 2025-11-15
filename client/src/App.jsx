import Navbar from './components/Navbar';
import { usePWA } from './hooks/usePWA';
import Home from './pages/Home';
import ExampleParent from './pages/Kanban';
import { Routes, Route } from 'react-router';
import Users from './pages/Users';
import { Toaster, toast } from 'sonner'
import KanbanPage from './pages/KanbanPage';
import Header from './components/Header';
import HelpCenter from './pages/HelpCenter';
import AskAI from './pages/AskAi';

export default function App() {
  const { isInstallable, installApp, isOnline } = usePWA();

  return (
    <>
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
              <Route path="/projects" element={<ExampleParent />} />
              <Route path="/projects/:id" element={<KanbanPage />} />
              <Route path="/users" element={<Users />} />
              <Route path="/help-center" element={<HelpCenter />} />
              <Route path="/ask-ai" element={<AskAI />} />


            </Routes>
          </div>
        </div>

        <Toaster position="top-right" expand={false} richColors />
      </div>
    </>
  );
}