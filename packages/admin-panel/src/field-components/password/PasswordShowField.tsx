import { RenderShowField } from "../../shared/show/RenderShowField"
import { ShowFieldProps } from "../types/ShowFieldProps"

export function PasswordShowField(props: ShowFieldProps) {
	return <RenderShowField {...props} render={() => "******"} />
}
