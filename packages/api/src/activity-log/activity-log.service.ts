import { throw500 } from "@api/common/throw-http"
import type {
	CreateFinishEvent,
	CrudFinishEvent,
	DeleteFinishEvent,
	UpdateFinishEvent,
} from "@api/crud/crud-event.types"
import { CrudService } from "@api/crud/crud.service"
import { OnCrudEvent } from "@api/crud/on-crud-event.decorator"
import { OrmRepository } from "@zmaj-js/orm"
import { RepoManager } from "@zmaj-js/orm"
import { Injectable } from "@nestjs/common"
import {
	ActivityLog,
	ActivityLogCollection,
	ActivityLogSchema,
	Struct,
	zodCreate,
} from "@zmaj-js/common"
import jsonPatch, { Operation } from "fast-json-patch"
import { ActivityLogConfig } from "./activity-log.config"

/**
 * Listen for CRUD events and apply write logs to database
 */
@Injectable()
export class ActivityLogService {
	repo: OrmRepository<ActivityLog>
	constructor(
		public readonly crud: CrudService<ActivityLog>,
		private readonly repoManager: RepoManager, // private readonly config: AppConfigService,
		private readonly config: ActivityLogConfig,
	) {
		this.repo = this.repoManager.getRepo(ActivityLogCollection)
	}

	/**
	 * Listen to after crud event, and create activity logs
	 * @internal
	 */
	@OnCrudEvent({ type: "finish" })
	async __logChanges(event: CrudFinishEvent): Promise<void> {
		if (this.config.logLevel === "disabled") return
		if (event.action === "read") return
		// log only non system
		if (event.collection.tableName.startsWith("zmaj")) return
		const logs = this.generateLogs(event)
		await this.repo.createMany({ data: logs, trx: event.trx })
	}

	private getChanges(
		item: Struct,
		event: UpdateFinishEvent | DeleteFinishEvent | CreateFinishEvent,
	): { previousData: Struct<unknown>; changes: Operation[] } {
		const id = item[event.collection.pkField] ?? throw500(3242301)

		const previousData: Struct =
			structuredClone(
				event.action === "update"
					? event.toUpdate.find((item) => item.id === id)?.original
					: event.action === "delete"
					? event.toDelete.find((item) => item.id === id)?.original
					: {},
			) ?? throw500(392342)

		const newData = structuredClone(
			event.action === "update" || event.action === "create" ? item : {},
		)

		// JSONPatch does not work with dates, so we have to transform them to JSON value
		for (const [key, val] of Object.entries(previousData)) {
			if (val instanceof Date) {
				previousData[key] = val.toJSON()
			}
		}

		for (const [key, val] of Object.entries(newData)) {
			if (val instanceof Date) {
				newData[key] = val.toJSON()
			}
		}
		return {
			previousData,
			changes: jsonPatch.compare(previousData, newData), //
		}
	}

	/**
	 * Create logs for crud event
	 *
	 * @param event Crud event
	 * @returns Created Logs
	 */
	private generateLogs(
		event: UpdateFinishEvent | DeleteFinishEvent | CreateFinishEvent,
	): readonly ActivityLog[] {
		return event.result.map((item) => {
			const id = item[event.collection.pkField] ?? throw500(3242301)

			let previousData: Struct | null = null
			let changes: Operation[] | null = null

			if (this.config.logLevel === "full") {
				const res = this.getChanges(item, event)
				previousData = res.previousData
				changes = res.changes
			}
			const embeddedUserInfo = event.user?.stripJwtData() ?? null

			return zodCreate(ActivityLogSchema, {
				action: event.action,
				ip: event.req.ip,
				userAgent: event.req.userAgent,
				itemId: String(id),
				resource: event.collection.authzKey,
				userId: embeddedUserInfo?.userId,
				previousData,
				changes,
				embeddedUserInfo,
			})
		})
	}
}
