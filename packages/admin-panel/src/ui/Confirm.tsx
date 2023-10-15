import { Button } from "@admin-panel/ui/buttons/Button"
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
				<Button
					autoFocus
					variant="outlined"
					className="w-32"
					onPress={() => props.onClose()}
				>
					Cancel
				</Button>
				<Button
					color="warning"
					className="ml-5 w-32"
					onPress={async () => props.onConfirm()}
				>
					Confirm
				</Button>
			</div>
		</Dialog>
	)
}
