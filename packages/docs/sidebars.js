/* eslint-env node */
/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
	// By default, Docusaurus generates a sidebar from the docs folder structure
	// tutorialSidebar: [{ type: "autogenerated", dirName: "." }],

	docs: [
		// "docs/intro",
		{
			type: "category",
			items: [
				"getting-started/installation",
				"getting-started/new-project",
				"getting-started/manual-installation",
				"getting-started/docker",
				//
			],
			collapsed: false,
			link: { type: "doc", id: "getting-started/installation" },
			label: "Getting Started",
		},
		{
			type: "category",
			// items: [{ type: "autogenerated", dirName: "configuration" }],
			items: [
				"configuration/database",
				"configuration/storage",
				"configuration/email",
				"configuration/redis",
				"configuration/env-vars", //
			],
			collapsed: false,

			link: {
				type: "generated-index",
				slug: "configuration",
				// slug: "getting-started/installation",
			},
			label: "Configuring",
		},
		{
			type: "category",
			items: ["collections/collections-api", "collections/crud-events", "collections/validation"],
			collapsed: false,
			label: "Collections",
		},
		{
			type: "category",
			items: ["schema/collections", "schema/fields", "schema/relations"],
			collapsed: false,
			label: "Schema",
		},
		"authentication",
		"authorization",
		"nest-modules",
		"webhooks",
		"orm",
		"activity-log",
		"client-sdk",
		"migrations",
		"files",
		// {
		// 	type: "category",
		// 	link: { type: "doc", id: "videos/videos" },
		// 	items: [
		// 		// "videos/videos",
		// 		"videos/auth-videos",
		// 		"videos/user-videos", //
		// 		"videos/role-videos", //
		// 		"videos/permission-videos", //
		// 		"videos/collection-videos", //
		// 		"videos/field-videos", //
		// 		"videos/relation-videos", //
		// 	],
		// 	collapsed: true,
		// 	label: "Videos",
		// },
	],

	// But you can create a sidebar manually
	/*
  tutorialSidebar: [
    'intro',
    'hello',
    {
      type: 'category',
      label: 'Tutorial',
      items: ['tutorial-basics/create-a-document'],
    },
  ],
   */
}

module.exports = sidebars
