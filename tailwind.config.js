/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary-fixed": "#dae2ff",
        "outline-variant": "#c3c6d6",
        "surface-container-lowest": "#ffffff",
        "surface-bright": "#f8f9fa",
        "on-background": "#191c1d",
        "on-primary-container": "#c4d2ff",
        "background": "#f8f9fa",
        "surface-variant": "#e1e3e4",
        "tertiary-fixed": "#ffdbcf",
        "error": "#ba1a1a",
        "inverse-surface": "#2e3132",
        "surface-container-high": "#e7e8e9",
        "secondary-fixed": "#dae2ff",
        "on-tertiary": "#ffffff",
        "on-primary-fixed-variant": "#0040a2",
        "surface-dim": "#d9dadb",
        "secondary-container": "#b6c8fe",
        "on-error-container": "#93000a",
        "tertiary-fixed-dim": "#ffb59b",
        "tertiary-container": "#a33500",
        "surface-tint": "#0c56d0",
        "on-tertiary-fixed": "#380d00",
        "primary": "#003d9b",
        "tertiary": "#7b2600",
        "inverse-on-surface": "#f0f1f2",
        "secondary": "#4c5d8d",
        "primary-container": "#0052cc",
        "on-surface": "#191c1d",
        "on-tertiary-fixed-variant": "#812800",
        "on-secondary": "#ffffff",
        "surface": "#f8f9fa",
        "on-secondary-container": "#415382",
        "on-surface-variant": "#434654",
        "error-container": "#ffdad6",
        "surface-container": "#edeeef",
        "surface-container-low": "#f3f4f5",
        "on-primary": "#ffffff",
        "on-error": "#ffffff",
        "on-tertiary-container": "#ffc6b2",
        "secondary-fixed-dim": "#b4c5fb",
        "primary-fixed-dim": "#b2c5ff",
        "on-secondary-fixed-variant": "#344573",
        "on-secondary-fixed": "#021945",
        "outline": "#737685",
        "inverse-primary": "#b2c5ff"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "1rem",
        "2xl": "1.5rem",
        "full": "9999px"
      },
      fontFamily: {
        "headline": ["Manrope", "sans-serif"],
        "display": ["Manrope", "sans-serif"],
        "body": ["Inter", "sans-serif"],
        "label": ["Inter", "sans-serif"]
      }
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false, // disable Tailwind base reset if using MUI
  },
};
