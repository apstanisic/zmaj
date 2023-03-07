import { castArray, ColumnDataType, Struct } from "@zmaj-js/common"
import { ReadonlyDeep, SetOptional } from "type-fest"
import { AdminPanelError } from "../shared/AdminPanelError"
import { BooleanComponents } from "./boolean"
import { CodeComponents } from "./code"
import { CsvComponents } from "./csv"
import { DateComponents } from "./date"
import { DateTimeComponents } from "./datetime"
import { DropdownComponents } from "./dropdown"
import { EmailComponents } from "./email"
import { JsonComponents } from "./json"
import { KeyValueComponents } from "./key-value"
import { MarkdownComponents } from "./markdown"
import { FloatComponents } from "./number"
import { IntComponents } from "./number-int"
import { PasswordComponents } from "./password"
import { RichTextComponents } from "./rich-text"
import { ShortTextComponents } from "./text"
import { TextareaComponents } from "./textarea"
import { TimeComponents } from "./time"
import { CrudComponentDefinition } from "./types/CrudComponentDefinition"
import { UrlComponents } from "./url"
import { UuidComponents } from "./uuid"

export type AddFieldComponentParams = SetOptional<
	CrudComponentDefinition,
	"SmallInput" | "availableComparisons" | "List" | "Show"
>

class FieldCrudComponents {
	#components: Struct<CrudComponentDefinition> = {}
	constructor() {
		this.add(BooleanComponents)
		this.add(CodeComponents)
		this.add(CsvComponents)
		this.add(DateComponents)
		this.add(DateTimeComponents)
		this.add(DropdownComponents)
		this.add(EmailComponents)
		this.add(JsonComponents)
		this.add(KeyValueComponents)
		this.add(MarkdownComponents)
		this.add(FloatComponents)
		this.add(IntComponents)
		this.add(PasswordComponents)
		this.add(RichTextComponents)
		this.add(ShortTextComponents)
		this.add(TextareaComponents)
		this.add(TimeComponents)
		this.add(UrlComponents)
		this.add(UuidComponents)
	}

	get components(): ReadonlyDeep<Struct<CrudComponentDefinition>> {
		return this.#components
	}

	add(component: CrudComponentDefinition): void {
		this.#components[component.name] = component
	}

	/**
	 *
	 * @param name Component name
	 * @param dbType Fallback component, if user requests component that does not exist,
	 * we will try to get component based of column type. If no component is found, we will throw
	 * @returns Relevant component
	 * It allows this weird params with null, cause it accepts data from db
	 */
	get(name?: string | null, dbType?: ColumnDataType | null): CrudComponentDefinition {
		const comp =
			this.#components[name ?? "_"] ??
			this.#components[dbType ?? "_"] ??
			this.#components["short-text"]
		if (!comp) throw new AdminPanelError(`#7203 ${name} ${dbType}`)
		return comp
	}

	getByDbType(type: ColumnDataType): string[] {
		return Object.values(this.#components)
			.filter((c) => c.availableFor.includes(type))
			.flatMap((c) => castArray(c.name))
	}
}

export const fieldComponents = new FieldCrudComponents()
