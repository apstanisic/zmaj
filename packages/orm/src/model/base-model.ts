import { Class } from "type-fest"
import { createField, createFieldBuilder } from "./fields/create-field"
import { AllFieldsInModel } from "./fields/types/all-fields-in-model.type"
import { RelationBuilderResult } from "./relations/relation-builder-result"
import {
	ManyToMany,
	ManyToOne,
	OneToMany,
	OwnerOneToOne,
	RefOneToOne,
	RelationType,
} from "./relations/relation-type.types"

/**
 * Explore auto generating `readonly` for `canUpdate=false` types
 */
export abstract class BaseModel {
	abstract name: string
	tableName?: string
	abstract fields: AllFieldsInModel

	getTableName(): string {
		return this.tableName ?? this.name
	}

	protected buildFields = createFieldBuilder
	protected field = createField

	readonly disabled = false

	getRelations(): Record<string, RelationBuilderResult<any, RelationType, undefined>> {
		const toReturn: Record<string, RelationBuilderResult<any, RelationType, undefined>> = {}
		for (const [property, value] of Object.entries(this)) {
			if (value instanceof RelationBuilderResult) {
				toReturn[property] = value
			}
		}
		return toReturn
	}

	getPkField(): string {
		for (const [property, field] of Object.entries(this.fields)) {
			if (field.isPk) return property
		}
		throw new Error("No PK provided")
	}

	protected manyToOne<
		T extends BaseModel,
		TThis extends this = this,
		TColumnName extends keyof TThis["fields"] = keyof TThis["fields"],
	>(
		modelType: () => Class<T>,
		options: { fkField: TColumnName; referencedField?: keyof T["fields"] },
	): RelationBuilderResult<T, ManyToOne, TColumnName> {
		return new RelationBuilderResult(modelType, {
			fkField: options.fkField,
			type: "many-to-one",
			referencedField: options.referencedField as string | undefined,
		})
	}

	protected oneToMany<T extends BaseModel, TThis extends this = this>(
		modelFn: () => Class<T>,
		options: { fkField: keyof T["fields"]; referencedField?: keyof TThis["fields"] },
	): RelationBuilderResult<T, OneToMany, string> {
		return new RelationBuilderResult(modelFn, {
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
		TColumnName extends keyof TThis["fields"] = keyof TThis["fields"],
	>(
		modelFn: () => Class<T>,
		options: { fkField: TColumnName; referencedField?: keyof T["fields"] },
	): RelationBuilderResult<T, OwnerOneToOne, TColumnName> {
		return new RelationBuilderResult(modelFn, {
			type: "owner-one-to-one",
			fkField: options.fkField,
			referencedField: options.referencedField as string | undefined,
		})
	}

	/**
	 * Foreign key is located in referenced model
	 */
	protected oneToOneRef<T extends BaseModel, TThis extends this = this>(
		modelFn: () => Class<T>,
		options: { fkField: keyof T["fields"]; referencedField?: keyof TThis["fields"] },
	): RelationBuilderResult<T, RefOneToOne, string> {
		return new RelationBuilderResult(modelFn, {
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
	): RelationBuilderResult<T, ManyToMany, undefined> {
		return new RelationBuilderResult(modelFn, {
			type: "many-to-many",
			junction: options.junctionModel,
			fields: options.junctionFields as [string, string],
		})
	}
}
