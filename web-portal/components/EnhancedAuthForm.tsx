'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { createBrowserClient } from '@supabase/ssr';

export default function EnhancedAuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState<'magic_link' | 'password' | 'signup'>('magic_link');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const { signIn } = useAuth();
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (authMode === 'magic_link') {
        const result = await signIn(email);
        if (result.error) {
          setMessage(result.error);
        } else {
          setMessage('Magic link sent! Check your email.');
        }
      } else if (authMode === 'password') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          setMessage(error.message);
        } else {
          setMessage('Signed in successfully!');
        }
      } else if (authMode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        
        if (error) {
          setMessage(error.message);
        } else {
          setMessage('Account created! Check your email to confirm.');
        }
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            HOA Community Portal
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to access your property dashboard
          </p>
        </div>
        
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Auth Mode Toggle */}
          <div className="mb-6">
            <div className="flex rounded-md shadow-sm" role="group">
              <button
                type="button"
                onClick={() => setAuthMode('magic_link')}
                className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
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
                className={`px-4 py-2 text-sm font-medium border-t border-b ${
                  authMode === 'password'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Password
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('signup')}
                className={`px-4 py-2 text-sm font-medium rounded-r-md border ${
                  authMode === 'signup'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {(authMode === 'password' || authMode === 'signup') && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter your password"
                    minLength={6}
                  />
                </div>
                {authMode === 'signup' && (
                  <p className="mt-1 text-xs text-gray-500">
                    Password must be at least 6 characters long
                  </p>
                )}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  'Processing...'
                ) : authMode === 'magic_link' ? (
                  'Send Magic Link'
                ) : authMode === 'password' ? (
                  'Sign In'
                ) : (
                  'Create Account'
                )}
              </button>
            </div>

            {message && (
              <div className={`text-sm text-center p-3 rounded-md ${
                message.includes('error') || message.includes('Error') || message.includes('failed')
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-green-50 text-green-700 border border-green-200'
              }`}>
                {message}
              </div>
            )}
          </form>

          <div className="mt-6">
            <div className="text-center text-sm text-gray-500">
              {authMode === 'magic_link' && (
                <>
                  Magic links are passwordless and more secure.<br />
                  A secure login link will be sent to your email.
                </>
              )}
              {authMode === 'password' && (
                <>
                  Sign in with your password.<br />
                  Don't have an account? Switch to "Sign Up" above.
                </>
              )}
              {authMode === 'signup' && (
                <>
                  Create a new account with email and password.<br />
                  Already have an account? Switch to "Password" above.
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}