import {
	CollectionMetadata,
	CompositeUniqueKey,
	DbColumn,
	FieldMetadata,
	ForeignKey,
	RelationMetadata,
	Struct,
} from "@zmaj-js/common"

export type InitialDbState = {
	columns: Struct<Struct<DbColumn>>
	fks: ForeignKey[]
	compositeUniqueKeys: CompositeUniqueKey[]
	collectionMetadata: CollectionMetadata[]
	fieldMetadata: FieldMetadata[]
	relationMetadata: RelationMetadata[]
}
