import { CacheInterceptor, ExecutionContext, Inject, Injectable } from "@nestjs/common"
import { AuthUser } from "@zmaj-js/common"
import { Request } from "express"
import { CacheConfig } from "./cache.config"

@Injectable()
export class AppCacheInterceptor extends CacheInterceptor {
	/**
	 * We can't use constructor injection since `CacheInterceptor` has it's own dependency injection
	 */
	@Inject(CacheConfig)
	private config!: CacheConfig

	/**
	 * We check if cache is enabled, and if nestjs can cache object (only get request)
	 */
	protected override isRequestCacheable(context: ExecutionContext): boolean {
		if (this.config.enabled !== true) return false
		return super.isRequestCacheable(context)
	}

	/**
	 * How to track a cache value
	 *
	 * We have to customize key, so user can only access his/her cache.
	 * @see https://docs.nestjs.com/techniques/caching#adjust-tracking
	 *
	 * Guards are executed after each middleware, but before any interceptor or pipe.
	 * So we have access to logged in user, but don't have a access to `parsedQuery`
	 * All non registered users share cache since their permissions are the same
	 *
	 * It won't track if key is falsy
	 * @see https://github.com/nestjs/nest/blob/master/packages/common/cache/interceptors/cache.interceptor.ts#L44
	 */
	override trackBy(context: ExecutionContext): string | undefined {
		const canCache = this.isRequestCacheable(context)
		if (!canCache) return

		const req = context.switchToHttp().getRequest<Request>()
		const user: Partial<AuthUser> = req.user ?? {}
		const userId = user.userId ?? "public"

		// We are leveraging nestjs built in trackBy and just appending current user id
		const url = super.trackBy(context)
		const key = `HTTP__${url}__${userId}`
		return key
	}
}
