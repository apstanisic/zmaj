import { BaseModel, GetModelFields } from "@zmaj-js/orm"

export class KeyValueModel extends BaseModel {
	override name = "zmajKeyValue"
	override tableName = "zmaj_key_value"

	fields = this.buildFields((f) => ({
		id: f.uuidPk({}),
		namespace: f.text({ nullable: true, canUpdate: false }),
		key: f.text({ canUpdate: false }),
		value: f.text({ nullable: true }),
		expiresAt: f.dateTime({ nullable: true }),
		updatedAt: f.updatedAt({}),
		createdAt: f.createdAt({}),
	}))
}

export type KeyValue = GetModelFields<KeyValueModel>
