import { RefOneToOneShowField, RefOneToOneShowFieldProps } from "./RefOneToOneShowField"

/**
 * We currently do not offer editing one-to-one relation from ref side
 */
export function RefOneToOneEditField(props: RefOneToOneShowFieldProps): JSX.Element {
	return (
		<RefOneToOneShowField
			{...props}
			newTab
			description="You can't currently edit record from here, please go to referenced record"
		/>
	)
}
