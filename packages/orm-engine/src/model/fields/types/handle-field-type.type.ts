import { BuildFieldParamsAndType } from "./build-field-params-and-type.type"
import { HandleCreateFieldType } from "./handle-create-field-type.type"
import { HandleNullableFieldType } from "./handle-nullable-field-type.type"
import { HandleReadFieldType } from "./handle-read-field-type.type"
import { HandleUpdateFieldType } from "./handle-update-field-type.type"

export type HandleFieldType<TParams extends BuildFieldParamsAndType<any>> = HandleReadFieldType<
	HandleUpdateFieldType<
		HandleCreateFieldType<
			HandleNullableFieldType<TParams> //
		> //
	>
>
