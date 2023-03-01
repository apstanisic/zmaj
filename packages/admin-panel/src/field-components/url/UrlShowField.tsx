import { RenderShowField } from "../../shared/show/RenderShowField"
import { ShowFieldProps } from "../types/ShowFieldProps"

export function UrlShowField(props: ShowFieldProps): JSX.Element {
	return (
		<RenderShowField
			{...props}
			render={({ value }) => (
				<a
					href={value}
					target="_blank"
					rel="noopener noreferrer"
					className="text-blue-700 hover:underline"
				>
					{value}
				</a>
			)}
		/>
	)
}
