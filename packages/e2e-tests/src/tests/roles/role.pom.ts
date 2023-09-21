import { RoleCreateDto, RoleModel } from "@zmaj-js/common"
import { OrmRepository } from "zmaj"
import { ZmajCrudPage } from "../../setup/ZmajCrudPage.js"

export class RolePage extends ZmajCrudPage {
	override title = "Roles & Permissions"

	get repo(): OrmRepository<RoleModel> {
		return this.orm.repoManager.getRepo(RoleModel)
	}

	db = {
		deleteByName: async (name: string) => this.repo.deleteWhere({ where: { name } }),
		findByName: async (name: string) => this.repo.findOne({ where: { name } }),
		create: async (data: RoleCreateDto) => this.repo.createOne({ data, overrideCanCreate: true }),
	}
}
