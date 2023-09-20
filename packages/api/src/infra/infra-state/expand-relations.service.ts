import { throw500 } from "@api/common/throw-http"
import { Injectable, Logger } from "@nestjs/common"
import {
	CollectionDef,
	CollectionMetadata,
	FieldMetadata,
	RelationDef,
	RelationMetadata,
	expandRelation,
} from "@zmaj-js/common"
import { CompositeUniqueKey, ForeignKey } from "@zmaj-js/orm"

type ExpandRelationParams = {
	allRelations: readonly RelationMetadata[]
	fks: readonly ForeignKey[]
	collections: readonly (CollectionMetadata | CollectionDef)[]
	compositeUniqueKeys: readonly CompositeUniqueKey[]
	fields: FieldMetadata[]
}

@Injectable()
export class ExpandRelationsService {
	logger = new Logger(ExpandRelationsService.name)
	expand(relation: RelationMetadata, rest: ExpandRelationParams): RelationDef {
		return expandRelation(relation, { ...rest, onError: throw500, logger: this.logger })
	}
}
