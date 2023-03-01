import { Injectable } from "@nestjs/common"
import { InfraSchemaCollectionsSyncService } from "./infra-schema-collections-sync.service"
import { InfraSchemaFieldsSyncService } from "./infra-schema-fields-sync.service"
import { InfraSchemaRelationsSyncService } from "./infra-schema-relations-sync.service"

@Injectable()
export class InfraSchemaSyncService {
	constructor(
		private readonly collectionSync: InfraSchemaCollectionsSyncService,
		private readonly fieldSync: InfraSchemaFieldsSyncService,
		private readonly relationsSync: InfraSchemaRelationsSyncService,
	) {}

	async sync(): Promise<void> {
		await this.collectionSync.sync()
		await this.fieldSync.sync()
		await this.relationsSync.sync()
	}
}
