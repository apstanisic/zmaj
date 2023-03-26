import { CollectionDef, snakeCase } from "@zmaj-js/common"
import { v4 } from "uuid"

export function getFreeFkColumn(collection: CollectionDef, rightCollection: string): string {
	const allColumns = Object.values(collection.fields).map((f) => f.columnName) ?? []

	// We will check up to a 1000 times to find free column name
	for (let i = 1; i < 1000; i++) {
		const columnName = `${snakeCase(rightCollection)}_${i}`
		const exist = allColumns.includes(columnName)
		if (!exist) {
			return columnName
		}
	}

	// if in 1000 times there is no free column, simply append uuid
	const lastPartOfUuid = v4().substring(24)
	return `${snakeCase(rightCollection)}_${lastPartOfUuid}`
}
