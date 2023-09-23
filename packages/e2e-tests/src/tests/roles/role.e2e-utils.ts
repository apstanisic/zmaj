import { Role, RoleCreateDto, RoleModel } from "@zmaj-js/common"
import { Orm, OrmRepository } from "zmaj"
import { ZmajCrudPage } from "../../setup/ZmajCrudPage.js"

export class RolePage extends ZmajCrudPage {
	override title = "Roles & Permissions"
}

export class RoleDb {
	constructor(protected orm: Orm) {}
	get repo(): OrmRepository<RoleModel> {
		return this.orm.repoManager.getRepo(RoleModel)
	}
	async deleteByName(name: string): Promise<void> {
		await this.repo.deleteWhere({ where: { name } })
	}

	async delete(role: Role): Promise<void> {
		await this.repo.deleteWhere({ where: { id: role.id } })
	}

	async findByName(name: string): Promise<Role | undefined> {
		return this.repo.findOne({ where: { name } })
	}
	async create(data: RoleCreateDto): Promise<Role> {
		return this.repo.createOne({ data, overrideCanCreate: true })
	}
}
