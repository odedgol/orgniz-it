'use client';

import { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { auth, googleProvider } from '@/lib/firebase';

export default function ElectronAuthPage() {
  const [status, setStatus] = useState<'idle' | 'authenticating' | 'getting_token' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    try {
      setStatus('authenticating');
      setError(null);

      // Perform Google sign-in (passkey will work in system browser)
      await signInWithPopup(auth, googleProvider);

      setStatus('getting_token');

      // Now that user is authenticated in Firebase, get a custom token
      // This custom token can be used by Electron to sign in
      const functions = getFunctions();
      const createCustomToken = httpsCallable<void, { customToken: string }>(functions, 'createCustomToken');

      const result = await createCustomToken();
      const customToken = result.data.customToken;

      if (!customToken) {
        throw new Error('Failed to get custom token');
      }

      setStatus('success');

      // Redirect to custom protocol for Electron to catch
      // Pass the custom token instead of ID token
      setTimeout(() => {
        window.location.href = `orgnizit://auth/callback?customToken=${encodeURIComponent(customToken)}`;
      }, 1000);

    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication failed');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
      <div className="bg-[#1A1A1D] rounded-2xl p-8 max-w-md w-full mx-4 text-center">
        {status === 'idle' && (
          <>
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-white mb-2">Sign in to Orgniz-it</h1>
            <p className="text-gray-400 mb-6">Click below to sign in with your Google account. You can use your passkey!</p>
            <button
              onClick={handleSignIn}
              className="w-full px-6 py-3 bg-white hover:bg-gray-100 text-gray-800 font-medium rounded-lg transition-colors flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>
          </>
        )}

        {status === 'authenticating' && (
          <>
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-white mb-2">Signing In</h1>
            <p className="text-gray-400">Complete sign-in in the popup window...</p>
          </>
        )}

        {status === 'getting_token' && (
          <>
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-white mb-2">Almost Done</h1>
            <p className="text-gray-400">Setting up your session...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-white mb-2">Sign-In Successful!</h1>
            <p className="text-gray-400">Returning to Orgniz-it...</p>
            <p className="text-gray-500 text-sm mt-4">You can close this window if it doesn&apos;t close automatically.</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-white mb-2">Sign-In Failed</h1>
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={handleSignIn}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
