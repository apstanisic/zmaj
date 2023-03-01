import { AuthenticationConfig } from "@api/authentication/authentication.config"
import { throw404 } from "@api/common/throw-http"
import { emsg } from "@api/errors"
import { Injectable } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
/**
 * This is not global guard, it's not part of CombinedGuard and does not allow unauthenticated users
 * This is used for facebook oauth, and creating normal refresh token
 * that can then be normally used. It should be only user on specified urls
 */
@Injectable()
export class FacebookOAuthGuard extends AuthGuard("facebook") {
	constructor(private config: AuthenticationConfig) {
		super()
	}

	/**
	 * If there is facebook client id, we assume it's enabled
	 */
	override canActivate(): true {
		if (this.config.oauth.facebook === undefined) throw404(78923, emsg.oauthNotEnabled)
		return true
	}
}
