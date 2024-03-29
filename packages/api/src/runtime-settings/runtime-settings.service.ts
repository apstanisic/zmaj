import { AuthenticationConfig } from "@api/authentication/authentication.config"
import { throw403 } from "@api/common/throw-http"
import { emsg } from "@api/errors"
import { KeyValueNamespace } from "@api/key-value-storage/key-value.consts"
import { Injectable, OnModuleInit } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import {
	ADMIN_ROLE_ID,
	AuthUser,
	ChangeSettingsDto,
	RuntimeSettingsSchema,
	Settings,
	merge,
} from "@zmaj-js/common"
import { ReadonlyDeep } from "type-fest"
import { KeyValueStorageService } from "../key-value-storage/key-value-storage.service"

/**
 * @deprecated For now, to reduce complexity. Nothing prevents users that add custom module
 * with sign up feature, it's fairly simple
 * @internal
 */
@Injectable()
export class RuntimeSettingsService implements OnModuleInit {
	constructor(
		private keyVal: KeyValueStorageService, //
		private authConfig: AuthenticationConfig,
	) {
		this._settings = this.parseSettings(null)
	}

	// value is replaced with real value in `onModuleInit`
	private _settings: ReadonlyDeep<Settings>

	getSettings(): ReadonlyDeep<Settings> {
		return this._settings
	}

	async setSettings(val: ChangeSettingsDto, user: AuthUser): Promise<ReadonlyDeep<Settings>> {
		if (user.roleId !== ADMIN_ROLE_ID) throw403(793423, emsg.noAuthz)
		const merged = merge(this.getSettings().data, val)

		const updated = await this.keyVal.upsert({
			key: "SETTINGS",
			namespace: KeyValueNamespace.INTERNAL,
			value: JSON.stringify(merged),
		})
		this._settings = this.parseSettings(updated.value)
		return structuredClone(this._settings)
	}

	private parseSettings(val?: string | null): ReadonlyDeep<Settings> {
		return {
			data: RuntimeSettingsSchema.parse(JSON.parse(val ?? "{}")),
			meta: { signUpDynamic: false },
		}
	}

	private async getSettingsFromDb(): Promise<ReadonlyDeep<Settings>> {
		const val = await this.keyVal.findByKey("SETTINGS", KeyValueNamespace.INTERNAL)
		return this.parseSettings(val?.value)
	}

	async onModuleInit(): Promise<void> {
		this._settings = await this.getSettingsFromDb()
	}

	@Cron(CronExpression.EVERY_10_MINUTES)
	async __refresh(): Promise<void> {
		this._settings = await this.getSettingsFromDb()
	}
}
