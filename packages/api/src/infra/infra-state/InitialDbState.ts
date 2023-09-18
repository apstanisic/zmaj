import { CollectionMetadata, FieldMetadata, RelationMetadata, Struct } from "@zmaj-js/common"
import { CompositeUniqueKey, DbColumn, ForeignKey } from "@zmaj-js/orm"

export type InitialDbState = {
	columns: Struct<Struct<DbColumn>>
	fks: ForeignKey[]
	compositeUniqueKeys: CompositeUniqueKey[]
	collectionMetadata: CollectionMetadata[]
	fieldMetadata: FieldMetadata[]
	relationMetadata: RelationMetadata[]
}
