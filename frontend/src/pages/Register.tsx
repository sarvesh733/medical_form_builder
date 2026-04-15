import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Mail, Lock, User, Phone, Building, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { USER_ROLES, UserRole, saveSession } from '../auth';
import { registerUser } from '../api/auth';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    organization: '',
    role: 'doctor' as UserRole,
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

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

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.role) newErrors.role = 'Role is required';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const session = await registerUser({
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      saveSession(session);
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({
        submit: error instanceof Error ? error.message : 'Registration failed. Please try again.',
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        className="relative z-10 w-full max-w-lg"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
              <Heart size={24} className="text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              MedicalBuilder
            </span>
          </Link>
          <h1 className="text-4xl font-bold mb-2">Create Account</h1>
          <p className="text-slate-400">Select your role and create a secure account</p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm"
        >
          {errors.submit && (
            <motion.div
              variants={itemVariants}
              className="mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm"
            >
              {errors.submit}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium mb-2">First Name *</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-3.5 text-slate-500" />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-lg focus:border-blue-500/50 focus:outline-none transition-colors"
                  />
                </div>
                {errors.firstName && <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>}
              </motion.div>

              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium mb-2">Last Name *</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-3.5 text-slate-500" />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-lg focus:border-blue-500/50 focus:outline-none transition-colors"
                  />
                </div>
                {errors.lastName && <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>}
              </motion.div>
            </div>

            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium mb-2">Role *</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-lg focus:border-blue-500/50 focus:outline-none"
              >
                {USER_ROLES.map((role) => (
                  <option key={role} value={role} className="bg-slate-900">
                    {role}
                  </option>
                ))}
              </select>
              {errors.role && <p className="text-red-400 text-sm mt-1">{errors.role}</p>}
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium mb-2">Email Address *</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-3.5 text-slate-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-lg focus:border-blue-500/50 focus:outline-none transition-colors"
                />
              </div>
              {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
            </motion.div>

            <div className="grid grid-cols-2 gap-4">
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3 top-3.5 text-slate-500" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-lg focus:border-blue-500/50 focus:outline-none transition-colors"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium mb-2">Organization</label>
                <div className="relative">
                  <Building size={18} className="absolute left-3 top-3.5 text-slate-500" />
                  <input
                    type="text"
                    name="organization"
                    value={formData.organization}
                    onChange={handleChange}
                    placeholder="Hospital/Clinic"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-lg focus:border-blue-500/50 focus:outline-none transition-colors"
                  />
                </div>
              </motion.div>
            </div>

            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium mb-2">Password *</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-3.5 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 8 characters"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-800/50 border border-white/10 rounded-lg focus:border-blue-500/50 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium mb-2">Confirm Password *</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-3.5 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-800/50 border border-white/10 rounded-lg focus:border-blue-500/50 focus:outline-none transition-colors"
                />
              </div>
              {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-start gap-3">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className="mt-1 w-4 h-4 rounded border-white/20 bg-slate-800/50 cursor-pointer"
              />
              <label className="text-sm text-slate-400 cursor-pointer">
                I agree to the terms and privacy policy.
              </label>
            </motion.div>
            {errors.agreeToTerms && <p className="text-red-400 text-sm">{errors.agreeToTerms}</p>}

            <motion.button
              variants={itemVariants}
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ChevronRight size={20} />
                </>
              )}
            </motion.button>
          </form>

          <motion.p variants={itemVariants} className="text-center mt-6 text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-cyan-400 font-semibold">
              Sign In
            </Link>
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Register;
