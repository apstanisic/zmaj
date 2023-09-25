import { BaseModel, GetModelFields } from "@zmaj-js/orm"
import { UserModel } from "../users/user.model"

export class SecurityTokenModel extends BaseModel {
	override name = "zmajSecurityTokens"
	override tableName = "zmaj_security_tokens"
	fields = this.buildFields((f) => ({
		id: f.uuid({ isPk: true }),
		createdAt: f.createdAt(),
		token: f.text({ canUpdate: false }),
		validUntil: f.dateTime({ columnName: "valid_until", canUpdate: false }),
		usedFor: f.text({ columnName: "user_for", canUpdate: false }),
		userId: f.uuid({ columnName: "user_id", canUpdate: false }),
		data: f.text({ nullable: true, canUpdate: false }),
	}))

	user = this.manyToOne(() => UserModel, { fkField: "userId" })
}

export type SecurityToken = GetModelFields<SecurityTokenModel>
