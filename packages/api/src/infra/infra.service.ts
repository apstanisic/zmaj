import { BootstrapRepoManager } from "@api/database/orm-specs/BootstrapRepoManager"
import { Transaction } from "@api/database/orm-specs/Transaction"
import { Injectable } from "@nestjs/common"
import {
	CollectionMetadata,
	CollectionMetadataCollection,
	FieldMetadata,
	FieldMetadataCollection,
	RelationMetadata,
	RelationMetadataCollection,
} from "@zmaj-js/common"

@Injectable()
export class InfraService {
	constructor(private baseRepoManager: BootstrapRepoManager) {}

	async getCollectionMetadata(trx?: Transaction): Promise<CollectionMetadata[]> {
		return this.baseRepoManager.getRepo(CollectionMetadataCollection).findWhere({ trx })
	}

	async getFieldMetadata(trx?: Transaction): Promise<FieldMetadata[]> {
		return this.baseRepoManager.getRepo(FieldMetadataCollection).findWhere({ trx })
	}

	async getRelationMetadata(trx?: Transaction): Promise<RelationMetadata[]> {
		return this.baseRepoManager.getRepo(RelationMetadataCollection).findWhere({ trx })
	}
}
