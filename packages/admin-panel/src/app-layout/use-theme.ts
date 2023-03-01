import { stateFactory } from "../utils/createState"
// import create from "zustand"

type Theme = "light" | "dark"

export const [useTheme] = stateFactory<Theme>(
	window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light", //
	"theme",
)

// const theme = createStore((set) => ({
// 	theme: window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light", //
// 	manual: false,
// 	setTheme: (theme: Theme) => set({ theme }),
// 	setManual: (manual: boolean) => set({ manual }),
// }))
