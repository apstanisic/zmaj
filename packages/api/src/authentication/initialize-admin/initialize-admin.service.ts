import { GlobalConfig } from "@api/app/global-app.config"
import { throw403 } from "@api/common/throw-http"
import { emsg } from "@api/errors"
import { KeyValueStorageService } from "@api/key-value-storage/key-value-storage.service"
import { SettingsKey } from "@api/key-value-storage/key-value.consts"
import { UsersService } from "@api/users/users.service"
import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common"
import { ADMIN_ROLE_ID, AuthUser, SignUpDto } from "@zmaj-js/common"
import { Orm } from "@zmaj-js/orm"
import { AuthenticationConfig } from "../authentication.config"

@Injectable()
export class InitializeAdminService implements OnApplicationBootstrap {
	logger = new Logger(InitializeAdminService.name)
	constructor(
		private readonly users: UsersService,
		private readonly keyVal: KeyValueStorageService,
		private readonly orm: Orm,
		private readonly config: AuthenticationConfig,
		private readonly globalConfig: GlobalConfig,
	) {}

	async onApplicationBootstrap(): Promise<void> {
		const inited = await this.isAdminInitialized()
		if (inited) return

		const message = [
			"\n\n",
			"Admin account is not initialized.\n",
			"You can initialize it with cli:",
			"npx zmaj create-admin [email]\n",
			...(this.config.allowAdminInitialize
				? ["Or go to:", this.globalConfig.joinWithAdminPanelUrl("/#/auth/init")]
				: []),
			"\n\n",
		].join("\n")

		this.logger.log(message)
	}

	/**
	 * Check if admin is initialized
	 */
	async isAdminInitialized(): Promise<boolean> {
		// if (!this.config.allowAdminInitialize) throw403(79432)
		const adminsCount = await this.users.repo.count({ where: { roleId: ADMIN_ROLE_ID } })
		if (adminsCount > 0) return true

		// we check this even if admin count is 0, since it might be deleted on unknown way,
		// and we don't want to create a security vulnerability
		const adminInited = await this.keyVal.findByKey(
			SettingsKey.ADMIN_USER_INITED,
			SettingsKey.NAMESPACE,
		)

		if (adminInited?.value === "true") return true

		return false
	}

	/**
	 * This method is safe to expose to REST API
	 */
	async createAdminSafe(data: SignUpDto): Promise<AuthUser> {
		if (!this.config.allowAdminInitialize) throw403(879993, emsg.noAuthz)
		const isInitialized = await this.isAdminInitialized()
		if (isInitialized) throw403(12395, emsg.noAuthz)
		return this.createAdmin(data)
	}
	/**
	 * Allow first user registration as admin
	 */
	async createAdmin(data: SignUpDto, options?: { ignoreInited?: boolean }): Promise<AuthUser> {
		return this.orm.transaction({
			fn: async (em) => {
				const savedUser = await this.users.createUser({
					trx: em,
					// id: MAIN_ADMIN_ID,
					data: {
						...data,
						roleId: ADMIN_ROLE_ID,
						status: "active",
						// This is true, because we don't care if admin provides invalid email, he/she controls app
						confirmedEmail: true,
					},
				})
				await this.keyVal.upsert(
					{
						key: SettingsKey.ADMIN_USER_INITED,
						value: "true",
						namespace: SettingsKey.NAMESPACE,
					},
					em,
				)
				return AuthUser.fromUser(savedUser)
			},
		})
	}
}
