import { Dialog } from "@admin-panel/ui/Dialog"
import { RaRecord } from "ra-core"
import { useCallback } from "react"
import { ReferencePickerDialogContent } from "./ReferencePickerDialogContent"

type ChoicesPickerDialogProps = {
	show: boolean
	setShow: (val: boolean) => void
	onSelect: (record: RaRecord) => unknown
	template?: string
}

export function ReferencesPickerDialog(props: ChoicesPickerDialogProps): JSX.Element {
	const { show, setShow, onSelect, template } = props
	// const resource = useChoicesContext().resource

	const onClick = useCallback(
		(record: RaRecord) => {
			setShow(false)
			onSelect(record)
		},
		[onSelect, setShow],
	)
	return (
		<Dialog onClose={setShow} open={show} className="relative min-h-[500px] max-w-2xl">
			<div className="flex min-h-full flex-1 flex-col items-stretch p-4">
				{/* <h1 className="pb-1 text-center text-2xl">{resource}</h1> */}
				<ReferencePickerDialogContent onSelect={onClick} template={template} />
			</div>
		</Dialog>
	)
}
