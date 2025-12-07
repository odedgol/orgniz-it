'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Bell, Clock, Check, Loader2, Send } from 'lucide-react';
import { Card, Button, Label, Input } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';
import { useNotifications } from '@/hooks/useNotifications';

const REMINDER_OPTIONS = [
  { value: 0.5, label: '30 minutes' },
  { value: 1, label: '1 hour' },
  { value: 2, label: '2 hours' },
  { value: 3, label: '3 hours' },
  { value: 6, label: '6 hours' },
  { value: 12, label: '12 hours' },
  { value: 24, label: '24 hours' },
  { value: 48, label: '2 days' },
];

export default function SettingsPage() {
  const { user, updateUserSettings } = useAuthStore();
  const { status, isSupported, isEnabled, isLoading, error, requestPermission, sendTestNotification } =
    useNotifications();

  const [firstReminder, setFirstReminder] = useState(24);
  const [secondReminder, setSecondReminder] = useState(1);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  // Initialize from user settings
  useEffect(() => {
    if (user?.settings?.notifications) {
      setFirstReminder(user.settings.notifications.firstReminderHours);
      setSecondReminder(user.settings.notifications.secondReminderHours);
    }
  }, [user]);

  const handleSaveNotificationSettings = async () => {
    if (!user) return;

    setSaving(true);
    try {
      await updateUserSettings({
        notifications: {
          enabled: isEnabled,
          firstReminderHours: firstReminder,
          secondReminderHours: secondReminder,
        },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleEnableNotifications = async () => {
    const success = await requestPermission();
    if (success) {
      await updateUserSettings({
        notifications: {
          enabled: true,
          firstReminderHours: firstReminder,
          secondReminderHours: secondReminder,
        },
      });
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
    setTimeout(() => setTestResult(null), 5000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
          <Settings className="text-accent-blue" />
          Settings
        </h1>
        <p className="text-text-secondary mt-1">Manage your account and notification preferences</p>
      </div>

      {/* Profile Section */}
      <Card>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          Profile
        </h2>
        <div className="space-y-4">
          <div>
            <Label>Name</Label>
            <p className="text-text-primary mt-1">{user?.displayName || 'Not set'}</p>
          </div>
          <div>
            <Label>Email</Label>
            <p className="text-text-primary mt-1">{user?.email || 'Not set'}</p>
          </div>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Bell size={20} className="text-accent-blue" />
          Notification Settings
        </h2>

        <div className="space-y-6">
          {/* Enable/Disable Section */}
          <div className="pb-4 border-b border-bg-tertiary">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-text-tertiary">
                  {isEnabled
                    ? 'Notifications are enabled'
                    : !isSupported
                    ? 'Not supported in this browser'
                    : status === 'denied'
                    ? 'Blocked - enable in browser settings'
                    : 'Enable to receive interview reminders'}
                </p>
              </div>
              {isSupported && status !== 'denied' && (
                <Button
                  onClick={handleEnableNotifications}
                  disabled={isLoading || isEnabled}
                  variant={isEnabled ? 'secondary' : 'primary'}
                  size="sm"
                >
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin mr-2" />
                  ) : isEnabled ? (
                    <Check size={16} className="mr-2" />
                  ) : (
                    <Bell size={16} className="mr-2" />
                  )}
                  {isEnabled ? 'Enabled' : 'Enable'}
                </Button>
              )}
            </div>

            {error && <p className="text-sm text-accent-red mt-2">{error}</p>}

            {/* Test Notification */}
            {isEnabled && (
              <div className="mt-4">
                <Button
                  onClick={handleTestNotification}
                  disabled={testLoading}
                  variant="secondary"
                  size="sm"
                >
                  {testLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={14} className="mr-2" />
                      Send Test Notification
                    </>
                  )}
                </Button>
                {testResult && (
                  <p
                    className={`text-sm mt-2 ${
                      testResult.startsWith('Error') ? 'text-accent-red' : 'text-accent-green'
                    }`}
                  >
                    {testResult}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Reminder Timing Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={18} className="text-text-tertiary" />
              <p className="font-medium">Interview Reminder Timing</p>
            </div>
            <p className="text-sm text-text-tertiary -mt-2">
              You&apos;ll receive two separate reminders before each interview
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstReminder">Reminder 1</Label>
                <select
                  id="firstReminder"
                  value={firstReminder}
                  onChange={(e) => setFirstReminder(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 bg-bg-secondary border border-bg-active rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  disabled={!isEnabled}
                >
                  {REMINDER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label} before
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="secondReminder">Reminder 2</Label>
                <select
                  id="secondReminder"
                  value={secondReminder}
                  onChange={(e) => setSecondReminder(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 bg-bg-secondary border border-bg-active rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  disabled={!isEnabled}
                >
                  {REMINDER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label} before
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {!isEnabled && (
              <p className="text-xs text-text-muted">Enable notifications to customize reminder timing</p>
            )}
          </div>

          {/* Save Button */}
          {isEnabled && (
            <div className="pt-4 border-t border-bg-tertiary">
              <Button
                onClick={handleSaveNotificationSettings}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Saving...
                  </>
                ) : saved ? (
                  <>
                    <Check size={16} className="mr-2" />
                    Saved!
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
