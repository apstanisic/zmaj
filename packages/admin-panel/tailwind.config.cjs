/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */

const daisyShapeVars = {
	"--rounded-btn": "0.5rem",
	"--animation-input": "0.1s",
	"--btn-text-case": "",
	"--rounded-badge": "0.5rem",
	"--btn-focus-scale": "0.95",
}

/** @type {import('tailwindcss').Config} */
module.exports = {
	future: {
		hoverOnlyWhenSupported: true,
	},
	content: ["./src/**/*.{js,ts,jsx,tsx,html}"],
	// use dark mode based on class
	// this gives more control to user so he/she can choose dark mode in system light theme...
	darkMode: "class",
	theme: {},
	plugins: [
		require("@tailwindcss/typography"),
		// require("@tailwindcss/forms"),
		require("daisyui"), //
	],
	daisyui: {
		themes: [
			{
				light: {
					...require("daisyui/src/theming/themes")["[data-theme=corporate]"],
					...daisyShapeVars,
					"base-content": "rgb(51 65 85)",
				},
				dark: {
					...require("daisyui/src/theming/themes")["[data-theme=business]"],
					...daisyShapeVars,
				},
			},
		],

		prefix: "du-",
		darkTheme: "dark",
	},
	/**
	 * These classes are always generated, since user can provide field width,
	 * we don't know what classes are needed
	 */
	safelist: [{ pattern: /col-span-(1|2|3|4|5|6|7|8|9|10|11|12)/, variants: ["md", "lg", "sm"] }],
}
