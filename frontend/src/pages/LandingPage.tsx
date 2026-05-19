import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ArrowRight, Zap, Shield, Users, CheckCircle } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Heart,
      title: 'Medical Professional Grade',
      description: 'Build forms tailored to healthcare requirements with HIPAA considerations'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Create and manage complex medical forms in seconds'
    },
    {
      icon: Shield,
      title: 'Data Secure',
      description: 'Enterprise-grade security for sensitive medical data'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Work together seamlessly with your medical team'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-slate-900 dark:text-white overflow-hidden transition-colors px-4 sm:px-6 md:px-12">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-400/20 dark:bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-400/20 dark:bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.04] [background-image:radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.14)_1px,transparent_0)] [background-size:24px_24px] dark:opacity-[0.03]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-4 py-4 sm:px-6 md:px-12 md:py-6 border-b border-slate-200/90 dark:border-white/10 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
            <Heart size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
            MedicalBuilder
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors duration-200"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/register')}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-200"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.section
        className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 md:px-12 py-16 md:py-32"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="text-center mb-12">
          <h2 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Build Medical Forms
            <span className="block bg-gradient-to-r from-sky-600 via-cyan-600 to-sky-600 dark:from-blue-400 dark:via-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
              Instantly
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8">
            Create, customize, and deploy professional medical forms without writing a single line of code.
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <button
            onClick={() => navigate('/register')}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg font-semibold text-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-200 flex items-center justify-center gap-2 group"
          >
            Create Account
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-4 border-2 border-slate-300 dark:border-white/20 rounded-lg font-semibold text-lg hover:border-slate-500 dark:hover:border-white/40 hover:bg-white/60 dark:hover:bg-white/5 transition-all duration-200 flex items-center justify-center gap-2"
          >
            Sign In to Dashboard
          </button>
        </motion.div>

        {/* Video/Screenshot placeholder */}
        <motion.div variants={itemVariants} className="relative">
          <div className="bg-gradient-to-br from-sky-500/20 to-cyan-500/20 rounded-2xl border border-slate-200 dark:border-white/10 p-1 overflow-hidden shadow-xl shadow-sky-100 dark:shadow-none">
            <div className="bg-white/90 dark:bg-slate-800/80 rounded-xl p-8 md:p-12 backdrop-blur-sm flex items-center justify-center min-h-[300px]">
              <div className="text-center">
                <Heart size={64} className="mx-auto mb-4 text-sky-600 dark:text-blue-400 opacity-60" />
                <p className="text-slate-600 dark:text-slate-400">Medical Form Builder Preview</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-20"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.h3 variants={itemVariants} className="text-4xl font-bold text-center mb-16">
          Powerful Features
        </motion.h3>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white/85 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-6 hover:border-sky-500/50 hover:bg-sky-500/5 transition-all duration-300"
              >
                <Icon size={32} className="mb-4 text-sky-600 dark:text-blue-400" />
                <h4 className="text-lg font-semibold mb-2">{feature.title}</h4>
                <p className="text-slate-600 dark:text-slate-400">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* Benefits Section */}
      <motion.section
        className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-20"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.h3 variants={itemVariants} className="text-4xl font-bold text-center mb-16">
          Why Choose MedicalBuilder?
        </motion.h3>

        <div className="space-y-4">
          {[
            'No coding required - intuitive drag-and-drop interface',
            'Advanced validation rules for medical data',
            'Integration-ready API for seamless connectivity',
            'Priority support from medical software experts',
            'Compliance with healthcare regulations',
            'Unlimited form templates and customization'
          ].map((benefit, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="flex items-center gap-4 p-4 rounded-lg bg-white/85 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-cyan-500/50 transition-all"
            >
              <CheckCircle size={24} className="text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
              <span className="text-lg">{benefit}</span>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CTA Footer */}
      <motion.section
        className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-20 text-center"
        variants={itemVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <h3 className="text-4xl font-bold mb-6">Ready to get started?</h3>
        <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
          Join medical professionals using MedicalBuilder to streamline their workflow
        </p>
        <button
          onClick={() => navigate('/register')}
          className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg font-semibold text-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-200 inline-flex items-center gap-2 group"
        >
          Create Account Now
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </motion.section>
    </div>
  );
};

export default LandingPage;
