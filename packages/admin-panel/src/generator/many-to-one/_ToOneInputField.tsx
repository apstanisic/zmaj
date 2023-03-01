import { useRecord } from "@admin-panel/hooks/use-record"
import { ChoicesDialogAndButton } from "@admin-panel/shared/choices/ChoicesDialogAndButton"
import { useInputField } from "@admin-panel/shared/input/useInputField"
import { memo, useMemo, useState } from "react"
import { useActionContext } from "../../context/action-context"
import { useIsAllowed } from "../../hooks/use-is-allowed"
import { MyReferenceInput } from "./MyReferenceInput"
import { ToOneInternalProps } from "./ToOneInternalProps.type"

/**
 * Input variants (Edit/Create)
 */
export const ToOneInputField = memo((props: ToOneInternalProps): JSX.Element => {
	const { field, relation } = props
	const action = useActionContext()
	const actionAllowed = useIsAllowed(action, relation.tableName, field.fieldName)
	const record = useRecord()

	const disabled = !actionAllowed || (action === "create" ? !field.canCreate : !field.canUpdate)

	const filter = useMemo(() => {
		if (relation.type !== "owner-one-to-one") return
		return {
			$or: [
				{
					[relation.otherSide.fieldName]: record?.[relation.fieldName],
				},
				{
					[relation.otherSide.propertyName!]: {
						[relation.fieldName]: null,
					},
				},
			],
		}
	}, [record, relation])

	// move picker here, so we only fetch data when user open choices picker
	const [showPicker, setShowPicker] = useState(false)

	/**
	 * many-to-one
	 * one-to-one owning side
	 */
	return (
		<MyReferenceInput
			source={field.fieldName}
			reference={relation.otherSide.collectionName}
			perPage={10}
			filter={filter}
			enableGetChoices={() => showPicker}
		>
			<RenderToOneInput
				{...props}
				disabled={disabled}
				showPicker={showPicker}
				setShowPicker={setShowPicker}
			/>
		</MyReferenceInput>
	)
})

const RenderToOneInput = memo(
	(
		props: ToOneInternalProps & {
			disabled: boolean
			showPicker: boolean
			setShowPicker: (val: boolean) => void
		},
	): JSX.Element => {
		const action = useActionContext()

		const required = useMemo(
			() =>
				action === "create" //
					? !props.field.isNullable && !props.field.hasDefaultValue
					: !props.field.isNullable,
			[action, props.field],
		)

		const field = useInputField({
			source: props.field.fieldName, //
			label: props.label,
			isRequired: required,
			description: props.field.description,
			disabled: props.disabled,
		})

		return (
			<ChoicesDialogAndButton
				field={field}
				className={props.className}
				template={props.template}
				show={props.showPicker}
				onShowChange={props.setShowPicker}
			/>
		)
	},
)
