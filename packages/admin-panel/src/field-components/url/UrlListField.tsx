import { RenderListField } from "../../shared/list/RenderListField"
import { ListFieldProps } from "../types/ListFieldProps"

export function UrlListField(props: ListFieldProps): JSX.Element {
	return (
		<RenderListField
			{...props}
			render={({ value }) => (
				<a
					// prevent opening underling row in show page
					onClick={(e) => e.stopPropagation()}
					href={value}
					target="_blank"
					rel="noopener noreferrer"
					className="max-w-[12rem] truncate text-blue-700 hover:underline"
				>
					{value}
				</a>
			)}
		/>
	)
}
