import { ignoreErrors } from "@zmaj-js/common"
import { format, formatDistanceToNow } from "date-fns"
import { RenderShowField } from "../../shared/show/RenderShowField"
import { ShowFieldProps } from "../types/ShowFieldProps"

/**
 * For show always show relative after current date
 */

export function DateTimeShowField(props: ShowFieldProps): JSX.Element {
	return (
		<RenderShowField
			{...props}
			render={({ value }) => {
				const parsed = ignoreErrors(() => {
					// How to handle this, since sometimes default value from db can be "CURRENT_TIMESTAMP",
					// but user can also provide JSON date
					if (typeof value === "string") return
					const dateTime = format(value, "yyyy-MM-dd HH:mm")

					const relativeTime = formatDistanceToNow(value, { addSuffix: true })
					return `${dateTime} (${relativeTime})`
				})

				return parsed ?? <span className="text-orange-500">{String(value)}</span>
			}}
		/>
	)
}
