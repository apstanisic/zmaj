import { ColumnType } from "@orm/column-type"
import { ModelConfig } from "@orm/config"
import { Logger } from "@orm/logger.type"
import { Struct } from "@zmaj-js/common"
import { DataTypes, Model, ModelAttributes, ModelStatic, Sequelize } from "sequelize"
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
	 * @param collections for which we need to generate entities
	 * @param orm Orm to which to define collection
	 */
	generateModels(collections: readonly ModelConfig<any>[], orm: Sequelize): void {
		this.removeAllModels(orm)

		for (const col of collections) {
			if (col.disabled) continue
			this.generateModelWithFields(col, orm)
		}

		try {
			for (const col of collections) {
				this.attachRelationsToModels(col, orm.models)
			}
		} catch (error) {
			// if there is problem generating relations, generate normal fields
			this.logger.error("Problem generating relations!", error)

			this.removeAllModels(orm)

			for (const col of collections) {
				if (col.disabled) continue
				this.generateModelWithFields(col, orm)
			}
		}
	}

	private generateModelWithFields(col: ModelConfig<Struct>, orm: Sequelize): void {
		const properties: ModelAttributes = {}

		const fields = Object.values(col.fields)

		const createdAtField = fields.find((f) => f.isCreatedAt)?.fieldName ?? false
		const updatedAtField = fields.find((f) => f.isUpdatedAt)?.fieldName ?? false

		fields.forEach((field) => {
			const property: ModelAttributes[string] = {
				// allowNull: true, //field.isNullable,
				allowNull: ![createdAtField, updatedAtField].includes(field.fieldName),
				// orm.options.dialect === "sqlite" ? "sqlite" : "postgres",
				type: this.getType(field.dataType, field.fieldName),
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

			properties[field.fieldName] = property
		})

		orm.define(col.collectionName, properties, {
			freezeTableName: true,
			tableName: col.tableName,
			timestamps: true,
			updatedAt: updatedAtField,
			createdAt: createdAtField,
			deletedAt: false,
		})
	}

	private attachRelationsToModels(col: ModelConfig, models: Struct<ModelStatic<Model<any>>>): void {
		for (const [propertyName, rel] of Object.entries(col.relations)) {
			const leftModel = models[col.collectionName]
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
	private getType(type: ColumnType, field: string): DataTypes.AbstractDataType {
		if (type.startsWith("array")) {
			const withoutArray = type.substring(5) as any
			return new DataTypes.ARRAY(this.getType(withoutArray, field))
		} else if (type.startsWith("text_")) {
			const length = type.substring(5)
			return DataTypes.STRING(parseInt(length))
		} else if (type === "text") {
			return new DataTypes.TEXT()
		} else if (type === "boolean") {
			return new DataTypes.BOOLEAN()
		} else if (type === "date") {
			return new DataTypes.DATEONLY()
		} else if (type === "datetime") {
			return DataTypes.DATE(3)
		} else if (type === "float") {
			return new DataTypes.DOUBLE()
		} else if (type === "int") {
			return new DataTypes.INTEGER()
		} else if (type === "json") {
			return new DataTypes.JSONB()
		} else if (type === "time") {
			return new DataTypes.TIME()
		} else if (type === "uuid") {
			return new DataTypes.UUID()
		} else if ((type as any) === "short-text" || (type as any) === "long-text") {
			// For transition
			return new DataTypes.TEXT()
		} else {
			// fallback to text for now, during migrations (because array handling)
			return new DataTypes.TEXT()
			// throw new InvalidColumnTypeError(type, 3098)
		}
	}
}
