import { BaseModel } from "@zmaj-js/orm"

class BRel extends BaseModel {
	name = ""
	fields = this.buildFields((f) => ({
		id: f.text({ isPk: true }),
		fk: f.text({}),
	}))

	relations = {
		cRel: { rel: this.manyToOne(() => CRel, { fkField: "fk" }) },
	}
}

class CRel extends BaseModel {
	name = ""
	fields = this.buildFields((f) => ({
		id: f.text({ isPk: true }),
	}))

	relations = {
		bRel: { rel: this.oneToMany(() => BRel, { fkField: "fk" }) },
	}
}
