import { BaseModel, ModelType } from "@zmaj-js/orm-common"
import { UserModel } from "../users/user.model"

export class SecurityTokenModel extends BaseModel {
	override name = "zmajSecurityToken"
	override tableName = "zmaj_security_token"
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

export type SecurityToken = ModelType<SecurityTokenModel>
