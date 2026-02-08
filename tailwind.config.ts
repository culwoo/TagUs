/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sf-pro': ['SF Pro Display', '-apple-system', 'system-ui', 'BlinkMacSystemFont', 'sans-serif'],
        'pretendard': ['Poppins', 'Pretendard', 'sans-serif'],
      },
      colors: {
        primary: {
          bg: '#F8F9FA',
          DEFAULT: '#007AFF',
          hover: '#0062CC',
        },
        text: {
          primary: '#1A1A1A',
          secondary: '#666',
          tertiary: '#888',
        },
        success: '#4CAF50',
        error: '#F44336',
        warning: '#FF9800',
        info: '#2196F3',
      },
      boxShadow: {
        'floating': '0 10px 25px rgba(0,0,0,0.1)',
        'glow': '0 0 0 3px rgba(0, 122, 255, 0.1)',
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'spin': 'spin 1s linear infinite',
      },
      keyframes: {
        slideIn: {
          'from': {
            transform: 'translateY(20px)',
            opacity: '0',
          },
          'to': {
            transform: 'translateY(0)',
            opacity: '1',
          },
        },
      },
    },
  },
  plugins: [],
}
