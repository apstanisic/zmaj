import { ToOneInputCurrentValue } from "@admin-panel/generator/many-to-one/_ToOneInputCurrentValue"
import { clsx } from "clsx"
import { useCallback, useState } from "react"
import { useFormContext } from "react-hook-form"
import { UseInputFieldResult } from "../input/useInputField"
import { ChoicesPickerDialog } from "./ChoicesPickerDialog"

type ChoicesDialogAndButtonProps = {
	field: UseInputFieldResult
	className?: string
	template?: string
	show?: boolean
	onShowChange?: (show: boolean) => void
}

export function ChoicesDialogAndButton(props: ChoicesDialogAndButtonProps): JSX.Element {
	const { field } = props
	const [show, _setShow] = useState(props.show ?? false)
	const { setValue } = useFormContext()

	const changeShow = useCallback(
		(val: boolean) => {
			_setShow(val)
			props.onShowChange?.(val)
		},
		[props],
	)

	return (
		<div className={clsx("w-full", props.className)} id={`zmaj_x2o_input_${field.source}`}>
			<ToOneInputCurrentValue
				fieldName={field.source}
				required={field.isRequired}
				disabled={field.disabled}
				label={field.label}
				template={props.template ?? "{id}"}
				showPicker={() => changeShow(true)}
			/>

			<ChoicesPickerDialog
				show={show}
				setShow={changeShow}
				template={props.template}
				onClick={(record) => setValue(field.source, record.id)}
			/>
		</div>
	)
}
