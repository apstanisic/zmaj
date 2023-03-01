// @ts-check

/** @type {import("eslint").Linter.Config} */
module.exports = {
	root: true,
	parser: "@typescript-eslint/parser",
	plugins: ["@typescript-eslint", "unused-imports"],

	extends: [
		"eslint:recommended",
		"plugin:import/recommended",
		"plugin:import/typescript",
		"plugin:@typescript-eslint/recommended",
		"prettier",
	],
	// https://stackoverflow.com/questions/63118405
	ignorePatterns: [
		"coverage",
		"packages/*/dist/",
		"packages/cli/templates/",
		".eslintrc.cjs",
		"examples/",
	],
	settings: {
		"import/resolver": {
			typescript: true,
			node: true,
		},
	},
	rules: {
		// fs-extra causing problem
		"import/no-named-as-default-member": "off",
		// This is handled by TypeScript
		"import/no-unresolved": "off",
		"unused-imports/no-unused-imports": "warn",
		// ESLint breaks with this since it needs to read source code
		// https://github.com/typescript-eslint/typescript-eslint/issues/1192
		//
		// Require that we handle promise
		// "@typescript-eslint/no-floating-promises": "warn",
		// Forbid conditional promises
		// "@typescript-eslint/no-misused-promises": "warn",
		// If function returns promise, it must be async
		// "@typescript-eslint/promise-function-async": "error",
		//
		//
		// Allow `test!.hello`. It's common when looping, and it's better than to do necessary
		// checks for `null | undefined`
		"@typescript-eslint/no-non-null-assertion": "off",
		// Allow empty function
		"@typescript-eslint/no-empty-function": "off",
		// Warn when we have unreachable code
		"no-unreachable": "warn",
		// Do not await promise that is returned
		// `const fn = () => await fetch()`. `await` is redundant.
		"no-return-await": "error",
		// Allow unused vars // it started to complain when used with decorators
		"@typescript-eslint/no-unused-vars": "off",
		// Allow to have vars with `any` type. There are a lot of places where checking is not important
		// and it helps with testing/mocking
		"@typescript-eslint/no-explicit-any": "off",
		// Allow to specify type even when it can be inferred.
		// Allows this: `const price: number = 5`
		"@typescript-eslint/no-inferrable-types": "off",
		// Used a lot in testing to circumvent `readonly`
		"@typescript-eslint/ban-ts-comment": "off",
		// Warn when we didn't specify return type (except in callbacks)
		"@typescript-eslint/explicit-function-return-type": [
			"warn",
			{
				allowExpressions: true,
				allowTypedFunctionExpressions: true,
			},
		],
	},
}
