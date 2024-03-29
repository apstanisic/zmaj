import { SecurityConfig } from "@api/app/security.config"
import { Injectable, RequestMethod } from "@nestjs/common"
import { NestExpressApplication } from "@nestjs/platform-express"
import { qsParse } from "@zmaj-js/common"
import cookieParser from "cookie-parser"
import session from "express-session"
import { isArray, unique } from "radash"
import { GlobalConfig } from "./global-app.config"

@Injectable()
export class AppService {
	constructor(
		private config: GlobalConfig,
		private securityConfig: SecurityConfig,
	) {}

	configureApp(app: NestExpressApplication): void {
		// use custom query parser (qs with custom params)
		app.set("query parser", (str: string) => qsParse(str))

		// enable cookies
		app.use(cookieParser(this.config.secretKey))
		app.use(
			session({
				secret: this.config.secretKey,
				resave: false,
				saveUninitialized: false,
				cookie: {
					// use secure when https
					secure: "auto",
					httpOnly: true, //
				},
			}),
		)

		app.setGlobalPrefix("api", {
			exclude: [
				{ method: RequestMethod.GET, path: "/" }, //
				{ method: RequestMethod.GET, path: "/api" }, //
			],
		})

		if (this.config.log !== true) {
			app.useLogger(this.config.log)
		}

		const corsOrigins = isArray(this.securityConfig.corsOrigin)
			? unique([
					...this.securityConfig.corsOrigin.map((url) => new URL(url).origin),
					new URL(this.config.urls.adminPanel).origin,
					new URL(this.config.urls.api).origin,
			  ])
			: this.securityConfig.corsOrigin

		// Use custom cors if provided, fallback to basic
		app.enableCors(
			this.securityConfig.advancedCors ?? {
				// allows cookies
				credentials: true,
				origin: corsOrigins,
				// preflightContinue: true,
			},
		)
	}
}
