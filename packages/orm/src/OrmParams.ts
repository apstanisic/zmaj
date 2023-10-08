import { Class } from "type-fest"
import { NameTransformer } from "./NameTransformer"
import { DatabaseConfig } from "./database-config.type"
import { BaseModel } from "./model/base-model"
import { OrmEngineSetup } from "./orm-engine"

export type OrmParams<T> = {
	/**
	 * Underlying engine that will power ORM
	 * There is `@zmaj-js/orm-sq` which is an Sequelize based engine
	 */
	engine: OrmEngineSetup<T>
	/**
	 * Config that is used to connect to database
	 * Currently only Postgres is officially supported
	 */
	config: DatabaseConfig
	/**
	 * Models that will be used with ORM
	 */
	models: Class<BaseModel>[]
	/**
	 * Get column name if not specified. By default, it will use same value as field
	 * `@zmaj-js/orm-sq` exports `snakeCaseNaming` which will transform `helloWorld` to `hello_world`
	 */
	naming?: NameTransformer
}
