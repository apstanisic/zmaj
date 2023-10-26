import { useRecord } from "@admin-panel/hooks/use-record"
import { useMemo } from "react"
import { ManyToOneInputField } from "../many-to-one/ManyToOneInputField/ManyToOneInputField"

type OwnerToOneInputFieldProps = {
	source: string
	reference: string
	/* If post_info -> post, it's relation property on posts, in this case: postInfo */
	// force to pass null
	referenceProperty: string | null
	// currently only ID is allowed
	// referenceSource: string
	label?: string
	disabled?: boolean
	className?: string
	template?: string
}

export function OwnerOneToOneInputField(props: OwnerToOneInputFieldProps): JSX.Element {
	const { source, referenceProperty } = props
	const fkValue = useRecord()?.[source]
	// get where other side ID is fkValue, or, it does not have relation
	const filter = useMemo(
		() => ({
			$or: [
				{ ["id"]: fkValue },
				// this check that record does not already have anything pointing to him
				{ [referenceProperty ?? "_"]: { ["id"]: null } }, //
			],
		}),
		[fkValue, referenceProperty],
	)

	return (
		<ManyToOneInputField
			{...props}
			filter={filter}
			disabled={props.disabled ?? referenceProperty === null}
		/>
	)
}
