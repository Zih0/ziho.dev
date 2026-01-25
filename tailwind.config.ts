import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#09090b',
        surface: '#121214',
        primary: '#3b82f6',
        border: 'rgba(255, 255, 255, 0.06)'
      },
      fontFamily: {
        sans: ['var(--font-noto-sans-kr)', 'sans-serif'],
        serif: ['var(--font-noto-sans-kr)', 'sans-serif'],
        display: ['var(--font-noto-sans-kr)', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace']
      },
    }
  },
  plugins: [require('@tailwindcss/typography')]
}

export default config
