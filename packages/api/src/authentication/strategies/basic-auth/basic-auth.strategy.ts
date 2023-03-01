import { AuthenticationConfig } from "@api/authentication/authentication.config"
import { throw403 } from "@api/common/throw-http"
import { emsg } from "@api/errors"
import { Injectable } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { AuthUser } from "@zmaj-js/common"
import { BasicStrategy, BasicStrategyOptions } from "passport-http"
import { AuthenticationService } from "../../authentication.service"

@Injectable()
export class BasicAuthStrategy extends PassportStrategy(BasicStrategy, "basic") {
	constructor(
		private readonly authn: AuthenticationService,
		private readonly config: AuthenticationConfig,
	) {
		super({} as BasicStrategyOptions)
	}

	/**
	 * This method is called only when basic auth exist, so we can throw an error if user does not exist
	 */
	async validate(email: string, password: string): Promise<AuthUser> {
		if (this.config.allowBasicAuth !== true) throw403(9610404, emsg.noAuthz)

		const user = await this.authn.getSignInUser({ email, password })
		const authUser = AuthUser.fromUser(user)

		// this.authz.checkSystem("account", "basicAuthLogin", { user: authUser }) || throw403(853292)

		return authUser
	}
}
