import { Injectable } from "@nestjs/common"
import { REFRESH_COOKIE_NAME } from "@zmaj-js/common"
import { addMilliseconds } from "date-fns"
import { Response } from "express"
import { AuthenticationConfig } from "./authentication.config"

@Injectable()
export class RefreshTokenService {
	constructor(private readonly config: AuthenticationConfig) {}

	/**
	 * Remove refresh token
	 */
	remove(res: Response): void {
		res.clearCookie(REFRESH_COOKIE_NAME)
	}

	/**
	 * Helper method for setting refresh token
	 * @param res Express response
	 * @param refreshToken Refresh token to be set as cookie
	 */
	set(res: Response, token: string): void {
		res.cookie(REFRESH_COOKIE_NAME, token, {
			httpOnly: true,
			sameSite: "lax",
			expires: this.getExpirationDate(),
			signed: true,
			secure: true,
		})
	}

	/**
	 * Easier for testing
	 * @returns When token expires
	 */
	private getExpirationDate(): Date {
		return addMilliseconds(new Date(), this.config.refreshTokenTtlMs)
	}
}
