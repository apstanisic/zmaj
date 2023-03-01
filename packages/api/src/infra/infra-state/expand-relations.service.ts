import { throw500 } from "@api/common/throw-http"
import { Injectable } from "@nestjs/common"
import {
	CollectionDef,
	CompositeUniqueKey,
	expandRelation,
	ForeignKey,
	CollectionMetadata,
	RelationMetadata,
	RelationDef,
} from "@zmaj-js/common"

type ExpandRelationParams = {
	allRelations: readonly RelationMetadata[]
	fks: readonly ForeignKey[]
	collections: readonly (CollectionMetadata | CollectionDef)[]
	compositeUniqueKeys: readonly CompositeUniqueKey[]
}

@Injectable()
export class ExpandRelationsService {
	expand(relation: RelationMetadata, rest: ExpandRelationParams): RelationDef {
		return expandRelation(relation, { ...rest, onError: throw500 })
	}
}
