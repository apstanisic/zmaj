import { ServeStaticModule } from "@nestjs/serve-static"
import { ConfigureAppParams, predefinedApiConfigs, runApi, ZmajApplication } from "@zmaj-js/api"
import { fileURLToPath } from "url"

export async function runServer(config: ConfigureAppParams = {}): Promise<ZmajApplication> {
	// TSUP will handle shims for cjs
	const adminPanelDistFolder = await import("import-meta-resolve")
		.then((pkg) => pkg.resolve("@zmaj-js/admin-panel/dist", import.meta.url)) //
		.then((path) => fileURLToPath(path)) //path.replace("file:///", "/"))

	const apiAndGui = await runApi(
		predefinedApiConfigs.adminPanel, //
		config,
		{
			customModules: [
				ServeStaticModule.forRoot({
					rootPath: adminPanelDistFolder,
					serveRoot: "/admin",
					serveStaticOptions: { redirect: true, fallthrough: true },
				}),
				...(config.customModules ?? []),
			],
		},
	)

	return apiAndGui
}

export * from "@zmaj-js/api"
