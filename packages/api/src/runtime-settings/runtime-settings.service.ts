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
	merge,
	RuntimeSettingsSchema,
	Settings,
} from "@zmaj-js/common"
import { freeze } from "immer"
import { ReadonlyDeep } from "type-fest"
import { KeyValueStorageService } from "../key-value-storage/key-value-storage.service"

/**
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

		const updated = await this.keyVal.updateOrCreate({
			key: "SETTINGS",
			namespace: KeyValueNamespace.INTERNAL,
			value: JSON.stringify(merged),
		})
		this._settings = this.parseSettings(updated.value)
		return this._settings
	}

	private parseSettings(val?: string | null): ReadonlyDeep<Settings> {
		const parsed = RuntimeSettingsSchema.parse(JSON.parse(val ?? "{}")) //

		return freeze(
			{
				data: parsed,
				meta: { signUpDynamic: this.authConfig.isSignUpDynamic() },
			},
			true,
		)
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
