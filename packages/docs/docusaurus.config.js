// @ts-check
/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github")
const darkCodeTheme = require("prism-react-renderer/themes/oceanicNext")

/** @type {import('@docusaurus/types').Config} */
const config = {
	title: "Zmaj CMS",
	tagline:
		"Zmaj is a headless CMS with RESTful API for your database and admin panel to easily manage your data.",
	url: "https://zmaj.vercel.app",
	baseUrl: "/",
	onBrokenLinks: "throw",
	onBrokenMarkdownLinks: "warn",
	favicon: "/favicon.ico",
	i18n: {
		defaultLocale: "en",
		locales: ["en"],
	},
	presets: [
		[
			"classic",
			/** @type {import('@docusaurus/preset-classic').Options} */
			({
				docs: {
					sidebarPath: require.resolve("./sidebars.js"),
					// Please change this to your repo.
					// Remove this to remove the "edit this page" links.
					// editUrl:
					// 	"https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/",
				},
				blog: false,
				// blog: {
				// 	showReadingTime: true,
				// 	// Please change this to your repo.
				// 	// Remove this to remove the "edit this page" links.
				// 	// editUrl:
				// 	// 	"https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/",
				// },
				theme: {
					customCss: require.resolve("./src/css/custom.css"),
				},
			}),
		],
	],

	themeConfig:
		/** @type {import('@docusaurus/preset-classic').ThemeConfig} */
		({
			navbar: {
				title: "Zmaj CMS",
				logo: {
					alt: "Zmaj Logo",
					src: "/logo.svg",
				},
				items: [
					{
						type: "doc",
						docId: "getting-started",
						position: "left",
						label: "Documentation",
					},
					// { to: "/blog", label: "Blog", position: "left" },
					{
						href: "https://github.com/facebook/docusaurus",
						label: "GitHub",
						position: "right",
					},
				],
			},
			footer: {
				style: "dark",
				links: [
					{
						title: "Docs",
						items: [
							{
								label: "Getting Started",
								to: "/docs",
							},
							{
								label: "Configuring",
								to: "/docs/configuration",
							},
						],
					},
					// {
					// 	title: "Community",
					// 	items: [
					// 		{
					// 			label: "Stack Overflow",
					// 			href: "https://stackoverflow.com/questions/tagged/docusaurus",
					// 		},
					// 		{
					// 			label: "Discord",
					// 			href: "https://discordapp.com/invite/docusaurus",
					// 		},
					// 		{
					// 			label: "Twitter",
					// 			href: "https://twitter.com/docusaurus",
					// 		},
					// 	],
					// },
					{
						title: "More",
						items: [
							{
								label: "Documentation",
								to: "/docs",
							},
							{
								label: "GitHub",
								href: "https://github.com/apstanisic/zmaj",
							},
						],
					},
				],
				copyright: `Copyright © ${new Date().getFullYear()} apstanisic, Inc. Built with Docusaurus.`,
			},
			prism: {
				theme: lightCodeTheme,
				darkTheme: darkCodeTheme,
				additionalLanguages: ["http"],
			},
		}),
}

module.exports = config
