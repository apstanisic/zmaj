---
title: Relations
---

Relations are based on your database schema. This ensures data integrity.
Many to one (M2O) and one to many (O2M) relations are based upon a single foreign key. One to one (O2O) relations are
same as M2O/O2M, only difference is that O2O relation's foreign key column also contains unique constraint.
Many to many M2M requires junction table with 2 foreign keys, that have composite unique key on those 2 columns.
Every relation is based on db schema, so when you create a relation trough admin panel or API, you are changing
underlying database.

Information about relation is stored in `zmaj_relation_metadata` table and contains additional data that
allows API to function. Every relation has `propertyName`, which specifies property on which relation
data will be attached. If `propertyName` is `myComments`, then you can access your comments with `record.myComments`.
Every relation can have `label` and `template`. Label is used when displaying data in admin panel.
When displaying a list of referenced records, we can replace collection's default `template`, with custom one
used only for this relation.

Zmaj will adapt to your database schema, so if you modify database, Zmaj will automatically create/delete
needed relations.

There are examples of database schema for every type in sections bellow.
Example schema that we will use is: `posts` has many (M20/O2M) `comments`, `posts` has single (O2O/O2O) `posts_metadata`, `posts` has many (M2M/M2M) `tags` trough `posts_tags`.

## Types

### Many to One (M2O) / One to Many (02M)

This type of relation is based on single non unique column with foreign key.
There is M2O owning side (where FK is located) and O2M referencing side (where PK/unique is located).

```js title="Example schema for M2O/O2M relations"
await knex.schema.createTable("posts", (t) => {
	t.uuid("id").primary()
	t.string("title")
})

await knex.schema.createTable("comments", (t) => {
	t.uuid("id").primary()
	t.text("body")
	// we create column
	t.uuid("post_id")
	// and that fk has fk to other table
	t.foreign("post_id").references("id").inTable("posts")
})
```

### One to One (O2O)

Relation will be O2O if foreign key column has unique constraint. If that happens,
Zmaj will generate `owner-one-to-one` and `ref-one-to-one` relations. Owning side is a side where FK is located.
They have different types since even though they are same "type" their behavior is very different.

```js title="Example schema for O2O/O2O relations"
// Every post can have only single metadata
await knex.schema.createTable("posts", (t) => {
	t.uuid("id").primary()
	t.string("title")
})

await knex.schema.createTable("post_metadata", (t) => {
	t.uuid("id").primary()
	t.text("some_data")
	// we create column and make it unique. This will make relation from M2O to O2O
	t.uuid("post_id").unique()
	// and that fk has fk to other table
	t.foreign("post_id").references("id").inTable("posts")
})
```

### Many to Many (M2M)

To create many to many relations you need table with 2 foreign keys, and composite unique constraint on those 2 columns.
By default, we will not generate M2M relation, since there could be a situation where user might want something that looks like junction table, but it's not M2M relation. You can make request to our API to join them `PUT /api/system/infra/relations/join-mtm/:junctionCollection`, and `PUT /api/system/infra/relations/split-mtm/:junctionCollection` to separate them.
Or you can do that with admin panel.

```js title="Example schema for M2M relations"
await knex.schema.createTable("posts", (t) => {
	t.uuid("id").primary()
	t.string("title")
})

await knex.schema.createTable("tags", (t) => {
	t.uuid("id").primary()
	t.string("name")
})

await knex.schema.createTable("posts_tags", (t) => {
	t.increments("id", { primaryKey: true })
	t.uuid("post_id")
	t.uuid("tag_id")

	// make foreign keys in junction table
	t.foreign("post_id").references("id").inTable("posts").onDelete("CASCADE")
	t.foreign("tag_id").references("id").inTable("tags").onDelete("CASCADE")
	// make composite unique key for fk columns
	t.unique(["post_id", "tag_id"])
})
```

## Storing relations metadata

Every foreign key is represented as 2 relations. In database, single relation only stores data
related to it's table.
For example `posts` and `comments`, there is:

```js
// this is m2o relation
const rel1 = {
	id: "uuid-1",
	table_name: "posts",
	fk_name: "posts_comments_fk",
	// At which property will data be returned
	property_name: "comments",
	label: "Comments",
	// ...other info
}

// this is o2m relation
const rel2 = {
	id: "uuid-2",
	table_name: "comments",
	fk_name: "posts_comments_fk",
	property_name: "post",
	label: "Post",
	// ...other info
}
```

If foreign key is removed from database, both relations will be deleted.

Many to many consists of 2 relations.
One from `posts` to `tags`, other from `tags` to `posts`.

Junction collection `postsTags` will contain 2 separate M2O relations that are not impacted by M2M/M2M.
You can query `postsTags` collection, `posts` and `tags`.

## Updating relations

When updating data with API, we sometimes want to change some relation data.
When we want to update M2O relation or O2O owning side, we can simply change value in field where
foreign key is located. But what happens when we want to change O2M or M2M relation.
We can change O2M from other collection, where foreign key is located, and M2M by changing junction collection.
But that is not ideal, and leads to bad UX. We can simply send array with PK of records that belong to current record.
But that easily becomes problematic. For example, you have post with 100 000 comments,
we do not want to send thousands of IDs and diff them when updating. Best solution is to only send changes.

```ts title="Example object to update post"
const updatePost = {
	title: "Updated Title",
	comments: {
		type: "toMany",
		// this will change value is comments table to point to this record
		added: [3, 75],
		// this will change value is comments table to not point to this record
		// This will fail if fk column is non nullable
		removed: [56],
	},
}
```
