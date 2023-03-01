import { BootstrapRepoManager } from "@api/database/orm-specs/BootstrapRepoManager"
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

	async getCollectionMetadata(): Promise<CollectionMetadata[]> {
		return this.baseRepoManager.getRepo(CollectionMetadataCollection).findWhere({})
	}

	async getFieldMetadata(): Promise<FieldMetadata[]> {
		return this.baseRepoManager.getRepo(FieldMetadataCollection).findWhere({})
	}

	async getRelationMetadata(): Promise<RelationMetadata[]> {
		return this.baseRepoManager.getRepo(RelationMetadataCollection).findWhere({})
	}
}
