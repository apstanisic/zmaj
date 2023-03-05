import { useRecord } from "@admin-panel/hooks/use-record"
import { getCrudUrl } from "@admin-panel/utils/get-crud-url"
import { CollectionMetadataCollection } from "@zmaj-js/common"
import { plural, singular } from "pluralize"
import { useNotify, useRedirect } from "ra-core"
import { memo, useEffect, useMemo } from "react"
import { ManualInputLayout } from "../../crud-layouts/input/ManualInputLayout"
import { GeneratedCreatePage } from "../../generator/pages/GeneratedCreatePage"
import { useInfraTables } from "../../state/infra-state-v2"
import { useInfraState } from "../../state/useInfraState"
import { RelationCreateForm } from "./create/RelationCreateForm"

export const RelationCreate = memo(() => {
	const infra = useInfraState()
	return (
		<GeneratedCreatePage onCreate={async (relation) => infra.refetch()}>
			<Content />
		</GeneratedCreatePage>
	)
})

function Content(): JSX.Element {
	const record = useRecord()
	// we expect that this value is provided with url
	const redirect = useRedirect()
	const notify = useNotify()
	const allTables = useInfraTables()
	const tables = useMemo(() => {
		return allTables.filter(
			(t) => !t.startsWith("zmaj") || t === "zmaj_users" || t === "zmaj_files",
		)
	}, [allTables])

	const leftTable = String(record?.["leftTable"] ?? "")
	// first table that is not left table
	const rightTable = tables.at(0) ?? ""

	useEffect(() => {
		if (tables.includes(leftTable)) return

		notify("Invalid table", { type: "error" })
		redirect(getCrudUrl(CollectionMetadataCollection, "list"))
	}, [leftTable, notify, redirect, tables])

	return (
		<ManualInputLayout
			className="mt-3 mb-20"
			enableNoChangeSubmit
			// we have to provide tables, otherwise values can't be pre-filled
			defaultValues={{
				type: "many-to-one",
				rightTable,
				leftTable,
				// leftColumn: `${leftTable}_id`,
				// rightColumn: "",
				leftPropertyName: singular(rightTable),
				rightPropertyName: plural(leftTable),
			}}
		>
			<RelationCreateForm tables={tables} />
		</ManualInputLayout>
	)
}
