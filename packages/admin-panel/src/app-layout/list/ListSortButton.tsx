import { useLayoutConfigContext } from "@admin-panel/context/layout-config-context"
import { Button } from "@admin-panel/ui/Button"
import { Menu, MenuItemParams } from "@admin-panel/ui/Menu"
import { useListContext } from "ra-core"
import { memo, useMemo } from "react"
import { MdArrowDownward, MdArrowUpward } from "react-icons/md"
import { useCollectionContext } from "../../context/collection-context"

export const ListSortButton = memo(() => {
	const collection = useCollectionContext()
	const list = useListContext()
	const config = useLayoutConfigContext().list

	// We are first checking if schema info provided fields that are allowed to be sorted by
	// and take them, or all fields are sortable
	const sortableFields = useMemo(() => {
		const sf = config.sortableFields
		return Object.values(collection.fields)
			.filter((f) => {
				if (!f.sortable) return false
				return sf ? sf.includes(f.fieldName) : true
			})
			.map((f) => ({ field: f.fieldName, label: f.label }))
	}, [collection.fields, config.sortableFields])

	return (
		<>
			<Menu
				button={(ref, props) => (
					<Button
						{...props}
						onClick={() => ref?.current?.click()}
						className="normal-case"
						variant="transparent"
						small
						startIcon={
							list.sort.order === "ASC" ? (
								<MdArrowUpward fontSize="small" />
							) : (
								<MdArrowDownward fontSize="small" />
							)
						}
					>
						{sortableFields.find((sf) => sf.field === list.sort.field)?.label ?? list.sort.field}
					</Button>
				)}
				items={[
					{
						button: "div",
						startIcon: (
							<Button
								small
								outline
								active={list.sort.order === "ASC"}
								disabled={list.sort.order === "ASC"}
								onClick={() => list.setSort({ order: "ASC", field: list.sort.field })}
							>
								<MdArrowUpward />
							</Button>
						),
						endIcon: (
							<Button
								small
								outline
								active={list.sort.order === "DESC"}
								disabled={list.sort.order === "DESC"}
								onClick={() => list.setSort({ order: "DESC", field: list.sort.field })}
							>
								<MdArrowDownward />
							</Button>
						),
						title: "",
					},
					...sortableFields.map(
						(sortable): MenuItemParams => ({
							button: true,
							title: sortable.label ?? sortable.field,
							onClick: () => {
								list.setSort({ field: sortable.field, order: list.sort.order })
							},
						}),
					),
				]}
			/>
		</>
	)
})
