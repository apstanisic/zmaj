import { useResourceCollection } from "@admin-panel/hooks/use-resource-collection"
import { ReactNode } from "react"
import { PageHeader } from "../shared/PageHeader"

function useCreateTitle() {
	const col = useResourceCollection()

	return `Create ${col.label ?? col.collectionName}`
}

type CreatePageHeaderProps = {
	actions?: ReactNode
}

export function CreatePageHeader(props: CreatePageHeaderProps) {
	const title = useCreateTitle()
	return <PageHeader title={title} actions={props.actions} />
}
