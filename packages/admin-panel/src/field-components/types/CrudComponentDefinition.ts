import { Comparison, FieldDef } from "@zmaj-js/common"
import { ColumnDataType } from "@zmaj-js/orm"
import { ReactNode } from "react"
import { InputFieldProps } from "./InputFieldProps"
import { ListFieldProps } from "./ListFieldProps"
import { ShowFieldProps } from "./ShowFieldProps"

// $exists and $not_exists should handle FE, not API
// we need some way to provide ui with null and not null
export type GuiComparison = Comparison | "$exists" | "$not_exists"

export type CrudComponentDefinition = {
	/**
	 * Component name
	 */
	readonly name: string //| readonly string[]
	/**
	 * Component to render for input
	 */
	readonly Input: (props: InputFieldProps) => ReactNode
	/**
	 * Component to render for list
	 */
	readonly List: (props: ListFieldProps) => ReactNode
	/**
	 * Component to render for show
	 *
	 */
	readonly Show: (props: ShowFieldProps) => ReactNode
	/**
	 * Used when there is little space, for example for filter. We can't put big text area there,
	 * we must have something single line
	 */
	readonly SmallInput: (props: InputFieldProps) => ReactNode
	/**
	 * What comparisons can be used for this component
	 * For example, string can use $ends, but number can't
	 */
	readonly availableComparisons: readonly GuiComparison[]

	/**
	 * For which column type are this components available for
	 * For example, password component should be only available for short-text and long-text
	 */
	readonly availableFor: readonly ColumnDataType[]

	/**
	 * Render field config values
	 */
	readonly ShowFieldConfig?: () => ReactNode

	/**
	 * Render input for config values
	 *
	 * Component has some internal config. For example, number can set max value, string can set regex,
	 * uuid can specify version. This property adds ability to provide react component to render with option
	 *
	 */
	readonly InputFieldConfig?: () => ReactNode

	// TODO
	// ShowConfig?: () => ReactNode
	// ChangeConfig?: () => ReactNode

	/**
	 * Every component can have function that validates it's value (value is never null or undefined)
	 * Currently it's the same as components internal validation,
	 * but it might change with v4
	 * @deprecated TODO. Is this good?
	 */
	validate?: (params: { value: any; field: FieldDef; source: string }) => string | undefined
}
