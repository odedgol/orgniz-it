import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        'bg-primary': '#0A0A0B',
        'bg-secondary': '#141416',
        'bg-tertiary': '#1C1C1F',
        'bg-hover': '#232328',
        'bg-active': '#2A2A30',

        // Text
        'text-primary': '#FAFAFA',
        'text-secondary': '#A1A1A6',
        'text-tertiary': '#6B6B70',
        'text-muted': '#4A4A4F',

        // Accents
        'accent-blue': '#5E6AD2',
        'accent-purple': '#9F7AEA',
        'accent-green': '#3DCC79',
        'accent-orange': '#F59E0B',
        'accent-red': '#EF4444',
        'accent-cyan': '#22D3EE',

        // Subject Colors
        'subject-blue': '#5E6AD2',
        'subject-green': '#3DCC79',
        'subject-cyan': '#22D3EE',
        'subject-orange': '#F59E0B',
        'subject-purple': '#9F7AEA',
        'subject-red': '#EF4444',
        'subject-pink': '#EC4899',
        'subject-yellow': '#EAB308',
      },
      fontFamily: {
        sans: ['DM Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      fontSize: {
        'xs': '11px',
        'sm': '12px',
        'base': '13px',
        'md': '14px',
        'lg': '15px',
        'xl': '16px',
        '2xl': '20px',
        '3xl': '28px',
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
      },
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
      },
      borderColor: {
        'subtle': 'rgba(255, 255, 255, 0.06)',
        'default': 'rgba(255, 255, 255, 0.1)',
        'strong': 'rgba(255, 255, 255, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'zoom-in': 'zoomIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        zoomIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
