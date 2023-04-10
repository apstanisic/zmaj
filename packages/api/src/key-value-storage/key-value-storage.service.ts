import { OrmRepository } from "@zmaj-js/orm"
import { RepoManager } from "@zmaj-js/orm"
import { Transaction } from "@zmaj-js/orm"
import { Injectable } from "@nestjs/common"
import {
	ignoreErrors,
	isStruct,
	KeyValue,
	KeyValueCollection,
	KeyValueSchema,
	Struct,
	zodCreate,
} from "@zmaj-js/common"
import { z } from "zod"

@Injectable()
export class KeyValueStorageService {
	private repo: OrmRepository<KeyValue>
	constructor(private readonly repoManager: RepoManager) {
		this.repo = this.repoManager.getRepo(KeyValueCollection)
	}

	/**
	 * Don't use repo, use custom methods because that method parsed result
	 */

	async findByKey(
		key: string,
		namespace: string | null = null,
		options: { trx?: Transaction } = {},
	): Promise<KeyValue | undefined> {
		return this.repo.findOne({
			where: { key, namespace: namespace },
			trx: options.trx,
		})
	}

	async findAndCast<T>(params: {
		key: string
		namespace: string | null
		trx?: Transaction
		cast: (v: KeyValue) => T
	}): Promise<{ raw: KeyValue; casted: T } | undefined> {
		const raw = await this.findByKey(params.key, params.namespace ?? null, { trx: params.trx })
		if (!raw) return undefined
		try {
			const casted = params.cast(raw)
			return { raw, casted }
		} catch (error) {
			return undefined
		}
	}

	castValue<T>(val: KeyValue, cast: (v: Struct) => T): T | null {
		const asJSON = ignoreErrors(() => JSON.parse(val.value ?? "null"))
		if (!isStruct(asJSON)) return null
		return cast(asJSON)
	}

	/**
	 * Store new key value pair in database
	 * @param data
	 * @param em It accepts EntityManager in case it's in transaction
	 */
	async create(data: z.input<typeof KeyValueSchema>, trx?: Transaction): Promise<KeyValue> {
		const keyVal = zodCreate(KeyValueSchema, data)

		const saved = await this.repo.createOne({ data: keyVal, trx })
		return saved
	}

	async updateOrCreate(data: z.input<typeof KeyValueSchema>, trx?: Transaction): Promise<KeyValue> {
		const exist = await this.repo.findOne({
			where: { key: data.key, namespace: data.namespace },
		})

		if (exist) {
			return this.repo.updateById({
				id: exist.id,
				changes: { value: data.value, updatedAt: new Date() },
				trx,
			})
		} else {
			return this.create(data, trx)
		}
	}

	/**
	 * Key and namespace are composite unique
	 */
	async delete(
		key: string,
		namespace: string | null = null,
		options: { trx?: Transaction } = {},
	): Promise<KeyValue | undefined> {
		const deleted = await this.repo.deleteWhere({
			where: { key, namespace: namespace },
			trx: options.trx,
		})
		return deleted[0]
	}
}
