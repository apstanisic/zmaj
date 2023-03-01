export type PublicAuthData = {
	signUpAllowed: boolean
	// adminInitialized: boolean
	resetPasswordAllowed: boolean
	requireEmailConfirmation: boolean
	magicLink: boolean
	oidc: {
		name: string
		url: string
	}[]
	oauth?: {
		apple: boolean
		google: boolean
		facebook: boolean
	}
}
