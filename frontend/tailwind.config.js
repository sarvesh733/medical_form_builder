/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        medical: {
          primary: "rgb(var(--medical-primary) / <alpha-value>)",
          secondary: "rgb(var(--medical-secondary) / <alpha-value>)",
          accent: "rgb(var(--medical-accent) / <alpha-value>)",
          dark: "rgb(var(--medical-dark) / <alpha-value>)",
          card: "rgb(var(--medical-card) / <alpha-value>)",
          neon: "rgb(var(--medical-neon) / <alpha-value>)",
        },
        "border-color": "var(--border-color)",
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
        'app-bg': 'var(--app-bg-image)',
      },
      boxShadow: {
        'neon-glow': 'var(--neon-glow)',
      }
    },
  },
  plugins: [],
}
