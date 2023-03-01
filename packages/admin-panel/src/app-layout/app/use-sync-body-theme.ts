import { useEffect } from "react"
import { useTheme } from "../use-theme"

/**
 * We need to set theme to body tag so that dialog and non app layout items share theme
 */
export function useSyncBodyTheme(): void {
	const [theme] = useTheme()

	useEffect(() => {
		// we have to attach "dark" class here, since mui dialog is direct child of body tag by using dialog
		const element = document.body //document.getElementById("root")

		if (theme === "dark") {
			document.body.dataset["theme"] = "dark"
			element.classList.add("dark")
		} else {
			document.body.dataset["theme"] = "light"
			element.classList.remove("dark")
		}
	}, [theme])
}
