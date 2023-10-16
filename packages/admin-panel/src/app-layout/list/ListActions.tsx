import { ResponsiveButton } from "@admin-panel/ui/buttons/ResponsiveButton"
import { clsx } from "clsx"
import { useListContext, useResourceDefinition } from "ra-core"
import { ReactNode, memo } from "react"
import { TbFilterOff } from "react-icons/tb"
import { CreateButton } from "../buttons/CreateButton"
import { ListSortButton } from "./ListSortButton"
import { ShowFilterDialogButton } from "./ShowFilterDialogButton"

type CustomListActionProps = {
	className?: string
	actionsStart?: ReactNode
	actionsEnd?: ReactNode
	hideDefaultActions?: boolean
	render?: (props: { defaultActions: ReactNode }) => ReactNode
}

/**
 * List Actions
 * @todo file is called differently from component
 */
export const ListActions = memo((props: CustomListActionProps) => {
	return (
		<div
			className={clsx(
				props.className,
				"mb-2 flex w-full items-center gap-3 whitespace-nowrap",
				// Make actions responsive
				// quickFilterExists && "h-32 flex-col md:h-16 md:flex-row",
				"flex-row",
			)}
		>
			{/* {quickFilterExists && disableFilter !== true && (
				<ListQuickFilterInput field={quickFilterKey} />
			)} */}

			<div className={clsx("ml-auto flex h-full flex-wrap items-center gap-x-3")}>
				{props.render ? (
					props.render({ defaultActions: <DefaultActions /> })
				) : (
					<DefaultActions />
				)}
			</div>
		</div>
	)
})

function DefaultActions() {
	const list = useListContext()
	const resource = useResourceDefinition()
	return (
		<>
			<ShowFilterDialogButton />
			{Object.keys(list?.filterValues).filter((f) => !f.startsWith("_")).length > 0 && (
				<ResponsiveButton
					label="Remove Filters"
					onPress={() => list.setFilters({}, {})}
					icon={<TbFilterOff />}
				/>
			)}

			{resource.hasCreate && <CreateButton />}
			{/* {resource.hasCreate && <CreateButton />} */}
			<ListSortButton />
		</>
	)
}
