import { Class } from "type-fest"
import { createFieldBuilder } from "./fields/create-field"
import { AllFieldsInModel } from "./fields/types/all-fields-in-model.type"
import { CreateFieldParams } from "./fields/types/create-field-params.type"
import { ModelRelationDefinition } from "./relations/relation-metadata"

/**
 * Explore auto generating `readonly` for `canUpdate=false` types
 */
export abstract class BaseModel {
	abstract name: string
	tableName?: string
	abstract fields: AllFieldsInModel
	// abstract config: { tableName?: string; name: string }

	protected buildFields = createFieldBuilder

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
			const field = _field as CreateFieldParams
			if (field.isPk) return property
		}
		throw new Error("No PK provided")
	}

	protected manyToOne<
		T extends BaseModel,
		TThis extends this = this,
		TColumnName extends keyof TThis["fields"] = string,
	>(
		modelType: () => Class<T>,
		options: { fkField: TColumnName; referencedField?: keyof T["fields"] },
	): ModelRelationDefinition<T, false, TColumnName> {
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

	/**
	 * Foreign key is located in current model
	 */
	protected oneToOneOwner<
		T extends BaseModel,
		TThis extends this = this,
		TColumnName extends keyof TThis["fields"] = string,
	>(
		modelFn: () => Class<T>,
		options: { fkField: TColumnName; referencedField?: keyof T["fields"] },
	): ModelRelationDefinition<T, false, TColumnName> {
		return new ModelRelationDefinition(modelFn, {
			type: "owner-one-to-one",
			fkField: options.fkField as string,
			referencedField: options.referencedField as string | undefined,
		})
	}

	/**
	 * Foreign key is located in referenced model
	 */
	protected oneToOneRef<T extends BaseModel, TThis extends this = this>(
		modelFn: () => Class<T>,
		options: { fkField: keyof T["fields"]; referencedField?: keyof TThis["fields"] },
	): ModelRelationDefinition<T, false> {
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
}
