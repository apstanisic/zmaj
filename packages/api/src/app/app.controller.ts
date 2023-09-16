import { Controller, Get } from "@nestjs/common"
import { RepoManager } from "@zmaj-js/orm"
import { GlobalConfig } from "./global-app.config"

@Controller()
export class AppController {
	constructor(
		private config: GlobalConfig,
		private rm: RepoManager,
	) {}

	@Get("/")
	async home(): Promise<any> {
		// const user = await this.rm
		// 	.getRepo("comments")
		// 	.findWhere({ fields: { id: true, postId: true, post: true } })
		// return user
		// const res = await this.rm.getRepo(UserModel).findWhere({
		// 	fields: {
		// 		id: true,
		// 		email: true,
		// 		authSessions: {
		// 			id: true,
		// 		},
		// 		files: true,
		// 		role: {
		// 			id: true,
		// 			permissions: true,
		// 			users: true,
		// 			// permissions: { action: true },
		// 		},
		// 	},
		// })
		// // o2m returns T | T[]
		// return res
		return { message: "API successfully reached!" }
	}

	@Get("/app-info")
	async appInfo(): Promise<{ name: string }> {
		return {
			name: this.config.name,
		}
	}
}
