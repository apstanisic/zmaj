import { throw400, throw401, throw403, throw500 } from "@api/common/throw-http"
import { BootstrapOrm } from "@api/database/BootstrapRepoManager"
import { emsg } from "@api/errors"
import { Injectable } from "@nestjs/common"
import {
	AuthUser,
	Struct,
	User,
	UserCreateDto,
	UserModel,
	UserSchema,
	UserUpdateDto,
	UserUpdatePasswordDto,
	UserWithSecret,
	zodCreate,
} from "@zmaj-js/common"
import { OrmRepository, RepoFilterWhere, Transaction } from "@zmaj-js/orm"
import { omit } from "radash"
import { EncryptionService } from "../encryption/encryption.service"

type IdOrEmailObject = { id: string } | { email: string }

@Injectable()
export class UsersService {
	constructor(
		private readonly orm: BootstrapOrm,
		private readonly encryptionService: EncryptionService,
	) {
		this.repo = this.orm.getRepo(UserModel)
	}

	readonly repo: OrmRepository<UserModel>

	/**
	 * Find user either by ID or by email
	 */
	async findUser(where: IdOrEmailObject, trx?: Transaction): Promise<User | undefined> {
		// @ts-ignore https://github.com/microsoft/TypeScript/issues/53234
		return this.repo.findOne({ where, trx })
	}

	async findUserWithHiddenFields(
		filter: RepoFilterWhere<UserModel>,
		// userId: string,
		trx?: Transaction,
	): Promise<UserWithSecret | undefined> {
		const users = await this.repo.findWhere({
			limit: 1,
			where: filter,
			includeHidden: true,
			trx,
		})
		const user = users[0] as UserWithSecret | undefined

		if (user && (user.password === undefined || user.otpToken === undefined)) throw500(3784329)

		return user
	}

	/**
	 * Find active user either by ID or by email
	 */
	async findActiveUser(where: IdOrEmailObject, em?: Transaction): Promise<User> {
		const user = await this.findUser(where, em)
		// if there is no user, it's not able to authorize (401 error)
		if (!user) throw401(73929, emsg.userNotFound)

		// if there is user, email not confirmed
		if (!user.confirmedEmail) throw403(5934323, emsg.noAuthz)
		// if there is user, but it's not able it's forbidden (403 error)
		if (user.status !== "active") throw403(69392, emsg.noAuthz)
		return user
	}

	ensureUserIsActive<T extends User>(user?: T | null): T {
		// if there is no user, it's not able to authorize (401 error)
		if (!user) throw401(53909, emsg.userNotFound)

		// if there is user, email not confirmed
		if (!user.confirmedEmail) throw403(59323, emsg.noAuthz)
		// if there is user, but it's not able it's forbidden (403 error)
		if (user.status !== "active") throw403(69392, emsg.noAuthz)
		return user
	}

	async createUserFactory(data: Struct): Promise<UserWithSecret> {
		const validUser = zodCreate(UserSchema, data as any)
		const passwordHash = await this.encryptionService.hash(validUser.password)
		validUser.password = passwordHash
		return validUser
	}

	/**
	 * Create new user
	 *
	 * @param user User data
	 * @param password We must specially pass password here, only from api. User can never
	 * change other user password. This is used for API, when first registering user
	 * @param em Transaction
	 * @returns Created user
	 */
	async createUser({
		data,
		id,
		trx,
	}: {
		data: UserCreateDto
		id?: string
		trx?: Transaction
	}): Promise<User> {
		const validUser = await this.createUserFactory(data)
		if (id) {
			validUser.id = id
		}
		return this.repo.createOne({
			data: omit(validUser, ["createdAt"]),
			trx: trx,
		})
	}

	/**
	 * Update user
	 * This accepts all values and is meant for internal use. For
	 * changing user info based on user input, use `ProfileModule`
	 */
	async updateUser({
		userId,
		data,
		trx,
	}: {
		userId: string
		data: UserUpdateDto
		trx?: Transaction
	}): Promise<User> {
		return this.repo.updateById({ id: userId, changes: data, trx })
	}

	/**
	 * Change user's password
	 */
	async setPassword(params: {
		userId: string
		newPassword: string
		trx?: Transaction
	}): Promise<void> {
		const { newPassword, userId, trx } = params
		const password = await this.encryptionService.hash(newPassword)
		await this.repo.updateWhere({
			changes: { password },
			where: userId,
			overrideCanUpdate: true,
			trx,
		})
	}

	async checkPasswordHash(hash: string, password: string): Promise<boolean> {
		return this.encryptionService.verifyHash(hash, password.trim())
	}

	async checkPassword({
		userId,
		password,
		trx,
	}: {
		userId: string
		password: string
		trx?: Transaction
	}): Promise<boolean> {
		const user = await this.findUserWithHiddenFields({ id: userId }, trx)

		if (!user) return false

		return this.encryptionService.verifyHash(user.password, password.trim())
	}

	/**
	 * Change user's password if old password matches and new password is valid
	 */
	async tryChangePassword(params: {
		user: AuthUser
		data: UserUpdatePasswordDto
		trx?: Transaction
	}): Promise<void> {
		const { data, user, trx } = params
		const valid = await this.checkPassword({
			userId: user.userId,
			password: data.oldPassword,
			trx,
		})
		if (!valid) throw400(967123, emsg.invalidPassword)
		await this.setPassword({ userId: user.userId, newPassword: data.newPassword, trx })
	}
}
