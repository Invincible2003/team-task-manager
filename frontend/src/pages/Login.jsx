import { useState } from "react";
import axios from "axios";

function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "member", // Default role
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      if (isRegister) {
        // Register API Call
        const res = await axios.post(`${API}/api/auth/register`, formData);
        setSuccessMsg("Registration successful! You can now log in.");
        setIsRegister(false); // Switch to login view
        setFormData({
          name: "",
          email: formData.email, // pre-fill email
          password: "",
          role: "member",
        });
      } else {
        // Login API Call
        const res = await axios.post(`${API}/api/auth/login`, {
          email: formData.email,
          password: formData.password,
        });

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        setSuccessMsg("Login successful! Loading workspace...");
        
        setTimeout(() => {
          window.location.href = "/";
        }, 800);
      }
    } catch (error) {
      console.error(error);
      setErrorMsg(error.response?.data?.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsRegister(!isRegister);
    setErrorMsg("");
    setSuccessMsg("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden font-sans">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-purple-500/10 blur-[150px] pointer-events-none"></div>

      <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-[450px] relative z-10 transition-all duration-300">
        
        {/* Brand Logo & Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-2xl shadow-xl shadow-indigo-500/10 mb-3 text-white">
            T
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            {isRegister ? "Join Workspace" : "Welcome Back"}
          </h1>
          <p className="text-slate-400 text-xs mt-1.5 text-center">
            {isRegister 
              ? "Create your account to start managing projects" 
              : "Enter your credentials to access your collaborative dashboard"}
          </p>
        </div>

        {/* Message banners */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {isRegister && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Name</label>
              <input
                type="text"
                name="name"
                placeholder="Aryan Pandey"
                className="w-full border border-slate-800 bg-slate-950 p-3 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white transition-all"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="name@company.com"
              className="w-full border border-slate-800 bg-slate-950 p-3 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white transition-all"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              className="w-full border border-slate-800 bg-slate-950 p-3 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white transition-all"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {isRegister && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Role Type</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full border border-slate-800 bg-slate-950 p-3 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white transition-all cursor-pointer"
              >
                <option value="member">Member</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white p-3.5 rounded-xl text-sm font-semibold tracking-wide shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:scale-100 disabled:pointer-events-none cursor-pointer mt-4"
          >
            {loading 
              ? "Processing..." 
              : isRegister 
                ? "Register Workspace Account" 
                : "Secure Sign In"}
          </button>

        </form>

        {/* Toggle Mode Link */}
        <div className="mt-8 text-center text-xs text-slate-400">
          {isRegister ? "Already have an account?" : "Need to register a new user?"}{" "}
          <button
            type="button"
            onClick={toggleAuthMode}
            className="text-indigo-400 hover:text-indigo-300 font-bold hover:underline transition ml-1 cursor-pointer"
          >
            {isRegister ? "Sign In" : "Create Account"}
          </button>
        </div>

      </div>
    </div>
  );
}

export default Login;