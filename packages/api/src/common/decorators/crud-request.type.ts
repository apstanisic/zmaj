import { AuthUser, CollectionDef, Struct } from "@zmaj-js/common"
import { IdType } from "@zmaj-js/orm"

export type CrudRequest = {
	/** IP */
	ip: string
	/** User Agent */
	userAgent?: string
	/** Authentication user */
	user?: AuthUser
	/** Url query */
	// query: UrlQuery
	query: Struct
	/** Params from url path */
	params: { collection?: string; id?: string; [key: string]: string | undefined }
	/** Request body. If request does not have body it will be empty object */
	body: Struct
	/** Only available if there is `:collection` param or set manually by `@SetCollection` */
	collection: string | CollectionDef
	/** Only available if there is `:id` param  */
	recordId?: IdType
	/** Only available if set with `@SetSystemPermission('resource', 'action')` */
	// authz?: { action: string; resource: string }
	isCrudRequest: true
}
