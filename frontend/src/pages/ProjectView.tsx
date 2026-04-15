import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, MoreHorizontal, Calendar, ArrowRight, KanbanSquare, X, CheckCircle2 } from 'lucide-react';

export default function ProjectView() {
  const { id: projectId } = useParams();
  const [tasks, setTasks] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTask, setNewTask] = useState({ 
    title: '', 
    description: '', 
    status: 'To Do', 
    priority: 'Medium', 
    dueDate: '',
    assignedTo: '' 
  });
  
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const { data: workspaces } = await axios.get('/api/workspaces');
        if (workspaces.length > 0) {
          const currentWorkspaceId = workspaces[0]._id;
          setWorkspaceId(currentWorkspaceId);
          
          // Fetch Tasks
          const { data: taskData } = await axios.get(`/api/tasks/${currentWorkspaceId}?projectId=${projectId}`);
          setTasks(taskData);

          // Fetch Members
          const { data: memberData } = await axios.get(`/api/workspaces/${currentWorkspaceId}/members`);
          setMembers(memberData);
        }
      } catch (error) {
        console.error('Failed to fetch project data:', error);
      }
    };
    fetchProjectData();
  }, [projectId]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim() || !workspaceId || !projectId) return;

    setIsSubmitting(true);
    try {
      // Ensure we don't send an empty string for assignedTo
      const targetAssignee = newTask.assignedTo && newTask.assignedTo.trim() !== "" 
        ? newTask.assignedTo 
        : user?._id;

      const { data } = await axios.post('/api/tasks', {
        ...newTask,
        workspaceId,
        projectId,
        assignedTo: targetAssignee
      });
      
      // Update UI immediately
      const activeTasks = Array.isArray(tasks) ? tasks : [];
      setTasks([...activeTasks, data]);
      
      // Reset & Close
      setNewTask({ title: '', description: '', status: 'To Do', priority: 'Medium', dueDate: '', assignedTo: '' });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to create task:', error);
      alert('Failed to create task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    { id: 'To Do', color: 'bg-slate-200', text: 'text-slate-700', border: 'border-slate-300' },
    { id: 'In Progress', color: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-300' },
    { id: 'Done', color: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300' }
  ];

  return (
    <div className="relative min-h-full bg-[#fafafa] font-sans text-slate-800 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-8 py-5 sticky top-0 z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-full text-sm font-medium shadow-sm transition-all active:scale-95"
          >
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
                        <div className="flex gap-2">
                          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md border ${col.border} ${col.text} ${col.color}/50`}>
                            Feature
                          </span>
                          {task.priority && (
                            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md border ${
                              task.priority === 'High' ? 'bg-red-50 text-red-600 border-red-100' : 
                              task.priority === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                              'bg-slate-50 text-slate-600 border-slate-100'
                            }`}>
                              {task.priority}
                            </span>
                          )}
                        </div>
                        {/* Fake avatar mapping or initials */}
                        {task?.assignedTo && (
                          <div className="w-7 h-7 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 border-2 border-white shadow-sm flex items-center justify-center text-[10px] font-bold text-white shrink-0" title={task.assignedTo.name || 'User'}>
                            {task.assignedTo.name ? task.assignedTo.name.charAt(0) : 'U'}
                          </div>
                        )}
                      </div>

                      <h4 className="font-semibold text-slate-900 mb-2 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                        {task?.title || 'Untitled Task'}
                      </h4>
                      
                      {task.description && (
                        <p className="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <div className={`flex items-center gap-2 text-xs font-medium ${
                          task.dueDate && new Date(task.dueDate) < new Date() ? 'text-red-500' : 'text-slate-400'
                        }`}>
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No Date'}</span>
                        </div>
                        
                        {(user?.role === 'Admin' || true) && (
                          <button className="text-indigo-500 hover:text-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs font-semibold">
                            Details <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* Quick Add Button */}
                  <button 
                    onClick={() => {
                      setNewTask({ ...newTask, status: col.id });
                      setIsModalOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-slate-200 rounded-2xl text-sm font-medium text-slate-400 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all active:scale-[0.98]"
                  >
                    <Plus className="w-4 h-4" /> Add Task
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* New Task Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
            onClick={() => !isSubmitting && setIsModalOpen(false)}
          ></div>
          
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Create New Task</h3>
              </div>
              <button 
                onClick={() => !isSubmitting && setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateTask} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Task Title <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  autoFocus
                  placeholder="E.g., Design the new authentication flow..." 
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm shadow-sm"
                  value={newTask.title}
                  onChange={e => setNewTask({...newTask, title: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Description</label>
                <textarea 
                  rows={3}
                  placeholder="Add any additional details, links, or context..." 
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm shadow-sm resize-none"
                  value={newTask.description}
                  onChange={e => setNewTask({...newTask, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Priority</label>
                  <select 
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm shadow-sm cursor-pointer"
                    value={newTask.priority}
                    onChange={e => setNewTask({...newTask, priority: e.target.value})}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Due Date</label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm shadow-sm"
                    value={newTask.dueDate}
                    onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Assignee</label>
                <div className="relative group/select">
                  <select 
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm shadow-sm cursor-pointer appearance-none"
                    value={newTask.assignedTo}
                    onChange={e => setNewTask({...newTask, assignedTo: e.target.value})}
                  >
                    <option value="">Select a member...</option>
                    {members.map((member: any) => (
                      <option key={member._id} value={member._id}>
                        {member.name} ({member.email})
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover/select:text-indigo-500 transition-colors">
                    <ArrowRight className="w-4 h-4 rotate-90" />
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 flex items-center justify-end gap-3 flex-col-reverse sm:flex-row">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting || !newTask.title.trim()}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-medium text-white bg-slate-900 hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
