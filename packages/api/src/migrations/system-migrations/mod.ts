import { CreateMigrationsTable } from "./000_migrations"
import { CreateRolesTable } from "./001_roles"
import { CreatePermissionsTable } from "./002_permissions"
import { CreateUsersTable } from "./003_users"
import { CreateAuthSessionsTable } from "./004_auth_sessions"
import { CreateFilesTable } from "./005_files"
import { CreateWebhooksTable } from "./006_webhooks"
import { CreateKeyValueTable } from "./007_key_value"
import { CreateSecurityTokensTable } from "./008_security_tokens"
import { CreateCollectionMetadataTable } from "./009_collection_metadata"
import { CreateFieldMetadataTable } from "./010_field_metadata"
import { CreateRelationMetadataTable } from "./011_relation_metadata"
import { CreateActivityLogTable } from "./012_activity-log"
import { CreateTranslationsTable } from "./013_translations"

export const systemMigrations = [
	CreateMigrationsTable,
	CreateRolesTable,
	CreatePermissionsTable,
	CreateUsersTable,
	CreateAuthSessionsTable,
	CreateFilesTable,
	CreateWebhooksTable,
	CreateKeyValueTable,
	CreateSecurityTokensTable,
	CreateCollectionMetadataTable,
	CreateFieldMetadataTable,
	CreateRelationMetadataTable,
	CreateActivityLogTable,
	CreateTranslationsTable,
] as const
