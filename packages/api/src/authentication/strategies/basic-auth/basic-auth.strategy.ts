import { AuthenticationConfig } from "@api/authentication/authentication.config"
import { throw403 } from "@api/common/throw-http"
import { emsg } from "@api/errors"
import { Injectable } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { AuthUser } from "@zmaj-js/common"
import { addSeconds } from "date-fns"
import { Request } from "express"
import { BasicStrategy, BasicStrategyOptions } from "passport-http"
import { AuthenticationService } from "../../authentication.service"

@Injectable()
export class BasicAuthStrategy extends PassportStrategy(BasicStrategy, "basic") {
	constructor(
		private readonly authn: AuthenticationService,
		private readonly config: AuthenticationConfig,
	) {
		super({ passReqToCallback: true } as BasicStrategyOptions)
	}

	/**
	 * This method is called only when basic auth exist, so we can throw an error if user does not exist
	 */
	async validate(req: Request, email: string, password: string): Promise<AuthUser> {
		if (this.config.allowBasicAuth !== true) throw403(9610404, emsg.noAuthz)

		const response = await this.authn.emailAndPasswordSignIn(
			{ email, password },
			// this creates short living auth session that will be internally used only for this request
			{ ip: req.ip, userAgent: req.headers["user-agent"], expiresAt: addSeconds(new Date(), 5) },
		)
		if (response.status === "must-create-mfa") throw403(673223, emsg.mfaMustBeEnabled)
		if (response.status === "has-mfa") throw403(673223, emsg.mfaInvalid)

		return new AuthUser(response.user)
	}
}
