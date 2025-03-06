/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
	  "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
	  "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
	  "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
	  extend: {
		backgroundImage: {
		  "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
		  "gradient-conic":
			"conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
		},
		animation: {
		  shimmer: 'shimmer 2.5s infinite',
		  'fade-in': 'fadeIn 0.5s ease-in-out',
		  'slide-up': 'slideUp 0.5s ease-out',
		  'zoom-in': 'zoomIn 0.5s ease-out',
		  'pulse-slow': 'pulse 3s infinite',
		},
		keyframes: {
		  shimmer: {
			'0%': { transform: 'translateX(-100%)' },
			'100%': { transform: 'translateX(100%)' },
		  },
		  fadeIn: {
			'0%': { opacity: '0' },
			'100%': { opacity: '1' },
		  },
		  slideUp: {
			'0%': { transform: 'translateY(20px)', opacity: '0' },
			'100%': { transform: 'translateY(0)', opacity: '1' },
		  },
		  zoomIn: {
			'0%': { transform: 'scale(0.95)', opacity: '0' },
			'100%': { transform: 'scale(1)', opacity: '1' },
		  },
		},
		screens: {
		  'xs': '475px',
		},
		maxWidth: {
		  '8xl': '88rem',
		  '9xl': '96rem',
		},
	  },
	},
	plugins: [require("daisyui")],
	daisyui: {
	  themes: ["light", "dark"],
	},
  };
