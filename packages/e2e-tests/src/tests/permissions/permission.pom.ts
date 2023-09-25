import { Locator, expect } from "@playwright/test"
import {
	Permission,
	PermissionCreateDto,
	PermissionModel,
	PermissionUpdateDto,
	Role,
} from "@zmaj-js/common"
import { Orm, OrmRepository, RepoFilterWhere } from "zmaj"
import { ZmajPage } from "../../setup/ZmajPage.js"

export class PermissionPage extends ZmajPage {
	async hasPartialPermissionsAmount(n: number): Promise<void> {
		await expect(this.page.getByTestId("SettingsInputComponentIcon")).toHaveCount(n)
	}
	async hasAllowedPermissionsAmount(n: number): Promise<void> {
		await expect(this.page.getByTestId("CheckIcon")).toHaveCount(n)
	}

	async openPermissionDialog(action: string, resource: string): Promise<void> {
		await this.page
			.getByRole("cell", { name: `Show permission dialog for ${action} ${resource}`, exact: true })
			.click()
	}

	async hasTextOnBasicTab(text: string | RegExp): Promise<void> {
		await expect(this.page.getByRole("tabpanel", { name: "Basic" })).toContainText(text)
	}

	async goToFieldsTab(): Promise<void> {
		await this.page.getByRole("tab", { name: "Fields" }).click()
	}

	async goToConditionsTab(): Promise<void> {
		await this.page.getByRole("tab", { name: "Conditions" }).click()
	}

	async hasAllowedFieldsAmount(n: number): Promise<void> {
		await expect(
			this.page.getByRole("tabpanel", { name: "Fields" }).getByRole("checkbox", { checked: true }),
		).toHaveCount(n)
	}

	fieldCheckbox(name: string): Locator {
		return this.page
			.getByRole("tabpanel", { name: "Fields" })
			.locator("li")
			.filter({ hasText: new RegExp(`^${name}$`) })
			.getByLabel("Select row")
	}

	async hasAllowedField(name: string): Promise<void> {
		await expect(this.fieldCheckbox(name)).toBeChecked()
	}

	async hasForbiddenField(name: string): Promise<void> {
		await expect(this.fieldCheckbox(name)).not.toBeChecked()
	}

	async hasCondition(conditions: unknown): Promise<void> {
		await expect(this.page.locator("#zmaj_input_conditions")).toContainText(
			JSON.stringify(conditions, null, 4),
		)
	}

	async clickForbidButton(): Promise<void> {
		await this.page.getByRole("button", { name: "Forbid" }).click()
	}

	async clickOnSelectAll(): Promise<void> {
		await this.page.getByRole("checkbox", { name: "Select all" }).check()
	}
	async clickOnUnselectAll(): Promise<void> {
		await this.page.getByRole("checkbox", { name: "Select all" }).uncheck()
	}

	async clickOnChangeButton(): Promise<void> {
		await this.page.getByRole("button", { name: "Change" }).click()
	}
	async clickOnEnableButton(): Promise<void> {
		await this.page.getByRole("button", { name: "Enable" }).click()
	}

	async permissionUpdatedToast(): Promise<void> {
		await this.hasToast("Permissions successfully updated")
	}
}

export class PermissionUtilsFx {
	constructor(private orm: Orm) {}
	get repo(): OrmRepository<PermissionModel> {
		return this.orm.repoManager.getRepo(PermissionModel)
	}

	async removeWhere(where: RepoFilterWhere<PermissionModel>): Promise<void> {
		await this.repo.deleteWhere({ where })
	}

	async createPermission(data: PermissionCreateDto): Promise<Permission> {
		return this.repo.createOne({ data })
	}

	async update(id: string, changes: PermissionUpdateDto): Promise<Permission> {
		return this.repo.updateById({ id, changes })
	}

	async findPermission(id: string): Promise<Permission | undefined> {
		return this.repo.findOne({ where: { id } })
	}
	async getAllRolePermissions(role: Role): Promise<Permission[]> {
		return this.repo.findWhere({ where: { roleId: role.id } })
	}
}
