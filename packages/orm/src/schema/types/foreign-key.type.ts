const fkOn = ["SET NULL", "CASCADE", "SET DEFAULT", "RESTRICT", "NO ACTION"] as const
type FkOn = (typeof fkOn)[number]

export type ForeignKey = {
	fkName: string
	//
	fkTable: string
	fkColumn: string
	//
	referencedColumn: string
	referencedTable: string
	//
	onDelete: FkOn | null
	onUpdate: FkOn | null
	/** Is fk column unique (used to differentiate between o2o and m2o) */
	fkColumnUnique: boolean
	/** @deprecated I do not know if i need this */
	fkColumnDataType: string
}
