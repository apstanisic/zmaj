import { Injectable } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"

/**
 * This is not global guard, it's not part of CombinedGuard and does not allow unauthenticated users
 * This is used for getting user from magic link, and creating normal refresh token
 * that can then be normally used. It should be only user on specified urls
 */
@Injectable()
export class MagicLinkGuard extends AuthGuard("magic-link") {}
