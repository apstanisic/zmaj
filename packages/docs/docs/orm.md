---
title: ORM
description: ORM can be used for changing records in the database
---

Zmaj has with it's own ORM,
which is a thin wrapper around [Sequelize](https://sequelize.org/). It provides full type safety.

## Using ORM

You can inject `RepoManager` in any of your services. It provides method `getRepo` that will
return repository for specified collection. You can pass either table name or collection name
(collection name is camel-cased version of table name). ORM will use database schema, combined with
configuration for provided collection to generate proper entities and proper relations.

```ts
import { RepoManager, OrmRepository } from "zmaj"
import { Injectable } from "@nestjs/common"

@Injectable()
class MyService {
	repo: OrmRepository<{ id: number; title: string }>

	constructor(private repoManager: RepoManager) {
		this.repo = this.repoManager.getRepo("posts")
	}

	async findAllPosts() {
		return this.repo.findWhere({})
	}

	async createPost() {
		await this.repo.createOne({ data: { title: "Hello World" } })
	}

	// ORM knows that id is not returned, that's why it's `string | undefined`
	async getOnlyTitle(): Promise<{ id?: number; title: string }[]> {
		return this.repo.findWhere({ fields: { title: true } })
	}
}
```

## Relations

Relations will be automatically generated based on foreign keys, and contents of the `zmaj_relation_metadata` table.
Be careful when you are joining one to many and many to many, since it can return thousands of rows.

```ts
// This will find user with email "test@example.com", and "Editor" role.
// It will return "id", "email",
// user's role (only "id" and "name"),
// user's files (all fields),
// and user's auth sessions (only "ip" and "userAgent").
const user = await this.usersRepo.findOne({
	where: {
		email: "test@example.com",
		role: { name: "Editor" },
	},
	fields: {
		id: true,
		email: true,
		role: { id: true, name: true },
		files: true,
		authSessions: { ip: true, userAgent: true },
	},
})
// Typescript knows that name is returned, and is a string
console.log(user.role.name)
// Typescript will know that description is undefined, since it knows that description is not returned
console.log(user.role.description)
```

### Typescript

If you wish to have type safe relations, you have to provide proper types.
`EntityRef` is type that will inform TypeScript that this field is relation, and will provide
valid filtering, selecting and ordering.

```ts
import { EntityRef, User } from "@zmaj-js/full"
import type { Comment } from "./comment.type"

type Post = {
	id: number
	title: string
	userId: string
	// many to one / one to one
	user?: EntityRef<User>
	// one to many / many to many
	comments?: EntityRef<Comment>[]
}
```

## Built on top of Sequelize

This is not a full blown ORM, it is around 500 lines of code wrapper around Sequelize to decouple it from Zmaj.
Sequelize is doing all of the heavy lifting under the hood.

This proved to be necessity, since I had encountered problems with TypeORM and MikroORM, and having
ORM wrapper enabled me to switch underlying ORM without having to fix whole app.
Sequelize proved to be best option, even though it does not have prettiest API.
It has good support for joining, filtering, and has proper support for changing models during runtime.
Currently, in Sequelize directly, it's not possible to achieve this level of type safety.
