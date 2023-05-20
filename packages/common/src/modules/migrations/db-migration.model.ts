import { BaseModel, ModelType } from "@zmaj-js/orm-common"

export class DbMigrationModel extends BaseModel {
	override name = "zmajMigrations"
	override tableName = "zmaj_migrations"

	fields = this.buildFields((f) => ({
		id: f.uuid({ isPk: true }),
		name: f.text({ canUpdate: false }),
		type: f.enumString({ enum: ["system", "user"], canUpdate: false }),
	}))
}

export type DbMigration = ModelType<DbMigrationModel>
