// App.jsx — Routage principal de l'application
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 animate-pulse" />
          <p className="text-slate-400 text-xs font-medium">Initializing secure workspace...</p>
        </div>
      </div>
    );
  }

  return user ? <ChatPage /> : <LoginPage />;
}
