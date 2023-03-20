import { AuthUserType } from "./modules"

export type SignInResponse =
	| { status: "signed-in"; accessToken: string; refreshToken?: string; user: AuthUserType }
	| { status: "has-mfa" }
	| { status: "must-create-mfa"; data: EnableMfaParams }

export type EnableMfaParams = {
	image: string
	secret: string
	jwt: string
	backupCodes: string[]
}
