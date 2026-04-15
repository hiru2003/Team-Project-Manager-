import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LayoutDashboard, CheckCircle2, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<any>(null);
  const visibleTasks = useMemo(() => {
    const recentTasks = analytics?.recentTasks || [];
    if (user?.role !== 'Member') return recentTasks;

    return recentTasks.filter((task: any) => {
      const assignees = Array.isArray(task.assignedTo) ? task.assignedTo : [task.assignedTo];
      return assignees.some((a: any) => {
        const id = typeof a === 'string' ? a : a?._id;
        return id === user?._id;
      });
    });
  }, [analytics, user]);

  useEffect(() => {
    const fetchWorkspacesAndAnalytics = async () => {
      try {
        const { data: workspaces } = await axios.get('/api/workspaces');
        if (workspaces.length > 0) {
          const analyticsResponses = await Promise.all(
            workspaces.map((workspace: { _id: string }) => axios.get(`/api/analytics/${workspace._id}`))
          );

          const combined = analyticsResponses.reduce(
            (acc: any, response: any) => {
              const data = response.data;
              acc.totalTasks += data.totalTasks || 0;
              acc.completedTasks += data.completedTasks || 0;
              acc.projectCount += data.projectCount || 0;

              (data.distribution || []).forEach((item: any) => {
                acc.distributionMap[item._id] = (acc.distributionMap[item._id] || 0) + item.count;
              });

              (data.recentTasks || []).forEach((task: any) => acc.recentTasks.push(task));
              return acc;
            },
            {
              totalTasks: 0,
              completedTasks: 0,
              projectCount: 0,
              distributionMap: {},
              recentTasks: []
            }
          );

          const distribution = Object.entries(combined.distributionMap).map(([key, value]) => ({
            _id: key,
            count: value
          }));

          const completionRate =
            combined.totalTasks > 0
              ? Math.round((combined.completedTasks / combined.totalTasks) * 100)
              : 0;

          const recentTasks = combined.recentTasks
            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 10);

          setAnalytics({
            totalTasks: combined.totalTasks,
            completedTasks: combined.completedTasks,
            projectCount: combined.projectCount,
            completionRate,
            distribution,
            recentTasks
          });
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      }
    };
    fetchWorkspacesAndAnalytics();
  }, []);

  const downloadReport = async () => {
    try {
      const { data: workspaces } = await axios.get('/api/workspaces');
      if (workspaces.length > 0) {
        const { data } = await axios.get(`/api/reports/${workspaces[0]._id}`);
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nexus-flow-report-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
      }
    } catch (err) {
      alert('Failed to generate report');
    }
  };

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
              Operations Overview <span className="ml-2 px-2 py-1 bg-red-500 text-white text-[10px] rounded-full animate-pulse">V2.0 LIVE</span>
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
        
        {analytics ? (
          <>
            {/* Metric Cards - Full Width Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                { title: 'Total Tasks', value: analytics?.totalTasks || 0, icon: LayoutDashboard, color: 'text-blue-500', bg: 'bg-blue-50' },
                { title: 'Active Projects', value: analytics?.projectCount || 0, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                { title: 'Completion Rate', value: `${analytics?.completionRate || 0}%`, icon: TrendingUp, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                { title: 'Pending Tasks', value: (analytics?.totalTasks || 0) - (analytics?.completedTasks || 0), icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
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
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative mb-8">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-t-3xl opacity-50"></div>
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Task Lifecycle</h3>
                  <p className="text-sm text-slate-500">Distribution of all active and completed tasks.</p>
                </div>
                <button 
                  onClick={downloadReport}
                  className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                >
                  Download Report
                </button>
              </div>
              
              <div className="h-[350px] w-full">
                {analytics.distribution?.length > 0 ? (
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
                        radius={[12, 12, 0, 0]} 
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
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                    <TrendingUp className="w-8 h-8 mb-2 opacity-20" />
                    <p className="text-sm font-medium">No task activity to display yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Task List Section */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {user?.role === 'Admin' ? 'Recent Workspace Activity' : 'Your Assigned Tasks'}
                  </h3>
                  <p className="text-sm text-slate-500">Track and manage your {user?.role === 'Admin' ? 'team\'s' : 'active'} assignments.</p>
                </div>
                <div className="flex items-center gap-4">
                  {user?.role === 'Member' && (
                    <button
                      onClick={() => navigate('/my-tasks')}
                      className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1"
                    >
                      My Task List <CheckCircle2 className="w-4 h-4 ml-1" />
                    </button>
                  )}
                  <button
                    onClick={() => navigate('/projects')}
                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-1"
                  >
                    Go to Project Board <CheckCircle2 className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                {visibleTasks.length > 0 ? (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Task Detail</th>
                        <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Project</th>
                        <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Priority</th>
                        <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {visibleTasks.map((task: any) => (
                        <tr key={task._id} className="hover:bg-slate-50/30 transition-colors group">
                          <td className="px-8 py-4">
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">{task.title}</span>
                              <span className="text-xs text-slate-400 mt-0.5">
                                Assigned to: {Array.isArray(task.assignedTo) 
                                  ? task.assignedTo.map((a: any) => a.name || 'User').join(', ') 
                                  : (task.assignedTo?.name || 'Unassigned')}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                              <span className="text-sm font-medium text-slate-600">{task.projectId?.name || 'General Task'}</span>
                            </div>
                          </td>
                          <td className="px-8 py-4">
                            <div className="flex justify-center">
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${
                                task.priority === 'High' ? 'bg-rose-50 text-rose-600' : 
                                task.priority === 'Medium' ? 'bg-amber-50 text-amber-600' : 
                                'bg-slate-50 text-slate-600'
                              }`}>
                                {task.priority || 'Medium'}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-4 text-right">
                            <span className={`text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 ${
                              task.status === 'Done' ? 'bg-emerald-50 text-emerald-600' : 
                              task.status === 'In Progress' ? 'bg-indigo-50 text-indigo-600' : 
                              'bg-slate-100 text-slate-500'
                            }`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                 task.status === 'Done' ? 'bg-emerald-500' : 
                                 task.status === 'In Progress' ? 'bg-indigo-500' : 
                                 'bg-slate-400'
                              }`}></div>
                              {task.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="px-8 py-12 text-center">
                    <LayoutDashboard className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    <h4 className="text-sm font-bold text-slate-900">No tasks found</h4>
                    <p className="text-xs text-slate-500">You don't have any tasks assigned to you in this workspace yet.</p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
           <div className="flex flex-col items-center justify-center p-16 bg-white rounded-3xl border border-slate-100 border-dashed">
             <AlertCircle className="w-12 h-12 text-slate-300 mb-4" />
             <p className="text-slate-500 font-medium text-center">No workspace or data found.<br/>Ensure you are part of a team workspace.</p>
           </div>
        )}
      </main>
    </div>
  );
}
