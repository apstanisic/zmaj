# Collection Info

Stores info about collection (db table)

## Auto syncing from db schema to info

Every table automatically have collection info. On startup, missing collection info are generated,
and collection info that don't have table are deleted.
This simplifies frontend, because we don't have to have special case for when table does
not have collection info.

## Crud syncing

When collection is created/deleted, event hooks are called that will create/delete
required table in database.
