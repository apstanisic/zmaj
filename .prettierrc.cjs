// @ts-check
/* eslint-env node */

/** @type {import('prettier').Config} */
module.exports = {
	// order tailwind classes
	// this is not currently running since I'm using Rome for formatting js/ts
	// plugins: [require("prettier-plugin-tailwindcss")],
	// easier to move multiline code
	trailingComma: "all",
	// move from 80 chars line to 100
	printWidth: 100,
	// don't use semicolons, since typescript catches problematic cases
	semi: false,
	// use tabs, since that way user can specify tab size
	useTabs: true,
}
