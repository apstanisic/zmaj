import { memo } from "react"
import { RenderListField } from "../../shared/list/RenderListField"
import { ListFieldProps } from "../types/ListFieldProps"
import { DisplayCsvValue } from "./_DisplayCsvValue"

export const CsvListField = memo((props: ListFieldProps) => {
	return <RenderListField {...props} render={({ value }) => <DisplayCsvValue value={value} />} />
})
