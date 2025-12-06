/** @type {import('tailwindcss').Config} */

const defaultTheme = require("tailwindcss/defaultTheme")

module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	daisyui: {
		themes: [
			{
				mytheme: {

					"primary": "#16067f",

					"secondary": "#fcde7e",

					"accent": "#70f9d7",

					"neutral": "#212c3b",

					"base-100": "#ecedee",

					"info": "#2198ed",

					"success": "#0b6031",

					"warning": "#b38b14",

					"error": "#f62869",
				},
			},
		],
	},
	theme: {
		extend: {
			fontFamily: {
				sans: ["Merriweather", ...defaultTheme.fontFamily.sans]
			},
			keyframes: {
				'slide-in-up': {
					'0%': {
						transform: 'translateY(20px)',
						opacity: '0'
					},
					'100%': {
						transform: 'translateY(0)',
						opacity: '1'
					}
				},
				'slide-in-down': {
					'0%': {
						transform: 'translateY(-20px)',
						opacity: '0'
					},
					'100%': {
						transform: 'translateY(0)',
						opacity: '1'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0'
					},
					'100%': {
						opacity: '1'
					}
				}
			},
			animation: {
				'slide-in-up': 'slide-in-up 0.4s ease-out',
				'slide-in-down': 'slide-in-down 0.4s ease-out',
				'fade-in': 'fade-in 0.3s ease-out'
			},
			transitionProperty: {
				'position': 'transform, opacity',
				'sort': 'transform, opacity'
			}
		},
	},
	plugins: [require("@tailwindcss/typography"), require('daisyui')],
}
