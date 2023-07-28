/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {},
    fontFamily: {
      sans: ['Avenir', 'sans-serif'],
    }
  },
  daisyui: {
    themes: [{
      red: {
        "primary": "#F5F0FF",
        "secondary": "#D7CAF2",
        "accent": "#2D165E",
        "neutral": "#2b3440",
        "base-100": "#ffffff",
        "info": "#3abff8",
        "success": "#36d399",
        "warning": "#fbbd23",
        "error": "#f87272",
      },
    }],
  },
  plugins: [require("daisyui")],
}

