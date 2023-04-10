# Info about schema

Using `md` file so I can get dynamic syntax highlighting.
Prefer using `information_schema` since it's [standardized way to query schema](https://stackoverflow.com/a/58431521),
but don't do it if performance penalty is to big. More info about that [here](https://dataedo.com/kb/databases/all/information_schema).
Also for performance penalty, [see this](https://dba.stackexchange.com/a/22420).
Also this answer for performance, [see](https://dba.stackexchange.com/a/75124).

## Foreign key

### Using `information_schema`

Based on [this answer](https://stackoverflow.com/a/1152321)

```sql
SELECT
    tc.table_schema,
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
-- Remove schema if you want
AND tc.table_schema = 'public'
-- Remove table name if you want
AND tc.table_name='table_name';

```

### Using PG specific

Based on [this answer](https://dba.stackexchange.com/a/265741).

<!-- cSpell:disable -->

```sql
SELECT
  la.attrelid :: regclass AS "sourceTable",
  la.attname AS "sourceColumn",
  ra.attrelid :: regclass AS "targetTable",
  ra.attname AS "targetColumn",
  c.confdeltype AS "onDelete",
  c.confupdtype AS "onUpdate",
  c.conname AS "keyName",
  c.connamespace ::regnamespace as "schemaName",
  la.atttypid :: regtype AS "longDataType",
  la.attnotnull AS "notNullable"
  uc.contype is not null and uc.contype = 'u' as "unique"
FROM
  pg_constraint AS c
  JOIN pg_index AS i ON i.indexrelid = c.conindid
  JOIN pg_attribute AS la ON la.attrelid = c.conrelid
  AND la.attnum = c.conkey[1]
  JOIN pg_attribute AS ra ON ra.attrelid = c.confrelid
  AND ra.attnum = c.confkey[1]
  -- This is joined so that we can get if column is unique (to know if m2o or o2o)
  -- join again with `pg_constraint` on current table, and must be constraint type unique
  -- must have only column is it's constraint, and it's column number must be the same as
  left join pg_catalog.pg_constraint uc on
	la.attrelid = uc.conrelid
	and uc.contype = 'u'
	and cardinality(uc.conkey) = 1
	and la.attnum = uc.conkey[1]

where
  c.contype = 'f'
  -- schema
  AND c.connamespace = 'public'::regnamespace
  -- table
  AND la.attrelid = 'zmaj_users'::regclass
  -- column
  AND la.attname = 'role_id'
  -- if there is more than 1 column in unqiue key
  AND cardinality(c.confkey) = 1;
```

<!-- cSpell:enable -->

## Unique key

### Using information_schema

Based on [this answer](https://stackoverflow.com/a/59284175).

```sql
select
	table_schema,
	table_name,
	column_name
from
	information_schema.table_constraints as c
join information_schema.constraint_column_usage as cc
		using (table_schema,
	table_name,
	constraint_name)
where
	c.constraint_type = 'UNIQUE'
    and c.table_schema = 'public';
```

### Using PG specific

Based on [this answer](https://dba.stackexchange.com/a/289320).
I added `group by` so that I can get column names as array in single row

<!-- cSpell:disable -->

```sql
select
  uc.connamespace :: regnamespace as "schemaName",
  uc.conname :: regclass as "keyName",
  uc.conrelid :: regclass as "tableName",
  -- this returns array of column names, because of node-pg
  -- I have to cast it to text[] for node
  array_agg(a.attname):: text[] as "columnNames"
from
  pg_constraint uc
  join pg_attribute a on a.attrelid = uc.conrelid
  and a.attnum = any(uc.conkey)
where
  -- "u" stands for unique
  uc.contype = 'u'
  and uc.connamespace = 'public' :: regnamespace
  -- cardinality returns length or array, and uc.conkey are columns in unique key
  -- so this returns key that more than 1
  -- set to = 1 for only single unique column, or remove for both
  and cardinality(uc.conkey) > 1
group by
  uc.connamespace,
  uc.conname,
  uc.conrelid
```

<!-- cSpell:enable -->

## Column

### Standard way

Based on [this answer](https://dba.stackexchange.com/a/22368).
I added other info based on column names. Using a little dirty way
to check if value is auto increment, but I think it works.
This finds everything except if the column is unique.

```sql
 select
	c.table_schema as "schemaName",
	c.table_name as "tableName",
	c.column_name as "columnName",
	c.column_default as "defaultValue",
	c.is_nullable = 'YES' as "nullable",
	c.data_type as "longDataType",
	c.udt_schema as "shortDataType",
	c.column_default is not null
	and c.data_type like 'integer%'
	and c.column_default like 'nextval(%' as "autoIncrement"
from
	information_schema."columns" c
where
	c.table_schema = 'public';
```

### PG specific

Based on couple answers: [answer 1](https://stackoverflow.com/a/8148177), [answer 2](https://dba.stackexchange.com/a/289320).

Auto increment detection is based on this 2 answers: [answer 1](https://dba.stackexchange.com/a/90567),
and [answer 2](https://dba.stackexchange.com/a/47107).
I know it's not perfect solution, but it works. Unless there is a bug, do not overcomplicate query.

<!-- cSpell:disable -->

I have to join with `pg_catalog.pg_class` and check that table is normal table, and not an index,
or something else. That is why there is `pc.relkind = 'r'`.
Also needed is `and i.indisprimary`, otherwise it will return for other indexes, and there
will be multiple rows for same column

Added comment since it was easy and was available is sequelize `describeTable`. Maybe remove it.

Edit: Not working when not "SERIAL".
[Better answer](https://dba.stackexchange.com/a/168675). Problem with first approach is that
it does not work when using `GENERATED BY DEFAULT AS IDENTITY`.

From sequelize docs, caused problem when using `autoIncrementIdentity` as `true`:

> If this field is a Postgres auto increment field,
> use Postgres GENERATED BY DEFAULT AS IDENTITY instead of SERIAL. Postgres 10+ only.

This [answer](https://stackoverflow.com/a/55300741) recommends not using identity.
PG 10 is not maintained anymore, so it should be supported everywhere.

```sql
select
  pg_get_expr(d.adbin, d.adrelid) as "defaultValue",
  attrelid :: regclass as "tableName",
  attname as "columnName",
  atttypid :: regtype as "dataType",
  not a.attnotnull as "nullable",
  pc.relnamespace :: regnamespace as "schemaName",
  -- this way not working when using GENERATED BY DEFAULT AS IDENTITY
  -- pg_get_expr(d.adbin, d.adrelid) is not null
  -- and atttypid :: regtype = 'integer' :: regtype
  -- and pg_get_expr(d.adbin, d.adrelid):: text like 'nextval(%::regclass)' as "autoIncrement",
  i.indisprimary is not null as "primaryKey",
  -- value is unique by default if it's primary key
  uc.contype is not null or i.indisprimary is not null  as "unique"
  pg_get_serial_sequence(a.attrelid :: regclass :: text, a.attname) is not null as "autoIncrement"
from
  pg_catalog.pg_attribute a
left join pg_catalog.pg_attrdef d on (a.attrelid, a.attnum) = (d.adrelid, d.adnum)
join pg_catalog.pg_class pc on pc.oid = a.attrelid
  and pc.relkind = 'r'
left join pg_catalog.pg_index i on a.attrelid = i.indrelid
  and a.attnum = any(i.indkey)
  and i.indisprimary
left join pg_catalog.pg_constraint uc on attrelid = uc.conrelid
  and uc.contype = 'u'
  and cardinality(uc.conkey) = 1
  and attnum = uc.conkey[1]
where
  not a.attisdropped -- no dropped (dead) columns
  and a.attnum > 0 -- no system columns
  and pc.relnamespace = 'public' :: regnamespace --  and a.attrelid = 'zmaj_users'::regclass
  --  and a.attname = 'id';
```

<!-- cSpell:enable -->

## Results:

| Type   | Standard | Cost           | Time  |
| ------ | -------- | -------------- | ----- |
| FK     | [x]      | 74.50 - 234.67 | 9.262 |
| FK     | [ ]      | 0.71 - 31.36   | 0.230 |
| UNIQUE | [x]      | 31.33 - 87.86  | 8.242 |
| UNIQUE | [ ]      | 79.09 - 79.27  | 0.229 |
| COLUMN | [x]      | 79.09 - 79.27  | 0.229 |
| COLUMN | [ ]      | 79.09 - 79.27  | 0.229 |

## Has column

### PG specific

<!-- cSpell:disable -->

```sql
select
  count(pt.tablename) = 1 as "exists"
from
  pg_catalog.pg_tables pt
where
  pt.schemaname = 'public'
  and pt.tablename = 'zmaj_users';
```

<!-- cSpell:enable -->

### Standard

```sql
SELECT
  COUNT('table_name') = 1 as "exists"
FROM
  information_schema.tables
WHERE
  table_name = $1
  and table_schema = $2;


```

## Has column

## PG specific

<!-- cSpell:disable -->

Based on combination of [this answer](https://dba.stackexchange.com/a/200422) and
[this answer](https://dba.stackexchange.com/a/75124).

```sql
select
  count(attname) = 1 as "exists"
	-- attrelid::regclass as "tableName",
	-- pc.relnamespace::regnamespace::text as "schemaName",
	-- attname as "columnName"
from
	pg_catalog.pg_attribute pa
join pg_catalog.pg_class pc on
	pa.attrelid = pc.oid
where
	attrelid = 'zmaj_users'::regclass
	and
	pc.relnamespace = 'public'::regnamespace
	and pa.attname = 'id'
	and attnum > 0
	and not attisdropped
order by
	attnum
```

<!-- cSpell:enable -->

### Standard

```sql
select
  COUNT(c.column_name) = 0 as "exists"
from
  information_schema.columns c
where
  c.table_name = $1
  and c.column_name = $2
  and c.table_schema = $3;

```

## List tables

### Standard

```sql
select t.table_name as "tableName"
from information_schema.tables t
where t.table_schema = $1
;
```

### PG specific

```sql
select pt.tablename as "tableName"
from pg_catalog.pg_tables pt
where schemaname = $1
;
```

## Get Primary key

Taken from [dock](https://wiki.postgresql.org/wiki/Retrieve_primary_key_columns)

<!-- cSpell:disable -->

```sql
select
  a.attname as "columnName",
  a.attrelid :: regclass as "tableName",
	pc.relnamespace ::regnamespace as "schemaName"
from
  pg_index i
  join pg_attribute a on a.attrelid = i.indrelid
  and a.attnum = any(i.indkey)
  join pg_catalog.pg_class pc on pc.oid = a.attrelid
where
  i.indisprimary
  and pc.relnamespace = 'public' :: regnamespace
  -- comment line bellow to get for all tables
  and i.indrelid = 'zmaj_users' :: regclass;
	;
```

<!-- cSpell:enable -->
