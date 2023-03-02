import { throw500 } from "@api/common/throw-http"
import { Injectable } from "@nestjs/common"
import {
	DataType,
	DataTypes,
	Model,
	ModelAttributes,
	ModelStatic,
	Sequelize,
} from "@sequelize/core"
import { ColumnDataType, CollectionDef, getColumnType, Struct } from "@zmaj-js/common"
import { v4 } from "uuid"

@Injectable()
export class SequelizeModelsGenerator {
	removeAllModels(orm: Sequelize): void {
		// Models in best delete order
		const toRemove =
			// orm.modelManager
			// 	.getModelsTopoSortedByForeignKey()
			// 	?.concat() // reverse mutates array, so we clone it here
			// 	.reverse() ?? //
			// orm.modelManager.all
			Object.values(orm.models)

		for (const model of toRemove) {
			orm.modelManager.removeModel(model)
		}
	}

	/**
	 * Take all provided collection info and generate entities
	 * @param collections for which we need to generate entities
	 * @param orm Orm to which to define collection
	 */
	generateModels(collections: readonly CollectionDef[], orm: Sequelize): void {
		this.removeAllModels(orm)

		for (const col of collections) {
			if (col.disabled) continue
			this.generateModelWithFields(col, orm)
		}

		for (const col of collections) {
			this.attachRelationsToModels(col, orm.models)
		}
	}

	private generateModelWithFields(col: CollectionDef, orm: Sequelize): void {
		const properties: ModelAttributes = {}

		const fields = Object.values(col.fields)

		const createdAtField = fields.find((f) => f.isCreatedAt)?.fieldName ?? false
		const updatedAtField = fields.find((f) => f.isUpdatedAt)?.fieldName ?? false

		fields.forEach((field) => {
			const property: ModelAttributes[string] = {
				// allowNull: true, //field.isNullable,
				allowNull: ![createdAtField, updatedAtField].includes(field.fieldName),
				// orm.options.dialect === "sqlite" ? "sqlite" : "postgres",
				type: this.getType(field.dataType, field.dbRawDataType, "postgres"),
				autoIncrement: field.isAutoIncrement,
				unique: field.isUnique,
				primaryKey: field.isPrimaryKey,
				field: field.columnName,
				// i'm abusing comment property to notify repository if record can be updated
				comment: `CAN_CREATE=${field.canCreate};CAN_UPDATE=${field.canUpdate}`,
			}

			const isUuidPkWithoutDefaultValue =
				field.isPrimaryKey &&
				// mysql and sqlite don't have uuid
				// field.dataType === "uuid" && //
				// field.dataType !== "int" && //
				col.pkType !== "auto-increment" &&
				field.dbDefaultValue === null

			if (isUuidPkWithoutDefaultValue) {
				property.defaultValue = v4
			}

			// we can't simply provide undefined if it's not hidden, since it check if undefined is provided
			if (!field.canRead) {
				property.get = () => undefined
			}

			properties[field.fieldName] = property
		})

		orm.define(col.tableName, properties, {
			freezeTableName: true,
			tableName: col.tableName,
			timestamps: true,
			updatedAt: updatedAtField,
			createdAt: createdAtField,
			deletedAt: false,
		})
	}

	private attachRelationsToModels(
		col: CollectionDef,
		models: Struct<ModelStatic<Model<any>>>,
	): void {
		for (const rel of Object.values(col.relations)) {
			const leftModel = models[rel.tableName]
			const rightModel = models[rel.otherSide.tableName]
			// if collection is disabled, it can infer with relations
			if (!leftModel || !rightModel) continue
			// if (rel.type === "many-to-one" && col.isJunctionTable) {
			// 	leftModel.belongsTo(rightModel, {
			// 		foreignKey: { name: rel.leftField, allowNull: true }, // allowNull: col.isJunctionTable ? false : undefined },
			// 		as: rel.propertyName,
			// 		targetKey: rel.rightField,
			// 		// no inverse, since inverse is m2m
			// 	})
			// } else if (rel.type === "one-to-many") {
			// 	leftModel.hasMany(rightModel, {
			// 		foreignKey: { name: rel.rightField, allowNull: true },
			// 		as: rel.propertyName,
			// 		sourceKey: rel.leftField,
			// 		...(col.isJunctionTable
			// 			? {}
			// 			: {
			// 					inverse: { as: rel.rightPropertyName },
			// 			  }),
			// 	})
			// } else if (rel.type === "ref-one-to-one") {
			// 	leftModel.hasOne(rightModel, {
			// 		foreignKey: rel.rightField,
			// 		as: rel.propertyName,
			// 		sourceKey: rel.leftField,
			// 		inverse: { as: rel.rightPropertyName },
			// 	})
			// } else if (rel.type === "many-to-many") {
			// 	//
			// 	const first = alphabetical([rel.leftTable, rel.rightTable], (v) => v)[0] === rel.leftTable

			// 	// const isFirst = [rel.leftTable, rel.rightTable].sort()[0] === rel.leftTable
			// 	if (first) {
			// 		leftModel.belongsToMany(rightModel, {
			// 			as: rel.propertyName,
			// 			through: models[rel.junctionTable] ?? rel.junctionTable,
			// 			foreignKey: { name: rel.junctionLeftField, allowNull: true },
			// 			otherKey: { name: rel.junctionRightField, allowNull: true },
			// 			sourceKey: rel.leftField,
			// 			targetKey: rel.rightField,

			// 			inverse: { as: rel.rightPropertyName },
			// 		})
			// 	}
			// } else if (rel.type === "many-to-one" || rel.type === "owner-one-to-one") {
			// 	// do nothing
			// }
			if (rel.type === "many-to-one") {
				leftModel.belongsTo(rightModel, {
					foreignKey: rel.fieldName,
					as: rel.propertyName,
					targetKey: rel.otherSide.fieldName,
				})
			} else if (rel.type === "one-to-many") {
				leftModel.hasMany(rightModel, {
					foreignKey: rel.otherSide.fieldName,
					as: rel.propertyName,
				})
			} else if (rel.type === "owner-one-to-one") {
				leftModel.belongsTo(rightModel, {
					foreignKey: rel.fieldName,
					as: rel.propertyName,
					targetKey: rel.otherSide.fieldName,
				})
			} else if (rel.type === "ref-one-to-one") {
				leftModel.hasOne(rightModel, {
					foreignKey: rel.otherSide.fieldName,
					as: rel.propertyName,
				})
			} else if (rel.type === "many-to-many") {
				leftModel.belongsToMany(rightModel, {
					as: rel.propertyName,
					// junction model will be undefined if table is disabled
					through: models[rel.junction.tableName] ?? rel.junction.tableName,
					//   through: { model: this.models[rel.junctionTable]! }, // rel.junctionTable,
					foreignKey: rel.junction.thisSide.fieldName,
					otherKey: rel.junction.otherSide.fieldName,
				})
			}
		}
	}

	/** Convert to Sequelize data type */
	private getType(type: ColumnDataType, rawType: string, dbType: "postgres"): DataType {
		if (type === "array")
			if (rawType.endsWith("[]")) {
				const stripArray = rawType.slice(0, -2)
				const innerType = getColumnType(stripArray)
				const subType = this.getType(innerType, stripArray, dbType)
				return DataTypes.ARRAY(subType as any)
			}
		if (type === "boolean") {
			return DataTypes.BOOLEAN
		} else if (type === "date") {
			return DataTypes.DATEONLY
		} else if (type === "datetime") {
			return DataTypes.DATE({ length: 3 })
		} else if (type === "float") {
			return DataTypes.DOUBLE
		} else if (type === "int") {
			return DataTypes.INTEGER
		} else if (type === "json") {
			if (dbType !== "postgres") return DataTypes.JSON
			return DataTypes.JSONB
		} else if (type === "long-text") {
			return DataTypes.TEXT
		} else if (type === "short-text") {
			return DataTypes.STRING
		} else if (type === "time") {
			return DataTypes.TIME
		} else if (type === "uuid") {
			return DataTypes.UUID
		} else {
			throw500(35412932)
		}
	}
}
