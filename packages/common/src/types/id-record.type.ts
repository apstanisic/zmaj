import { IdType } from "@zmaj-js/orm-common"

/**
 * Record that has id field defined and is an ID type, and all other fields nullable
 *
 * IDK if I should use this. Yes, data provider will always provide id, but still,
 * it smells...
 */
export type IdRecord<T extends { id?: IdType } = { id?: IdType }> = Partial<Omit<T, "id">> & {
	id: NonNullable<T["id"]>
}
