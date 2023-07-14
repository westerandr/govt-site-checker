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
			}
		},
	},
	plugins: [require("@tailwindcss/typography"), require('daisyui')],
}
