import { BaseModel, GetModelFields } from "@zmaj-js/orm"

export class DbMigrationModel extends BaseModel {
	override name = "zmajMigrations"
	override tableName = "zmaj_migrations"

	fields = this.buildFields((f) => ({
		id: f.uuid({ isPk: true }),
		name: f.text({ canUpdate: false }),
		type: f.enumString({ enum: ["system", "user"], canUpdate: false }),
	}))
}

export type DbMigration = GetModelFields<DbMigrationModel>
