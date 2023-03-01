---
title: Collections
---

Every table is represented as a collection, with a single row in `zmaj_collection_metadata`.
Collection name is camel cased table name, so if table name is `super_posts`, collection name
will be `superPosts`.
Fields are also converted to camel case, so `post_id` column will be `postId` field.

## Disabling collection

It is possible to disable managing collection by settings `disabled` property. This will disable
any access by Zmaj to that table, until reenabled.

## Display template

When displaying record in admin panel, it is prettier to display some text instead of record ID.
To achieve this, you can set `displayTemplate`. It receives all data from fetched record,
and you can inject that data into template.

For example, if you have collections `posts` with fields `id` and `title`, you can write
template `Title of this post is: {title}`. Zmaj will inject title in this template.
Everything between curly brackets `{}` will be parsed.
If user does not have access to `title`, nothing will be written.

### Pipes

Similar to Angular, Zmaj have some basic pipes that can be used to transform data.
For example you can use uppercase pipe: `Hello {name | upperCase}`.
If record with data `{ "name": "John" }` is provided, it will print out `Hello JOHN`.
It is possible to chain pipes: `{body | lowerCase | truncate}... Read More`.

Built in pipes are:

- upperCase - convert var to upper case
- lowerCase - convert var to lower case
- camelCase - convert var to camel case
- snakeCase - convert var to snake case
- truncate - truncate string to 50 characters
- date - convert JSON date to more readable format
- toKb - converts value from bytes to kilobytes
- orUnknown - if value is null or undefined, print "UNKNOWN"

Currently it's not possible for user to provide custom pipes. That option will be added in the future.

### Template Examples

```ts
type Post = { id: number; title?: string | null }
const post1: Post = { id: 4, title: "World" }
const post1Template = "Hello {title}" // "Hello World"
const post1TemplateUpper = "Hello {title|upperCase}" // "Hello WORLD"

const post2: Post = { id: 4 }
const post2Template = "Hello {title}" // "Hello "
const post2TemplateUnknown = "Hello {title|orUnknown}" // "Hello UNKNOWN"
```

## Hide collection

It is possible to hide collection from admin panel by settings `hidden` to `true`.
This won't affect how collection works, you will still be able to query collection.

## Label and Description

You can provide `label` and `description` that will be shown in admin panel instead of default values.

## Layout Configuration

:::caution
This feature is experimental
:::

Zmaj provides a lot of layout configuration. Currently it's not easy to configure, it will be improved
in the future. This config is stored in `layoutConfig` property on collection.
If config is invalid, default config will be used.

```ts
import { LayoutConfigSchema, type LayoutConfig } from "zmaj"
// This will ensure that correct config is provided.
// Set this value to `layoutConfig` property in collection
const config: LayoutConfig = LayoutConfigSchema.parse({})
```

<!--

Collections are fully backed by database schema. Every collection corresponds with single table,
every field corresponds with single column. Every foreign key has 2 relations,
owning relation (collection where FK is located), and referencing collection (where PK is located).
Many-to-many relations consist of 2 foreign keys, and composite unique keys that guaranties that
there isn't multiple same connections. On app startup, Zmaj will create for you collections, fields
and relations based on your database schema.
By default, many-to-many relations will be created as 2 many-to-one, since we can't be
sure if you want many-to-many or direct relations (this might be revisited in the future).

## Many-to-many relations

For relation to be many-to-many, there must be a junction table with 2 foreign keys, and there
must be composite unique constraint with those 2 keys. It is not possible to have many-to-many if
junction table has 3 foreign keys.
You can convert many-to-one to many-to-many if they fullfil requirements.
Many-to-many can always be split to 2 many-to-one.

To convert many-to-one to many-to-many, send `POST /api/system/infra/relations/join-mtm/:junctionCollectionName`.


 -->
