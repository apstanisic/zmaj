import { SetSystemPermission } from "@api/authorization/set-system-permission.decorator"
import { DtoBody } from "@api/common/decorators/dto-body.decorator"
import { wrap } from "@api/common/wrap"
import { Controller, Get, Put } from "@nestjs/common"
import {
	AuthUser,
	Data,
	endpoints,
	ProfileInfo,
	ProfileUpdateDto,
	UserUpdatePasswordDto,
} from "@zmaj-js/common"
import { GetUser } from "../get-user.decorator"
import { ProfileService } from "./profile.service"

const ep = endpoints.auth.account.profile

@Controller(ep.$base)
export class ProfileController {
	constructor(private service: ProfileService) {}

	@SetSystemPermission("account", "readProfile")
	@Get(ep.get)
	async profileInfo(@GetUser({ required: true }) user: AuthUser): Promise<Data<ProfileInfo>> {
		return wrap(this.service.getProfile(user))
	}

	@SetSystemPermission("account", "updateProfile")
	@Put(ep.update)
	async updateInfo(
		@GetUser({ required: true }) user: AuthUser,
		@DtoBody(ProfileUpdateDto) data: ProfileUpdateDto,
	): Promise<Data<ProfileInfo>> {
		return wrap(this.service.updateInfo({ data, user }))
	}

	@SetSystemPermission("account", "updatePassword")
	@Put(ep.updatePassword)
	async changePassword(
		@GetUser({ required: true }) user: AuthUser,
		@DtoBody(UserUpdatePasswordDto) data: UserUpdatePasswordDto,
	): Promise<{ email: string }> {
		await this.service.changePassword(user, data)
		return { email: user.email }
	}

	// @Get(ep.requestToEnableOtp)
	// async requestOtpEnable(
	// 	@GetUser({ required: true }) user: AuthUser,
	// ): Promise<{ image: string; secret: string; jwt: string; backupCodes: string[] }> {
	// 	return this.service.requestToEnableOtp(user)
	// }

	// @Put(ep.enableOtp)
	// async enableOtp(
	// 	@GetUser({ required: true }) user: AuthUser,
	// 	@DtoBody() data: OtpEnableDto,
	// ): Promise<{ success: true }> {
	// 	await this.service.enableOtp({ user, code: data.code, jwt: data.jwt })
	// 	return { success: true }
	// }

	// @Put(ep.disableOtp)
	// async disableOtp(
	// 	@GetUser({ required: true }) user: AuthUser,
	// 	@DtoBody() data: OtpDisableDto,
	// ): Promise<{ success: true }> {
	// 	await this.service.disableOtp(user, data.password)
	// 	return { success: true }
	// }
}
