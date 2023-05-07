import { BaseModel, ModelType } from "@zmaj-js/orm-common"
import { UserModel } from "../users/user.model"

// export type SecurityToken = {
// 	id: string
// 	token: string
// 	validUntil: Date
// 	usedFor: string
// 	userId: string
// 	createdAt: Date
// 	data: string | null
// 	// Relations
// 	user?: EntityRef<User>
// }

class SecurityTokenModel extends BaseModel {
	override name = "zmajSecurityToken"
	override tableName = "zmaj_security_token"
	fields = this.buildFields((f) => ({
		id: f.uuid({ isPk: true }),
		token: f.text({}),
		validUntil: f.dateTime({}),
		usedFor: f.text({}),
		userId: f.uuid({}),
		createdAt: f.createdAt(),
		data: f.text({ nullable: true }),
	}))

	user = this.manyToOne(() => UserModel, { fkField: "userId" })
}

export type SecurityToken = ModelType<SecurityTokenModel>
