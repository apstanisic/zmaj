import { Locator, expect } from "@playwright/test"
import { Permission, PermissionCreateDto, PermissionModel, Role, RoleModel } from "@zmaj-js/common"
import { OrmRepository } from "zmaj"
import { ZmajPage } from "../../setup/ZmajPage.js"
import { getUniqueTitle } from "../../setup/e2e-unique-id.js"

export class PermissionPage extends ZmajPage {
	get repo(): OrmRepository<PermissionModel> {
		return this.orm.repoManager.getRepo(PermissionModel)
	}

	get rolesRepo(): OrmRepository<RoleModel> {
		return this.orm.repoManager.getRepo(RoleModel)
	}
	db = {
		createRole: async (name?: string) =>
			this.rolesRepo.createOne({ data: { name: name ?? getUniqueTitle() } }),
		deleteRole: async (name: string) => this.rolesRepo.deleteWhere({ where: { name } }),
		createPermission: async (data: PermissionCreateDto): Promise<Permission> =>
			this.repo.createOne({ data }),
		findPermission: (id: string): Promise<Permission | undefined> =>
			this.repo.findOne({ where: { id } }),
		getAllRolePermissions: (role: Role): Promise<Permission[]> =>
			this.repo.findWhere({ where: { roleId: role.id } }),
	}

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
