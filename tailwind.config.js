/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5',
        secondary: '#6366F1',
        accent: '#0EA5E9',
        success: '#10B981',
        danger: '#EF4444',
        'text-light': '#0F172A',
        'text-dark': '#F8FAFC',
        'dark-bg': '#0E0E0E',
        'dark-card': '#18181B',
        'dark-surface': '#18181B',
        'deep-charcoal': '#0E0E0E',
        'surface-muted': '#1F1F23',
        'glass-light': 'rgba(255, 255, 255, 0.1)',
        'glass-dark': 'rgba(0, 0, 0, 0.3)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
        display: ['Satoshi', 'Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-premium': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-aqua': 'linear-gradient(135deg, #0EA5E9 0%, #3B82F6 100%)',
        'gradient-glow': 'linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(14, 165, 233, 0.1) 100%)',
       'gradient-dark': 'linear-gradient(135deg, #0E0E0E 0%, #181818 100%)',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(79, 70, 229, 0.5)',
        'glow-sm': '0 0 10px rgba(79, 70, 229, 0.3)',
        'glow-aqua': '0 0 20px rgba(14, 165, 233, 0.5)',
        'brand-glow': '0 0 30px rgba(59, 130, 246, 0.8)',
        'neumorphic-light': '8px 8px 16px #d1d9e6, -8px -8px 16px #ffffff',
        'neumorphic-dark': '8px 8px 16px #0a0a0a, -8px -8px 16px #1a1a1a',
      },
      blur: {
        ambient: '120px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'ambient-blob': 'ambientBlob 7s ease-in-out infinite',
        'text-rotate': 'textRotate 7.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(79, 70, 229, 0.5)' },
          '50%': { boxShadow: '0 0 30px rgba(79, 70, 229, 0.8)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        ambientBlob: {
          '0%': { transform: 'translate3d(0, 0, 0) scale(1)' },
          '33%': { transform: 'translate3d(5%, -5%, 0) scale(1.05)' },
          '66%': { transform: 'translate3d(-5%, 5%, 0) scale(0.95)' },
          '100%': { transform: 'translate3d(0, 0, 0) scale(1)' },
        },
        textRotate: {
          '0%': { opacity: 1, transform: 'translateY(0)' },
          '33%': { opacity: 0, transform: 'translateY(-20%)' },
          '66%': { opacity: 0, transform: 'translateY(20%)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
