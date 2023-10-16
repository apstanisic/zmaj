import { stateFactory } from "../utils/createState"

type Theme = "light" | "dark"

export const [useTheme] = stateFactory<Theme>(
	window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light", //
	"theme",
)
