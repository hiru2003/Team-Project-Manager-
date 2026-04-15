import React from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, KanbanSquare, LogOut, Hexagon, FolderClosed } from 'lucide-react';

export const ProtectedRoute = ({ allowedRoles }: { allowedRoles?: string[] }) => {
  const { user, loading, logout } = useAuth();
  const location = useLocation();

  if (loading) return <div className="h-screen w-full bg-slate-50 flex items-center justify-center">Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Restore Layout structure logic below for logged-in users...
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans selection:bg-indigo-100">
      {/* Modern Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex-col hidden md:flex z-50 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="h-20 flex items-center px-8 border-b border-slate-100">
          <div className="w-8 h-8 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center mr-3 shadow-md shadow-indigo-200">
            <Hexagon className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-slate-900 tracking-tight">NexusFlow</span>
        </div>
        
        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
          <p className="px-4 text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Workspace</p>
          <Link to="/dashboard" className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all ${location.pathname === '/dashboard' ? 'bg-indigo-50 text-indigo-700 font-bold shadow-sm border border-indigo-100/50' : 'text-slate-500 font-medium hover:bg-slate-50 hover:text-slate-900'}`}>
            <LayoutDashboard className={`w-5 h-5 ${location.pathname === '/dashboard' ? 'text-indigo-600' : 'text-slate-400'}`} />
            Dashboard Overview
          </Link>
          <Link to="/projects" className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all ${location.pathname.startsWith('/projects') || location.pathname.startsWith('/project') ? 'bg-indigo-50 text-indigo-700 font-bold shadow-sm border border-indigo-100/50' : 'text-slate-500 font-medium hover:bg-slate-50 hover:text-slate-900'}`}>
            <FolderClosed className={`w-5 h-5 ${location.pathname.startsWith('/projects') || location.pathname.startsWith('/project') ? 'text-indigo-600' : 'text-slate-400'}`} />
            Projects Explorer
          </Link>
        </nav>
        
        <div className="p-6 border-t border-slate-100">
          <button onClick={logout} className="flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-colors">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>
      
      {/* Scrollable Main Edge-to-Edge Canvas */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto relative bg-slate-50/50">
        <Outlet />
      </main>
    </div>
  );
};
