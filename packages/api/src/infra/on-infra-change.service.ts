import { SequelizeService } from "@zmaj-js/orm"
import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common"
import type PQueue from "p-queue"
import { InfraSchemaSyncService } from "./infra-schema-sync/infra-schema-sync.service"
import { InfraStateService } from "./infra-state/infra-state.service"

@Injectable()
export class OnInfraChangeService implements OnModuleDestroy, OnModuleInit {
	constructor(
		private infraSchemaSync: InfraSchemaSyncService,
		private infraState: InfraStateService,
		private sequelizeService: SequelizeService,
	) {}
	async onModuleInit(): Promise<void> {
		// pre cache it
		await import("p-queue")
	}

	private changeDbQueue?: PQueue
	// need this "getter" to support esm only `p-queue`
	async getQueue(): Promise<PQueue> {
		if (!this.changeDbQueue) {
			const pqImport = await import("p-queue")
			this.changeDbQueue = new pqImport.default({ concurrency: 1 })
		}
		return this.changeDbQueue
	}

	async syncAppAndDb(): Promise<void> {
		await this.infraSchemaSync.sync()
		await this.infraState.initializeState()
		this.sequelizeService.generateModelsCms(Object.values(this.infraState.collections))
	}

	async executeChange<T>(fn: () => Promise<T>): Promise<T> {
		const queue = await this.getQueue()
		const result = await queue.add(async () => {
			const res = await fn()
			await this.syncAppAndDb()
			return res
		})
		return result as T
	}

	/**
	 * Wait for all items to end before shutting down the app
	 */
	async onModuleDestroy(): Promise<void> {
		const queue = await this.getQueue()
		await queue.onIdle()
	}
}
