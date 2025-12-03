'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/src/stores/authStore';
import { Button } from '@/src/components/ui';

export default function LoginPage() {
  const router = useRouter();
  const { signInWithGoogle, loading, error, user } = useAuthStore();

  React.useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleSignIn = async () => {
    await signInWithGoogle();
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
            O
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Orgniz-it</h1>
          <p className="text-text-secondary">Your personal job search organizer</p>
        </div>

        {/* Login Card */}
        <div className="bg-bg-secondary border border-bg-active rounded-xl p-8">
          <h2 className="text-xl font-semibold text-text-primary mb-2 text-center">
            Welcome back
          </h2>
          <p className="text-text-tertiary text-sm text-center mb-6">
            Sign in to continue tracking your job search journey
          </p>

          {error && (
            <div className="bg-accent-red/10 border border-accent-red/20 rounded-lg p-3 mb-4">
              <p className="text-accent-red text-sm">{error}</p>
            </div>
          )}

          <Button
            onClick={handleSignIn}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Signing in...
              </span>
            ) : (
              <span className="flex items-center gap-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </span>
            )}
          </Button>

          <p className="text-text-muted text-xs text-center mt-6">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl mb-1">📋</div>
            <p className="text-xs text-text-secondary">Task Tracking</p>
          </div>
          <div>
            <div className="text-2xl mb-1">💼</div>
            <p className="text-xs text-text-secondary">Job Pipeline</p>
          </div>
          <div>
            <div className="text-2xl mb-1">🔥</div>
            <p className="text-xs text-text-secondary">Streak Motivation</p>
          </div>
        </div>
      </div>
    </div>
  );
}
