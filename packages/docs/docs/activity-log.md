---
title: Activity Log
---

Zmaj can keep track of changes in your collections. That way you can track every change that
happened to the record.
Every create, update and delete event will be recorded.
This is only available for non system tables.

:::caution
Zmaj can only track changes that happen with Zmaj's API. If you manually change data in database Zmaj
won't be able to know that it happened.
:::

## Settings

You can disable logging, enable only logging events, or log both events and changes.
If log level is events only, then we will log events, and who committed them, but we won't track
changes.

```js
runServer({
	activityLog: {
		// possible "disabled", "events-only", "full". Default to "full"
		logLevel: "full",
	},
})
```

## Permission

Activity log uses separate permission, so roles that have access to activity log will be able to see
changes for all user collections, unless specified in permission's condition.
You can enable and disable access to activity log in admin panel.

```js
// Example condition that only allows access to logs for posts and tags
const condition = {
	resource: { $in: ["collections.posts", "collections.tags"] },
}
```

## API

### REST API

You can access REST API for activity log at `/api/system/activity-log`. You can use same
query as CRUD endpoints to paginate and filter results.
When using SDK there is

| Usage                      | Method | URL                          |
| -------------------------- | ------ | ---------------------------- |
| Get paginated activity log | GET    | /api/system/activity-log     |
| Get specific log           | GET    | /api/system/activity-log/:id |
| Delete log                 | DELETE | /api/system/activity-log/:id |

### SDK

You can access API in SDK with `sdk.activityLog`.

```js
await sdk.activityLog.getMany()
```
