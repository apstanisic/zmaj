import { notNil } from "@zmaj-js/common"
import {
	CompositeUniqueKey,
	DbColumn,
	ForeignKey,
	GetColumnParams,
	GetColumnsParams,
	GetCompositeUniqueKeysParams,
	GetForeignKeyParams,
	GetForeignKeysParams,
	GetPrimaryKeyParams,
	GetSingleUniqueKeysParams,
	GetTableNamesParams,
	GetUniqueKeysParams,
	HasColumnParams,
	HasTableParams,
	SchemaInfoService,
	SingleUniqueKey,
	TableHasNoPkError,
	UniqueKey,
	ZmajOrmError,
} from "@zmaj-js/orm"
import { SequelizeService } from "../sq.service"

type PgColumn = {
	schemaName: string
	tableName: string
	columnName: string
	defaultValue: string
	dataType: string
	nullable: boolean
	autoIncrement: boolean
	primaryKey: boolean
	unique: boolean
	comment: string | null
}

const onDeleteMapper = {
	a: "NO ACTION",
	r: "RESTRICT",
	c: "CASCADE",
	n: "SET NULL",
	d: "SET DEFAULT",
} as const

type PgFk = {
	sourceTable: string
	sourceColumn: string
	targetTable: string
	targetColumn: string
	keyName: string
	// Foreign key update action code: a = no action, r = restrict, c = cascade, n = set null, d = set default
	onDelete: "a" | "r" | "c" | "n" | "d"
	// Foreign key deletion action code: a = no action, r = restrict, c = cascade, n = set null, d = set default
	onUpdate: "a" | "r" | "c" | "n" | "d"
	dataType: string
	notNullable: boolean
	unique: boolean
}

export class SequelizeSchemaInfoService implements SchemaInfoService {
	constructor(private sq: SequelizeService) {}

	// https://stackoverflow.com/a/24089729
	async hasTable(params: HasTableParams): Promise<boolean> {
		const { table, ...other } = params
		if (!table) throw new ZmajOrmError("Missing table name", 59399)

		const query = `
		select
		  count(pt.tablename) = 1 as "exists"
		from
		  pg_catalog.pg_tables pt
		where
		  schemaname =  $1
		  and tablename = $2
		;
		`
		const result: [{ exists: boolean }] = (await this.sq.rawQuery(query, {
			params: [other?.schema ?? "public", table],
			trx: other?.trx,
		})) as any
		return result[0].exists
	}
	async hasColumn(params: HasColumnParams): Promise<boolean> {
		const { table, column, ...other } = params
		/* cSpell:disable */
		const query = `
        select
           count(attname) = 1 as "exists"
         from
           pg_catalog.pg_attribute pa
           join pg_catalog.pg_class pc on pa.attrelid = pc.oid
         where
           attrelid = $table_name :: regclass
           and pc.relnamespace = $schema_name :: regnamespace
           and pa.attname = $column_name
           and attnum > 0
           and not attisdropped
        ;
        `
		/* cSpell:enable */

		const result: [{ exists: boolean }] = (await this.sq.rawQuery(query, {
			params: {
				schema_name: other?.schema ?? "public", //
				table_name: table,
				column_name: column,
			},
			trx: other?.trx,
		})) as any

		return result[0].exists
	}
	async getTableNames(params?: GetTableNamesParams): Promise<string[]> {
		const pgNative = `
        select
            pt.tablename as "tableName"
        from
            pg_catalog.pg_tables pt
        where
            schemaname = $1
        ;
        `

		const result: [{ tableName: string }] = (await this.sq.rawQuery(pgNative, {
			params: [params?.schema ?? "public"],
			trx: params?.trx,
		})) as any

		return result.map((r) => r.tableName)
	}

	async getColumns(params?: GetColumnsParams): Promise<Readonly<DbColumn>[]> {
		/* cSpell:disable */
		const query = `
        select
            pg_get_expr(d.adbin, d.adrelid) as "defaultValue",
            attrelid :: regclass as "tableName",
            attname as "columnName",
            atttypid :: regtype as "dataType",
            not a.attnotnull as "nullable",
            pc.relnamespace :: regnamespace as "schemaName",
            pg_get_serial_sequence(a.attrelid :: regclass :: text, a.attname) is not null as "autoIncrement",
            i.indisprimary is not null as "primaryKey",
			uc.contype is not null or i.indisprimary is not null as "unique",
			col_description(a.attrelid , a.attnum) as "comment"
          from
            pg_catalog.pg_attribute a
          left join pg_catalog.pg_attrdef d on (a.attrelid, a.attnum) = (d.adrelid, d.adnum)
          join pg_catalog.pg_class pc on pc.oid = a.attrelid
            and pc.relkind = 'r'
          left join pg_catalog.pg_index i on a.attrelid = i.indrelid
            and a.attnum = any(i.indkey)
            and i.indisprimary
		  left join pg_catalog.pg_constraint uc on
			attrelid = uc.conrelid
			and uc.contype = 'u'
			and cardinality(uc.conkey) = 1
			and attnum = uc.conkey[1]
          where
            not a.attisdropped -- no dropped (dead) columns
            and a.attnum > 0 -- no system columns
            and pc.relnamespace = $schema_name :: regnamespace
            ${params?.table ? "and a.attrelid = $table_name::regclass" : ""}
            ${params?.column ? "and a.attname = $column_name" : ""}
            ;
            `
		/* cSpell:enable */
		const result: PgColumn[] = (await this.sq.rawQuery(query, {
			params: {
				schema_name: params?.schema ?? "public", //
				table_name: params?.table,
				column_name: params?.column,
			},
			trx: params?.trx,
		})) as any

		return result.map((v) => ({
			autoIncrement: v.autoIncrement,
			columnName: v.columnName, //maybe trim(v, '"') since pg treats differently upper case
			dataType: v.dataType,
			defaultValue: v.defaultValue,
			nullable: v.nullable,
			tableName: v.tableName, //maybe trim(v, '"') since pg treats differently upper case
			primaryKey: v.primaryKey,
			schemaName: v.schemaName,
			unique: v.unique,
			comment: v.comment ?? undefined,
		}))
	}

	async getColumn(options: GetColumnParams): Promise<Readonly<DbColumn> | undefined> {
		const columns = await this.getColumns(options)
		return columns[0]
	}

	async getPrimaryKey(params: GetPrimaryKeyParams): Promise<DbColumn> {
		const { table: tableName, ...shared } = params
		/* cSpell:disable */
		const query = `
        select
          a.attname as "columnName"
        from
          pg_index i
          join pg_attribute a on a.attrelid = i.indrelid
          and a.attnum = any(i.indkey)
          join pg_catalog.pg_class pc on pc.oid = a.attrelid
        where
          i.indisprimary
          and pc.relnamespace = $1 :: regnamespace
          and i.indrelid = $2 :: regclass
    	;
        `
		/* cSpell:enable */
		const result: [{ columnName: string }] | [] = (await this.sq.rawQuery(query, {
			trx: shared?.trx,
			params: [shared?.schema ?? "public", tableName],
		})) as any
		if (result.length === 0) throw new TableHasNoPkError(tableName)
		const columnName = result[0].columnName
		const column = await this.getColumn({ table: tableName, column: columnName, ...shared })
		return column!
	}

	async getForeignKeys(options?: GetForeignKeysParams): Promise<ForeignKey[]> {
		/* cSpell:disable */
		// "la" is where fk is located, "ra" is where fk points to
		// "c" is where info about fk is located
		const query = `
        select
           la.attrelid ::regclass as "sourceTable",
           la.attname as "sourceColumn",
           ra.attrelid ::regclass as "targetTable",
           ra.attname as "targetColumn",
           c.confdeltype as "onDelete",
           c.confupdtype as "onUpdate",
           c.conname as "keyName",
           la.atttypid ::regtype as "dataType",
           la.attnotnull as "notNullable",
		   uc.contype is not null and uc.contype = 'u' as "unique"
        from
           pg_constraint as c
        join pg_index as i
             on
           i.indexrelid = c.conindid
        join pg_attribute as la
             on
           la.attrelid = c.conrelid
           and la.attnum = c.conkey[1]
        join pg_attribute as ra
             on
           ra.attrelid = c.confrelid
           and ra.attnum = c.confkey[1]
		left join pg_catalog.pg_constraint uc on
		  	la.attrelid = uc.conrelid
		  	and uc.contype = 'u'
		  	and cardinality(uc.conkey) = 1
		  	and la.attnum = uc.conkey[1]
        where
           c.contype = 'f'
           and cardinality(c.confkey) = 1
           and c.connamespace = $schema_name::regnamespace
           ${options?.table ? "and la.attrelid = $table_name::regclass" : ""}
           ${options?.column ? "and la.attname = $column_name" : ""}
           ;
        `
		/* cSpell:enable */
		const result: PgFk[] = (await this.sq.rawQuery(query, {
			trx: options?.trx,
			params: {
				table_name: options?.table,
				column_name: options?.column,
				schema_name: options?.schema ?? "public",
			},
		})) as any

		return result.map((v) => ({
			onUpdate: onDeleteMapper[v.onUpdate],
			onDelete: onDeleteMapper[v.onDelete],
			fkColumn: v.sourceColumn,
			fkTable: v.sourceTable,
			fkName: v.keyName,
			referencedTable: v.targetTable,
			referencedColumn: v.targetColumn,
			fkColumnDataType: v.dataType,
			fkColumnUnique: v.unique,
		}))
	}
	async getForeignKey(options: GetForeignKeyParams): Promise<ForeignKey | undefined> {
		const res = await this.getForeignKeys(options)
		return res[0]
	}

	async getSingleUniqueKeys(options?: GetSingleUniqueKeysParams): Promise<SingleUniqueKey[]> {
		const result = await this.getUniqueKeys({ ...options, type: "single" })
		return result.map(({ columnNames, ...rest }) => ({ ...rest, columnName: columnNames[0] }))
	}

	async getCompositeUniqueKeys(
		options?: GetCompositeUniqueKeysParams,
	): Promise<CompositeUniqueKey[]> {
		const result = await this.getUniqueKeys({ ...options, type: "composite" })
		return result as CompositeUniqueKey[]
	}

	async getUniqueKeys(shared?: GetUniqueKeysParams): Promise<Readonly<UniqueKey>[]> {
		let filterByIsComposite: string
		if (shared?.type === "single") {
			filterByIsComposite = "and cardinality(uc.conkey) = 1"
		} else if (shared?.type === "composite") {
			filterByIsComposite = "and cardinality(uc.conkey) > 1"
		} else {
			filterByIsComposite = ""
		}

		/* cSpell:disable */
		const query = `
        SELECT
        	uc.connamespace::regnamespace as "schemaName",
        	uc.conname ::regclass as "keyName",
        	uc.conrelid::regclass as "tableName",
            -- this returns array of column names, because of node-pg
            -- I have to cast it to text[] for node
        	array_agg(a.attname)::text[] as "columnNames"
        FROM
        	pg_constraint uc
        JOIN pg_attribute a ON
        	a.attrelid = uc.conrelid
        	and a.attnum = any(uc.conkey)
        WHERE
        -- "u" stands for unique
        	uc.contype = 'u'
        -- cardinality returns length or array, and uc.conkey are columns in unique key
        -- so this returns key that more than 1
            ${filterByIsComposite}
        	and uc.connamespace = $1::regnamespace
            ${shared?.table ? "and uc.conrelid = $2::regclass" : ""}
        GROUP BY
        	uc.connamespace,
        	uc.conname,
        	uc.conrelid,
        	uc.conkey
        `
		/* cSpell:enable */
		const result: CompositeUniqueKey[] = (await this.sq.rawQuery(query, {
			params: [shared?.schema ?? "public", shared?.table].filter(notNil),
			trx: shared?.trx,
		})) as any
		return result
	}
}

// https://stackoverflow.com/questions/58431104/difference-between-information-schema-tables-and-pg-tables

// function isPlainDefaultValue(column: DbColumn) {
// 	if (column.defaultValue === null) return true
// 	if (column.defaultValue.endsWith(`::${column.dataType}`)) return false
// 	return true
// }
