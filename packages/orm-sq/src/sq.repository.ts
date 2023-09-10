import {
	Comparison,
	IdArraySchema,
	Struct,
	filterStruct,
	getFirstKey,
	getFirstProperty,
	isIdType,
	isNil,
	isStruct,
	notNil,
} from "@zmaj-js/common"
import {
	BaseModel,
	CountOptions,
	CreateParams,
	CrudFilter,
	CursorPaginationResponse,
	DeleteByIdParams,
	DeleteManyParams,
	FindAndCountOptions,
	FindByIdOptions,
	FindManyCursor,
	FindManyOptions,
	FindOneOptions,
	FkDeleteError,
	IdType,
	InternalOrmProblem,
	NoPropertyError,
	OrmRepository,
	PaginatedResponse,
	RawQueryOptions,
	RecordNotFoundError,
	ReturnedFields,
	SelectFields,
	UndefinedModelError,
	UniqueError,
	UpdateManyOptions,
	UpdateOneOptions,
	ZmajOrmError,
} from "@zmaj-js/orm-engine"
import { get, isArray, isEmpty, mapValues, pick, set } from "radash"
import {
	ForeignKeyConstraintError,
	IncludeOptions,
	Model,
	ModelStatic,
	Op,
	UniqueConstraintError,
	WhereOptions,
} from "sequelize"
import { SequelizeService } from "./sq.service"

const symbolComparisons: Record<Comparison | "$and" | "$or", symbol> = {
	$eq: Op.eq,
	$gt: Op.gt,
	$gte: Op.gte,
	$in: Op.in,
	$like: Op.like,
	$lt: Op.lt,
	$lte: Op.lte,
	$ne: Op.ne,
	$nin: Op.notIn,
	$and: Op.and,
	$or: Op.or,
}
export class SequelizeRepository<
	TModel extends BaseModel = BaseModel,
> extends OrmRepository<TModel> {
	// collectionName: string
	constructor(private orm: SequelizeService, private collectionName: string) {
		//private modelConfig: ModelConfig) {
		super()
		// this.collectionName = modelConfig.collectionName
	}

	/**
	 *
	 */
	async rawQuery(query: string, params?: RawQueryOptions): Promise<unknown> {
		const res = await this.orm.rawQuery(query, params)
		return res
	}

	/**
	 *
	 */
	async findOne<
		TFields extends SelectFields<TModel> | undefined = undefined,
		TIncludeHidden extends boolean = false,
	>(
		params: FindOneOptions<TModel, TFields, TIncludeHidden>,
	): Promise<ReturnedFields<TModel, TFields, TIncludeHidden> | undefined> {
		const [item] = await this.findWhere({
			trx: params.trx,
			fields: params.fields,
			orderBy: params.orderBy,
			where: params.where,
			limit: 1,
			includeHidden: params.includeHidden,
		})
		return item
	}

	/**
	 *
	 */
	async findOneOrThrow<
		TFields extends SelectFields<TModel> | undefined = undefined,
		TIncludeHidden extends boolean = false,
	>(
		params: FindOneOptions<TModel, TFields, TIncludeHidden>,
	): Promise<ReturnedFields<TModel, TFields, TIncludeHidden>> {
		const item = await this.findOne(params)
		if (!item) throw new RecordNotFoundError(this.model.name)
		return item
		// return item ?? throw404(532125, emsg.recordNotFound)
	}

	/**
	 *
	 */
	async findById<
		TFields extends SelectFields<TModel> | undefined = undefined,
		TIncludeHidden extends boolean = false,
	>(
		params: FindByIdOptions<TModel, TFields, TIncludeHidden>,
	): Promise<ReturnedFields<TModel, TFields, TIncludeHidden>> {
		const res = await this.findOneOrThrow({
			fields: params.fields,
			trx: params.trx,
			where: params.id,
			includeHidden: params.includeHidden,
		})
		return res
	}

	/**
	 *
	 */
	async findWhere<
		TFields extends SelectFields<TModel> | undefined = undefined,
		TIncludeHidden extends boolean = false,
	>(
		params: FindManyOptions<TModel, TFields, TIncludeHidden>,
	): Promise<ReturnedFields<TModel, TFields, TIncludeHidden>[]> {
		const raw = params.includeHidden === true
		const filterAndFields = this.filterAndFields(params.where, params.fields)

		const res = await this.model.findAll({
			raw,
			limit: params.limit,
			offset: params.offset,
			order: Object.entries(params.orderBy ?? {}) as any,
			transaction: params.trx as any,
			...filterAndFields,
		})

		if (raw) return res as any[] as ReturnedFields<TModel, TFields, TIncludeHidden>[]

		return res.map((r) => r.get({ plain: true })) as ReturnedFields<
			TModel,
			TFields,
			TIncludeHidden
		>[]
	}

	/**
	 *
	 */
	async findAndCount<
		TFields extends SelectFields<TModel> | undefined = undefined,
		TIncludeHidden extends boolean = false,
	>(
		params: FindAndCountOptions<TModel, TFields, TIncludeHidden>,
	): Promise<[ReturnedFields<TModel, TFields, TIncludeHidden>[], number]> {
		const fieldsAndFilter = this.filterAndFields(params.where, params.fields)

		const res = await this.model.findAndCountAll({
			transaction: params.trx as any,
			limit: params.limit,
			offset: params.offset,
			order: Object.entries(params.orderBy ?? {}) as any,
			...fieldsAndFilter,
			// where: this.parseWhere(params.where).where,
			// include: fieldsAndRelations.include,
			// attributes: fieldsAndRelations.attributes,
		})
		return [
			res.rows.map((r) => r.get({ plain: true })) as ReturnedFields<
				TModel,
				TFields,
				TIncludeHidden
			>[],
			res.count, //
		]
	}

	paginate<
		TFields extends SelectFields<TModel> | undefined = undefined,
		TIncludeHidden extends boolean = false,
	>(
		params: FindManyOptions<TModel, TFields, TIncludeHidden>,
	): Promise<PaginatedResponse<ReturnedFields<TModel, TFields, TIncludeHidden>>> {
		throw new ZmajOrmError("Not implemented")
	}

	cursor<
		TFields extends SelectFields<TModel> | undefined = undefined,
		TIncludeHidden extends boolean = false,
	>(
		params: FindManyCursor<TModel, TFields, TIncludeHidden>,
	): Promise<CursorPaginationResponse<ReturnedFields<TModel, TFields, TIncludeHidden>>> {
		throw new ZmajOrmError("Not implemented")
	}

	/**
	 *
	 */
	async count(params: CountOptions<TModel>): Promise<number> {
		const fieldsAndFilter = this.filterAndFields(params.where)
		const res = await this.model.count({
			transaction: params.trx as any,
			where: fieldsAndFilter.where,
			include: fieldsAndFilter.include,
		})
		return res
	}

	/**
	 *
	 */
	async createOne<OverrideCanCreate extends boolean>(
		params: CreateParams<TModel, OverrideCanCreate, "one">,
	): Promise<ReturnedFields<TModel, undefined>> {
		const result = await this.createMany({ data: [params.data], trx: params.trx })
		if (result.length !== 1) throw new InternalOrmProblem(39534) //throw500(39534)
		return result[0]!
	}

	/**
	 *
	 */
	async createMany<OverrideCanCreate extends boolean>(
		params: CreateParams<TModel, OverrideCanCreate, "many">,
	): Promise<ReturnedFields<TModel, undefined>[]> {
		try {
			// do not pass null values when creating record, since that replaces default value
			// idk why sequelize sends it. On update, it should work normally
			const data = this.getWritableData("create", params.data as any[]) //
				.map((row) => filterStruct(row, (v) => notNil(v)))

			const created = await this.model.bulkCreate(data as any[], {
				transaction: params.trx as any, //
			})
			return created.map((v) => v.get({ plain: true }))
		} catch (error) {
			if (error instanceof UniqueConstraintError) {
				throw new UniqueError(error, 3012)
			}

			throw new InternalOrmProblem(93100, error)
		}
	}

	/**
	 *
	 */
	async updateById<OverrideCanUpdate extends boolean>(
		params: UpdateOneOptions<TModel, OverrideCanUpdate>,
	): Promise<ReturnedFields<TModel, undefined>> {
		const [updated] = await this.updateWhere({
			trx: params.trx,
			changes: params.changes,
			where: params.id,
		})
		if (!updated) throw new RecordNotFoundError(this.model.name, params.id)
		return updated
	}

	/**
	 *
	 */
	async updateWhere<OverrideCanUpdate extends boolean>(
		params: UpdateManyOptions<TModel, OverrideCanUpdate>,
	): Promise<ReturnedFields<TModel, undefined, false>[]> {
		const changes = params.overrideCanUpdate
			? params.changes
			: this.getWritableData("update", params.changes)

		// do nothing if no change is passed
		if (Object.keys(changes).length === 0) {
			return this.findWhere<undefined>({ where: params.where, trx: params.trx, fields: undefined })
		}

		const rows = await this.findWhere({
			trx: params.trx,
			where: params.where,
			// get only ids
			fields: { [this.pk]: true } as any,
		})

		const ids = this.getIdsFromRows(rows)

		await this.model.update(changes as any, {
			transaction: params.trx as any,
			where: this.parseFilter(ids).where,
			// fields: this.getNonReadonlyFields("update", params.overrideCanUpdate),
		})
		return this.findWhere<undefined>({ where: ids, trx: params.trx })
	}

	/**
	 *
	 */
	async deleteById(params: DeleteByIdParams<TModel>): Promise<ReturnedFields<TModel, undefined>> {
		const [deleted] = await this.deleteWhere({
			trx: params.trx,
			where: params.id,
		})
		if (!deleted) throw new RecordNotFoundError(this.model.name, params.id)
		return deleted
	}

	/**
	 *
	 */
	async deleteWhere(
		params: DeleteManyParams<TModel>,
	): Promise<ReturnedFields<TModel, undefined>[]> {
		// return all top level fields
		const res = await this.findWhere({
			trx: params.trx,
			where: params.where,
		})
		const ids = this.getIdsFromRows(res)
		await this.model
			.destroy({ where: this.parseFilter(ids).where, transaction: params.trx as any })
			.catch((e) => {
				if (e instanceof ForeignKeyConstraintError) throw new FkDeleteError()
				throw e
			})

		return res as any as ReturnedFields<TModel, undefined>[]
	}

	private getWritableData<T extends Struct | Struct[]>(action: "update" | "create", data: T): T {
		const fields = this.getNonReadonlyFields(action)
		return (
			isArray(data)
				? data.map((item) => pick(item, fields)) //
				: pick(data as Struct, fields)
		) as T
	}

	/**
	 * Find way to memoize this. Model is getter, so we have to pass it as param,
	 * and that model should have some kinda id. It also didn't work for second param, idk why
	 */
	private getNonReadonlyFields(
		action: "update" | "create",
		overrideHidden: boolean = false,
	): string[] {
		return Object.entries(this.model.getAttributes())
			.filter(([_, attribute]) => {
				if (overrideHidden) return true
				const forbidden: boolean =
					attribute.comment?.includes(
						action === "create" ? "CAN_CREATE=false" : "CAN_UPDATE=false",
					) ?? false
				return !forbidden
			})
			.map(([fieldName]) => fieldName)
	}

	/**
	 * Get only pks from records
	 */
	private getIdsFromRows<Id extends IdType = IdType>(rows: Struct[]): Id[] {
		return IdArraySchema.parse(rows.map((row) => get(row, this.pk) ?? undefined)) as Id[]
	}

	/**
	 * We do not want to have model reference, since model will change schema is changed,
	 * and we do not want to keep track
	 */
	private get model(): ModelStatic<Model<any, any>> {
		const model = this.orm.models[this.collectionName]
		if (!model) throw new InternalOrmProblem(3910)
		return model
		// return (
		// 	this.orm.models[this.collectionName] ?? throw500(19732, emsg.noModel(this.collectionName))
		// )
	}

	get pk(): string {
		return this.model.primaryKeyAttribute
		// const pks = this.model.modelDefinition.primaryKeysAttributeNames
		// const [pk, ...rest] = pks
		// if (pk === undefined) throw500(398991)
		// if (rest.length > 0) throw500(97992)
		// return pk
	}

	private filterAndFields(
		where?: CrudFilter<TModel> | IdType[] | IdType,
		fields?: SelectFields<TModel>,
	): Pick<IncludeOptions, "attributes" | "include" | "association" | "through" | "where"> {
		const whereResult = this.parseFilter(where)

		const fieldsAndRelations = this.parseFields({
			// fields: params.fields,
			fields: fields,
			collection: this.collectionName,
			filterRelations: whereResult.toAdd,
		})
		return { where: whereResult.where, ...fieldsAndRelations }
	}

	private parseFilter(where?: CrudFilter<TModel> | IdType[] | IdType): {
		where: WhereOptions<any>
		toAdd?: string[]
	} {
		if (isIdType(where)) {
			return { where: { [this.pk]: { [Op.eq]: where } } as WhereOptions<TModel> }
		} else if (Array.isArray(where)) {
			return { where: { [this.pk]: { [Op.in]: where } } as any as WhereOptions<TModel> }
		} else {
			return this.parseWhereFilter(where ?? {}, this.model)
		}
	}

	/**
	 *
	 * @param params.fields Fields to get
	 * @param params.table Table for which current fields are tied to
	 * @param params.filterRelations Relation that need to be in filter, because we have to join
	 * to have filter working.
	 * Format is: for `posts` table, it will be `comments`, `user.role.id`...
	 * @param params.property Property at which data will be attached (undefined for root)
	 * @returns Properties that can be provided to sequelize
	 */
	private parseFields<F extends SelectFields<TModel> | undefined>({
		fields,
		collection,
		property,
		filterRelations,
	}: // subQuery,
	{
		fields: F
		collection: string
		property?: string
		filterRelations?: string[]
		// subQuery?: boolean
	}): Pick<IncludeOptions, "attributes" | "include" | "association" | "through"> {
		// clone since filter relations will mutate this value
		fields = structuredClone(fields ?? ({} as F))

		const model = this.orm.models[collection] // ?? throw500(378324, emsg.noModel(collection))
		if (!model) throw new UndefinedModelError(collection, 3001)
		// if fields is empty, get all columns
		// we need to specify here, since if filter add join, we don't know what fields to fetch
		// so if it's empty, get all
		if (isEmpty(fields) || fields?.$fields) {
			// `getAttributes` returns column property as key, and it's data.
			// we are simply taking all property names and settings them to true
			fields = mapValues(model.getAttributes(), (v) => true) as F
		}
		filterRelations?.forEach((relation) => {
			const alreadyAdded = get(fields, relation)

			if (isNil(alreadyAdded)) {
				fields = set(fields!, relation, {})
			}
		})

		const attributes: string[] = []
		const include: IncludeOptions[] = []

		const fieldsMeta = model.getAttributes()

		// delete fields!.$subQuery
		for (const [property, value] of Object.entries(fields!)) {
			// field property is not relation, simply add to attributes (fields)
			const isField = fieldsMeta[property]
			if (isField) {
				attributes.push(property)
				continue
			}

			// property must be relation, or invalid param
			const relMeta = model.associations[property] // ?? throw400(578932, emsg.noProperty)
			if (!relMeta) throw new NoPropertyError(property, 1490)
			// get relation type
			const relType = relMeta.associationType

			// TODO document why
			const shouldSubQuery = filterRelations?.includes(property)

			// we tell sq what relation we want to include
			const rel: IncludeOptions = {
				association: property,
			}
			// if value is true, it means all default
			if (value === true) {
				//
			}
			// if value is object, get no data. It's usually used to filter nested relations,
			// we need to include them in "join"
			else if (isEmpty(value)) {
				rel.attributes = []
			} else {
				// if some fields are specified, we need to recursively check for normal field and relations
				const deep = this.parseFields({
					fields: value as any,
					collection: relMeta.target.name,
					property: relMeta.as,
					filterRelations: filterRelations
						?.filter((r) => r.includes("."))
						.map((r) => r.substring(0, r.indexOf("."))),
				})
				rel.association = deep.association
				rel.attributes = deep.attributes
				rel.include = deep.include
			}
			// if relation is m2m, we do not want to get data from junction table
			if (relType === "BelongsToMany") {
				rel.through = { attributes: [] }
			}

			// https://github.com/sequelize/sequelize/issues/12971
			// when limit is provided, deep filtering only works if it's subquery
			if (shouldSubQuery) {
				rel.subQuery = true
			}
			include.push(rel)
		}

		return { include, attributes, association: property }
	}
	private parseWhereFilter(
		where: Struct,
		model: ModelStatic<Model<TModel, Partial<TModel>>>,
		prefix = "",
	): { where: WhereOptions; toAdd: string[] } {
		const cloned: Struct = {}
		const toAdd = <string[]>[]
		for (const [key, val] of Object.entries(where)) {
			// ignore filter if value is undefined
			if (val === undefined) continue
			//
			if (key === "$or" || key === "$and") {
				// $or: [...]
				const symbolComp: any = symbolComparisons[key]
				cloned[symbolComp] = (val as Struct[]).map((item) => {
					const res = this.parseWhereFilter(item, model, prefix)
					toAdd.push(...res.toAdd)
					return res.where
				})
			} else {
				const isRel = model.associations[key]
				if (isRel) {
					const together = prefix !== "" ? [prefix, key].join(".") : key
					const parsed = this.parseWhereFilter(val as any, isRel.target, together)
					toAdd.push(...parsed.toAdd)
					for (const nest of Object.entries(parsed.where)) {
						cloned[nest[0]] = nest[1]
					}
				} else {
					const fields = model.getAttributes()
					const field = fields[key as keyof typeof fields]
					const columnKey = field?.field // ?? throw400(37428, emsg.noProperty)
					if (!columnKey) throw new NoPropertyError(columnKey)
					const together = prefix !== "" ? [prefix, columnKey].join(".") : key
					if (prefix !== "") toAdd.push(together.slice(0, together.lastIndexOf(".")))

					const forSq = prefix === "" ? key : `$${together}$`
					if (isStruct(val) && Object.hasOwn(symbolComparisons, getFirstKey(val) ?? "_")) {
						const [comp, compValue] = getFirstProperty(val)!
						cloned[forSq] = { [symbolComparisons[comp as never]]: compValue }
					} else {
						cloned[forSq] = val
					}
				}
			}
		}

		/**
		 * I THINK HERE IS THE PROBLEM
		 */

		// return { where: convertFilterComparisons(cloned) as any, toAdd }
		return { where: cloned as any, toAdd }
	}
}
