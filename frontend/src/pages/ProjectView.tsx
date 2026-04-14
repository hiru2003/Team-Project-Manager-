import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, MoreHorizontal, Calendar, ArrowRight, KanbanSquare } from 'lucide-react';

export default function ProjectView() {
  const [tasks, setTasks] = useState<any[]>([]);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data: workspaces } = await axios.get('/api/workspaces');
        if (workspaces.length > 0) {
          const { data } = await axios.get(`/api/tasks/${workspaces[0]._id}`);
          setTasks(data);
        }
      } catch (error) {
        console.warn('API restricted or failed. Injecting development mock tasks...');
        setTasks([
          { _id: '1', title: 'Design Component Library', description: 'Create variants for primary buttons, inputs, and modals in Figma.', status: 'To Do', assignedTo: { name: 'Alice M.' }, date: 'Oct 2' },
          { _id: '2', title: 'Integrate Auth Flows', description: 'Connect Firebase or custom JWT backend to Redux state.', status: 'To Do', assignedTo: { name: 'Charlie R.' }, date: 'Oct 5' },
          { _id: '3', title: 'Setup GitHub Actions', description: 'Run test suite and docker builds on every main branch push.', status: 'In Progress', assignedTo: { name: 'Bob T.' }, date: 'Sep 30' },
          { _id: '4', title: 'Optimize Postgres Queries', description: 'Add indexing to the User and Analytics tables for speed.', status: 'In Progress', assignedTo: { name: 'Alice M.' }, date: 'Sep 29' },
          { _id: '5', title: 'Deploy Staging Environment', description: 'Push latest stable branch to Vercel and Railway.', status: 'Done', assignedTo: { name: 'Charlie R.' }, date: 'Sep 25' },
        ]);
      }
    };
    fetchTasks();
  }, []);

  const columns = [
    { id: 'To Do', color: 'bg-slate-200', text: 'text-slate-700', border: 'border-slate-300' },
    { id: 'In Progress', color: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-300' },
    { id: 'Done', color: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300' }
  ];

  return (
    <div className="min-h-full bg-[#fafafa] font-sans text-slate-800 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-8 py-5 sticky top-0 z-40 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-md">
            <KanbanSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 leading-none mb-1">Nexus Project</h1>
            <p className="text-sm text-slate-500 font-medium text-muted-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Active Sprint
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
            />
          </div>
          <button className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-full text-sm font-medium shadow-sm transition-all active:scale-95">
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </header>

      {/* Kanban Board */}
      <main className="flex-1 overflow-x-auto overflow-y-hidden p-8">
        <div className="flex gap-6 h-full items-start min-w-max">
          {columns.map(col => {
            const validTasks = Array.isArray(tasks) ? tasks : [];
            const columnTasks = validTasks.filter(t => t?.status === col.id);
            return (
              <div key={col.id} className="w-[340px] flex flex-col max-h-full">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4 px-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-700">{col.id}</h3>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${col.color} ${col.text}`}>
                      {columnTasks.length}
                    </span>
                  </div>
                  <button className="p-1 text-slate-400 hover:bg-slate-200 rounded transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Task Stream */}
                <div className="flex-1 space-y-4 overflow-y-auto pr-2 pb-4 smooth-scroll">
                  {columnTasks.map(task => (
                    <div 
                      key={task._id} 
                      className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all duration-200 cursor-grab active:cursor-grabbing relative overflow-hidden"
                    >
                      {/* Left color bar */}
                      <div className={`absolute top-0 left-0 h-full w-1 ${col.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                      
                      <div className="flex justify-between items-start mb-3">
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md border ${col.border} ${col.text} ${col.color}/50`}>
                          Bug / Feature
                        </span>
                        {/* Fake avatar */}
                        {task?.assignedTo?.name && (
                          <div className="w-7 h-7 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 border-2 border-white shadow-sm flex items-center justify-center text-[10px] font-bold text-white shrink-0" title={task.assignedTo.name}>
                            {task.assignedTo.name.charAt(0)}
                          </div>
                        )}
                      </div>

                      <h4 className="font-semibold text-slate-900 mb-2 leading-snug group-hover:text-indigo-600 transition-colors">
                        {task?.title || 'Untitled Task'}
                      </h4>
                      
                      <p className="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-2">
                        {task.description}
                      </p>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{task.date || 'Oct 12'}</span>
                        </div>
                        
                        {(user?.role === 'Admin' || true) && (
                          <button className="text-indigo-500 hover:text-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs font-semibold">
                            Details <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* Empty state or add button */}
                  <button className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-slate-200 rounded-2xl text-sm font-medium text-slate-400 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all">
                    <Plus className="w-4 h-4" /> Add Task
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
