import { isString } from "radash"
import { ListFieldProps } from "../../field-components/types/ListFieldProps"
import { ensureValidChild } from "../ensure-valid-child"
import { RenderListField } from "./RenderListField"

/**
 * List field that is limited to maximum width, with 3 dots (...) in the end if there is more text
 *
 * Use this field instead of a `TextField` in list because `TextField` can take to much space.
 * This will truncate excess part of the text. If user wants to see all, there is a show page.
 *
 * @todo Maybe show tooltip? But we don't know if tooltip should be shown.
 * It would hurt UX for short values
 *
 */
export function ListTrimmedField(props: ListFieldProps): JSX.Element {
	return (
		<RenderListField
			{...props}
			render={({ value, source }) => {
				// if value is displayed as string, limit to 100 chars, since only around 60 are shown.
				// this improves performance, since we can have huge json, md or right text
				const toShow = ensureValidChild(value)
				return (
					<p className="max-w-[12rem] truncate">
						{isString(toShow) ? toShow.substring(0, 100) : toShow}
					</p>
				)
			}}
		/>
	)
}
