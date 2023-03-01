import { ToManyInputContextProvider } from "@admin-panel/context/to-many-input-context"
import { OneToManyInternalProps } from "@admin-panel/generator/one-to-many/OneToManyInternalProps.type"
import { useRelationRightSide } from "@admin-panel/generator/use-relation-right-side"
import { useAuthz } from "@admin-panel/state/authz-state"
import { ListBase, ResourceContextProvider } from "ra-core"
import { memo, useMemo, useState } from "react"
import { useToManyInput } from "../useToManyInput"
import { ToManyPickerDialog } from "../_ToManyPickerDialog"
import { ToManyCreateInputField } from "./_ToManyCreateInputField"

export const ToManyCreateField = memo((props: OneToManyInternalProps) => {
	const { label, template, relation } = props
	const [pickerOpen, setPickerOpen] = useState(false)

	// in this context we only care about changes, so it's safe to use this generic
	// const [changes, setChanges] = useToManyInput()
	const changes = useToManyInput()

	// Get fk field, so we can check if field can be updated
	const rightSide = useRelationRightSide()

	// we check if user can change fk column, so action is update
	const authz = useAuthz()

	const canChange = useMemo(() => {
		if (relation.type === "many-to-many") {
			return authz.can("modify", relation.junction.collectionAuthzKey)
		} else {
			return authz.can("update", relation.otherSide.collectionName, relation.otherSide.fieldName)
		}
	}, [authz, relation])

	const enabled = useMemo(() => {
		if (relation.type === "one-to-many") {
			const rightField = rightSide?.fields[relation.otherSide.fieldName]
			return canChange && rightField?.canUpdate
		} else {
			// todo This could be more strict
			return canChange
		}
	}, [canChange, relation.otherSide.fieldName, relation.type, rightSide?.fields])

	return (
		<ToManyInputContextProvider
			value={{
				// not applicable to "create"
				deletable: false,
				disabled: !enabled,
				label,
				template,
				changes,
				pickerOpen,
				setPickerOpen,
			}}
		>
			<ResourceContextProvider value={relation.otherSide.collectionName}>
				<ListBase disableSyncWithLocation perPage={10}>
					<ToManyPickerDialog />
					<ToManyCreateInputField />
				</ListBase>
			</ResourceContextProvider>
		</ToManyInputContextProvider>
	)
})
