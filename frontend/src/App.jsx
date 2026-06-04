import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });

  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const [dashboard, setDashboard] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
  });

  const [tasks, setTasks] = useState([]);
  const [dbStatus, setDbStatus] = useState({ connected: true, checked: false });
  const [loading, setLoading] = useState(true);
  const [showDbWarning, setShowDbWarning] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
  });

  // Redirect to login if token is missing
  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      checkDbStatus();
      fetchDashboard();
      fetchTasks();
    }
  }, [token]);

  const checkDbStatus = async () => {
    try {
      const res = await axios.get(`${API}/api/db-status`);
      setDbStatus({ connected: res.data.connected, checked: true, uri: res.data.uri });
    } catch (error) {
      console.error("DB Status check failed", error);
      setDbStatus({ connected: false, checked: true });
    }
  };

  const fetchDashboard = async () => {
    try {
      const res = await axios.get(`${API}/api/dashboard`, {
        headers: { Authorization: token },
      });
      setDashboard(res.data);
    } catch (error) {
      console.error("Failed to fetch dashboard stats", error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${API}/api/tasks`, {
        headers: { Authorization: token },
      });
      setTasks(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch tasks", error);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const updateTaskStatus = async (id, newStatus) => {
    try {
      await axios.put(
        `${API}/api/tasks/${id}`,
        { status: newStatus },
        {
          headers: { Authorization: token },
        }
      );
      fetchTasks();
      fetchDashboard();
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const createTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${API}/api/tasks`,
        {
          title: formData.title,
          description: formData.description,
          dueDate: formData.dueDate,
        },
        {
          headers: { Authorization: token },
        }
      );
      setFormData({
        title: "",
        description: "",
        dueDate: "",
      });
      fetchTasks();
      fetchDashboard();
    } catch (error) {
      console.error("Failed to create task", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken("");
    setUser(null);
    window.location.href = "/login";
  };

  // Helper to format date cleanly
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Check if date is overdue
  const isOverdue = (dateString, status) => {
    if (status === "Done") return false;
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-indigo-400 font-semibold animate-pulse">Redirecting to login...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-500/20">
            T
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">TaskWorkspace</h1>
            <p className="text-xs text-indigo-300">Team Collab Platform</p>
          </div>
        </div>

        {/* DB Connection Health Badge */}
        {dbStatus.checked && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium glass-panel border border-slate-800">
            <span className={`h-2.5 w-2.5 rounded-full ${dbStatus.connected ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50 pulse-slow' : 'bg-rose-500 shadow-lg shadow-rose-500/50 pulse-slow'}`}></span>
            <span className="text-slate-300">
              Database: {dbStatus.connected ? 'Online' : 'Offline'}
            </span>
          </div>
        )}

        {/* User profile and logout */}
        <div className="flex items-center gap-4">
          {user && (
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-semibold text-slate-200">{user.name}</span>
              <span className="text-xs text-indigo-400 capitalize">{user.role}</span>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-800 bg-slate-900/50 hover:bg-rose-950/20 hover:border-rose-900/50 text-slate-300 hover:text-rose-400 transition-all duration-300 flex items-center gap-2 cursor-pointer"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-10 space-y-8">
        
        {/* DB status banner warning if offline */}
        {dbStatus.checked && !dbStatus.connected && showDbWarning && (
          <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-900/50 text-amber-200 flex flex-col gap-2 relative">
            <button
              onClick={() => setShowDbWarning(false)}
              className="absolute top-4 right-4 text-amber-400/60 hover:text-amber-300 p-1 hover:bg-amber-950/25 rounded-lg transition cursor-pointer"
              title="Dismiss warning"
            >
              <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex items-center gap-2 font-bold text-amber-400 pr-8">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Database Connection Failed
            </div>
            <p className="text-sm text-amber-300">
              The backend is running, but it cannot connect to your MongoDB database. IP whitelisting might be blocking the connection to MongoDB Atlas.
            </p>
            <div className="text-xs bg-slate-900/80 p-3 rounded-lg border border-slate-800 mt-2 font-mono text-slate-300 overflow-x-auto space-y-1">
              <div>// To resolve this locally, update backend/.env:</div>
              <div className="text-indigo-400">MONGO_URI=mongodb://127.0.0.1:27017/taskmanager</div>
              <div className="mt-2 text-slate-400">// Then restart the backend or hit the refresh database check:</div>
              <button 
                onClick={checkDbStatus}
                className="mt-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold cursor-pointer transition"
              >
                Retry Database Check
              </button>
            </div>
          </div>
        )}

        {/* Dashboard Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          
          <div className="glass-panel glass-panel-hover p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-5 group-hover:opacity-10 transition-opacity">
              <svg className="w-24 h-24 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Tasks</p>
            <p className="text-3xl font-extrabold text-white mt-2 font-mono">{dashboard.totalTasks}</p>
            <div className="h-1 w-12 bg-indigo-500 rounded-full mt-4"></div>
          </div>

          <div className="glass-panel glass-panel-hover p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-5 group-hover:opacity-10 transition-opacity">
              <svg className="w-24 h-24 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Completed</p>
            <p className="text-3xl font-extrabold text-emerald-400 mt-2 font-mono">{dashboard.completedTasks}</p>
            <div className="h-1 w-12 bg-emerald-500 rounded-full mt-4"></div>
          </div>

          <div className="glass-panel glass-panel-hover p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-5 group-hover:opacity-10 transition-opacity">
              <svg className="w-24 h-24 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pending</p>
            <p className="text-3xl font-extrabold text-amber-400 mt-2 font-mono">{dashboard.pendingTasks}</p>
            <div className="h-1 w-12 bg-amber-500 rounded-full mt-4"></div>
          </div>

          <div className="glass-panel glass-panel-hover p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-5 group-hover:opacity-10 transition-opacity">
              <svg className="w-24 h-24 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Overdue</p>
            <p className="text-3xl font-extrabold text-rose-400 mt-2 font-mono">{dashboard.overdueTasks}</p>
            <div className="h-1 w-12 bg-rose-500 rounded-full mt-4"></div>
          </div>

        </section>

        {/* Dashboard Actions and Task Table */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Create Task Card */}
          <div className="lg:col-span-1 glass-panel p-6 rounded-2xl h-fit border border-slate-800">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
              Create New Task
            </h2>
            <form onSubmit={createTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Task Title</label>
                <input
                  type="text"
                  name="title"
                  placeholder="Review documentation"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full border border-slate-800 bg-slate-900/50 p-3 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Description</label>
                <textarea
                  name="description"
                  placeholder="Explain what needs to be done..."
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full border border-slate-800 bg-slate-900/50 p-3 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white transition-all resize-none"
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="w-full border border-slate-800 bg-slate-900/50 p-3 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white p-3.5 rounded-xl text-sm font-semibold tracking-wide shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer mt-2"
              >
                Create Workspace Task
              </button>
            </form>
          </div>

          {/* Tasks List */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col min-h-[450px]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                Active Workspace Tasks
              </h2>
              <button 
                onClick={fetchTasks}
                className="text-xs bg-slate-900/80 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300 transition cursor-pointer"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3">
                <div className="h-8 w-8 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
                <p className="text-sm text-slate-400">Loading your workspace...</p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
                <svg className="w-16 h-16 text-slate-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-slate-300 font-semibold text-lg">No tasks found</p>
                <p className="text-slate-500 text-xs mt-1 max-w-sm">Create a task in the form to the left to populate your active workspace.</p>
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                      <th className="py-4 px-3">Title</th>
                      <th className="py-4 px-3">Description</th>
                      <th className="py-4 px-3">Due Date</th>
                      <th className="py-4 px-3">Status</th>
                      <th className="py-4 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900">
                    {tasks.map((task) => {
                      const overdue = isOverdue(task.dueDate, task.status);
                      return (
                        <tr key={task._id} className="hover:bg-slate-900/30 transition-colors text-sm">
                          <td className="py-4 px-3 font-semibold text-slate-200">
                            {task.title}
                          </td>
                          <td className="py-4 px-3 text-slate-400 max-w-xs truncate">
                            {task.description}
                          </td>
                          <td className="py-4 px-3">
                            <div className="flex items-center gap-1.5">
                              <svg className={`w-4 h-4 ${overdue ? 'text-rose-400' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className={overdue ? 'text-rose-400 font-medium' : 'text-slate-300'}>
                                {formatDate(task.dueDate)}
                                {overdue && <span className="ml-1 text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.5 rounded">Overdue</span>}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-3">
                            <select
                              value={task.status}
                              onChange={(e) => updateTaskStatus(task._id, e.target.value)}
                              className={`text-xs font-semibold py-1 px-2.5 rounded-full border bg-slate-950 focus:outline-none cursor-pointer ${
                                task.status === "Done"
                                  ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5"
                                  : task.status === "In Progress"
                                  ? "text-indigo-400 border-indigo-500/20 bg-indigo-500/5"
                                  : "text-slate-400 border-slate-700 bg-slate-900/50"
                              }`}
                            >
                              <option value="Todo">Todo</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Done">Done</option>
                            </select>
                          </td>
                          <td className="py-4 px-3 text-right">
                            {task.status !== "Done" && (
                              <button
                                onClick={() => updateTaskStatus(task._id, "Done")}
                                className="bg-emerald-600/10 border border-emerald-500/20 hover:bg-emerald-600 hover:text-white hover:border-emerald-500 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer"
                              >
                                Mark Done
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </section>

      </main>
      
      <footer className="py-6 border-t border-slate-900 text-center text-xs text-slate-600">
        Team Task Manager &copy; {new Date().getFullYear()} - Designed with Premium Aesthetics
      </footer>
    </div>
  );
}

export default App;