import { RenderShowField } from "../../shared/show/RenderShowField"
import { ShowFieldProps } from "../types/ShowFieldProps"
import { DisplayCsvValue } from "./_DisplayCsvValue"

/**
 * Add special red comma, so we know that it's csv, and not string with commas
 */

export function CsvShowField(props: ShowFieldProps): JSX.Element {
	return <RenderShowField {...props} render={({ value }) => <DisplayCsvValue value={value} />} />
}
