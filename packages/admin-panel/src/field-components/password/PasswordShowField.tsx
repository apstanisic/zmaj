import { RenderShowField } from "../../shared/show/RenderShowField"
import { ShowFieldProps } from "../types/ShowFieldProps"

export function PasswordShowField(props: ShowFieldProps): JSX.Element {
	return <RenderShowField {...props} render={() => "******"} />
}
