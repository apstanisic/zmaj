import { expect } from "@playwright/test"
import { UserCreateDto, UserModel } from "@zmaj-js/common"
import { OrmRepository } from "zmaj"
import { ZmajPage } from "../../setup/ZmajPage.js"

export class AuthPage extends ZmajPage {
	passwordHash?: string
	get repo(): OrmRepository<UserModel> {
		return this.orm.repoManager.getRepo(UserModel)
	}
	db = {
		createUser: async (data: UserCreateDto) => {
			if (!this.passwordHash) {
				const mainAdmin = await this.repo.findOneOrThrow({
					where: { email: "admin@examle.com" },
					includeHidden: true,
				})
				this.passwordHash = mainAdmin.password
			}
			return this.repo.createOne({
				data: {
					...data,
					status: data.status ?? "active",
					confirmedEmail: data.confirmedEmail ?? true,
					password: this.passwordHash,
				},
			})
		},
	}

	async isOnLoginPage(): Promise<void> {
		await expect(this.page).toHaveURL(/admin\/#\/login/)
	}

	async isOnHome(): Promise<void> {
		await expect(this.page).toHaveURL(/admin\/#\/$/)
	}

	async logout(): Promise<void> {
		await this.page.getByLabel("More Actions").click()
		await this.page.getByRole("menuitem", { name: "Logout" }).click()
		await expect(async () => {
			await this.isOnLoginPage()
		}).toPass()
	}
}
