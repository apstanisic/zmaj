---
title: CRUD Events
---

Zmaj allows you to hook inside it's create/update/delete/read events.
They are very similar to
[Strapi's Content-Type hooks](https://strapi.io/blog/understanding-the-different-types-categories-of-strapi-hooks).

There are 4 types of events:

- `before` - Happens before starting transaction
- `start` - Happens just after transaction is started
- `finish` - Happens just before transaction is finished
- `after` - Happens after transaction have ended

In "start" and "finish" event you have access to transaction with `event.trx`.
If error is thrown in those events, it will cancel transaction, and no changes will be saved to database.
If error is thrown in "after" event, API will return error response, but changes in the database will be preserved.

## Examples

---

### Send email every time when post is updated

```ts
import { OnCrudEvent, UpdateAfterEvent, EmailService, runServer } from "zmaj"
import { Injectable } from "@nestjs/common"

type Post = {
	id: string
	title: string
}

@Injectable()
class MyService {
	constructor(private emailService: EmailService)

	@OnCrudEvent({
		action: "update",
		type: "after",
		collection: "posts",
	})
	async sendEmailOnUpdate(event: UpdateAfterEvent<Post>) {
		const ids = event.result.map((post) => post.id)
		await this.emailService.sendEmail({
			to: "admin@example.test",
			text: `There was a change in posts ${ids.join(", ")}.`,
		})
	}
}

await runServer({
	customProviders: [MyService],
})
```

### Validation

There is more about validation in [validation section](./validation.md).

```ts
@Injectable()
class Service {
	@OnCrudEvent({
		action: "create",
		type: "before",
		collection: "comments",
	})
	async preventAddingCommentAsSomeUser(event: CreateBeforeEvent) {
		// event.dto is array with all the records that we want to create
		for (const comment of event.dto) {
			if (comment.userId !== SOME_USER_ID) throw new ForbiddenException("This user can't comment")
		}
	}

	@OnCrudEvent({
		action: "update",
		type: "before",
		collection: "posts",
	})
	async preventChangingPostOwner(event: UpdateBeforeEvent) {
		if (event.changes.userId) throw new BadRequestException("You can't change user")
	}

	@OnCrudEvent({
		action: "delete",
		type: "before",
		collection: "posts",
	})
	async preventNonAdminDelete(event: DeleteBeforeEvent) {
		if (event.user.userId !== ADMIN_ROLE_ID) throw new ForbiddenException("You must be admin")
	}
}
```

### Prevent changes to collection

```ts
@Injectable()
class Service {
	@OnCrudEvent({
		action: "*",
		type: "start",
		collection: "posts",
	})
	async disableModifyingPosts(event: CrudStartEvent<Post>) {
		if (event.action !== "read") throw new ForbiddenException("You can not modify posts")
	}
}
```

### Call URL when record is deleted (simplified webhook)

```ts
@Injectable()
class Service {
	@OnCrudEvent({
		action: "delete",
		type: "finish",
		collection: "*",
	})
	async update(event: DeleteFinishEvent) {
		await axios.get(`http://example.com/record-deleted/${event.collection.tableName}`)
	}
}
```

### Backup deleted record to redis

```ts
@Injectable()
class Service {
	@OnCrudEvent({
		action: "delete",
		type: "after",
		collection: "posts",
	})
	async onDelete(event: DeleteAfterEvent<Post>) {
		const promises = event.results.map((item: Post) => {
			return this.redisInstance.set("deleted-post-" + item.id, JSON.stringify(item))
		})
		await Promise.all(promises)
	}
}
```

### Change requested collection

Example bellow will return `comments` when user request `posts`.
Can be useful when migrating tables.

```ts
// This will return comments instead of posts
@Injectable()
class Service {
	constructor(private infraState: InfraStateService) {}

	@OnCrudEvent({
		action: "read",
		type: "before",
		collection: "posts",
	})
	async changeCollection(event: ReadBeforeEvent<Post>) {
		event.collection = this.infraState.collections.comments
	}
}
```

## Typescript

Every event has it's type.
Every type has support for generics, for example: `CrudBeforeEvent<MyPostType>`.

```ts
import type {
	CrudBeforeEvent,
	CrudStartEvent,
	CrudFinishEvent,
	CrudAfterEvent,
	//
	ReadBeforeEvent,
	ReadStartEvent,
	ReadFinishEvent,
	ReadAfterEvent,
	//
	UpdateBeforeEvent,
	UpdateStartEvent,
	UpdateFinishEvent,
	UpdateAfterEvent,
	//
	CreateBeforeEvent,
	CreateStartEvent,
	CreateFinishEvent,
	CreateAfterEvent,
	//
	DeleteBeforeEvent,
	DeleteStartEvent,
	DeleteFinishEvent,
	DeleteAfterEvent,
} from "zmaj"
```
