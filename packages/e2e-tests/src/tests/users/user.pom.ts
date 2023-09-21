import { faker } from "@faker-js/faker"
import { UserCreateDto, UserModel } from "@zmaj-js/common"
import { OrmRepository } from "zmaj"
import { ZmajCrudPage } from "../../setup/ZmajCrudPage.js"

export class UserPage extends ZmajCrudPage {
	title = "Users"
	get repo(): OrmRepository<UserModel> {
		return this.orm.repoManager.getRepo(UserModel)
	}

	db = {
		findByEmail: async (email: string) => this.repo.findOne({ where: { email } }),
		removeByEmail: async (email: string) => this.repo.deleteWhere({ where: { email } }),
		createOne: async (data: UserCreateDto) =>
			this.repo.createOne({
				// TODO This is not hashed
				data: { ...data, password: "not_important" },
				overrideCanCreate: true,
			}),
	}

	randEmail(): string {
		return faker.internet.email({ provider: "example.test" })
	}
}
