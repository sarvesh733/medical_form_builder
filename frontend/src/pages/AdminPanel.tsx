import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, Mail, User, AlertCircle, RefreshCw, Trash2 } from 'lucide-react';
import { getSession } from '../auth';

type PendingUser = {
  user_id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
};

type AllUser = {
  user_id: string;
  name: string;
  email: string;
  role: string;
  is_approved: boolean;
  created_at: string;
  approved_at: string | null;
};

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'pending' | 'all'>('pending');
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [allUsers, setAllUsers] = useState<AllUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const initialCheckRef = useRef(false);

  const session = getSession();

  const fetchPendingUsers = useCallback(async () => {
    if (!session) return;

    try {
      setError(null);
      
      const response = await fetch('http://localhost:5000/auth/pending-users', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.token}`,
          'x-user-id': session.user.user_id || '',
          'x-user-role': 'admin',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch pending users');
      }

      const data = await response.json();
      setPendingUsers(data.pendingUsers || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pending users');
    }
  }, [session]);

  const fetchAllUsers = useCallback(async () => {
    if (!session) return;

    try {
      setError(null);

      const response = await fetch('http://localhost:5000/auth/all-users', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.token}`,
          'x-user-id': session.user.user_id || '',
          'x-user-role': 'admin',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch all users');
      }

      const data = await response.json();
      setAllUsers(data.users || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch all users');
    }
  }, [session]);

  const loadData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchPendingUsers(), fetchAllUsers()]);
    setLoading(false);
  }, [fetchPendingUsers, fetchAllUsers]);

  useEffect(() => {
    // Only run once on mount
    if (initialCheckRef.current) return;
    initialCheckRef.current = true;

    // Check if user is admin
    if (!session || session.user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    loadData();
  }, []);

  const handleApprove = async (userId: string, userName: string) => {
    try {
      setActionLoading(userId);
      setError(null);

      const response = await fetch(`http://localhost:5000/auth/users/${userId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.token}`,
          'x-user-id': session?.user.user_id || '',
          'x-user-role': 'admin',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to approve user');
      }

      setSuccessMessage(`${userName} has been approved successfully!`);
      // Refresh both lists from server
      await loadData();

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to reject ${userName}? This action cannot be undone.`)) {
      return;
    }

    try {
      setActionLoading(userId);
      setError(null);

      const response = await fetch(`http://localhost:5000/auth/users/${userId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.token}`,
          'x-user-id': session?.user.user_id || '',
          'x-user-role': 'admin',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reject user');
      }

      setSuccessMessage(`${userName} has been rejected.`);
      // Refresh both lists from server
      await loadData();

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      return;
    }

    try {
      setActionLoading(userId);
      setError(null);

      const response = await fetch(`http://localhost:5000/auth/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.token}`,
          'x-user-id': session?.user.user_id || '',
          'x-user-role': 'admin',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete user');
      }

      setSuccessMessage(`${userName} has been deleted successfully.`);
      // Refresh both lists from server
      await loadData();

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-8 text-slate-900 dark:text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">User Management</h1>
            <p className="text-slate-600 dark:text-slate-400">Manage user accounts and approvals</p>
          </div>
          <button
            onClick={() => loadData()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded-lg text-blue-400 transition-all disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setTab('pending')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              tab === 'pending'
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            Pending Approvals ({pendingUsers.length})
          </button>
          <button
            onClick={() => setTab('all')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              tab === 'all'
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            All Users ({allUsers.length})
          </button>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-400"
          >
            <AlertCircle size={20} />
            {error}
          </motion.div>
        )}

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg flex items-center gap-3 text-green-400"
          >
            <CheckCircle size={20} />
            {successMessage}
          </motion.div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : tab === 'pending' ? (
          // PENDING APPROVALS TAB
          pendingUsers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-12 text-center"
            >
              <CheckCircle size={48} className="mx-auto mb-4 text-green-400 opacity-50" />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No Pending Approvals</h2>
              <p className="text-slate-600 dark:text-slate-400">All users have been reviewed. There are no pending registrations.</p>
            </motion.div>
          ) : (
            <div className="grid gap-4">
              <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden">
                <div className="grid grid-cols-5 gap-4 p-6 bg-slate-100 dark:bg-slate-800/50 border-b border-slate-200 dark:border-white/5 font-semibold text-slate-700 dark:text-slate-300 text-sm">
                  <div>Name</div>
                  <div>Email</div>
                  <div>Role</div>
                  <div>Registered</div>
                  <div className="text-right">Actions</div>
                </div>

                <div className="divide-y divide-slate-200 dark:divide-white/5">
                  {pendingUsers.map((user, idx) => (
                    <motion.div
                      key={user.user_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="grid grid-cols-5 gap-4 p-6 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors items-center"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                          <User size={20} className="text-blue-400" />
                        </div>
                        <span className="text-slate-900 dark:text-white font-medium">{user.name}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-slate-500" />
                        <span className="text-slate-600 dark:text-slate-400 text-sm break-all">{user.email}</span>
                      </div>

                      <div>
                        <span className="px-3 py-1 bg-slate-700/50 rounded-full text-xs font-medium text-slate-300 capitalize">
                          {user.role}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm">
                        <Clock size={16} />
                        {formatDate(user.created_at)}
                      </div>

                      <div className="flex items-center gap-2 justify-end">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleApprove(user.user_id, user.name)}
                          disabled={actionLoading === user.user_id}
                          className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded-lg text-green-400 transition-all disabled:opacity-50 text-sm font-medium"
                        >
                          <CheckCircle size={16} />
                          {actionLoading === user.user_id ? 'Processing...' : 'Approve'}
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleReject(user.user_id, user.name)}
                          disabled={actionLoading === user.user_id}
                          className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-400 transition-all disabled:opacity-50 text-sm font-medium"
                        >
                          <XCircle size={16} />
                          {actionLoading === user.user_id ? 'Processing...' : 'Reject'}
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )
        ) : (
          // ALL USERS TAB
          allUsers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-12 text-center"
            >
              <User size={48} className="mx-auto mb-4 text-blue-400 opacity-50" />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No Users</h2>
              <p className="text-slate-600 dark:text-slate-400">There are no users in the system yet.</p>
            </motion.div>
          ) : (
            <div className="grid gap-4">
              <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden">
                <div className="grid grid-cols-6 gap-4 p-6 bg-slate-100 dark:bg-slate-800/50 border-b border-slate-200 dark:border-white/5 font-semibold text-slate-700 dark:text-slate-300 text-sm">
                  <div>Name</div>
                  <div>Email</div>
                  <div>Role</div>
                  <div>Status</div>
                  <div>Registered</div>
                  <div className="text-right">Actions</div>
                </div>

                <div className="divide-y divide-slate-200 dark:divide-white/5">
                  {allUsers.map((user, idx) => (
                    <motion.div
                      key={user.user_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="grid grid-cols-6 gap-4 p-6 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors items-center"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                          <User size={20} className="text-blue-400" />
                        </div>
                        <span className="text-slate-900 dark:text-white font-medium truncate">{user.name}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-slate-500 flex-shrink-0" />
                        <span className="text-slate-600 dark:text-slate-400 text-sm break-all">{user.email}</span>
                      </div>

                      <div>
                        <span className="px-3 py-1 bg-slate-700/50 rounded-full text-xs font-medium text-slate-300 capitalize">
                          {user.role}
                        </span>
                      </div>

                      <div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.is_approved 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {user.is_approved ? 'Approved' : 'Pending'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm">
                        <Clock size={16} className="flex-shrink-0" />
                        <span className="text-xs">{formatDate(user.created_at)}</span>
                      </div>

                      <div className="flex items-center gap-2 justify-end">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDelete(user.user_id, user.name)}
                          disabled={actionLoading === user.user_id}
                          className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-400 transition-all disabled:opacity-50 text-sm font-medium"
                        >
                          <Trash2 size={16} />
                          {actionLoading === user.user_id ? 'Deleting...' : 'Delete'}
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
