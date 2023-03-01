import { EntityRef } from "../crud-types/entity-ref.type"
import { User } from "../users/user.model"

export type SecurityToken = {
	id: string
	token: string
	validUntil: Date
	usedFor: string
	userId: string
	createdAt: Date
	data: string | null
	// Relations
	user?: EntityRef<User>
}
