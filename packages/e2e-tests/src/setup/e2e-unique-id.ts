import { v4 } from "uuid"
/**
 * We have to use UUID since Playwright runs multiple process
 */
export function getUniqueId(): string {
	return v4().substring(0, 6)
}

export function getRandomTableName(): string {
	return `table_${getUniqueId()}`
}
