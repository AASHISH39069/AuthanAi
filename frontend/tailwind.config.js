/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
          blue: '#2563eb', // blue-600 primary
          indigo: '#4f46e5', // indigo-600
          cyan: '#0891b2', // cyan-600
          purple: '#7c3aed', // purple-600
          emerald: '#059669', // emerald-600
          amber: '#d97706', // amber-600
          rose: '#e11d48', // rose-600
        },
      },
      animation: {
        'scanline': 'scanline 4s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'float-reverse': 'floatReverse 9s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite alternate',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) scale(1)' },
          '50%': { transform: 'translateY(-18px) scale(1.04)' },
        },
        floatReverse: {
          '0%, 100%': { transform: 'translateY(0px) scale(1)' },
          '50%': { transform: 'translateY(18px) scale(0.96)' },
        },
        glowPulse: {
          '0%': { opacity: '0.4' },
          '100%': { opacity: '0.85' },
        },
      },
    },
  },
  plugins: [],
}
