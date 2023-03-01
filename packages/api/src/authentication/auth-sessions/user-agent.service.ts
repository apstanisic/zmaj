import { Injectable } from "@nestjs/common"
import { ParsedUserAgent, PublicAuthSession } from "@zmaj-js/common"
import UAParser from "ua-parser-js"

@Injectable()
export class UserAgentService {
	expandUserAgent(userAgent?: string | null): ParsedUserAgent {
		if (!userAgent) return {}

		const ua = new UAParser(userAgent).getResult()

		return {
			browser: {
				name: ua.browser.name,
				version: ua.browser.version,
			},
			os: {
				name: ua.os.name,
				version: ua.os.version,
			},
			device: {
				type: ua.device.type,
				vendor: ua.device.vendor,
			},
		}
	}

	/**
	 * Expanded auth session that is sent to user by parsing user agent and providing some
	 * basic info
	 *
	 * @param session Session from which to take user agent
	 * @returns `PublicAuthSession` with parsed user agent
	 */
	expandPublicSession(session: Omit<PublicAuthSession, keyof ParsedUserAgent>): PublicAuthSession {
		return {
			...this.expandUserAgent(session.userAgent),
			...session,
		}
	}
}
