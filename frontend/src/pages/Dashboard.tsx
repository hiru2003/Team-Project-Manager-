import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LayoutDashboard, CheckCircle2, Clock, AlertCircle, TrendingUp, LogOut } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    const fetchWorkspacesAndAnalytics = async () => {
      try {
        const { data: workspaces } = await axios.get('/api/workspaces');
        if (workspaces.length > 0) {
          const workspaceId = workspaces[0]._id;
          const { data } = await axios.get(`/api/analytics/${workspaceId}`);
          setAnalytics(data);
        }
      } catch (error) {
        console.warn('API restricted or failed. Injecting development mock data...');
        setAnalytics({
          totalTasks: 25,
          distribution: [
            { _id: 'To Do', count: 10 },
            { _id: 'In Progress', count: 8 },
            { _id: 'Done', count: 7 }
          ]
        });
      }
    };
    fetchWorkspacesAndAnalytics();
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-white/90 backdrop-blur-md rounded-lg shadow-xl border border-zinc-100">
          <p className="font-semibold text-zinc-800">{label}</p>
          <p className="text-indigo-600 font-medium">{payload[0].value} Tasks</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-full font-sans text-slate-900 pb-12">
      {/* Workspace Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="w-full px-8 h-20 flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Operations Overview
            </h1>
            <p className="text-sm font-medium text-slate-500">Real-time metrics for your active workspaces</p>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3 bg-white border border-slate-200 rounded-full py-1.5 px-4 shadow-sm">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-inner">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <span className="text-sm font-semibold text-slate-700 pr-1">{user?.name || 'User'}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full px-8 pt-8 space-y-8">
        
        {/* Metric Cards - Full Width Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'Total Tasks', value: analytics?.totalTasks || 0, icon: LayoutDashboard, color: 'text-blue-500', bg: 'bg-blue-50' },
            { title: 'Completed', value: analytics?.distribution?.find((d: any) => d._id === 'Done')?.count || 0, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
            { title: 'In Progress', value: analytics?.distribution?.find((d: any) => d._id === 'In Progress')?.count || 0, icon: TrendingUp, color: 'text-indigo-500', bg: 'bg-indigo-50' },
            { title: 'To Do', value: analytics?.distribution?.find((d: any) => d._id === 'To Do')?.count || 0, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
          ].map((metric, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-slate-100 group relative overflow-hidden">
              <div className={`absolute -right-6 -top-6 w-24 h-24 ${metric.bg} rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500`} />
              <div className="relative flex items-start justify-between">
                <div className="space-y-4">
                  <span className="text-sm font-medium text-slate-500">{metric.title}</span>
                  <div className="text-4xl font-bold text-slate-900">{metric.value}</div>
                </div>
                <div className={`p-3 rounded-xl ${metric.bg} ${metric.color}`}>
                  <metric.icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        {analytics ? (
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-t-3xl opacity-50"></div>
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Task Lifecycle</h3>
                <p className="text-sm text-slate-500">Distribution of all active and completed tasks.</p>
              </div>
              <button className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
                Download Report
              </button>
            </div>
            
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="_id" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12 }} 
                  />
                  <Tooltip cursor={{ fill: '#f8fafc' }} content={<CustomTooltip />} />
                  <Bar 
                    dataKey="count" 
                    fill="url(#colorGradient)" 
                    radius={[6, 6, 0, 0]} 
                    barSize={60}
                    animationDuration={1500} 
                  />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
           <div className="flex flex-col items-center justify-center p-16 bg-white rounded-3xl border border-slate-100 border-dashed">
             <AlertCircle className="w-12 h-12 text-slate-300 mb-4" />
             <p className="text-slate-500 font-medium text-center">Data streams are syncing.<br/>Please wait or populate the workspace.</p>
           </div>
        )}
      </main>
    </div>
  );
}
