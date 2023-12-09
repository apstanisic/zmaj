// @ts-check
import { withThemeByClassName } from "@storybook/addon-themes"
import { MemoryRouter } from "react-router-dom"
import "../src/styles/index.css"

/** @type { import('@storybook/react').Preview } */
const preview = {
	parameters: {
		actions: { argTypesRegex: "^on[A-Z].*" },
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
	},
	decorators: [
		withThemeByClassName({
			themes: {
				light: "light",
				dark: "dark",
			},
			defaultTheme: "light",
		}),
		(story) => <MemoryRouter initialEntries={["/"]}>{story()}</MemoryRouter>,
	],
}

export default preview
