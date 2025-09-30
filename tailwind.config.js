/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			colors: {
				'primary': '#5E6153',
				'off-white': '#F3F0E8',
				'black': '#212121',
				'secondary': {
					50: '#f0f9ff',
					500: '#06b6d4',
					700: '#0e7490',
				},
			},
			animation: {
				'slide-in': 'slideIn 0.3s ease-out',
				'fade-in': 'fadeIn 0.3s ease-out',
				'slide-up': 'slideUp 0.3s ease-out',
			},
			keyframes: {
				slideIn: {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(0)' },
				},
				fadeIn: {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' },
				},
				slideUp: {
					'0%': { transform: 'translateY(20px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' },
				},
			},
		},
	},
	plugins: [],
}
