import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Mail, Lock, ChevronRight, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { USER_ROLES, UserRole, saveSession } from '../auth';
import { loginUser } from '../api/auth';

const Login: React.FC = () => {
  const SAVED_EMAILS_KEY = 'medical_builder_saved_emails';
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [savedEmails, setSavedEmails] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'doctor' as UserRole,
    rememberMe: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVED_EMAILS_KEY);
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setSavedEmails(parsed.filter((email) => typeof email === 'string'));
      }
    } catch {
      // ignore malformed local storage values
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : false;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email';

    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.role) newErrors.role = 'Role is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const session = await loginUser({
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      const normalizedEmail = formData.email.trim().toLowerCase();
      if (normalizedEmail) {
        const updatedEmails = [normalizedEmail, ...savedEmails.filter((email) => email !== normalizedEmail)].slice(0, 10);
        localStorage.setItem(SAVED_EMAILS_KEY, JSON.stringify(updatedEmails));
        setSavedEmails(updatedEmails);
      }

      saveSession(session);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setErrors({
        submit: error instanceof Error ? error.message : 'Login failed. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-slate-900 dark:text-white flex items-center justify-center p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        className="relative z-10 w-full max-w-md"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.button
          variants={itemVariants}
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Home
        </motion.button>

        <motion.div variants={itemVariants} className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
              <Heart size={24} className="text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              MedicalBuilder
            </span>
          </Link>
          <h1 className="text-4xl font-bold mb-2">Welcome Back</h1>
          <p className="text-slate-500 dark:text-slate-400">Sign in with your role</p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-8 backdrop-blur-sm"
        >
          {errors.submit && (
            <motion.div
              variants={itemVariants}
              className="mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm"
            >
              {errors.submit}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" autoComplete="on">
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium mb-2">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white border border-slate-300 dark:border-white/10 rounded-lg focus:border-blue-500/50 focus:outline-none [color-scheme:light] dark:[color-scheme:dark]"
              >
                {USER_ROLES.map((role) => (
                  <option key={role} value={role} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
                    {role}
                  </option>
                ))}
              </select>
              {errors.role && <p className="text-red-400 text-sm mt-1">{errors.role}</p>}
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-3.5 text-slate-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  list="saved-email-options"
                  placeholder="john@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800/50 border border-slate-300 dark:border-white/10 rounded-lg focus:border-blue-500/50 focus:outline-none transition-colors"
                />
                <datalist id="saved-email-options">
                  {savedEmails.map((email) => (
                    <option key={email} value={email} />
                  ))}
                </datalist>
              </div>
              {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-3.5 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-800/50 border border-slate-300 dark:border-white/10 rounded-lg focus:border-blue-500/50 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center gap-3">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="w-4 h-4 rounded border-slate-300 dark:border-white/20 bg-white dark:bg-slate-800/50 cursor-pointer"
              />
              <label className="text-sm text-slate-500 dark:text-slate-400 cursor-pointer">Remember me</label>
            </motion.div>

            <motion.button
              variants={itemVariants}
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-6 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ChevronRight size={20} />
                </>
              )}
            </motion.button>
          </form>

          <motion.p variants={itemVariants} className="text-center mt-6 text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-400 hover:text-cyan-400 font-semibold">
              Create one
            </Link>
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
