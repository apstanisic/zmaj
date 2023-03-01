// import { ActivityLogCollection } from "../activity-log"
import { ActivityLog } from "../activity-log"
import { FileInfo } from "../files"
import { User } from "../users"
import { Webhook } from "../webhooks"

/**
 * This key should never be used with authz, joins...
 * Only manually for internal api
 */
export const forbiddenKey = "zmaj.forbidden"
export const forbiddenAction = "zmaj.forbiddenAction"

export const systemPermissions = {
	account: {
		label: "Account",
		resource: "zmaj.account",
		fields: false,
		actions: {
			readProfile: { key: "readProfile", label: "View Profile" },
			updateProfile: { key: "updateProfile", label: "Change Profile" },
			updateEmail: { key: "updateEmail", label: "Change Email" },
			updatePassword: { key: "updatePassword", label: "Change Password" },
			resetPassword: { key: "resetPassword", label: "Reset Password" },
			readSessions: { key: "readSessions", label: "View signed in devices" },
			deleteSessions: { key: "deleteSessions", label: "Sign out other devices" },
		},
	},
	adminPanel: {
		resource: "zmaj.adminPanel",
		label: "Admin Panel",
		fields: false,
		actions: {
			access: { key: "access" },
			// only admin
			// accessSettings: { key: "accessSettings" },
			// readInfra: { key: "readInfra" },
		},
	},
	authorization: {
		resource: "zmaj.authorization",
		label: "Roles & Permissions",
		fields: false,
		actions: {
			read: { key: "read" },
			modify: { key: "modify" },
			// readOwned: { key: "readOwned", label: "See permissions for their role" },
		},
	},
	users: {
		resource: "zmaj.users",
		label: "Users",
		// fields: UserCollection.fullFields.map((f) => f.fieldName) as string[],
		fields: [
			"createdAt",
			"email",
			"firstName",
			"lastName",
			"id",
			"roleId",
			"status",
			"confirmedEmail",
		] as (keyof User)[],
		actions: {
			read: { key: "read" },
			create: { key: "create" },
			update: { key: "update" },
			delete: { key: "delete", fields: false },
		},
	},
	infra: {
		resource: "zmaj.infra",
		label: "Collections Design",
		fields: false,
		actions: {
			read: { key: "read" },
			modify: { key: "modify" },
		},
	},
	files: {
		resource: "zmaj.files",
		label: "Files",
		fields: [
			"createdAt",
			"description",
			"extension",
			"fileSize",
			"folderPath",
			"id",
			"mimeType",
			"name",
			"storageProvider",
			"uri",
			"userId",
		] as (keyof FileInfo)[],
		actions: {
			// upload: { key: "upload", fields: false },
			create: { key: "create", fields: false, label: "Upload File" },
			// download: { key: "download", fields: false }, // merge with read
			read: { key: "read", label: "Download & Read Info" },
			delete: { key: "delete", fields: false },
			update: {
				key: "update",
				label: "Change File Info",
				fields: ["description", "folderPath", "name"] as (keyof FileInfo)[],
			},
			// regenerateImages: { key: "regenerateImages", fields: false },
			// maybe deprecate
			readFolders: { key: "readFolders", fields: false },
			readStorageProviders: {
				key: "readStorageProviders",
				fields: false,
				label: "Read Providers",
			},
		},
	},
	webhooks: {
		resource: "zmaj.webhooks",
		label: "Webhooks",
		// fields: WebhookCollection.fullFields.map((f) => f.fieldName) as string[],
		fields: [
			"id",
			"createdAt",
			"description",
			"enabled",
			"events",
			"httpHeaders",
			"httpMethod",
			"name",
			"sendData",
			"url",
		] satisfies (keyof Webhook)[],
		actions: {
			read: { key: "read" },
			create: { key: "create" },
			update: { key: "update" },
			delete: { key: "delete", fields: false },
		},
	},

	activityLog: {
		resource: "zmaj.activityLog",
		label: "Activity Log",
		// fields: ActivityLogCollection.fullFields.map((f) => f.fieldName) as string[],
		fields: [
			"action",
			"resource",
			"changes",
			"comment",
			"additionalInfo",
			"embeddedUserInfo",
			"id",
			"ip",
			"userAgent",
			"userId",
			"itemId",
			"previousData",
		] as (keyof ActivityLog)[],
		actions: {
			read: { key: "read" },
			delete: { key: "delete", fields: false },
		},
	},
} as const
// not working with tsup
//satisfies SystemPermissions

export type SystemPermissions = {
	[resource: string]: SystemResourcePermissions
}

export type SystemResourcePermissions = {
	resource: string
	label: string
	fields: string[] | false
	actions: {
		[key: string]: {
			key: string
			// hasFields?: boolean
			fields?: string[] | false
			label?: string
		}
	}
}
