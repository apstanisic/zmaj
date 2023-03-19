import { mapValues } from "radash"
import { joinUrl } from "./utils/mod"

type SingleGroup = { $base: string; [key: string]: string }

type EndpointType = {
	[key: string]: SingleGroup | EndpointType
}

export const endpoints = {
	userCollections: {
		$base: `/collections/:collection`,
		findById: ":id",
		findMany: "",
		create: "",
		updateById: ":id",
		deleteById: ":id",
	},

	authz: {
		$base: "/system/authorization",
		getPermissions: "permissions",
		isAllowed: "can/:action/:resource",
	},

	auth: {
		oauth: {
			apple: {
				$base: "/auth/oauth/apple",
				signIn: "sign-in",
				callback: "callback",
			},
			facebook: {
				$base: "/auth/oauth/facebook",
				signIn: "sign-in",
				callback: "callback",
			},
			google: {
				$base: "/auth/oauth/google",
				signIn: "sign-in",
				callback: "callback",
			},
		},
		oidc: {
			$base: "/auth",
			redirectToProviderLogin: "oidc/:provider/login",
			callback: "oidc/:provider/callback",
			getProviders: "oidc-providers",
		},
		signIn: {
			$base: "/auth",
			signIn: "sign-in",
			signOut: "sign-out",
			newAccessToken: "access-token",
		},
		signIn2: {
			$base: "/auth/sign-in",
			signIn: "",
			checkIfHasMfa: "mfa-status",
			requestToEnableOtp: "setup-otp",
			enableOtp: "enable-otp",
		},
		invitation: {
			$base: "/auth/invite",
			redirectToForm: "callback",
			confirm: "confirm",
		},
		magicLink: {
			$base: "/auth/magic-link",
			sendLink: "",
			callback: "callback",
		},
		signUp: {
			$base: "/auth/sign-up",
			signUp: "",
			confirmEmail: "confirm-email",
			isAllowed: "allowed",
			// setAllowed: "allowed",
		},
		authSessions: {
			$base: "/auth/sessions",
			userSessions: "",
			userCurrentSession: "current",
			userSessionById: ":id",
			userSessionDeleteById: ":id",
		},
		initAdmin: {
			$base: "/auth/initialize-admin",
			init: "",
		},
		passwordReset: {
			$base: "/auth/password-reset",
			request: "request",
			redirectToForm: "reset",
			reset: "reset",
		},

		mfa: {
			$base: "/auth/mfa",
			hasMfa: "enabled",
			requestToEnableOtp: "setup-otp",
			enableOtp: "enable-otp",
			disableOtp: "disable-otp",
		},

		account: {
			emailChange: {
				$base: "/auth/account/email-change",
				request: "",
				confirm: "confirm",
			},
			profile: {
				$base: "/auth/account",
				get: "profile",
				update: "profile",
				updatePassword: "password",
			},
		},
	},

	activityLog: {
		$base: `/system/activity-log`,
		findById: ":id",
		findMany: "",
		deleteById: ":id",
	},
	files: {
		$base: `/files`,
		findById: ":id",
		findMany: "",
		updateById: ":id",
		deleteById: ":id",
		//
		download: ":id/content",
		upload: "",
		//
		providers: "providers",
	},
	users: {
		$base: `/users`,
		findById: ":id",
		findMany: "",
		create: "",
		updateById: ":id",
		deleteById: ":id",
	},
	roles: {
		$base: `/system/roles`,
		findById: ":id",
		findMany: "",
		create: "",
		updateById: ":id",
		deleteById: ":id",
	},
	permissions: {
		$base: `/system/permissions`,
		findById: ":id",
		findMany: "",
		create: "",
		updateById: ":id",
		deleteById: ":id",
	},
	webhooks: {
		$base: `/system/webhooks`,
		findById: ":id",
		findMany: "",
		create: "",
		updateById: ":id",
		deleteById: ":id",
	},
	dynamicSettings: {
		$base: "/system/settings",
		getSettings: "",
		setSettings: "",
	},
	infraRead: {
		$base: "/system/infra",
		getCollections: "collections",
		getCollectionById: "collections/:id",
		getRelationById: "relations/:id",
		getFieldById: "fields/:id",
	},

	infraCollections: {
		$base: `/system/infra/collections`,
		create: "",
		updateById: ":id",
		deleteById: ":id",
	},
	infraFields: {
		$base: `/system/infra/fields`,
		create: "",
		updateById: ":id",
		deleteById: ":id",
	},
	infraRelations: {
		$base: `/system/infra/relations`,
		create: "",
		updateById: ":id",
		deleteById: ":id",
		joinManyToMany: "join-mtm/:junctionCollection",
		splitManyToMany: "split-mtm/:junctionCollection",
	},
} as const satisfies EndpointType

export function getEndpoints<T extends SingleGroup>(
	fn: (ep: typeof endpoints) => T,
): Record<Exclude<keyof T, "$base">, string> {
	const { $base, ...val } = fn(endpoints)

	return mapValues(val as any, (v: string) => joinUrl($base, v))
}
