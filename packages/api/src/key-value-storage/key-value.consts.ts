/**
 * All available settings keys
 */
export const SettingsKey = {
	NAMESPACE: "settings",
	DEFAULT_ROLE_ID: "DEFAULT_ROLE_ID",
	ALLOW_SIGN_UP: "ALLOW_SIGN_UP",
	ADMIN_USER_INITED: "ADMIN_USER_INITED",
	/**
	 * @deprecated for now. Use provided config in code
	 */
	IMAGES_SIZES: "IMAGES_SIZES",
} as const

export const KeyValueNamespace = {
	INTERNAL: "ZMAJ_INTERNAL",
} as const
