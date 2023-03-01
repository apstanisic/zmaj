import { DefineCrudLayout } from "../../DefineCrudLayout"
import { TableLayout } from "./TableLayout"

export const ListTableLayout = DefineCrudLayout({
	Layout: TableLayout,
	name: "table",
	type: "list",
})
