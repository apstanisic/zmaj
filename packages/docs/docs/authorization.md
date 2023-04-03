---
title: Authorization
---

Zmaj uses a mix between RBAC (role based access control) and ABAC (attribute based access control)
for securing your resources.
User can be allowed to access only specific properties on resource, and only under certain condition.
Different users with same role could have different access.
It uses [casl](https://casl.js.org/) under the hood.
Every permission is stored in `zmaj_permissions` table, and points to a single role stored in `zmaj_roles` table.

## Roles

User can only have single role.
There are 2 mandatory roles that can't be deleted:

- Admin, user can do everything
- Public, role assigned to users that are not signed it. You can also assign this role to registered user.

## Permissions

Every permission is tied to a single role. Permission contains action that it allows, resource on which action
is performed (it does not have to be collection), fields that user can access (if applicable),
and conditions under which resource can be accessed.

Example permission:

```ts
import { Permission } from "@zmaj-js/full"
// User can update posts, but only `title` and `userId` fields,
// only if post does not have title "Secret Title" and has `userId` equal to current user's ID.
const examplePermission: Permission = {
	id: "5621a3a8-c5b1-4b7b-9133-59f94be7ca04",
	createdAt: new Date("2023-02-24T21:20:17.500Z"),
	action: "update",
	resource: "collections.posts",
	fields: ["title", "userId"],
	conditions: {
		title: { $ne: "Secret Title" },
		// this will inject current user
		// only user this posts belongs to can update
		userId: "$CURRENT_USER",
	},
	roleId: "534c05a3-f087-455d-bfeb-5b36c4d58c48",
}
```

### Fields

It is possible to allow access only to some fields. Permission has fields array, and only allowed data,
will be returned. If user tries to access or change forbidden resource, error will be thrown.

If `fields` are empty array (`[]`), that means that user does not have access to any field.
If value is `null`, that means that user has access to all the fields.
There is a difference between `fields = null` and `fields = ["all", "fields", "specified", "manually"]`.
When new field is created, for example `new_field`, if fields are `null`, user will have access to that field,
but that field won't be added automatically if `fields` is an array.

### Conditions

You can provide custom condition that must be fulfilled so that user can access resource.
It uses MongoDB query syntax ([see casl docs for more](https://casl.js.org/v6/en/guide/conditions-in-depth)).

```js
// user can only access record if it's `title` is not "Secret Title",
// and if record's `userId` is same as current users.
const conditions = {
	title: { $ne: "Secret Title" },
	// this will inject current user
	userId: "$CURRENT_USER",
}
```

:::caution
`casl` currently does not support `$and`, `$or` and `$not` operator, [read more in casl docs](https://casl.js.org/v6/en/guide/conditions-in-depth#why-logical-query-operators-are-not-included).
:::

#### Dynamic values

Since permissions are stored in database, zmaj has placeholder values that will be replaced at runtime
with real values.
Currently there are `"$CURRENT_USER", "$CURRENT_ROLE", "$DATE:some-value":
It is possible for you to [write custom transformer](#writing-custom-condition-transformers).

<!-- Currently there are `"$CURRENT_USER", "$CURRENT_ROLE", "$DATE:some-value", "$CURRENT_DATE"`: -->

| Example                          | Description                                                                            |
| :------------------------------- | :------------------------------------------------------------------------------------- | -------------------- |
| "$CURRENT_USER"                  | Injects current user's ID                                                              |
| "$CURRENT_ROLE"                  | Injects current user's role ID                                                         |
| "$DATE:2022-09-12T16:12:53.343Z" | Creates `Date` object with provided value                                              |
| "$DATE:10000"                    | Creates `Date` object provided unix timestamp (in seconds)                             |
| <!--                             | "$CURRENT_DATE"                                                                        | Injects current date |
| "$CURRENT_DATE:3d"               | Injects date that is 3 days in the future ([uses `ms`](https://github.com/vercel/ms))  |
| "$CURRENT_DATE:-5s"              | Injects date that is 5 seconds in the past ([uses `ms`](https://github.com/vercel/ms)) | -->                  |

## Configuring

<!--
I won't document this API, since it should be enabled always when admin panel is used
// should we expose API that shows user what they can do. This is needed for admin panel
// to work properly. User is only allowed
exposeAllowedPermissions: true,
 -->

```js
await runServer({
	authorization: {
		// you can fully disable authorization
		disable: false,
		// custom transformers that inject dynamic values
		// see section bellow for more details
		customConditionsTransformer: [],
	},
})
```

## Writing custom condition transformers

There is exported type that will help you write this function `AuthzConditionTransformer`.

```ts
import type { AuthzConditionTransformer } from "zmaj"

// this is code that is used for injecting current user in request
const currentUserTransformer: AuthzConditionTransformer = {
	key: "MY_CURRENT_USER",
	// currently only `user` and `modifier` are passed as params
	// replace $MY_CURRENT_USER with current user's ID, or with `null` if user is not signed in
	transform: (params) => params.user?.userId ?? null,
}

// Simplified version of how Zmaj's current date transformer is implemented
// modifier is everything after ":", if colon is included
// in `$MY_CURRENT_DATE:2d`, modifier is `2d`
// in `$MY_CURRENT_DATE`, modifier is `undefined`
// in `$MY_CURRENT_DATE:`, modifier is empty string
const currentDateTransformer: AuthzConditionTransformer<Date> = {
	key: "MY_CURRENT_DATE",
	transform: ({ modifier }) => {
		if (modifier === undefined) return new Date()
		const inMs = ms(modifier)
		return addMilliseconds(new Date(), inMs)
	},
}

// then provide them to runServer
await runServer({
	authorization: {
		customConditionsTransformer: [
			currentUserTransformer,
			currentDateTransformer, //
		],
	},
})
```

## Custom authorization

There might be some case where Zmaj's authorization is not detailed enough for you.
You can use [`OnCrudEvents`](./collections/crud-events.md) to authorize CRUD endpoints with JavaScript.

```ts
@Injectable()
class MyAuthorizationService {
	/**
	 * Prevent deleting post if user's email is gmail
	 */
	@OnCrudEvent({
		action: "delete",
		type: "before",
		collection: "post",
	})
	async preventDeletingPostIfUserEmailIsFromGmail(event: DeleteBeforeEvent<Post>) {
		if (event.user?.email.endsWith("@gmail.com")) throw new ForbiddenException()
	}
}
```

### Using guards, interceptors and middleware

Zmaj is a NestJS application. So that means you can also write custom authorization using
guards, interceptors or middleware.
In fact, part of Zmaj's authorization (main exception are CRUD requests) is taking place mostly in guards.
You should first try to achieve this with Zmaj's permissions,
and write custom authorization only if built in authorization and CRUD events are not enough.

```ts
import { runServer, ADMIN_ROLE_ID, AuthUser } from "zmaj"
import {
	ExecutionContext,
	Injectable,
	CanActivate,
	Module,
	ForbiddenException,
} from "@nestjs/common"
import { APP_GUARD } from "@nestjs/core"

@Injectable()
export class MyAdminGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const req = context.switchToHttp().getRequest()
		// Only use on users endpoints
		if (!req.url.startsWith("/api/users")) return true

		if (req.user instanceof AuthUser && req.user.roleId === ADMIN_ROLE_ID) return true

		throw new ForbiddenException()
	}
}

@Module({
	providers: [{ provide: APP_GUARD, useClass: MyAdminGuard }],
})
export class MyModule {}

await runServer({
	customModules: [MyModule],
})
```
