import { throwInApp } from "@admin-panel/shared/throwInApp"
import { memo, useState } from "react"
import { useRelationContext } from "../../context/relation-context"
import { ToManyInputContextProvider } from "../../context/to-many-input-context"
import { useIsAllowed } from "../../hooks/use-is-allowed"
import { ToManyEditInputField } from "../to-many/input/edit/_ToManyEditInputField"
import { useToManyInput } from "../to-many/input/useToManyInput"
import { ManyToManyCurrent } from "./ManyToManyCurrent"

type OneToManyInputFieldProps = {
	label: string
	template: string
}

/**
 * ToManyInputContext
 */

export const ManyToManyEditField = memo((props: OneToManyInputFieldProps) => {
	const { label, template } = props
	const [pickerOpen, setPickerOpen] = useState(false)
	const relation = useRelationContext()!

	// in this context we only care about changes, so it's safe to use this generic
	// const [changes, setChanges] = useToManyInput()
	const changes = useToManyInput()

	// user must be able to manage junction table
	const canChange = useIsAllowed(
		"manage",
		// for ts
		relation.type !== "many-to-many" ? "all" : relation.junction.collectionAuthzKey,
	)

	if (relation.type !== "many-to-many") throwInApp("42333")

	return (
		<ManyToManyCurrent>
			{/* // enabled={pickerOpen}> */}
			<ToManyInputContextProvider
				value={{
					deletable: true,
					changes,
					disabled: !canChange,
					label,
					template,
					pickerOpen,
					setPickerOpen,
				}}
			>
				<ToManyEditInputField />
			</ToManyInputContextProvider>
		</ManyToManyCurrent>
	)
})
