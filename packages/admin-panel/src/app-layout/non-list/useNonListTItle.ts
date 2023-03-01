import { useRecord } from "@admin-panel/hooks/use-record"
import { templateParser } from "@zmaj-js/common"
import { singular } from "pluralize"
import { useMemo } from "react"
import { useActionContext } from "../../context/action-context"
import { useCollectionContext } from "../../context/collection-context"
import { throwInApp } from "../../shared/throwInApp"

export function useTitle(): string {
	const action = useActionContext()
	const collection = useCollectionContext() ?? throwInApp("287423")
	const record = useRecord()

	const memoized = useMemo(() => {
		// list
		if (action === "list") return ""

		// create
		if (action === "create") {
			return `New ${singular(collection.label ?? collection.tableName)}`
		}

		const title = templateParser.parse(
			collection.displayTemplate ?? "", //
			record,
			{ fallback: record?.id ?? "Record" },
		)

		// show
		if (action === "show") return title

		// edit
		return `Change "${title}"`
	}, [action, record, collection])

	return memoized
}
