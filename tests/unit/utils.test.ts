import { cn, formatDate, formatTime, getGreeting, getCurrentTimeSlot } from '@/lib/utils';

describe('utils', () => {
  describe('cn', () => {
    it('should merge class names', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('should handle conditional classes', () => {
      expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
    });

    it('should handle tailwind merge conflicts', () => {
      expect(cn('px-2', 'px-4')).toBe('px-4');
    });
  });

  describe('formatDate', () => {
    it('should format date to YYYY-MM-DD', () => {
      const date = new Date('2025-12-03T12:00:00');
      expect(formatDate(date)).toBe('2025-12-03');
    });

    it('should use local timezone, not UTC', () => {
      // Create a date at 11PM local time
      const date = new Date();
      date.setHours(23, 0, 0, 0);

      const result = formatDate(date);
      const [year, month, day] = result.split('-').map(Number);

      // Should match local date, not next day (UTC issue)
      expect(year).toBe(date.getFullYear());
      expect(month).toBe(date.getMonth() + 1);
      expect(day).toBe(date.getDate());
    });

    it('should pad single digit months and days', () => {
      const date = new Date(2025, 0, 5); // January 5, 2025
      expect(formatDate(date)).toBe('2025-01-05');
    });
  });

  describe('getCurrentTimeSlot', () => {
    it('should return current hour in HH:00 format', () => {
      const result = getCurrentTimeSlot();
      expect(result).toMatch(/^\d{2}:00$/);
    });

    it('should pad single digit hours', () => {
      const result = getCurrentTimeSlot();
      const [hours] = result.split(':');
      expect(hours.length).toBe(2);
    });
  });

  describe('formatTime', () => {
    it('should format morning time', () => {
      expect(formatTime('09:30')).toBe('9:30 AM');
    });

    it('should format afternoon time', () => {
      expect(formatTime('14:00')).toBe('2:00 PM');
    });

    it('should format noon', () => {
      expect(formatTime('12:00')).toBe('12:00 PM');
    });

    it('should format midnight', () => {
      expect(formatTime('00:00')).toBe('12:00 AM');
    });
  });

  describe('getGreeting', () => {
    it('should return a string greeting', () => {
      const greeting = getGreeting();
      expect(typeof greeting).toBe('string');
      expect(['Good morning', 'Good afternoon', 'Good evening']).toContain(greeting);
    });
  });
});
