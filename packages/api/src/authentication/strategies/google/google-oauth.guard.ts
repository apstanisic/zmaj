import { AuthenticationConfig } from "@api/authentication/authentication.config"
import { throw404 } from "@api/common/throw-http"
import { emsg } from "@api/errors"
import { Injectable } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
/**
 * This is not global guard and does not allow unauthenticated users
 * This is used for google oauth, and creating normal refresh token
 * that can then be normally used. It should be only user on specified urls
 * in google-oauth controller
 */
@Injectable()
export class GoogleOAuthGuard extends AuthGuard("google") {
	constructor(private config: AuthenticationConfig) {
		super()
	}

	/**
	 * If there is google client id, we assume it's enabled
	 */
	override canActivate(): true {
		if (this.config.oauth.google === undefined) throw404(83234, emsg.oauthNotEnabled)
		return true
	}
}
