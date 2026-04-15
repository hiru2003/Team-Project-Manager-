import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Folder, Calendar, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Projects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '', status: 'Planning' });
  
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchProjects = async (wId: string) => {
    try {
      const { data } = await axios.get(`/api/projects/${wId}`);
      setProjects(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const { data: workspaces } = await axios.get('/api/workspaces');
        if (workspaces.length > 0) {
          const wId = workspaces[0]._id;
          setWorkspaceId(wId);
          fetchProjects(wId);
        }
      } catch (err) {
        console.error(err);
      }
    };
    init();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name.trim() || !workspaceId) return;

    setIsSubmitting(true);
    try {
      await axios.post('/api/projects', {
        ...newProject,
        workspaceId
      });
      setIsModalOpen(false);
      setNewProject({ name: '', description: '', status: 'Planning' });
      fetchProjects(workspaceId);
    } catch (err) {
      console.error(err);
      alert('Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-full bg-slate-50/50 p-8 space-y-8 relative">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Active Projects</h1>
          <p className="text-slate-500 font-medium">Manage and track your primary team initiatives.</p>
        </div>
        {user?.role !== 'Member' && (
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all shadow-sm active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </button>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length > 0 ? projects.map(project => (
          <div 
            key={project._id} 
            onClick={() => navigate(`/project/${project._id}`)}
            className="group bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                <Folder className="w-6 h-6" />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-slate-100 text-slate-600`}>
                {project.status}
              </span>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
              {project.name}
            </h3>
            <p className="text-sm text-slate-500 mb-6 line-clamp-2 leading-relaxed">
              {project.description || 'No description provided for this project.'}
            </p>

            <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
              <div className="flex items-center -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                    {i}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
                <Calendar className="w-3.5 h-3.5" />
                <span>Updated Oct 12</span>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-slate-200">
             <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-300 mb-4">
                <Folder className="w-8 h-8" />
             </div>
             <h3 className="text-lg font-bold text-slate-900">No projects found</h3>
             <p className="text-slate-500 text-sm mb-6">Get started by creating your first team project.</p>
             {user?.role !== 'Member' && (
               <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-2"
               >
                  <Plus className="w-4 h-4" /> Create First Project
               </button>
             )}
          </div>
        )}
      </div>

      {/* New Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => !isSubmitting && setIsModalOpen(false)}></div>
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600"><Folder className="w-4 h-4" /></div>
                <h3 className="text-lg font-bold text-slate-900">Create New Project</h3>
              </div>
              <button onClick={() => !isSubmitting && setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleCreateProject} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Project Name <span className="text-red-500">*</span></label>
                <input type="text" required autoFocus placeholder="e.g. Q4 Marketing Campaign" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm" value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Description</label>
                <textarea rows={3} placeholder="Provide a brief overview..." className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm resize-none" value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Initial Status</label>
                <select className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm" value={newProject.status} onChange={e => setNewProject({...newProject, status: e.target.value})}>
                  <option value="Planning">Planning</option>
                  <option value="Active">Active</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmitting} className="px-6 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting || !newProject.name.trim()} className="px-6 py-2.5 rounded-xl font-medium text-white bg-slate-900 hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2">
                  {isSubmitting ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
