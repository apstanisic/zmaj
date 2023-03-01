---
title: Collections API
---

Collections can be accessed at `/api/collections` endpoint.

## REST API

| Usage                 | Method | URL                                    |
| --------------------- | ------ | -------------------------------------- |
| Get paginated records | GET    | `/api/collections/:collectionName`     |
| Get specific record   | GET    | `/api/collections/:collectionName/:id` |
| Create record         | POST   | `/api/collections/:collectionName`     |
| Update record         | PUT    | `/api/collections/:collectionName/:id` |
| Delete record         | DELETE | `/api/collections/:collectionName/:id` |

### Find many

```js
const result = await sdk.collection("posts").getMany({
	count: true,
	limit: 10,
	page: 2,
	fields: { title: true, body: true },
	filter: { title: "Hello World" },
	sort: { createdAt: "DESC" },
})
console.log(result.count) // total amount
console.log(result.data) // posts
```

```http title="Example HTTP request"
GET https://localhost:5000/api/collections/posts?limit=10&page=1&count=true&filter.title=hello%20world
```

Possible query params:

| Key    | Default value                                     | Description                                                      |
| ------ | ------------------------------------------------- | ---------------------------------------------------------------- |
| page   | `1`                                               | Page                                                             |
| limit  | `20`                                              | Limit (max 200)                                                  |
| count  | `false`                                           | Return total amount of rows (used for pagination in admin panel) |
| sort   | `{}` - use default database sort                  | Sort                                                             |
| fields | `undefined` - selects all fields in current table | Selected fields                                                  |
| filter | `{}`                                              | filter                                                           |

#### Filtering

It is recommended to use SDK to write complex filtering since Zmaj uses `qs` package to have
support for nested query params.

Zmaj supports MongoDB style filtering. Sequelize is used for querying database, and Zmaj will convert
it from Mongo style to Sequelize query.
They are mostly identical, only Sequelize is not using `$eq` and similar comparisons, but uses symbol
for keys. Zmaj will convert `$eq` to `[Op.eq]`.

We will join filter provided with query and conditions in permission that is needed to access those resource
so user will never get access to rows that they don't have permission to.
We will serialize filter with `qs` package

```js
const exampleFilter = {
	title: { $ne: "some title" },
	body: "Hello World Body",
}
```

#### Selecting fields

You can specify what fields from collection you want to get. You can also join relations if they are
many-to-one (foreign key is in current record).
One to many and many to many is not allowed for now since it's very easy to get record with 100000 possible items.
For example, get posts with comments would return 1 post and maybe 1000 comments. This future will
be available in the future, with pagination.

```js
const { data } = await sdk.collection("posts").getMany({
	fields: {
		title: true,
		body: true,
		user: {
			email: true,
		},
	},
})
```

```http title="Example HTTP request"
GET https://localhost:5000/api/collections/posts?fields.title=true&fields.body=true&fields.user.email=true
```

### Find by ID

```js
const post = await sdk.collection("posts").getById({ id: 5 })
```

```http title="Example HTTP request"
GET https://localhost:5000/api/collections/posts/5
```

### Update

Send `PUT` request to `/api/collections/:collectionName/:id` in which body is changes to be made.
It returns updated record.

```js
const updatedPost = await sdk
	.collection("posts")
	.updateById({ id: 5, data: { title: "Updated Post" } })
```

```http title="Example HTTP request"
PUT https://localhost:5000/api/collections/posts/5
content-type: application/json

{
    "title": "This is updated title"
}
```

### Create

Send `POST` request to `/api/collections/:collectionName` in which body is data that will be used to
create record
It returns created record.

```js
const createdPost = await sdk.collection("posts").createOne({ data: { title: "First Post" } })
```

```http title="Example HTTP request"
POST https://localhost:5000/api/collections/posts
content-type: application/json

{
    "title": "First Post",
    "body": "This is post body",
    "likes": 123
}
```

### Delete

Send `DELETE` request to `/api/collections/:collectionName/:id`, with collection name and record ID.
It returns deleted record

```js
const deletedPost = await sdk.collection("posts").deleteById({ id: 5 })
```

```http title="Example HTTP request"
DELETE https://localhost:5000/api/collections/posts/5
```

### Adding/removing from one-to-many and many-to-many in current record

It's easy to set value for many-to-one relations, just specify value in foreign key column.
For example, to create comment with specific post, you would write `{ postId: 5, otherValues: "..." }`.
But what if you want to update post and add some comments to it, and remove another.
Your post can have 10000s of comments, and fetching all their IDs would be expensive. We would have
to calculate difference, remove redundant comments, and add relevant. A lot cheaper way is for
client to send request with only differences to current relation.

<!-- When creating new record, it is possible to simply pass an array, but for consistency, same format
is used. -->

```js
const createdPost = await sdk.collection("posts").createOne({
	data: {
		title: "Default Title",
		comments: { type: "toMany", added: [1, 2, 3, 4, 5], removed: [] },
	},
})

// example post with comments 1, 2, 3, 4, 5
const updatedPost = await sdk.collection("posts").updateById({
	id: createdPost.id,
	data: {
		title: "I am also changing title",
		comments: {
			type: "toMany",
			// this will assign comments 11 and 12 to current post
			added: [11, 12],
			// this will remove comments 2, 3, and 4 from current post
			removed: [2, 3, 4],
		},
	},
})
// after request post will have comments 1, 5, 11, 12
```

## JS SDK

You can access API in SDK with `sdk.collection("collectionsName")`. This will return all possible methods.

```js
const response = await sdk.collection("posts").getMany()
```

:::caution
Every CRUD response is wrapped in `data` object. SDK unwraps this object, but you must do it manually
if you're using API directly

```js
// When using REST API directly:
const result = await fetch("http://localhost:5000/api/collections/posts/5").then((r) => r.json())
const record1 = result.data
// When using SDK:
const record2 = await sdk.collection("posts").getById({ id: 5 })
```

:::
