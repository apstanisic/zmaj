import { FunctionComponent } from "react"

// export * from "./InputLayoutDefinition"
/**
 * Requirements for layout
 */
export type LayoutDefinition = {
	/**
	 * Layout name by which user can specify that they want to use it
	 */
	name: string
	/**
	 * Container component that will be rendered
	 * No data is passed as prop. Use context to access data
	 */
	Layout: FunctionComponent

	type: "input" | "show" | "list"
}

export type InputLayoutDefinition = LayoutDefinition & { type: "input" }
export type ShowLayoutDefinition = LayoutDefinition & { type: "show" }
export type ListLayoutDefinition = LayoutDefinition & { type: "list" }
