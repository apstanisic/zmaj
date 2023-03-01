import { Logger } from "@nestjs/common"
import { NestFactory } from "@nestjs/core"
import { NestExpressApplication } from "@nestjs/platform-express"
import { mergeMany, notNil } from "@zmaj-js/common"
import { AppModule } from "./app/app.module"
import { AppService } from "./app/app.service"
import { ConfigureAppParams } from "./app/configure-app-params.type"
import { GlobalConfig } from "./app/global-app.config"

type ZmajConfigs = (ConfigureAppParams | null | undefined)[]

export type ZmajApplication = NestExpressApplication

export async function buildApi(...params: ZmajConfigs): Promise<ZmajApplication> {
	const config: ConfigureAppParams = mergeMany({}, ...params.filter(notNil))
	// we have to pass logger here, since if we pass it in configure app,
	// initial log will be shown
	const app = await NestFactory.create<NestExpressApplication>(AppModule.register(config), {
		logger: config.global?.log === true ? undefined : config.global?.log,
		// Do not exit in process, throw error and let user catch it
		abortOnError: false,
		forceCloseConnections: true,
	})
	// we need to set some values that require app instance
	app.get(AppService).configureApp(app)

	return app
}

/**
 * Build api and start listening
 * @param params Api configuration
 * @returns create nestjs application
 */
export async function runApi(...params: ConfigureAppParams[]): Promise<ZmajApplication> {
	const app = await buildApi(...params)
	const port = app.get(GlobalConfig).port

	await app.listen(port)
	app.get(Logger).log(`Listening on port ${port}`)
	return app
}
