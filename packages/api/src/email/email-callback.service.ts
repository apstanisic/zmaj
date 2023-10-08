import { GlobalConfig } from "@api/app/global-app.config"
import { throw400 } from "@api/common/throw-http"
import { emsg } from "@api/errors"
import { Injectable } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { z } from "zod"

const jwtSchema = z.object({
	sub: z.string().uuid(),
	type: z.literal("" as string),
})

type CreateUrlParams<T extends z.AnyZodObject> = {
	path: string
	data?: Omit<z.input<T>, keyof (typeof jwtSchema)["shape"]>
	userId: string
	usedFor: string
	expiresIn: string
}

/**
 * Common thing that we need to do is to send user confirmation email,
 * with token that allows them to do some. For example, reset password,
 * confirm email, accept invitation. This service provides common methods
 * for shared functionality between actions.
 */
@Injectable()
export class EmailCallbackService {
	constructor(
		private jwtService: JwtService,
		private globalConfig: GlobalConfig,
	) {}

	/**
	 * Create URL that can be used to verify action.
	 * It forces good practices, such as forcing to say purpose of JWT,
	 * scoping JWT to user and forcing expiration.
	 */
	async createJwtCallbackUrl<T extends z.AnyZodObject>(params: CreateUrlParams<T>): Promise<URL> {
		const jwtToken = await this.jwtService.signAsync(
			{
				...params.data,
				sub: params.userId,
				type: params.usedFor,
			},
			{
				expiresIn: params.expiresIn,
			},
		)
		const url = this.globalConfig.withApiUrl(params.path, { token: jwtToken })
		return url
	}

	async verifyJwtCallback<const T extends typeof jwtSchema>({
		token,
		schema,
	}: {
		token: string
		schema: T
	}): Promise<z.output<T>> {
		const jwtData = await this.jwtService.verifyAsync(token)

		const result = schema.safeParse(jwtData)
		if (result.success === false) throw400(29403, emsg.emailTokenExpired)
		const data = result.data

		return data
	}
}
