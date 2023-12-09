import { useRecord } from "@admin-panel/hooks/use-record"
import { useResourceCollection } from "@admin-panel/hooks/use-resource-collection"
import { templateParser } from "@zmaj-js/common"
import { ReactNode } from "react"
import { PageHeader } from "../shared/PageHeader"
import { ShowPageActions } from "./ShowPageActions"

function useShowTitle() {
	const record = useRecord()
	const col = useResourceCollection()

	const title = templateParser.parse(
		col.displayTemplate ?? "", //
		record,
		{ fallback: record?.id ?? " " },
	)
	return title
}

type ShowPageHeaderProps = {
	actions?: ReactNode
}

export function ShowPageHeader(props: ShowPageHeaderProps) {
	const { actions } = props
	const title = useShowTitle()
	return <PageHeader title={title} actions={actions ?? <ShowPageActions />} />
}
