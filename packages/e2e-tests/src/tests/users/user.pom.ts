import { faker } from "@faker-js/faker"
import { User, UserCreateDto, UserModel } from "@zmaj-js/common"
import { Orm, OrmRepository, RepoFilterWhere } from "zmaj"
import { ZmajCrudPage } from "../../setup/ZmajCrudPage.js"
import { ADMIN_EMAIL } from "../../setup/e2e-consts.js"

export class UserPage extends ZmajCrudPage {
	title = "Users"
}

export class UserUtilsFx {
	constructor(private orm: Orm) {}
	get repo(): OrmRepository<UserModel> {
		return this.orm.repoManager.getRepo(UserModel)
	}

	async findWhere(where: RepoFilterWhere<UserModel>): Promise<User | undefined> {
		return this.repo.findOne({ where })
	}

	async removeWhere(where: RepoFilterWhere<UserModel>): Promise<void> {
		await this.repo.deleteWhere({ where })
	}

	async createOne(data: UserCreateDto): Promise<User> {
		const mainAdmin = await this.repo.findOneOrThrow({
			where: { email: ADMIN_EMAIL },
			fields: { password: true },
			includeHidden: true,
		})

		return this.repo.createOne({
			data: { ...data, password: mainAdmin.password },
			overrideCanCreate: true,
		})
	}

	randEmail(): string {
		return faker.internet.email({ provider: "example.test" })
	}
}
