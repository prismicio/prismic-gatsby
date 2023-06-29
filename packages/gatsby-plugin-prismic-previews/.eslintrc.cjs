module.exports = {
	root: true,
	env: {
		browser: true,
		node: true,
	},
	parserOptions: {
		parser: "@typescript-eslint/parser",
		ecmaVersion: 2020,
	},
	settings: {
		react: {
			version: "detect",
		},
	},
	extends: [
		"plugin:@typescript-eslint/eslint-recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:prettier/recommended",
		"plugin:react/recommended",
		"plugin:react-hooks/recommended",
	],
	plugins: ["eslint-plugin-tsdoc"],
	rules: {
		"no-console": ["warn", { allow: ["info", "warn", "error"] }],
		"no-debugger": "warn",
		"no-undef": "off",
		curly: "error",
		"prefer-const": "error",
		"padding-line-between-statements": [
			"error",
			{ blankLine: "always", prev: "*", next: "return" },
		],
		"@typescript-eslint/no-unused-vars": [
			"error",
			{
				argsIgnorePattern: "^_",
				varsIgnorePattern: "^_",
			},
		],
		"@typescript-eslint/no-var-requires": "off",
		"@typescript-eslint/explicit-module-boundary-types": "error",
		"tsdoc/syntax": "warn",
		"react/display-name": "off",
		"react/react-in-jsx-scope": "off",
	},
};
