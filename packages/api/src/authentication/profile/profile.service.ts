import { AuthorizationService } from "@api/authorization/authorization.service"
import { throw403 } from "@api/common/throw-http"
import { emsg } from "@api/errors"
import { UsersService } from "@api/users/users.service"
import { Injectable } from "@nestjs/common"
import {
	AuthUser,
	ProfileInfo,
	ProfileUpdateDto,
	User,
	UserUpdatePasswordDto,
} from "@zmaj-js/common"

@Injectable()
export class ProfileService {
	constructor(
		private readonly usersService: UsersService,
		private readonly authz: AuthorizationService,
	) {}

	async getProfile(user: AuthUser): Promise<ProfileInfo> {
		this.authz.checkSystem("account", "readProfile", { user }) || throw403(5927134, emsg.noAuthz)
		const fullUser = await this.usersService.findActiveUser({ id: user.userId })
		return this.getProfileFields(fullUser)
	}

	async updateInfo({
		user,
		data,
	}: {
		user: AuthUser
		data: ProfileUpdateDto
	}): Promise<ProfileInfo> {
		this.authz.checkSystem("account", "updateProfile", { user }) || throw403(2142131, emsg.noAuthz)
		const updated = await this.usersService.updateUser({ userId: user.userId, data })
		return this.getProfileFields(updated)
	}

	/**
	 * Set password with user provided data
	 */
	async changePassword(user: AuthUser, data: UserUpdatePasswordDto): Promise<void> {
		this.authz.checkSystem("account", "updatePassword", { user }) || throw403(59362, emsg.noAuthz)
		await this.usersService.tryChangePassword({ user, data })
	}

	private getProfileFields(user: User): ProfileInfo {
		const { firstName, email, lastName, id } = user
		return { firstName, email, id, lastName }
	}
}
