import { Struct } from "@zmaj-js/common"
import { throwInApp } from "../shared/throwInApp"
import { DefaultInputLayout, StepsInputLayout, TabsInputLayout } from "./input"
import {
	InputLayoutDefinition,
	LayoutDefinition,
	ListLayoutDefinition,
	ShowLayoutDefinition,
} from "./layout-definitions.types"
import { CalendarLayout, ListGalleryLayout } from "./list"
import { ListTableLayout } from "./list/table/table-layout"
import { SimpleShowLayout } from "./show"
import { TabsShowLayout } from "./show/TabsShowLayout"

class CrudLayouts {
	/**
	 * All list layouts
	 *
	 * Take name and make it a property key
	 */
	#list: Struct<ListLayoutDefinition> = {
		[ListGalleryLayout.name]: ListGalleryLayout,
		// [CalendarLayout.name]: CalendarLayout,
		[ListTableLayout.name]: ListTableLayout,
	}

	/**
	 * All input layouts
	 *
	 * Take name and make it a property key
	 */
	#input: Struct<InputLayoutDefinition> = {
		[DefaultInputLayout.name]: DefaultInputLayout,
		[StepsInputLayout.name]: StepsInputLayout,
		[TabsInputLayout.name]: TabsInputLayout,
	}

	/**
	 * All show layouts
	 *
	 * Take name and make it a property key
	 */
	#show: Struct<ShowLayoutDefinition> = {
		[SimpleShowLayout.name]: SimpleShowLayout,
		[TabsShowLayout.name]: TabsShowLayout,
	}

	#defaultLayouts = {
		show: "simple",
		list: "table",
		input: "simple",
	}

	setLayout(type: "show" | "list" | "input", value: string): void {
		this.#defaultLayouts[type] = value
	}

	/**
	 * Add list layout
	 */
	addList(layout: ListLayoutDefinition): void {
		this.#list[layout.name] = layout
	}
	/**
	 * Add input layout
	 */
	addInput(layout: InputLayoutDefinition): void {
		this.#input[layout.name] = layout
	}
	/**
	 * Add show layout
	 */
	addShow(layout: ShowLayoutDefinition): void {
		this.#show[layout.name] = layout
	}

	getShow(name?: string): ShowLayoutDefinition {
		return this.#getLayout(this.#show, "show", name)
	}

	/**
	 * Get List Layout
	 */
	getList(name?: string): ListLayoutDefinition {
		return this.#getLayout<ListLayoutDefinition>(this.#list, "list", name)
	}

	/**
	 * Get Input Layout
	 */
	getInput(name?: string): InputLayoutDefinition {
		return this.#getLayout(this.#input, "input", name)
	}

	/**
	 * Since input, show, and list, all use the same base, this is a generic function
	 * that will get layout, and throw error if layout does not exist.
	 *
	 * @param layouts Layouts to choose from
	 * @param name Name of layout
	 * @returns Layout for provided definitions with provided name
	 */
	#getLayout<T extends LayoutDefinition>(layouts: Struct<T>, type: T["type"], name?: string): T {
		return layouts[name ?? this.#defaultLayouts[type]] ?? throwInApp("59933")
	}
}
/**
 * All resource layouts as singleton
 */
export const crudLayouts = new CrudLayouts()
