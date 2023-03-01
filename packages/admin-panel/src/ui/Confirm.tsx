import { Button } from "@admin-panel/ui/Button"
import { Dialog } from "@admin-panel/ui/Dialog"
import { Divider } from "@admin-panel/ui/Divider"
import { ReactNode } from "react"

export function Confirm(props: {
	onConfirm: () => void
	onClose: () => void
	open: boolean
	title: string
	content?: ReactNode
}): JSX.Element {
	return (
		<Dialog open={props.open} onClose={props.onClose} className="max-w-2xl">
			{props.title && <p className="mb-3 text-center text-xl">{props.title}</p>}
			{props.content}
			<Divider />
			<div className="flex justify-end">
				<Button autoFocus outline className="w-32" onClick={() => props.onClose()}>
					Cancel
				</Button>
				<Button variant="warning" className="ml-5 w-32" onClick={async () => props.onConfirm()}>
					Confirm
				</Button>
			</div>
		</Dialog>
	)
}
