import { Global, Module } from "@nestjs/common"
import { INFRA_SCHEMA_SYNC_FINISHED } from "../infra.consts"
import { InfraSchemaCollectionsSyncService } from "./infra-schema-collections-sync.service"
import { InfraSchemaFieldsSyncService } from "./infra-schema-fields-sync.service"
import { InfraSchemaRelationsSyncService } from "./infra-schema-relations-sync.service"
import { InfraInitedProvider } from "./infra-schema-sync-finished.provider"
import { InfraSchemaSyncService } from "./infra-schema-sync.service"

@Global()
@Module({
	providers: [
		InfraSchemaCollectionsSyncService,
		InfraSchemaFieldsSyncService,
		InfraSchemaRelationsSyncService,
		InfraSchemaSyncService,
		InfraInitedProvider,
	],
	exports: [INFRA_SCHEMA_SYNC_FINISHED, InfraSchemaSyncService],
})
export class InfraSchemaSyncModule {}

/**
 * KNEX
 * MIGRATIONS
 * INFRA -> This!
 * INFRA STATE
 * ORM
 */
