import { memo, ReactNode } from "react"
import { ListFieldProps } from "../../field-components/types/ListFieldProps"

type RenderListFieldProps = ListFieldProps & { render: (props: ListFieldProps) => ReactNode }

/**
 * Wrapper for every List Field, it check for null and undefined as shows special text
 * Otherwise it calls parse method
 * Record is cloned for every item, so we are sure that one field won't mess another
 */
export const RenderListField = memo((props: RenderListFieldProps) => {
	const { render, value } = props

	const nilText = value === null ? "NULL" : value === undefined ? "UNKNOWN" : undefined

	if (nilText) {
		return <p className="text-purple-600 dark:text-purple-400">{nilText}</p>
	}
	return <>{render(props)}</>
})
