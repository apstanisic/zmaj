import {
	Comparison,
	Struct,
	getFirstKey,
	getFirstProperty,
	isIdType,
	isNil,
	isStruct,
} from "@zmaj-js/common"
import {
	BaseModel,
	CountOptions,
	CreateParams,
	DeleteManyParams,
	FindAndCountOptions,
	FindManyOptions,
	FkDeleteError,
	IdType,
	InternalOrmProblem,
	NoFieldsSelectedError,
	NoPropertyError,
	OrmRepository,
	PojoModel,
	RawQueryOptions,
	RepoFilter,
	ReturnedProperties,
	SelectProperties,
	UndefinedModelError,
	UniqueError,
	UpdateManyOptions,
} from "@zmaj-js/orm"
import { get, isEmpty, mapValues, set } from "radash"
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
	constructor(
		private orm: SequelizeService,
		pojoModel: PojoModel,
	) {
		super(pojoModel)
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
	async findWhere<
		TFields extends SelectProperties<TModel> | undefined = undefined,
		TIncludeHidden extends boolean = false,
	>(
		params: FindManyOptions<TModel, TFields, TIncludeHidden>,
	): Promise<ReturnedProperties<TModel, TFields, TIncludeHidden>[]> {
		const raw = params.includeHidden === true
		const filterAndFields = this.filterAndFields(params.where, params.fields)

		const res = await this.sequelizeModel.findAll({
			raw,
			limit: params.limit,
			offset: params.offset,
			order: Object.entries(params.orderBy ?? {}) as any,
			transaction: params.trx as any,
			...filterAndFields,
		})

		if (raw) return res as any[] as ReturnedProperties<TModel, TFields, TIncludeHidden>[]

		return res.map((r) => r.get({ plain: true })) as ReturnedProperties<
			TModel,
			TFields,
			TIncludeHidden
		>[]
	}

	/**
	 *
	 */
	async findAndCount<
		TFields extends SelectProperties<TModel> | undefined = undefined,
		TIncludeHidden extends boolean = false,
	>(
		params: FindAndCountOptions<TModel, TFields, TIncludeHidden>,
	): Promise<[ReturnedProperties<TModel, TFields, TIncludeHidden>[], number]> {
		const fieldsAndFilter = this.filterAndFields(params.where, params.fields)

		const res = await this.sequelizeModel.findAndCountAll({
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
			res.rows.map((r) => r.get({ plain: true })) as ReturnedProperties<
				TModel,
				TFields,
				TIncludeHidden
			>[],
			res.count, //
		]
	}

	/**
	 *
	 */
	async count(params: CountOptions<TModel>): Promise<number> {
		const fieldsAndFilter = this.filterAndFields(params.where)
		const res = await this.sequelizeModel.count({
			transaction: params.trx as any,
			where: fieldsAndFilter.where,
			include: fieldsAndFilter.include,
		})
		return res
	}

	/**
	 *
	 */
	async createMany<OverrideCanCreate extends boolean>(
		params: CreateParams<TModel, OverrideCanCreate, "many">,
	): Promise<ReturnedProperties<TModel, undefined>[]> {
		const parsed = this.parseCreateData(params.data, params.overrideCanCreate)
		try {
			const created = await this.sequelizeModel.bulkCreate(
				parsed, //
				{ transaction: params.trx as any },
			)
			// Must find since SQLite does not return all data (data that has default value)
			// TODO Maybe add check for PG
			return this.findWhere({ where: created.map((c) => c.getDataValue(this.pk)) })
			// return created.map((v) => v.get({ plain: true }))
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
	async updateWhere<OverrideCanUpdate extends boolean>(
		params: UpdateManyOptions<TModel, OverrideCanUpdate>,
	): Promise<ReturnedProperties<TModel, undefined, false>[]> {
		const changes = this.parseUpdateData(params.changes, params.overrideCanUpdate)

		// TODO Can I do this without this find?
		const rows = await this.findWhere({
			trx: params.trx,
			where: params.where,
			// get only ids
			fields: { [this.pk]: true } as any,
		})

		const ids = rows.map((r) => r[this.pk]) as IdType[]

		await this.sequelizeModel.update(changes as any, {
			transaction: params.trx as any,
			where: this.parseFilter(ids).where,
			// This has support only for PG, I want to try to support more engines
			// returning: true
		})
		return this.findWhere<undefined>({ where: ids, trx: params.trx })
	}

	/**
	 *
	 */
	async deleteWhere(
		params: DeleteManyParams<TModel>,
	): Promise<ReturnedProperties<TModel, undefined>[]> {
		// return all top level fields, this values will be returned
		const toDelete = await this.findWhere({
			trx: params.trx,
			where: params.where,
		})
		const ids = toDelete.map((row) => row[this.pk]) as IdType[]
		await this.sequelizeModel
			.destroy({ where: this.parseFilter(ids).where, transaction: params.trx as any })
			.catch((e) => {
				if (e instanceof ForeignKeyConstraintError) throw new FkDeleteError()
				throw e
			})

		return toDelete as any as ReturnedProperties<TModel, undefined>[]
	}

	/**
	 * We do not want to have model reference, since model will change when schema is changed,
	 * and we do not want to keep track. SO we use dynamic getter.
	 */
	private get sequelizeModel(): ModelStatic<Model<any, any>> {
		const model = this.orm.models[this.pojoModel.name]
		if (!model) throw new InternalOrmProblem(3910)
		return model
	}

	private filterAndFields(
		where?: RepoFilter<TModel> | IdType[] | IdType,
		fields?: SelectProperties<TModel>,
	): Pick<IncludeOptions, "attributes" | "include" | "association" | "through" | "where"> {
		const whereResult = this.parseFilter(where)

		const fieldsAndRelations = this.parseFields({
			// fields: params.fields,
			fields: fields,
			collection: this.pojoModel.name,
			filterRelations: whereResult.toAdd,
		})
		return { where: whereResult.where, ...fieldsAndRelations }
	}

	private parseFilter(where?: RepoFilter<TModel> | IdType[] | IdType): {
		where: WhereOptions<any>
		toAdd?: string[]
	} {
		if (isIdType(where)) {
			return { where: { [this.pk]: { [Op.eq]: where } } as WhereOptions<TModel> }
		} else if (Array.isArray(where)) {
			return { where: { [this.pk]: { [Op.in]: where } } as any as WhereOptions<TModel> }
		} else {
			return this.parseWhereFilter(where ?? {}, this.sequelizeModel)
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
	private parseFields<F extends SelectProperties<TModel> | undefined>({
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
		// if it's nill, default to all fields
		fields = isNil(fields) ? ({ $fields: true } as never) : structuredClone(fields ?? ({} as F))

		const model = this.orm.models[collection] // ?? throw500(378324, emsg.noModel(collection))
		if (!model) throw new UndefinedModelError(collection, 3001)
		// if fields is empty, get all columns
		// we need to specify here, since if filter add join, we don't know what fields to fetch
		// so if it's empty, get all
		if (JSON.stringify(fields) === "{}") {
			throw new NoFieldsSelectedError(93000)
		}
		if (fields?.$fields) {
			// `getAttributes` returns column property as key, and it's data.
			// we are simply taking all property names and settings them to true
			// if $fields, we can have other relations
			fields = {
				...fields, // This will contain other relations
				...(mapValues(model.getAttributes(), () => true) as F), // all fields are set to true
			}
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
			// if $fields, get all fields
			if (property === "$fields") {
				attributes.push(...Object.keys(fieldsMeta))
				continue
			}
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
					if (
						isStruct(val) &&
						Object.hasOwn(symbolComparisons, getFirstKey(val) ?? "_")
					) {
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
