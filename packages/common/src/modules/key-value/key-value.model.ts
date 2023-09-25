import { BaseModel, GetModelFields } from "@zmaj-js/orm"

// export type KeyValue = {
// 	/**
// 	 * Row ID
// 	 */
// 	id: string
// 	/**
// 	 * When was created
// 	 */
// 	createdAt: Date
// 	/**
// 	 * Key with which to get value
// 	 */
// 	key: string
// 	/**
// 	 * When was last time updated
// 	 */
// 	updatedAt: Date
// 	/**
// 	 * Value
// 	 */
// 	value: string | null
// 	/**
// 	 * In what namespace is this value
// 	 */
// 	namespace: string | null
// }

export class KeyValueModel extends BaseModel {
	override name = "zmajKeyValue"
	override tableName = "zmaj_key_value"

	fields = this.buildFields((f) => ({
		id: f.uuid({ isPk: true }),
		createdAt: f.createdAt({}),
		key: f.text({ canUpdate: false }),
		value: f.text({ nullable: true }),
		namespace: f.text({ nullable: true, canUpdate: false }),
		updatedAt: f.updatedAt(),
	}))
}

export type KeyValue = GetModelFields<KeyValueModel>
