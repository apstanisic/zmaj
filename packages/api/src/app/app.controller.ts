import { Controller, Get } from "@nestjs/common"
import { UserModel } from "@zmaj-js/common"
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
		return { message: "API successfully reached." }
	}

	@Get("/app-info")
	async appInfo(): Promise<{ name: string }> {
		return {
			name: this.config.name,
		}
	}

	async test(): Promise<any> {
		const user = await this.rm
			.getRepo("comments")
			.findWhere({ fields: { id: true, postId: true, post: true } })
		// class TB extends BaseModel {
		// 	ff = this.oneToMany(() => ({}) as any, {})
		// }
		// const a = new UserModel()
		// const b = new TB()
		// a.authSessions
		// b.ff

		const res = await this.rm.getRepo(UserModel).findOneOrThrow({
			fields: {
				id: true,
				email: true,
				authSessions: {
					id: true,
				},
				files: true,
				role: {
					id: true,
					requireMfa: true,
					// permissions: true,
					// users: true,
					// permissions: { action: true },
				},
			},
		})
		const aaa = new UserModel().authSessions
		// const role = res?.role
		res.role.requireMfa
		res.authSessions.push

		// res?.authSessions.filter
		// res?.role.filter
		// const rr = res?.role
		// INFERENCE NOT WORKING. STRING NOT POSSIBLE
		// SHOULD BE ARRAY, NOT T | T[]
		// IT KEEPS GENERIC ALL VERSION
		// PLUS YOU CAN PASS ANYTHING TO FIELDS
		// res!.authSessions[0]?.createdAt
		// res!.role.push(...[])
		// PROBLEM IS THAT COMMON is using _zmaj_js_orm.RelationBuilder, while
		// inline is using RelationBuild...
		const a = new UserModel().authSessions
		// o2m returns T | T[]
		return res
	}
}
