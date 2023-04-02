import { useRecord } from "@admin-panel/hooks/use-record"
import { getCrudUrl } from "@admin-panel/utils/get-crud-url"
import {
	CollectionMetadataCollection,
	RelationCreateDto,
	filterStruct,
	notNil,
} from "@zmaj-js/common"
import { plural, singular } from "pluralize"
import { useNotify, useRedirect } from "ra-core"
import { memo, useEffect, useMemo } from "react"
import { ManualInputLayout } from "../../crud-layouts/input/ManualInputLayout"
import { GeneratedCreatePage } from "../../generator/pages/GeneratedCreatePage"
import { useUserCollections } from "../../hooks/use-user-collections"
import { useInfraState } from "../../state/useInfraState"
import { RelationCreateForm } from "./create/RelationCreateForm"
import { crush, construct } from "radash"

function removeEmptyValues(val: any): unknown {
	const flat = filterStruct(crush(val), (v) => notNil(v) && v !== "")
	return construct(flat) as unknown
}

export const RelationCreate = memo(() => {
	const infra = useInfraState()
	return (
		<GeneratedCreatePage
			transform={removeEmptyValues}
			onCreate={async (relation) => infra.refetch()}
		>
			<Content />
		</GeneratedCreatePage>
	)
})

function Content(): JSX.Element {
	const record = (useRecord() ?? {}) as Partial<RelationCreateDto>
	// we expect that this value is provided with url
	const redirect = useRedirect()
	const notify = useNotify()
	const cols = useUserCollections()
	const collectionNames = useMemo(() => {
		return ["zmajUsers", "zmajFiles", ...cols.map((c) => c.collectionName)]
	}, [cols])

	const leftCollection = String(record?.leftCollection ?? "") ?? "zmajUsers"
	// first table that is not left table
	const rightCollection = collectionNames.at(0) ?? ""

	useEffect(() => {
		if (collectionNames.includes(leftCollection)) return

		notify("Invalid collection", { type: "error" })
		redirect(getCrudUrl(CollectionMetadataCollection, "list"))
	}, [leftCollection, notify, redirect, collectionNames])

	return (
		<ManualInputLayout
			className="mt-3 mb-20"
			enableNoChangeSubmit
			// we have to provide tables, otherwise values can't be pre-filled
			defaultValues={
				{
					type: "many-to-one",
					rightCollection: rightCollection,
					leftCollection: leftCollection,
					left: {
						propertyName: singular(rightCollection),
						column: undefined as any,
					},
					right: {
						propertyName: plural(leftCollection),
						column: undefined as any,
					},
				} satisfies Partial<RelationCreateDto>
			}
		>
			<RelationCreateForm collections={collectionNames} />
		</ManualInputLayout>
	)
}
