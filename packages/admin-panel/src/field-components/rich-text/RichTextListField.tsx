import { RenderListField } from "../../shared/list/RenderListField"
import { ListFieldProps } from "../types/ListFieldProps"
import { safeDom } from "./_rich-text-utils"

export function RichTextListField(props: ListFieldProps) {
	return (
		<RenderListField
			{...props} //
			render={(props) => {
				return (
					<div className="w-full truncate max-w-[16rem]">
						{/* limit to only first 100 chars */}
						{safeDom(props.value, { stripTags: true }).substring(0, 100)}
					</div>
				)
			}}
		/>
	)
}
