import { Dialog } from "@admin-panel/ui/Dialog"
import { IdType } from "@zmaj-js/orm"
import { RaRecord } from "ra-core"
import { useCallback } from "react"
import { ReferencePickerDialogContent } from "./ReferencePickerDialogContent"

type ChoicesPickerDialogProps = {
	multiple?: boolean
	show: boolean
	setShow: (val: boolean) => void
	onSelect: (id: IdType) => unknown
	template?: string
	selected: IdType[]
}

export function ReferencesPickerDialog(props: ChoicesPickerDialogProps): JSX.Element {
	const { show, setShow, onSelect, template, selected } = props

	const onClick = useCallback(
		(record: RaRecord) => {
			onSelect(record.id)
			setShow(false)
		},
		[onSelect, setShow],
	)

	const onDismiss = useCallback(() => {
		setShow(false)
	}, [setShow])

	return (
		<Dialog
			onClose={onDismiss}
			open={show}
			className="relative min-h-[500px] max-h-[80vh] max-w-2xl"
		>
			<div className="flex min-h-full flex-1 flex-col items-stretch p-4">
				<ReferencePickerDialogContent
					onSelect={onClick}
					template={template}
					selected={selected}
				/>
				{/* {multiple && (
					<div className="flex justify-end">
						<Button variant="outlined" className="mt-6" onPress={onMultiDone}>
							Done
						</Button>
					</div>
				)} */}
			</div>
		</Dialog>
	)
}
