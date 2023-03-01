---
title: Validation
---

You can perform validation by listening to CRUD events.
It is recommended to throw [NestJS HTTP errors](https://docs.nestjs.com/exception-filters),
that will set proper status code and message.
You can validate in `before` or `start` events. `before` events are before starting transaction,
and they do not have access to records that will be updated/deleted. In `start` event, we already
fetched data that will be updated/deleted, and you can check those records.

:::note
You need to enable TypeScript decorators to use `@OnCrudEvent`
:::

```ts
import { OnCrudEvent, type CreateBeforeEvent, type UpdateBeforeEvent } from "zmaj"

@Injectable()
class MyValidationService {
	/**
	 * Prevent non admin users from creating posts.
	 * Also `userId` property must be `SOME_USER_ID`
	 */
	@OnCrudEvent({
		action: "create",
		// this will be run before transaction is started
		type: "before",
		collection: "posts",
	})
	async preventSomeUser(event: CreateBeforeEvent) {
		if (event.user.roleId !== ADMIN_ROLE_ID) throw new ForbiddenException("You are not allowed")
		// event.dto is array with all the records that we want to create
		for (const item of event.dto) {
			// validate
			if (item.userId !== SOME_USER_ID) throw new BadRequestException("Invalid User")
		}
	}

	/**
	 * Prevent user from changing `userId` property
	 */
	@OnCrudEvent({
		action: "update",
		// this will be run before transaction is started
		type: "before",
		collection: "posts",
	})
	async disableChangingUserId(event: UpdateBeforeEvent) {
		// validate
		if (event.changes.userId) throw new BadRequestException("You can't change user")
	}

	/**
	 * Prevent deleting record whose ID is 234
	 */
	@OnCrudEvent({
		action: "delete",
		type: "start",
		collection: "posts",
	})
	async preventDeletePost234(event: DeleteStartEvent) {
		if (event.trx === undefined) throw new InternalServerErrorException("Should never happen")

		const recordsToDelete = event.toDelete.filter((item) => item.original)
		const recordIdsToDelete = event.toDelete.filter((item) => item.id)

		if (recordIdsToDelete.includes(234)) {
			throw new BadRequestException("You can't delete post with ID 234")
		}
	}
}
```
