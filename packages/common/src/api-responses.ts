export type SignInResponse =
	| { status: "has-mfa" }
	| { status: "success"; accessToken: string; refreshToken?: string }
	| { status: "must-create-mfa"; data: EnableMfaParams }

export type EnableMfaParams = {
	image: string
	secret: string
	jwt: string
	backupCodes: string[]
}
