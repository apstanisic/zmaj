import { AuthenticationConfig } from "@api/authentication/authentication.config"
import { Injectable, NotImplementedException } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
/**
 * This is not global guard, it's not part of CombinedGuard and does not allow unauthenticated users
 * This is used for Apple oauth, and creating normal refresh token
 * that can then be normally used. It should be only user on specified urls
 */
@Injectable()
export class AppleOAuthGuard extends AuthGuard("apple") {
	constructor(private config: AuthenticationConfig) {
		super()
	}
	/**
	 * If there is client id, we assume it's enabled
	 */
	override canActivate(): true {
		// We have to store apple token somewhere first
		throw new NotImplementedException(9999)
		// TODO
		// if (this.config.oauth.apple === undefined) throw404(83234)
		// return true
	}
}
