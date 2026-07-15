import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Database, Lock, User } from 'lucide-react';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoading(true);
      setServerError('');
      const response = await api.post('/auth/login', data);
      login(response.data.token, response.data.user);
      navigate('/dashboard');
    } catch (error: any) {
      setServerError(error.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0a0a0a] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full border border-gray-200 dark:border-gray-800">
        <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20 text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center border border-gray-300 dark:border-gray-700 mb-4 bg-white dark:bg-[#0a0a0a]">
            <Database className="h-6 w-6 text-gray-900 dark:text-white" />
          </div>
          <h2 className="text-xl font-medium tracking-tight text-gray-900 dark:text-white">
            Oracle Forms Repository
          </h2>
          <p className="mt-2 text-xs font-mono text-gray-500 uppercase tracking-widest">
            System Authentication
          </p>
        </div>
        <div className="p-8">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {serverError && (
              <div className="bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400 p-3 text-xs font-mono">
                {serverError}
              </div>
            )}
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-mono font-semibold text-gray-500 uppercase tracking-widest mb-2">Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    {...register('username')}
                    className="block w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-none bg-white dark:bg-[#0a0a0a] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-gray-500 font-mono transition-colors"
                    placeholder="admin"
                  />
                </div>
                {errors.username && <p className="mt-1 text-xs font-mono text-red-500">{errors.username.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-mono font-semibold text-gray-500 uppercase tracking-widest mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    {...register('password')}
                    className="block w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-none bg-white dark:bg-[#0a0a0a] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-gray-500 font-mono transition-colors"
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && <p className="mt-1 text-xs font-mono text-red-500">{errors.password.message}</p>}
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2.5 px-4 bg-gray-900 hover:bg-black text-white dark:bg-gray-100 dark:hover:bg-white dark:text-gray-900 text-sm font-medium rounded-none disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'AUTHENTICATING...' : 'SIGN IN'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
