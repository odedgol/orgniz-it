import { cn, formatDate, formatTime, getGreeting } from '@/src/lib/utils';

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
