import { BootstrapRepoManager } from "@api/database/orm-specs/BootstrapRepoManager"
import { Transaction } from "@api/database/orm-specs/Transaction"
import { SchemaInfoService } from "@api/database/schema/schema-info.service"
import { Injectable } from "@nestjs/common"
import {
	CollectionMetadata,
	CollectionMetadataCollection,
	FieldMetadata,
	FieldMetadataCollection,
	ForeignKey,
	RelationMetadata,
	RelationMetadataCollection,
} from "@zmaj-js/common"
import { alphabetical, unique } from "radash"

@Injectable()
export class InfraService {
	constructor(
		private baseRepoManager: BootstrapRepoManager,
		private schemaInfo: SchemaInfoService,
	) {}

	async getCollectionMetadata(trx?: Transaction): Promise<CollectionMetadata[]> {
		return this.baseRepoManager.getRepo(CollectionMetadataCollection).findWhere({ trx })
	}

	async getFieldMetadata(trx?: Transaction): Promise<FieldMetadata[]> {
		return this.baseRepoManager.getRepo(FieldMetadataCollection).findWhere({ trx })
	}

	async getRelationMetadata(trx?: Transaction): Promise<RelationMetadata[]> {
		return this.baseRepoManager.getRepo(RelationMetadataCollection).findWhere({ trx })
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
