import { Dialog } from "@admin-panel/ui/Dialog"
import { RaRecord, useChoicesContext } from "ra-core"
import { useCallback } from "react"
import { ChoicesPicker, ChoicesPickerProps } from "./ChoicesPicker"

type ChoicesPickerDialogProps = {
	show: boolean
	setShow: (val: boolean) => void
	keepOpenAfterClick?: boolean
} & ChoicesPickerProps

export function ChoicesPickerDialog(props: ChoicesPickerDialogProps) {
	const { show, setShow, keepOpenAfterClick, ...picker } = props
	const resource = useChoicesContext().resource

	const onClick = useCallback(
		(record: RaRecord) => {
			if (keepOpenAfterClick !== true) {
				props.setShow(false)
			}
			picker.onClick(record)
		},
		[keepOpenAfterClick, picker, props],
	)
	return (
		<Dialog
			onClose={() => props.setShow(false)}
			open={props.show}
			className="relative min-h-[500px] max-w-2xl"
		>
			<div className="flex min-h-full flex-1 flex-col items-stretch p-4">
				<h1 className="pb-1 text-center text-2xl">{resource}</h1>
				<ChoicesPicker {...picker} onClick={onClick} />
			</div>
		</Dialog>
	)
}
