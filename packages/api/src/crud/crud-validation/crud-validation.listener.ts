import { Injectable } from "@nestjs/common"
// import Ajv from "ajv"
// import addFormats from "ajv-formats"

// const ajv = new Ajv({ strict: false })

// addFormats(ajv)
/**
 * Simple built in CRUD validation
 */
@Injectable()
export class CrudValidationListener {
	// /**
	//  * Validator
	//  */
	// constructor() {}
	// // @OnEvent("zmaj.collections.*.*.before")
	// @OnCrudEvent({ type: "start" })
	// before(event: CrudStartEvent): void {
	//   // nothing to validate when deleting or reading
	//   if (event.action !== "update" && event.action !== "create") return
	//   // Validate every item if validation exists
	//   const validation = event.collection.validation
	//   if (isNil(validation) || isEmpty(validation)) return
	//   const data =
	//     event.action === "create"
	//       ? event.dto
	//       : // we have to merge objects that will be updated with changes to check if valid
	//         event.toUpdate.map((item) => item.changed)
	//   data.forEach((item) => this.validate(item, validation))
	// }
	// /**
	//  * Validate object against provided JSON schema
	//  * @param item Data to be validated
	//  * @param validation JSONSchema for validation
	//  * @throws On validation error
	//  */
	// private validate(item: Struct, validation: SchemaObject): void {
	//   // Allow non validated fields by default, but user can override them
	//   // TODO memoize
	//   const validate = ajv.compile({ additionalProperties: true, ...validation })
	//   if (!validate(item)) {
	//     throw new BadRequestException(validate.errors?.map((error) => error.message))
	//   }
	// }
}
