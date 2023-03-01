import { EntityRef } from "../crud-types/entity-ref.type"
import { SetRequired } from "type-fest"
import { AuthSession } from "../auth-sessions/auth-session.model"
import { FileInfo } from "../files"
import { Role } from "../roles/role.model"

export type User = {
	/**
	 * ID
	 */
	id: string
	/**
	 * Email
	 */
	email: string
	// /**
	//  * Password
	//  */
	// password: string
	/**
	 * First name
	 */
	firstName: string | null
	/**
	 * Last name
	 */
	lastName: string | null
	/**
	 * Role ID
	 */
	roleId: string
	/**
	 * OTP token. It's undefined when we can't access it, and null when it's not available
	 */
	otpToken?: string | null
	/**
	 * Is email confirmed
	 */
	confirmedEmail: boolean
	/**
	 * When was user account created
	 */
	createdAt: Date
	/**
	 * @TODO
	 */
	// photoUrl: string | null
	/**
	 * When does password expires
	 * @todo This, or account expires, or both?
	 */
	// passwordExpiresAt: Date | null

	/**
	 * Status of current user's account
	 */
	status: "active" | "banned" | "hacked" | "disabled" | "emailUnconfirmed" | "invited"

	/**
	 * All user login sessions
	 */
	authSessions?: EntityRef<AuthSession>[]

	/**
	 * User's role
	 */
	role?: EntityRef<Role>

	/**
	 * File's that belong to user
	 */
	files?: EntityRef<FileInfo>[]
	/**
	 * Password is never null, it's string if it's returned, or undefined if we can't access it
	 */
	password?: string | undefined
}

export type UserWithSecret = SetRequired<User, "password" | "otpToken">
