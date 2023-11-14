/* eslint-env node */

/** @type {import("eslint").Linter.Config} */
module.exports = {
	extends: [
		"plugin:react/recommended",
		"plugin:react/jsx-runtime",
		"plugin:react-hooks/recommended",
		"prettier", // prettier should always be last
	],
	env: {
		browser: true,
	},
	settings: {
		react: {
			version: "detect",
		},
	},
	rules: {
		// It is showing error for React.memo
		"react/display-name": 0,
		// We are using TypeScript, so there is no need prop types
		// Benefit of runtime type checking is not enough to have to define prop types everywhere.
		"react/prop-types": 0,
	},
	overrides: {
		files: ["*.tsx"],
		// We are usually returning only component in tsx, so it makes it repetitive to write return type
		"@typescript-eslint/explicit-function-return-type": ["off"],
	},
}
