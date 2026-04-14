/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#1a365d',
        'navy-dark': '#102a4c',
        accent: '#ed8936',
        success: '#38a169',
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      fontSize: { base: ['15px', '1.6'] },
    },
  },
  plugins: [],
}
