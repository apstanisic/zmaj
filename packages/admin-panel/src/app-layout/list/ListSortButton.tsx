import { useLayoutConfigContext } from "@admin-panel/context/layout-config-context"
import { Menu, MenuItemParams } from "@admin-panel/ui/Menu"
import { Button } from "@admin-panel/ui/buttons/Button"
import { useListContext } from "ra-core"
import { memo, useMemo } from "react"
import { MdArrowDownward, MdArrowUpward } from "react-icons/md"
import { useResourceCollection } from "../../hooks/use-resource-collection"

export const ListSortButton = memo(() => {
	const collection = useResourceCollection()
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
						onPress={() => ref?.current?.click()}
						className="normal-case"
						color="transparent"
						size="small"
						startIcon={
							list.sort.order === "ASC" ? (
								<MdArrowUpward fontSize="small" />
							) : (
								<MdArrowDownward fontSize="small" />
							)
						}
					>
						{sortableFields.find((sf) => sf.field === list.sort.field)?.label ??
							list.sort.field}
					</Button>
				)}
				items={[
					{
						button: "div",
						startIcon: (
							<Button
								size="small"
								variant="outlined"
								isDisabled={list.sort.order === "ASC"}
								onPress={() =>
									list.setSort({ order: "ASC", field: list.sort.field })
								}
							>
								<MdArrowUpward />
							</Button>
						),
						endIcon: (
							<Button
								size="small"
								variant="outlined"
								isDisabled={list.sort.order === "DESC"}
								onPress={() =>
									list.setSort({ order: "DESC", field: list.sort.field })
								}
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
