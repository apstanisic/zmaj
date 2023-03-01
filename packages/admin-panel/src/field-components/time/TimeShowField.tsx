import { RenderShowField } from "../../shared/show/RenderShowField"
import { ShowFieldProps } from "../types/ShowFieldProps"
import { extractTime } from "./_time-utils"

export function TimeShowField(props: ShowFieldProps): JSX.Element {
	return <RenderShowField {...props} render={({ value }) => extractTime(value)} />
}
