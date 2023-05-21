import { ColumnType } from "@orm/column-type"
import { Logger } from "@orm/logger.type"
import {
	BaseModel,
	ModelConfig,
	convertModelClassToPlain,
	createModelsStore,
} from "@zmaj-js/orm-common"
import { DataTypes, Model, ModelAttributes, ModelStatic, Sequelize } from "sequelize"
import { Class } from "type-fest"
import { v4 } from "uuid"

export class SequelizeModelsGenerator {
	constructor(private logger: Logger = console) {}
	removeAllModels(orm: Sequelize): void {
		// Models in best delete order
		const toRemove =
			orm.modelManager
				.getModelsTopoSortedByForeignKey()
				?.concat() // reverse mutates array, so we clone it here
				.reverse() ?? //
			orm.modelManager.all
		// Object.values(orm.models)

		for (const model of toRemove) {
			orm.modelManager.removeModel(model as ModelStatic<any>)
		}
	}

	/**
	 * Take all provided collection info and generate entities
	 * @param models for which we need to generate entities
	 * @param orm Orm to which to define collection
	 */
	generateModels(models: readonly (Class<BaseModel> | ModelConfig)[], orm: Sequelize): void {
		this.removeAllModels(orm)
		const state = createModelsStore()

		const modelConfigs = models.map((c) => convertModelClassToPlain(c, state))

		for (const model of modelConfigs) {
			if (model.disabled) continue
			console.log(model)

			this.generateModelWithFields(model, orm)
		}

		try {
			for (const model of modelConfigs) {
				this.attachRelationsToModels(model, orm.models)
			}
		} catch (error) {
			// if there is problem generating relations, generate normal fields
			this.logger.error("Problem generating relations!", error)

			this.removeAllModels(orm)

			for (const col of modelConfigs) {
				if (col.disabled) continue
				this.generateModelWithFields(col, orm)
			}
		}
	}

	private generateModelWithFields(col: ModelConfig, orm: Sequelize): void {
		const properties: ModelAttributes = {}

		const fields = Object.entries(col.fields)

		const createdAtField = fields.find(([_, f]) => f.isCreatedAt)?.[0] ?? false
		const updatedAtField = fields.find(([_, f]) => f.isUpdatedAt)?.[0] ?? false

		fields.forEach(([propertyName, field]) => {
			const property: ModelAttributes[string] = {
				// allowNull: true, //field.isNullable,
				allowNull: ![createdAtField, updatedAtField].includes(propertyName),
				// orm.options.dialect === "sqlite" ? "sqlite" : "postgres",
				type: this.getType(field.dataType),
				autoIncrement: field.isAutoIncrement,
				unique: field.isUnique,
				primaryKey: field.isPrimaryKey,
				field: field.columnName,
				// i'm abusing comment property to notify repository if record can be updated
				comment: `CAN_CREATE=${field.canCreate};CAN_UPDATE=${field.canUpdate}`,
			}

			const isUuidPkWithoutDefaultValue =
				field.isPrimaryKey && //
				field.isAutoIncrement !== true &&
				field.hasDefaultValue !== true

			if (isUuidPkWithoutDefaultValue) {
				property.defaultValue = v4
			}

			// we can't simply provide undefined if it's not hidden, since it check if undefined is provided
			if (!field.canRead) {
				property.get = () => undefined
			}

			properties[propertyName] = property
		})

		orm.define(col.name, properties, {
			freezeTableName: true,
			tableName: col.tableName,
			timestamps: true,
			updatedAt: updatedAtField,
			createdAt: createdAtField,
			deletedAt: false,
		})
	}

	private attachRelationsToModels(
		col: ModelConfig,
		models: Record<string, ModelStatic<Model<any>>>,
	): void {
		for (const [propertyName, rel] of Object.entries(col.relations)) {
			const leftModel = models[col.name]
			const rightModel = models[rel.referencedModel]
			// if collection is disabled, it can infer with relations
			if (!leftModel || !rightModel) continue

			if (rel.type === "many-to-one") {
				leftModel.belongsTo(rightModel, {
					foreignKey: rel.field,
					as: propertyName,
					targetKey: rel.referencedField,
				})
			} else if (rel.type === "one-to-many") {
				leftModel.hasMany(rightModel, {
					foreignKey: rel.referencedField,
					as: propertyName,
				})
			} else if (rel.type === "owner-one-to-one") {
				leftModel.belongsTo(rightModel, {
					foreignKey: rel.field,
					as: propertyName,
					targetKey: rel.referencedField,
				})
			} else if (rel.type === "ref-one-to-one") {
				leftModel.hasOne(rightModel, {
					foreignKey: rel.referencedField,
					as: propertyName,
				})
			} else if (rel.type === "many-to-many") {
				leftModel.belongsToMany(rightModel, {
					as: propertyName,
					through: models[rel.junctionModel] ?? rel.junctionModel,
					sourceKey: rel.field,
					targetKey: rel.referencedField,
					foreignKey: rel.junctionField,
					otherKey: rel.junctionReferencedField,
				})
			}
		}
	}

	/** Convert to Sequelize data type */
	private getType(type: ColumnType): DataTypes.AbstractDataType {
		switch (type) {
			case "boolean":
				return new DataTypes.BOOLEAN()
			case "text":
				return new DataTypes.TEXT()
			case "time":
				return new DataTypes.TIME()
			case "date":
				return new DataTypes.DATEONLY()
			case "datetime":
				return new DataTypes.DATE()
			case "float":
				return new DataTypes.FLOAT()
			case "int":
				return new DataTypes.INTEGER()
			case "uuid":
				return new DataTypes.UUID()
			case "json":
				return new DataTypes.JSONB()
			default:
				if (type.startsWith("array.")) {
					return new DataTypes.ARRAY(
						this.getType(type.replace("array.", "") as any), //
					)
				}
				return new DataTypes.TEXT()
		}
	}
}
