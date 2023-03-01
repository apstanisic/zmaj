import { AuthSession } from "@common/modules/auth-sessions"
import { ParsedUserAgent } from "./parsed-user-agent.type"

/**
 * Value that is returned when user request user session
 */
export type PublicAuthSession = Pick<
	AuthSession,
	"createdAt" | "ip" | "lastUsed" | "userAgent" | "userId" | "id"
> &
	ParsedUserAgent
