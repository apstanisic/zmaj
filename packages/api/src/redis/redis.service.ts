import { Injectable, OnModuleDestroy } from "@nestjs/common"
import { Redis } from "ioredis"
import { RedisConfig } from "./redis.config"

export type RedisInstance = Redis

// const REDIS_ENABLED = 'REDIS_ENABLED'
/**
 * Provides access to Redis instance if Redis is enabled
 *
 * Every use should create it's own instance
 * This is because redis can be blocking (in pub/sub mode), and we can't be sure
 * that instance that is attached to this service is not in use.
 * We could call `unsubscribe`, but it could come to problems
 * Just call `.quit()` when you're done with instance.
 * All instances are deleted when app is shut down
 *
 */
@Injectable()
export class RedisService implements OnModuleDestroy {
	private instances: Redis[] = []

	constructor(private config: RedisConfig) {}

	/**
	 * Create new Redis instance
	 */
	createInstance(): RedisInstance | undefined {
		if (!this.config.enabled) return
		const instance = new Redis(this.config.port, this.config.host, {
			username: this.config.username,
			password: this.config.password,
		})
		this.instances.push(instance)
		return instance
	}

	/**
	 * Destroy all Redis connections
	 */
	async onModuleDestroy(): Promise<void> {
		await Promise.allSettled(this.instances.map(async (r) => r.quit()))
	}
}
