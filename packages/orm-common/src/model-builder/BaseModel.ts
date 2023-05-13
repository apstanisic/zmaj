import { Class } from "type-fest"
import { ModelRelationDefinition } from "./ModelRelationDefinition"
import { AllFields, UserParams, fields } from "./field-builder"

/**
 * Explore auto generating `readonly` for `canUpdate=false` types
 */
export abstract class BaseModel {
	abstract name: string
	tableName?: string
	abstract fields: AllFields
	// abstract config: { tableName?: string; name: string }

	protected buildFields = fields

	readonly disabled = false

	getRelations(): Record<string, ModelRelationDefinition<any, boolean>> {
		const toReturn: Record<string, ModelRelationDefinition<any>> = {}
		for (const [property, value] of Object.entries(this)) {
			if (value instanceof ModelRelationDefinition) {
				toReturn[property] = value
			}
		}
		return toReturn
	}

	getPkField(): string {
		for (const [property, _field] of Object.entries(this.fields)) {
			const field = _field as UserParams
			if (field.isPk) return property
		}
		throw new Error("No PK provided")
	}

	protected manyToOne<T extends BaseModel, TThis extends this = this>(
		modelType: () => Class<T>,
		options: { fkField: keyof TThis["fields"]; referencedField?: keyof T["fields"] },
	): ModelRelationDefinition<T, false> {
		return new ModelRelationDefinition(modelType, {
			fkField: options.fkField as string,
			type: "many-to-one",
			referencedField: options.referencedField as string | undefined,
		})
	}

	protected oneToMany<T extends BaseModel, TThis extends this = this>(
		modelFn: () => Class<T>,
		options: { fkField: keyof T["fields"]; referencedField?: keyof TThis["fields"] },
	): ModelRelationDefinition<T, true> {
		return new ModelRelationDefinition(modelFn, {
			fkField: options.fkField as string,
			type: "one-to-many",
			referencedField: options.referencedField as string | undefined,
		})
	}

	protected oneToOneOwner<T extends BaseModel, TThis extends this = this>(
		modelFn: () => Class<T>,
		options: { fkField: keyof TThis["fields"]; referencedField?: keyof T["fields"] },
	): ModelRelationDefinition<T, false> {
		return new ModelRelationDefinition(modelFn, {
			type: "owner-one-to-one",
			fkField: options.fkField as string,
			referencedField: options.referencedField as string | undefined,
		})
	}

	protected oneToOneRef<T extends BaseModel, TThis extends this = this>(
		modelFn: () => Class<T>,
		options: { fkField: keyof T["fields"]; referencedField?: keyof TThis["fields"] },
	): ModelRelationDefinition<T, true> {
		return new ModelRelationDefinition(modelFn, {
			type: "ref-one-to-one",
			fkField: options.fkField as string,
			referencedField: options.referencedField as string | undefined,
		})
	}

	protected manyToMany<T extends BaseModel, TJunction extends BaseModel>(
		modelFn: () => Class<T>,
		options: {
			junctionModel: () => Class<TJunction>
			junctionFields: [keyof TJunction["fields"], keyof TJunction["fields"]]
		},
	): ModelRelationDefinition<T, true> {
		return new ModelRelationDefinition(modelFn, {
			type: "many-to-many",
			junction: options.junctionModel,
			fields: options.junctionFields as [string, string],
		})
	}

	// _forGenerator(): ModelConfig {
	// 	return {
	// 		collectionName: this.name,
	// 		tableName: this.tableName ?? this.name,
	// 		fields: this.fields,
	// 		relations: {},
	// 		disabled: this.disabled,
	// 	}
	// }
}
