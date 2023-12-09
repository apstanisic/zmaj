import { useRecord } from "@admin-panel/hooks/use-record"
import { useResourceCollection } from "@admin-panel/hooks/use-resource-collection"
import { templateParser } from "@zmaj-js/common"
import { ReactNode } from "react"
import { PageHeader } from "../shared/PageHeader"
import { EditPageActions } from "./EditPageActions"

function useEditTitle() {
	const record = useRecord()
	const col = useResourceCollection()

	const title = templateParser.parse(
		col.displayTemplate ?? "", //
		record,
		{ fallback: record?.id ?? " " },
	)
	return `Edit "${title}"`
}

type EditPageHeaderProps = {
	actions?: ReactNode
}

export function EditPageHeader(props: EditPageHeaderProps) {
	const title = useEditTitle()
	return <PageHeader title={title} actions={props.actions ?? <EditPageActions />} />
}
