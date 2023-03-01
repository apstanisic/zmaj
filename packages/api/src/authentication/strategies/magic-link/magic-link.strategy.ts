import { GlobalConfig } from "@api/app/global-app.config"
import { Injectable } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { getEndpoints } from "@zmaj-js/common"
import MagicLoginStrategy from "passport-magic-login"
import { MagicLinkService } from "./magic-link.service"

type ConstructorParams = ConstructorParameters<typeof MagicLoginStrategy>[0]

// IDK why, but I have to this way when compiling with tsup, with tsc it does not require this
// @ts-ignore
const Strategy = MagicLoginStrategy.default ?? MagicLoginStrategy // ?? is just in case

@Injectable()
export class MagicLinkStrategy extends PassportStrategy(Strategy, "magic-link") {
	constructor(config: GlobalConfig, service: MagicLinkService) {
		super({
			secret: config.secretKey,
			// Do not include domain, only path. Do not include /api, since it's added in `sendMagicLink`
			callbackUrl: getEndpoints((e) => e.auth.magicLink).callback,
			sendMagicLink: async (dest, href) => service.sendMagicLink(dest, href),
			verify: (payload, done) => void service.verify(payload, done),
			// valid for 5 minutes
			jwtOptions: { expiresIn: 5 * 60 },
		} as ConstructorParams)
	}
}
