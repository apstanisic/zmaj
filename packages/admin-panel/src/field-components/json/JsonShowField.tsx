import { ignoreErrors, isNil } from "@zmaj-js/common"
import { isString } from "radash"
import { CodeShowField } from "../code/CodeShowField"
import { ShowFieldProps } from "../types/ShowFieldProps"

export const JsonShowField = (props: ShowFieldProps): JSX.Element => (
	<CodeShowField {...props} value={formatJson(props.value) ?? props.value} language="json" />
)

function formatJson(val: unknown): string {
	if (isNil(val)) return "null"
	if (!isString(val)) return JSON.stringify(val, null, 4)
	return ignoreErrors(() => JSON.stringify(JSON.parse(val), null, 4)) ?? val
}
