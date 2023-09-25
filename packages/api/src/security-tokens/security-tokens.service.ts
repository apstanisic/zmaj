import { GlobalConfig } from "@api/app/global-app.config"
import { EmailService, SendEmailParams } from "@api/email/email.service"
import { Injectable } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import {
	SecurityToken,
	SecurityTokenModel,
	SecurityTokenSchema,
	Struct,
	qsStringify,
	zodCreate,
} from "@zmaj-js/common"
import { OrmRepository, RepoManager, Transaction } from "@zmaj-js/orm"
import { z } from "zod"

export type CreateTokenFormEmailConfirmationParams = {
	/**
	 * data needed to create token
	 */
	token: Pick<z.input<typeof SecurityTokenSchema>, "usedFor" | "validUntil" | "data" | "userId">
	/**
	 * Additional data that will be passed to URL
	 */
	urlQuery?: Struct<string>
	/**
	 * Where will email redirect
	 */
	redirectPath: string
	/**
	 * Params that will be passed to send email
	 */
	emailParams: (url: string, appName: string) => SendEmailParams | Promise<SendEmailParams>
	/**
	 * Should we delete old tokens
	 * - all: delete all token for user
	 * - usedFor: delete all token for user that are used for same purpose (default)
	 * - none: Do not delete old tokens
	 */
	deleteOld?: "all" | "usedFor" | "none"
	trx?: Transaction
}

@Injectable()
export class SecurityTokensService {
	private readonly repo: OrmRepository<SecurityTokenModel>
	constructor(
		private readonly repoManager: RepoManager,
		private readonly config: GlobalConfig,
		private readonly emailService: EmailService,
	) {
		this.repo = this.repoManager.getRepo(SecurityTokenModel)
	}

	async createTokenWithEmailConfirmation(
		params: CreateTokenFormEmailConfirmationParams,
	): Promise<void> {
		const token = await this.repoManager.transaction({
			trx: params.trx,
			fn: async (trx) => {
				const usedFor =
					params.deleteOld === "usedFor" || params.deleteOld === undefined
						? params.token.usedFor
						: params.deleteOld === "all"
						? undefined
						: false

				// if none, do not delete old tokens
				if (usedFor !== false) {
					await this.deleteUserTokens({ userId: params.token.userId, usedFor, trx })
				}
				const token = await this.createToken(params.token, trx)
				return token.token
			},
		})

		const query = qsStringify({ ...params.urlQuery, token })
		const url = this.config.joinWithApiUrl(`${params.redirectPath}?${query}`)
		const emailParams = await params.emailParams(url, this.config.name)
		await this.emailService.sendEmail(emailParams)

		//
	}

	/**
	 * Create security token and store it in database
	 */
	async createToken(
		params: Pick<z.input<typeof SecurityTokenSchema>, "usedFor" | "validUntil" | "data" | "userId">,
		trx?: Transaction,
	): Promise<SecurityToken> {
		return this.repo.createOne({
			trx: trx,
			data: zodCreate(SecurityTokenSchema.omit({ createdAt: true }), params),
		})
	}

	async findToken(
		{ token, usedFor, userId }: { token: string; usedFor: string; userId: string },
		em?: Transaction,
	): Promise<SecurityToken | undefined> {
		return this.repo.findOne({
			trx: em,
			where: {
				token,
				usedFor,
				userId,
				validUntil: { $gt: new Date() },
			},
		})
	}

	async deleteUserTokens({
		userId,
		trx,
		usedFor,
	}: {
		userId: string
		usedFor?: string
		trx?: Transaction
	}): Promise<void> {
		await this.repo.deleteWhere({ where: { userId, usedFor }, trx: trx })
	}

	/**
	 * Every 1 hour remove expired tokens
	 *
	 * It's a simple query so it's not hard on db, and we should always use `findToken`
	 * that takes care of expiration, but we are removing so we don't have junk data, and that
	 * even in the case of accessing token directly, there are smaller changes that expired
	 * data will exist.
	 */
	@Cron(CronExpression.EVERY_HOUR)
	async deleteExpiredTokens(): Promise<void> {
		await this.repo.deleteWhere({
			where: {
				validUntil: { $lt: new Date() },
			},
		})
	}
}
