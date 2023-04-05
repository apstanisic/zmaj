import { useRelationContext } from "@admin-panel/context/relation-context"
import { useRecord } from "@admin-panel/hooks/use-record"
import { throwInApp } from "@admin-panel/shared/throwInApp"
import { isNil } from "@zmaj-js/common"
import { ListBase, ResourceContextProvider } from "ra-core"
import { memo, PropsWithChildren } from "react"

export const ManyToManyCurrent = memo((props: PropsWithChildren) => {
	const relation = useRelationContext() ?? throwInApp("42379")
	const record = useRecord()

	if (relation.type !== "many-to-many") throw new Error("#123")

	return (
		<ResourceContextProvider value={relation.otherSide.collectionName}>
			{/*
        This will not work with system tables that do not store other relations
        <ListBase
          disableSyncWithLocation
          perPage={10}
          filter={{
            [relation.rightPropertyName!]: {
              [relation.leftField!]: record?.id,
            },
          }}
          queryOptions={{ enabled: !isNil(record?.id) }}
        >
      */}

			<ListBase
				resource={relation.junction.collectionName}
				disableSyncWithLocation
				perPage={10}
				filter={{
					[relation.junction.thisSide.fieldName]: record?.id,
				}}
				queryOptions={{
					select(all) {
						const inner = all.data.map((row) => row[relation.junction.otherSide.propertyName])
						return { ...all, data: inner }
					},
					meta: {
						fields: {
							id: true,
							[relation.junction.otherSide.fieldName]: true,
							[relation.junction.otherSide.propertyName]: true,
						},
					},
					enabled: !isNil(record?.id),
				}}
			>
				{props.children}
			</ListBase>
		</ResourceContextProvider>
	)
})
