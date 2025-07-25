'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Home, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context-v2';

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState<'magic_link' | 'password'>('magic_link');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const { signIn, signInWithPassword, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (user) {
      router.push('/dashboard');
    }

    // Check for error from auth callback
    const error = searchParams.get('error');
    if (error === 'auth_error') {
      setMessage({ 
        type: 'error', 
        text: 'Authentication failed. Please try again.' 
      });
    }
  }, [user, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    let result;
    if (authMode === 'magic_link') {
      result = await signIn(email);
    } else {
      result = await signInWithPassword(email, password);
    }

    if (result.error) {
      setMessage({ type: 'error', text: result.error });
    } else {
      if (authMode === 'magic_link') {
        setMessage({ 
          type: 'success', 
          text: 'Check your email for a magic link to sign in!' 
        });
      } else {
        setMessage({ 
          type: 'success', 
          text: 'Signing in...' 
        });
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-blue-600 p-3 rounded-full">
              <Home className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            HOA Community Portal
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Access your property information and community surveys
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          {/* Auth Mode Toggle */}
          <div className="mb-6">
            <div className="flex rounded-md shadow-sm" role="group">
              <button
                type="button"
                onClick={() => setAuthMode('magic_link')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-l-md border ${
                  authMode === 'magic_link'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Magic Link
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('password')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-r-md border-t border-b border-r ${
                  authMode === 'password'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Password
              </button>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            {authMode === 'password' && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your password"
                  />
                </div>
              </div>
            )}

            {/* Message Display */}
            {message && (
              <div className={`flex items-center p-3 rounded-md ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 mr-2" />
                ) : (
                  <AlertCircle className="h-5 w-5 mr-2" />
                )}
                <span className="text-sm">{message.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !email || (authMode === 'password' && !password)}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <Lock className="h-5 w-5 text-blue-500 group-hover:text-blue-400" />
              </span>
              {isLoading ? (
                authMode === 'magic_link' ? 'Sending...' : 'Signing in...'
              ) : (
                authMode === 'magic_link' ? 'Send Magic Link' : 'Sign In'
              )}
            </button>
          </form>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              {authMode === 'magic_link' 
                ? "We'll send you a secure link to sign in without a password."
                : "Sign in with your email and password."
              }
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            New to the community portal?
          </h3>
          <p className="text-xs text-gray-600 mb-3">
            Create an account to get started, or request access to your property.
          </p>
          <div className="space-y-2">
            <a 
              href="/auth/signup" 
              className="block text-center w-full px-3 py-2 text-sm text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors"
            >
              Create Account & Find Property
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}