import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        black: '#000000',
        void: '#0a0a0a',
        white: '#EFEFEF',
        grey: {
          dark: '#1A1A1A',
          mid: '#333333',
          ash: '#1a1818',
        },
        red: {
          dark: '#8B0000',
          bright: '#CC0000',
        },
        blood: '#8B0000',
        arterial: '#CC0000',
        bruise: '#1a0a1a',
        infection: '#0a1a0a',
        signal: '#00ff41',
      },
      fontFamily: {
        display: ['CyberpunkCity', 'Archivo Black', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        ritual: ['CyberpunkCity', 'Archivo Black', 'sans-serif'],
      },
      fontSize: {
        'hero': 'clamp(4rem, 15vw, 10rem)',
        'display': 'clamp(2.5rem, 8vw, 5rem)',
        'heading': 'clamp(1.5rem, 4vw, 2.5rem)',
      },
      letterSpacing: {
        tighter: '-0.02em',
        wide: '0.1em',
        wider: '0.2em',
      },
      animation: {
        'grain': 'grain 80ms steps(4) infinite',
        'blink': 'blink 1s step-end infinite',
        'scanline': 'scanline-roll 8s linear infinite',
        'glitch': 'text-glitch 4s ease-in-out infinite',
        'reveal-up': 'reveal-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        grain: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '10%': { transform: 'translate(-2%, -2%)' },
          '20%': { transform: 'translate(2%, 2%)' },
          '30%': { transform: 'translate(-2%, 2%)' },
          '40%': { transform: 'translate(2%, -2%)' },
          '50%': { transform: 'translate(-2%, 0)' },
          '60%': { transform: 'translate(2%, 0)' },
          '70%': { transform: 'translate(0, -2%)' },
          '80%': { transform: 'translate(0, 2%)' },
          '90%': { transform: 'translate(-2%, -2%)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'scanline-roll': {
          '0%': { backgroundPositionY: '0' },
          '100%': { backgroundPositionY: '100px' },
        },
        'text-glitch': {
          '0%, 90%, 100%': {
            textShadow: '-2px 0 0 rgba(255, 0, 0, 0.6), 2px 0 0 rgba(0, 255, 255, 0.6)',
          },
          '92%': {
            textShadow: '3px 0 0 rgba(255, 0, 0, 0.8), -3px 0 0 rgba(0, 255, 255, 0.8)',
          },
          '94%': {
            textShadow: '-1px 2px 0 rgba(255, 0, 0, 0.6), 1px -2px 0 rgba(0, 255, 255, 0.6)',
          },
          '96%': {
            textShadow: '2px 1px 0 rgba(255, 0, 0, 0.8), -2px -1px 0 rgba(0, 255, 255, 0.8)',
          },
        },
        'reveal-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(60px) skewY(2deg)',
            filter: 'blur(4px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0) skewY(0)',
            filter: 'blur(0)',
          },
        },
      },
      transitionTimingFunction: {
        'aggressive': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'snap': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },
  plugins: [],
}

export default config
