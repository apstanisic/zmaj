import { twBreakpoints } from "@admin-panel/breakpoints"
import { useEffect } from "react"
import { useWindowSize } from "react-use"
import { useSidebarOpen } from "./use-sidebar-open"

/**
 * Hide sidebar on md screen
 */
export function useHideDynamicSidebar(): boolean {
	const [open, setOpen] = useSidebarOpen()
	const windowSize = useWindowSize()

	useEffect(() => {
		if (open && windowSize.width >= twBreakpoints.md) {
			setOpen(false)
		}
	}, [open, setOpen, windowSize.width])

	return windowSize.width >= twBreakpoints.md
}
