import {
	ActivityLogCollection,
	AuthSessionCollection,
	CollectionMetadataCollection,
	DbMigrationCollection,
	FieldMetadataCollection,
	FileCollection,
	KeyValueCollection,
	PermissionCollection,
	RelationMetadataCollection,
	RoleCollection,
	SecurityTokenCollection,
	TranslationCollection,
	UserCollection,
	WebhookCollection,
} from "./modules"

export const systemCollections = [
	UserCollection,
	RoleCollection,
	PermissionCollection,
	WebhookCollection,
	AuthSessionCollection,
	TranslationCollection,
	SecurityTokenCollection,
	KeyValueCollection,
	CollectionMetadataCollection,
	FieldMetadataCollection,
	FileCollection,
	ActivityLogCollection,
	RelationMetadataCollection,
	DbMigrationCollection,
] as const
