import { RelationDef } from "@zmaj-js/common"
import { RaRecord } from "ra-core"

export type RefOneToOneInternalProps = {
	template: string
	label: string
	relation: RelationDef
	//   field: FieldDef
	mainRecord: RaRecord
	className?: string
}
