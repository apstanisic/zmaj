import { RenderListField } from "../../shared/list/RenderListField"
import { ListFieldProps } from "../types/ListFieldProps"

/**
 * If password exists, just provide fixed text (In most cases API should not return password)
 */

export function PasswordListField(props: ListFieldProps) {
	return <RenderListField {...props} render={() => "******"} />
}
