import { useRecord } from "@admin-panel/hooks/use-record"
import { notNil } from "@zmaj-js/common"
import { ListBase, ResourceContextProvider } from "ra-core"
import { memo, useMemo, useState } from "react"
import { ToManyInputContextProvider } from "../../context/to-many-input-context"
import { useIsAllowed } from "../../hooks/use-is-allowed"
import { ToManyEditInputField } from "../to-many/input/edit/_ToManyEditInputField"
import { useToManyInput } from "../to-many/input/useToManyInput"
import { useRelationRightSide } from "../use-relation-right-side"
import { OneToManyInternalProps } from "./OneToManyInternalProps.type"

export const OneToManyEditField = memo((props: OneToManyInternalProps) => {
	const { label, template, relation } = props
	const [pickerOpen, setPickerOpen] = useState(false)
	const mainRecord = useRecord()

	// in this context we only care about changes, so it's safe to use this generic
	const changes = useToManyInput()

	// Get fk field, so we can check if field can be updated
	const rightSide = useRelationRightSide()

	// we check if user can change fk column, so action is update
	const canChange = useIsAllowed(
		"update",
		rightSide?.authzKey ?? "all",
		relation.otherSide.fieldName,
	)

	const disabled = useMemo(() => {
		if (!canChange) return true
		const rightField = rightSide?.fields[relation.otherSide.fieldName]
		if (!rightField) return true
		return !rightField.canUpdate
	}, [canChange, relation.otherSide.fieldName, rightSide?.fields])

	// We can't delete if other side requires fk to be not nullable, we must go to the other side and
	// delete it from there with replacing fk field value
	const deletable = useMemo(
		() => rightSide?.fields[relation.otherSide.fieldName]?.isNullable ?? false,
		[relation, rightSide],
	)

	return (
		<ResourceContextProvider value={relation.otherSide.collectionName}>
			{/* this shows current items, not possible, so it's simple filtering right table */}
			<ListBase
				disableSyncWithLocation
				perPage={10}
				queryOptions={{
					enabled: notNil(mainRecord?.id),
				}}
				filter={{
					// only get where fk points to current record
					[relation.otherSide.fieldName]: { $eq: mainRecord?.id },
				}}
			>
				<ToManyInputContextProvider
					value={{
						deletable,
						disabled,
						label,
						template,
						changes,
						pickerOpen,
						setPickerOpen,
					}}
				>
					<ToManyEditInputField />
				</ToManyInputContextProvider>
			</ListBase>
		</ResourceContextProvider>
	)
})
