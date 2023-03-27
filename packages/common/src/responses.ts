import { Except } from "type-fest"
import { ActivityLog } from "./modules/activity-log/activity-log.model"

type ApiReturnTypes<Ep> = {
	[key in keyof Ep]: Ep[key] extends SingleGroup
		? {
				[key2 in keyof Except<Ep[key], "$base">]: any
		  }
		: ApiReturnTypes<Ep[key]>
}

type SingleGroup = { $base: string; [key: string]: string }

const Returns = <T>(): void => {}

const ReturnTypes = {
	activityLog: {
		deleteById: Returns<Partial<ActivityLog>>(),
		findById: Returns<Partial<ActivityLog>>(),
		findMany: Returns<Partial<ActivityLog>[]>(),
	},
}
// } satisfies ApiReturnTypes<typeof endpoints>
