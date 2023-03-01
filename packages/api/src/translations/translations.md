# Translations

This module fetches translation stored in db.
There is a special table `zmaj_translations` that stores all translations.
There is no need for types, because translations are only for strings, and it's data type is json.
This is simplest way to store and get data, there is no need for special tables.
Key is column name, and value is value. There won't be any surprises because we are replacing
only keys that exist in item (value !== undefined).

## Other way to get translations

User can also manually specify translations by adding fields to collection table.
For example if user uses English and Spanish, he/she can have field `title`, and field `title_es`,
and then in column metadata simply say how he/she wants table name to be.
That way user can filter by translation.

This service is used by CRUD services internally, if user specifies query parameter `language`.

<!-- We can configure in `.env` file if we want to throw an error if translation does not exist. -->

## Fetching translations

You fetch translations as any other collection, only difference is that you set language in url query.
It will replace normal values with translations.

## TODO

Implement Create, update, delete
