import { ConfigService } from "@api/config/config.service"
import { Injectable } from "@nestjs/common"
import { joinUrl, ZodDto } from "@zmaj-js/common"
import { unique } from "radash"
import { z } from "zod"

const GlobalConfigSchema = z.object({
	/**
	 * Secret key that is used for encrypting access token and sensitive data
	 */
	secretKey: z.string().trim().min(20).max(100),
	// zmajUrl: z.string().url().optional(),
	urls: z
		.union([
			z.string().url(),
			z.object({
				api: z.string().url(),
				adminPanel: z.string().url(),
			}),
		])
		.default("http://localhost:5000")
		.transform((urls) => {
			return typeof urls === "string"
				? { api: joinUrl(urls, "api/"), adminPanel: joinUrl(urls, "admin/") } //
				: urls
		}),
	/**
	 * App name (used when sending emails...)
	 */
	name: z.string().default("Zmaj App"),
	/**
	 * On which port is API run
	 */
	port: z.number().int().default(5000),
	/**
	 * Configure api to allow some things so that Admin panel can work
	 */
	enableAdminPanelIntegration: z.boolean().default(false),
	/**
	 * Is logging enabled
	 */
	log: z
		.union([
			z.boolean(),
			z.array(z.enum(["debug", "error", "log", "verbose", "warn"])), //
		])
		.default(true)
		.transform((v) => (Array.isArray(v) ? unique(v) : v)),
})

export type GlobalConfigParams = Partial<z.input<typeof GlobalConfigSchema>>

@Injectable()
export class GlobalConfig extends ZodDto(GlobalConfigSchema) {
	constructor(params: GlobalConfigParams, config: ConfigService) {
		const name = params.name ?? config.get<string>("APP_NAME")
		const secretKey = params.secretKey ?? config.get<string>("SECRET_KEY")
		const port = params.port ?? config.get<number>("APP_PORT")
		const log = params.log ?? config.get<boolean>("APP_LOG")

		const appUrl = typeof params.urls === "string" ? params.urls : config.get<string>("APP_URL")
		const apiUrl =
			typeof params.urls === "object" //
				? params.urls.api
				: config.get<string>("ZMAJ_API_URL")
		const adminPanelUrl =
			typeof params.urls === "object"
				? params.urls.adminPanel
				: config.get<string>("ZMAJ_ADMIN_PANEL_URL")
		const urls = apiUrl && adminPanelUrl ? { api: apiUrl, adminPanel: adminPanelUrl } : appUrl

		const values: GlobalConfigParams = { name, secretKey, port, log, urls }
		super(values as Required<typeof values>)
	}

	joinWithAdminPanelUrl(...values: string[]): string {
		return joinUrl(this.urls.adminPanel, ...values)
	}

	joinWithApiUrl(...values: string[]): string {
		return joinUrl(this.urls.api, ...values)
	}
}
