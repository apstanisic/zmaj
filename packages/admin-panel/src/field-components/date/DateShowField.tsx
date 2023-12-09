import { RenderShowField } from "../../shared/show/RenderShowField"
import { ShowFieldProps } from "../types/ShowFieldProps"
import { extractDate } from "./_date-utils"

export function DateShowField(props: ShowFieldProps) {
	return <RenderShowField {...props} render={({ value }) => extractDate(value)} />
}
