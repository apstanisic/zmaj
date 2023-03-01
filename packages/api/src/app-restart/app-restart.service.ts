import { throw500 } from "@api/common/throw-http"
import { Injectable, Logger } from "@nestjs/common"

/**
 * Service for restarting app
 *
 * It is useful to sometimes dynamically restart the app
 * without using pm2/docker...
 *
 * It was previously used on db schema change
 *
 * `app.get` gets requested service, and will listen on restart event, and will close itself,
 * and run bootstrap again
 *
 * This should be in main.ts
 *
 * And the server can be restarted with call to `service.restart`
 *
 * We are throttling so there
 *
 * Code in main
 * ```js
 *  app.get(AppRestartService).registerRestartImplementation(async () => {
 *    await app.close();
 *    await bootstrap();
 *  });
 * ```
 *
 * @example
 * ```js
 * // file1.ts
 * await this.service.restart()
 * print('this code will run')
 *
 * // file2.ts
 * // this is recommended, since first way is problematic in controllers
 * //
 * this.service.restart()
 * print('this code will run')
 * // in controller do something like this
 * if (shouldRestart) {
 *    this.service.restart() // don't wait this promise
 *    return { success: true }
 * }
 *
 * ```

 */
@Injectable()
export class AppRestartService {
	// onApplicationBootstrap() {
	//   throw new Error("Method not implemented.")
	// }
	private logger = new Logger(AppRestartService.name)

	/** Function that will restart app. It is located in `main.ts`. There is no prettier way to do this */
	private restartFn?: () => Promise<void>

	/** used for preventing multiple restart at the same time */
	private isRestarting = false

	/**
	 * Restart application
	 * Be careful if you're awaiting this promise, cause it will wait for current request to end.
	 * But if we dont' send any data, request won't end. So it will hang.
	 */
	async restart(): Promise<void> {
		this.logger.warn("Restarting App")
		if (!this.restartFn) throw500(48623423)

		if (this.isRestarting) return
		this.isRestarting = true

		return this.restartFn()
		// this.restartListener$.next()
	}

	/**
	 * Internal method. Don't call this method
	 *
	 * @internal
	 * @param fn Function that will restart app
	 */
	registerRestartImplementation(fn: () => Promise<void>): void {
		if (this.restartFn) throw500(32498324)
		this.restartFn = fn
	}
}
