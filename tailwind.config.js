import plugin from '@sveltejs/adapter-auto';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    fontFamily: {
      sans: ['Nunito', 'sans-serif'],
    },
    extend: {
      screens: {
        'md': '821px', //to have full calendar on ipad vertical
      },
    },
  },
  daisyui: {
    themes: [{
      red: {
        "primary": "#2D165E",
        "secondary": "#D7CAF2",
        "accent": "#F5F0FF",
        "neutral": "#896CC7",
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

