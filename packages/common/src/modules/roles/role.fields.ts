import { ExtractType, Fields } from "../crud-types/model-def.type"
import { ManyToOne, OneToMany } from "../crud-types/relation.types"

export const roleFields = Fields((f) => ({
	id: f.uuid({ isPk: true }),
	createdAt: f.createdAt({}),
	name: f.shortText({}),
	description: f.longText({ nullable: true }),
	requireMfa: f.boolean({}),
}))

const userFields = Fields((f) => ({
	id: f.uuid({ isPk: true }),
	confirmedEmail: f.boolean({}),
	email: f.shortText({}),
	firstName: f.shortText({ nullable: true }),
	lastName: f.shortText({ nullable: true }),
	otpToken: f.shortText({ nullable: true, canRead: false }),
	status: f.enumString({
		enum: ["active", "banned", "hacked", "disabled", "invited", "emailUnconfirmed"],
	}),
	roleId: f.uuid({ hasDefault: true }),
	createdAt: f.createdAt({}),
	password: f.shortText({ canRead: false, canUpdate: false }),
}))

type UserModel = ExtractType<typeof userFields> & {
	role: ManyToOne<RoleFull>
}
