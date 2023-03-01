import { format, formatDistanceToNow } from "date-fns"
import { RenderListField } from "../../shared/list/RenderListField"
import { ListFieldProps } from "../types/ListFieldProps"

type DateTimeListFieldProps = ListFieldProps & { relative?: boolean }

/**
 * Date field
 */
export function DateTimeListField(props: DateTimeListFieldProps): JSX.Element {
	const relative = props.relative ?? props.fieldConfig?.component?.dateTime?.showRelative ?? false
	return (
		<RenderListField
			{...props}
			render={({ value }) =>
				relative
					? formatDistanceToNow(value, { addSuffix: true })
					: format(value, "dd.MM.yyyy - HH:mm")
			}
		/>
	)
}
