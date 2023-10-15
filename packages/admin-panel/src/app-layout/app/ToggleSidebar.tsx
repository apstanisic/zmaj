import { IconButton } from "@admin-panel/ui/buttons/IconButton"
import { clsx } from "clsx"
import { MdClose, MdMenu } from "react-icons/md"
import { useSidebarOpen } from "./use-sidebar-open"
export function ToggleSidebar(): JSX.Element {
	const [open, setOpen] = useSidebarOpen()

	return (
		<IconButton
			onPress={() => setOpen(!open)}
			aria-label="Open sidebar"
			className={clsx("du-swap du-swap-rotate relative md:!hidden", open && "du-swap-active")}
		>
			<span className={clsx("du-swap-on absolute")}>
				<MdClose />
			</span>
			<span className={clsx("du-swap-off absolute")}>
				<MdMenu />
			</span>
		</IconButton>
	)
}
