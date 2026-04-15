import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Calendar, CheckCircle2, Clock3, ListTodo, FolderKanban, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type Task = {
  _id: string;
  title: string;
  description?: string;
  status: 'To Do' | 'In Progress' | 'Done';
  priority?: 'Low' | 'Medium' | 'High';
  dueDate?: string;
  projectId?: { _id: string; name: string } | string;
  assignedTo?: { _id: string; name: string; email: string } | string;
  workspaceId?: string;
  workspaceName?: string;
};

export default function MyTasks() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const { data: workspaces } = await axios.get('/api/workspaces');
        if (!workspaces?.length) {
          setTasks([]);
          return;
        }

        const taskResponses = await Promise.all(
          workspaces.map(async (workspace: { _id: string; name: string }) => {
            const { data } = await axios.get(`/api/tasks/${workspace._id}`);
            const workspaceTasks = Array.isArray(data) ? data : [];
            return workspaceTasks.map((task: Task) => ({
              ...task,
              workspaceId: workspace._id,
              workspaceName: workspace.name
            }));
          })
        );

        const mergedTasks = taskResponses.flat();
        setTasks(mergedTasks);
      } catch (error) {
        console.error('Failed to fetch member task list:', error);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const myTasks = useMemo(() => {
    if (user?.role !== 'Member') return tasks;
    return tasks.filter((task) => {
      const assigneeId =
        typeof task.assignedTo === 'string' ? task.assignedTo : task.assignedTo?._id;
      return assigneeId === user?._id;
    });
  }, [tasks, user]);

  const summary = useMemo(() => {
    return {
      total: myTasks.length,
      todo: myTasks.filter((task) => task.status === 'To Do').length,
      inProgress: myTasks.filter((task) => task.status === 'In Progress').length,
      done: myTasks.filter((task) => task.status === 'Done').length
    };
  }, [myTasks]);

  const updateTaskStatus = async (taskId: string, status: Task['status']) => {
    try {
      const { data } = await axios.put(`/api/tasks/${taskId}`, { status });
      setTasks((prev) => prev.map((task) => (task._id === taskId ? { ...task, ...data } : task)));
    } catch (error) {
      console.error('Failed to update task status:', error);
      alert('Unable to update task status right now.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-full p-8">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 text-slate-500">Loading your tasks...</div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50/50 p-8 space-y-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/dashboard')}
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Task List</h1>
          <p className="text-slate-500 font-medium">Tasks currently assigned to you.</p>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-100 rounded-2xl p-5">
          <div className="text-slate-500 text-sm mb-2">Total Tasks</div>
          <div className="text-3xl font-bold text-slate-900">{summary.total}</div>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-5">
          <div className="text-slate-500 text-sm mb-2">To Do</div>
          <div className="text-3xl font-bold text-slate-900">{summary.todo}</div>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-5">
          <div className="text-slate-500 text-sm mb-2">In Progress</div>
          <div className="text-3xl font-bold text-slate-900">{summary.inProgress}</div>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-5">
          <div className="text-slate-500 text-sm mb-2">Done</div>
          <div className="text-3xl font-bold text-slate-900">{summary.done}</div>
        </div>
      </section>

      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Assigned Tasks</h2>
        </div>

        {myTasks.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            <ListTodo className="w-10 h-10 mx-auto text-slate-300 mb-3" />
            <p>No tasks assigned yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {myTasks.map((task) => (
              <div key={task._id} className="p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-semibold text-slate-900">{task.title}</h3>
                    <span
                      className={`text-[11px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide ${
                        task.priority === 'High'
                          ? 'bg-red-50 text-red-600'
                          : task.priority === 'Low'
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-amber-50 text-amber-600'
                      }`}
                    >
                      {task.priority || 'Medium'}
                    </span>
                  </div>
                  {task.description && <p className="text-sm text-slate-500">{task.description}</p>}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 className="w-3.5 h-3.5" />
                      {task.workspaceName || 'Workspace'}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <FolderKanban className="w-3.5 h-3.5" />
                      {typeof task.projectId === 'object' ? task.projectId?.name : 'Project'}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateTaskStatus(task._id, 'To Do')}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold ${
                      task.status === 'To Do' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    To Do
                  </button>
                  <button
                    onClick={() => updateTaskStatus(task._id, 'In Progress')}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold ${
                      task.status === 'In Progress'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                    }`}
                  >
                    In Progress
                  </button>
                  <button
                    onClick={() => updateTaskStatus(task._id, 'Done')}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold inline-flex items-center gap-1 ${
                      task.status === 'Done' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Done
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
