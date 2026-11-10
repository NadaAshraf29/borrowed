/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        onyx: {
          DEFAULT: '#0B0B0B',
          50: '#2A2A2A',
          100: '#1F1F1F',
          900: '#0B0B0B',
        },
        ivory: {
          DEFAULT: '#F7F4ED',
          light: '#FCFAF6',
          dark: '#EFEBE1',
        },
        taupe: {
          DEFAULT: '#C9B9A6',
          light: '#E1D7CC',
          dark: '#A69581',
        },
        sage: {
          DEFAULT: '#8EA48F',
          light: '#AEC0AF',
          dark: '#6E856F',
        },
        mauve: {
          DEFAULT: '#C7A3B0',
          light: '#DABEC7',
          dark: '#AB8292',
        },
        darkbrown: {
          DEFAULT: '#352820',
          light: '#4E3C32',
          dark: '#241B15',
        },
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['var(--font-montserrat)', 'Montserrat', 'Helvetica Neue', 'sans-serif'],
      },
      borderRadius: {
        'luxury': '14px',
        'luxury-lg': '20px',
      },
      boxShadow: {
        'luxury': '0 10px 30px -10px rgba(11, 11, 11, 0.08)',
        'luxury-hover': '0 20px 40px -15px rgba(11, 11, 11, 0.15)',
      },
    },
  },
  plugins: [],
};

