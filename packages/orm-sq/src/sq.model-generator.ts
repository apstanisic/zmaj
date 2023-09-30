import { ColumnDataType, OrmLogger, PojoModel } from "@zmaj-js/orm"
import { DataTypes, Model, ModelAttributes, ModelStatic, Sequelize } from "sequelize"
import { v4 } from "uuid"

export class SequelizeModelsGenerator {
	constructor(private logger: OrmLogger = console) {}
	removeAllModels(orm: Sequelize): void {
		// Models in best delete order
		const sortedToRemove =
			orm.modelManager
				.getModelsTopoSortedByForeignKey()
				?.concat() // reverse mutates array, so we clone it here
				.reverse() ?? orm.modelManager.all //

		for (const model of sortedToRemove) {
			orm.modelManager.removeModel(model as ModelStatic<any>)
		}
	}

	/**
	 * Take all provided collection info and generate entities
	 * @param models for which we need to generate entities
	 * @param orm Orm to which to define collection
	 */
	generateModels(models: PojoModel[], orm: Sequelize): void {
		this.removeAllModels(orm)

		const modelConfigs = models

		for (const model of modelConfigs) {
			if (model.disabled) continue
			this.generateModelAndFields(model, orm)
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
				this.generateModelAndFields(col, orm)
			}
		}
	}

	private generateModelAndFields(col: PojoModel, orm: Sequelize): void {
		const fields = Object.entries(col.fields)

		const properties: ModelAttributes = {}

		for (const [propertyName, field] of fields) {
			const property: ModelAttributes[string] = {
				// allowNull: true, //field.isNullable,
				// allowNull: ![createdAtField, updatedAtField].includes(propertyName),
				field: field.columnName,
				type: this.getType(field.dataType),
				unique: field.isUnique,
				autoIncrement: field.isAutoIncrement,
				primaryKey: field.isPrimaryKey,
				autoIncrementIdentity: field.isPrimaryKey && field.isAutoIncrement,
			}

			const uuidPk =
				field.isPrimaryKey && //
				field.dataType === "uuid" &&
				!field.hasDefaultValue // if there is default value in DB, do nothing

			if (uuidPk) {
				property.defaultValue = v4
			}

			properties[propertyName] = property
		}

		orm.define(col.name, properties, {
			freezeTableName: true,
			tableName: col.tableName,
			timestamps: false,
		})
	}

	private attachRelationsToModels(
		col: PojoModel,
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
	private getType(type: ColumnDataType): DataTypes.AbstractDataType {
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
