import { IconToggleButton } from "@admin-panel/ui/IconToggleButton"
import { cn } from "@admin-panel/utils/cn"
import { MdClose, MdMenu } from "react-icons/md"
import { useSidebarOpen } from "./use-sidebar-open"
export function ToggleSidebar() {
	const [open, setOpen] = useSidebarOpen()

	return (
		<IconToggleButton
			onPress={() => setOpen(!open)}
			aria-label="Open sidebar"
			className={cn("du-swap-rotate md:!hidden text-white")}
			on={<MdClose />}
			off={<MdMenu />}
			isOn={open}
		></IconToggleButton>
	)
}
