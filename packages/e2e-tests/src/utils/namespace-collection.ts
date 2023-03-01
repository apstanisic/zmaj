import { Page } from "@playwright/test"
import { joinFilters, qsParse, qsStringify, Struct, throwErr } from "@zmaj-js/common"

type NamespaceOptions = {
	page: Page
	field?: string
	suffix: string
	collection: string
	// it currently does not work in firefox for some reason, so we do nothing if ff
	// browserName: string
}

// so we don't have to pass field for common tables
const predefinedFields: Struct<string> = {
	comments: "body",
	posts: "title",
	tags: "name",
}

export async function namespaceTestCollections(
	params: Pick<NamespaceOptions, "page" | "suffix">,
): Promise<void> {
	for (const col of Object.keys(predefinedFields)) {
		await namespaceCollection({
			collection: col,
			field: predefinedFields[col],
			suffix: params.suffix,
			page: params.page,
		})
	}
}

/**
 * Not stable, testing currently
 */
export async function namespaceCollection(params: NamespaceOptions): Promise<void> {
	const { page, suffix, collection } = params
	const field = params.field ?? predefinedFields[collection] ?? throwErr()

	// not using since it's not working in firefox
	return
	// await page.route(`http://localhost:7100/${collection}*`, (route) => {
	// using void `promise` since this function should return void
	// eslint-disable-next-line no-unreachable
	await page.route(`http://localhost:7100/api/collections/${collection}*`, (route) => {
		const req = route.request()
		if (req.method() !== "GET") {
			void route.continue()
			return
		}

		const url = new URL(req.url())

		// this prevents from table posts mixing with postsTags, tagsPosts,
		// since they match in page.route(...)
		const pathname = url.pathname.endsWith("/") ? url.pathname.slice(0, -1) : url.pathname
		const valid = pathname.endsWith(`/${collection}`)
		if (!valid) {
			void route.continue()
			return
		}
		// console.log("Intercepted for " + params.collection, url.toString())

		const query = qsParse(url.search)
		const toAdd = { [field]: { $like: `%${suffix}` } }
		const newFilter = joinFilters(query["filter"], toAdd)
		url.search = qsStringify({ ...query, filter: newFilter }, { charset: "utf-8" })
		// console.log(1, "  ", req.url())
		// console.log(2, "  ", url.toString())
		// console.log(3, "  ", qsStringify({ ...query, filter: newFilter }))
		// console.log(4, "  ", decodeURI(qsStringify({ ...query, filter: newFilter })))
		// const use =

		// console.log({
		// 	og: req.url(),
		// 	nw: url.toString(), //
		// 	ogT: typeof req.url(),
		// 	nwT: typeof url.toString(), //
		// })

		// not working currently in firefox
		// it works if i provide og url, but not modified, I checked, and modified is valid
		route.continue({ url: url.toString() })
	})
}
