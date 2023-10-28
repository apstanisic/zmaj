import { List } from "@admin-panel/ui/List"
import { RaRecord, useCreatePath, useListContext, useResourceDefinition } from "ra-core"
import { ReactNode, useCallback } from "react"

type SimpleListProps<T = RaRecord> = {
	primaryText: (r: T) => ReactNode
	secondaryText?: (r: T) => string
	startIcon?: (r: T) => ReactNode
	endIcon?: (r: T) => ReactNode
	rowClassName?: string
	linkType?: false
	className?: string
}

/**
 *
 */
export function SimpleListLayout<T extends RaRecord = RaRecord>(
	props: SimpleListProps<T>,
): JSX.Element {
	const list = useListContext()
	// const redirect = useRedirect()
	const resource = useResourceDefinition()
	const toPath = useCreatePath()

	const getHref = useCallback(
		(id: string | number) => {
			if (props.linkType === false) return
			const path = toPath({
				type: resource.hasShow ? "show" : resource.hasEdit ? "edit" : "list",
				resource: resource.name,
				id,
			})
			// it does not return # by default
			return `#${path}`
		},
		[props.linkType, resource.hasEdit, resource.hasShow, resource.name, toPath],
	)

	if (list.data?.length === 0) return <p className="my-5 text-center">No Items</p>

	const Item = props.linkType !== false ? List.ButtonItem : List.Item

	return (
		<List className={props.className}>
			{list.data?.map((item) => (
				<Item
					key={item.id}
					href={getHref(item.id)}
					end={props.endIcon?.(item)}
					start={props.startIcon?.(item)}
					// onClick={onClick ? () => onClick(item.id) : undefined}
					className={props.rowClassName}
				>
					<List.TitleAndSub
						title={props.primaryText(item)}
						subtitle={props.secondaryText?.(item)}
					/>
				</Item>
			))}
		</List>
	)
}
