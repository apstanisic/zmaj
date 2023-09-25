import { BootstrapRepoManager } from "@api/database/BootstrapRepoManager"
import { Injectable } from "@nestjs/common"
import {
	CollectionMetadata,
	CollectionMetadataModel,
	FieldMetadata,
	FieldMetadataModel,
	RelationMetadata,
	RelationMetadataModel,
} from "@zmaj-js/common"
import { ForeignKey, SchemaInfoService, Transaction } from "@zmaj-js/orm"
import { alphabetical, unique } from "radash"

@Injectable()
export class InfraService {
	constructor(
		private baseRepoManager: BootstrapRepoManager,
		private schemaInfo: SchemaInfoService,
	) {}

	async getCollectionMetadata(trx?: Transaction): Promise<CollectionMetadata[]> {
		// @ts-ignore https://github.com/microsoft/TypeScript/issues/53234
		return this.baseRepoManager.getRepo(CollectionMetadataModel).findWhere({ trx })
	}

	async getFieldMetadata(trx?: Transaction): Promise<FieldMetadata[]> {
		// @ts-ignore https://github.com/microsoft/TypeScript/issues/53234
		return this.baseRepoManager.getRepo(FieldMetadataModel).findWhere({ trx })
	}

	async getRelationMetadata(trx?: Transaction): Promise<RelationMetadata[]> {
		// @ts-ignore https://github.com/microsoft/TypeScript/issues/53234
		return this.baseRepoManager.getRepo(RelationMetadataModel).findWhere({ trx })
	}

	// sort fks by table, then by it's name. This prevent having multiple fks
	// with same name. I decided to simply use first fk, since it's an anti-pattern and 1/1_000_000 chance
	// https://github.com/apstanisic/zmaj/issues/67
	async getForeignKeys(trx?: Transaction): Promise<ForeignKey[]> {
		const fks = await this.schemaInfo.getForeignKeys({ trx })
		return unique(
			alphabetical(fks, (fk) => fk.fkTable),
			(fk) => fk.fkName,
		)
	}
}
