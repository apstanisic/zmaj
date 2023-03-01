import { Button } from "@admin-panel/ui/Button"
import { Dialog } from "@admin-panel/ui/Dialog"
import { useCallback, useState } from "react"
import { useShowFilterDialog } from "../use-show-filter-dialog"
import { JsonFilterForm } from "./JsonFilterForm"
import { UiFilterForm } from "./UiFilterForm"

export function FilterDialog(): JSX.Element {
	const [type, setType] = useState<"ui" | "json">("ui")
	//
	const [show, setShow] = useShowFilterDialog()
	const hideDialog = useCallback(() => setShow(false), [setShow])

	// we want to remove component from state, not simply hide it,
	// so that next time we show it, completely new form will be created
	if (!show) return <></>

	return (
		<Dialog
			open={true}
			onClose={hideDialog}
			className="max-w-3xl"
			// fullWidth
			// maxWidth="md" //
		>
			<div className="flex justify-between">
				<span>Add filter</span>
				<Button
					className="ml-auto"
					// variant="text"
					variant="transparent"
					onClick={() => setType(type === "json" ? "ui" : "json")}
				>
					Switch Mode
				</Button>
			</div>
			<div className="pb-6">
				{type === "json" ? (
					<JsonFilterForm hideDialog={hideDialog} />
				) : (
					<UiFilterForm hideDialog={hideDialog} />
				)}
			</div>
		</Dialog>
	)
}
