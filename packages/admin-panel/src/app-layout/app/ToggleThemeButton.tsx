import { IconToggleButton } from "@admin-panel/ui/IconToggleButton"
import { cn } from "@admin-panel/utils/cn"
import { useCallback } from "react"
import { MdBrightness4, MdBrightness7 } from "react-icons/md"
import { useTheme } from "../use-theme"

export function ToggleThemeButton(): JSX.Element {
	const [theme, setTheme] = useTheme()

	const changeTheme = useCallback(() => {
		setTheme(theme === "light" ? "dark" : "light")
	}, [setTheme, theme])

	return (
		<IconToggleButton
			onPress={changeTheme}
			aria-label="Toggle Theme"
			size="large"
			isOn={theme === "light"}
			className={cn("text-white")}
			on={<MdBrightness7 />}
			off={<MdBrightness4 />}
		/>
	)
}
