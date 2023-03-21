import { SetRequired } from "type-fest"
import { AuthSession } from "../auth-sessions/auth-session.model"
import { ExtractType, Fields } from "../crud-types/model-def.type"
import { ManyToOne, OneToMany } from "../crud-types/relation.types"
import { FileInfo } from "../files"
import { Role } from "../roles/role.model"
import { PUBLIC_ROLE_ID } from "../roles/role.consts"

export const userFields = Fields((f) => ({
	/**
	 * ID
	 */
	id: f.uuid({ isPk: true }),
	/**
	 * Email
	 */
	email: f.shortText({}, { componentName: "email" }),
	// /**
	//  * Password
	//  */
	password: f.longText({ canRead: false, canUpdate: false }, { componentName: "password" }),
	/**
	 * First name
	 */
	firstName: f.shortText({ nullable: true }),
	/**
	 * Last name
	 */
	lastName: f.shortText({ nullable: true }),
	/**
	 * Role ID
	 */
	roleId: f.uuid(
		{ hasDefault: true },
		{
			isForeignKey: true,
			dbDefaultValue: PUBLIC_ROLE_ID,
		},
	),
	/**
	 * OTP token. It's undefined when we can't access it, and null when it's not available
	 */
	otpToken: f.shortText(
		{ nullable: true, canRead: false },
		{ fieldConfig: { createHidden: true, editHidden: true } },
	),
	/**
	 * Is email confirmed
	 */
	confirmedEmail: f.boolean({ hasDefault: true }),
	/**
	 * When was user account created
	 */
	createdAt: f.createdAt({}),
	/**
	 * Status of current user's account
	 */
	status: f.enumString(
		{
			enum: ["active", "banned", "hacked", "disabled", "emailUnconfirmed", "invited"],
			hasDefault: true,
		},
		{
			componentName: "dropdown",
			dbDefaultValue: "disabled",
			fieldConfig: {
				component: {
					dropdown: {
						choices: [
							{ value: "active", label: "Active" },
							{ value: "banned", label: "Banned" },
							{ value: "hacked", label: "Hacked" },
							{ value: "disabled", label: "Disabled" },
							{ value: "invited", label: "Invited" },
							{ value: "emailUnconfirmed", label: "Email Unconfirmed" },
						],
					},
				},
			},
		},
	),
}))

export type User = ExtractType<typeof userFields> & {
	/**
	 * All user login sessions
	 */
	authSessions?: OneToMany<AuthSession>

	/**
	 * User's role
	 */
	role?: ManyToOne<Role>

	/**
	 * File's that belong to user
	 */
	files?: OneToMany<FileInfo>
}

export type UserWithSecret = SetRequired<User, "password" | "otpToken">
