'use client';

import React, { useState, useEffect } from 'react';
import { Bell, BellOff, X, Check, Loader2, AlertTriangle, Send } from 'lucide-react';
import { Button } from '@/components/ui';
import { useNotifications } from '@/hooks/useNotifications';

interface NotificationPermissionProps {
  variant?: 'banner' | 'compact' | 'button';
  onDismiss?: () => void;
  className?: string;
}

export const NotificationPermission: React.FC<NotificationPermissionProps> = ({
  variant = 'banner',
  onDismiss,
  className = '',
}) => {
  const { status, isSupported, isEnabled, isLoading, error, requestPermission, sendTestNotification } =
    useNotifications();
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  // Check if user has dismissed the banner before
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const wasDismissed = localStorage.getItem('notification-banner-dismissed');
      if (wasDismissed) setDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('notification-banner-dismissed', 'true');
    onDismiss?.();
  };

  const handleEnable = async () => {
    const success = await requestPermission();
    if (success) {
      // Clear dismissed state if user enables
      localStorage.removeItem('notification-banner-dismissed');
    }
  };

  const handleTestNotification = async () => {
    setTestLoading(true);
    setTestResult(null);
    const result = await sendTestNotification();
    setTestLoading(false);
    if (result.success) {
      setTestResult('Notification sent! Check your notifications.');
    } else {
      setTestResult(`Error: ${result.error}`);
    }
    // Clear result after 5 seconds
    setTimeout(() => setTestResult(null), 5000);
  };

  // Debug logging
  useEffect(() => {
    console.log('[NotificationPermission] status:', status, 'isSupported:', isSupported, 'isEnabled:', isEnabled, 'dismissed:', dismissed);
  }, [status, isSupported, isEnabled, dismissed]);

  // Don't show while loading
  if (status === 'loading') {
    return null;
  }

  // Show enabled state with test button
  if (isEnabled && !dismissed && variant === 'banner') {
    return (
      <div className={`bg-accent-green/10 border border-accent-green/20 rounded-xl p-4 ${className}`}>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-accent-green/20 flex items-center justify-center flex-shrink-0">
            <Check size={20} className="text-accent-green" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold mb-1">Notifications Enabled</h4>
            <p className="text-xs text-text-tertiary mb-3">
              You'll receive reminders 24 hours and 1 hour before your interviews.
            </p>
            {testResult && (
              <p className={`text-xs mb-2 ${testResult.startsWith('Error') ? 'text-accent-red' : 'text-accent-green'}`}>
                {testResult}
              </p>
            )}
            <Button
              onClick={handleTestNotification}
              disabled={testLoading}
              size="sm"
              variant="secondary"
              className="text-xs"
            >
              {testLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin mr-1.5" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={14} className="mr-1.5" />
                  Send Test Notification
                </>
              )}
            </Button>
          </div>
          <button onClick={handleDismiss} className="text-text-muted hover:text-text-secondary p-1 -m-1">
            <X size={18} />
          </button>
        </div>
      </div>
    );
  }

  // Don't show if dismissed
  if (dismissed) {
    return null;
  }

  // Show unsupported browser warning
  if (!isSupported && status === 'unsupported') {
    if (variant === 'button' || variant === 'compact') {
      return null;
    }

    return (
      <div className={`bg-accent-orange/10 border border-accent-orange/20 rounded-xl p-4 ${className}`}>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-accent-orange/20 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={20} className="text-accent-orange" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold mb-1">Push Notifications Not Available</h4>
            <p className="text-xs text-text-tertiary mb-2">
              Push notifications are not supported in this browser.
            </p>
          </div>
          <button onClick={handleDismiss} className="text-text-muted hover:text-text-secondary p-1 -m-1">
            <X size={18} />
          </button>
        </div>
      </div>
    );
  }

  // Compact button variant
  if (variant === 'button') {
    return (
      <Button
        onClick={handleEnable}
        disabled={isLoading || status === 'denied'}
        variant="secondary"
        className={className}
      >
        {isLoading ? (
          <Loader2 size={16} className="animate-spin mr-2" />
        ) : status === 'denied' ? (
          <BellOff size={16} className="mr-2" />
        ) : (
          <Bell size={16} className="mr-2" />
        )}
        {status === 'denied' ? 'Notifications Blocked' : 'Enable Notifications'}
      </Button>
    );
  }

  // Compact inline variant
  if (variant === 'compact') {
    return (
      <div
        className={`flex items-center gap-2 px-3 py-2 bg-accent-blue/10 border border-accent-blue/20 rounded-lg ${className}`}
      >
        <Bell size={16} className="text-accent-blue flex-shrink-0" />
        <span className="text-sm text-text-secondary flex-1">
          Get interview reminders
        </span>
        <button
          onClick={handleEnable}
          disabled={isLoading}
          className="text-xs font-medium text-accent-blue hover:underline disabled:opacity-50"
        >
          {isLoading ? 'Enabling...' : 'Enable'}
        </button>
        <button
          onClick={handleDismiss}
          className="text-text-muted hover:text-text-secondary p-1"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  // Full banner variant (default)
  return (
    <div
      className={`bg-gradient-to-r from-accent-blue/10 to-accent-purple/10 border border-accent-blue/20 rounded-xl p-4 ${className}`}
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-accent-blue/20 flex items-center justify-center flex-shrink-0">
          <Bell size={20} className="text-accent-blue" />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold mb-1">
            Never Miss an Interview
          </h4>
          <p className="text-xs text-text-tertiary mb-3">
            Enable push notifications to get reminders 24 hours and 1 hour before your scheduled
            interviews.
          </p>

          {error && (
            <p className="text-xs text-accent-red mb-3">{error}</p>
          )}

          {status === 'denied' ? (
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <BellOff size={14} />
              <span>
                Notifications are blocked. Please enable them in your browser settings.
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                onClick={handleEnable}
                disabled={isLoading}
                size="sm"
                className="text-xs"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin mr-1.5" />
                    Enabling...
                  </>
                ) : (
                  <>
                    <Check size={14} className="mr-1.5" />
                    Enable Notifications
                  </>
                )}
              </Button>
              <button
                onClick={handleDismiss}
                className="text-xs text-text-muted hover:text-text-secondary transition-colors"
              >
                Maybe later
              </button>
            </div>
          )}
        </div>

        <button
          onClick={handleDismiss}
          className="text-text-muted hover:text-text-secondary p-1 -m-1"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default NotificationPermission;
