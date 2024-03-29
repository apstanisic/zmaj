import { faker } from "@faker-js/faker"
import { v4 } from "uuid"
/**
 * We have to use UUID since Playwright runs multiple process
 */
export function getUniqueId(): string {
	return v4().substring(0, 8)
}

export function getRandomTableName(): string {
	return `table_${getUniqueId()}`
}

export function getUniqueTitle(): string {
	return `${faker.lorem.words(2)} ${getUniqueId()}`
}

export function getUniqueEmail(): string {
	return faker.internet.email({ provider: "example.test" })
}

export function getUniqueColumnName(): string {
	return `col_${getUniqueId()}`
}

export function getUniqueWord(): string {
	return `${faker.lorem.word()}${getUniqueId()}`
}
