import { ColumnDataType } from "../column-data-type"
import { BuildFieldAddCreate } from "./build-field-add-create.type"
import { BuildFieldAddNullable } from "./build-field-add-nullable.type"
import { BuildFieldAddRead } from "./build-field-add-read.type"
import { BuildFieldAddUpdate } from "./build-field-add-update.type"
import { BuildFieldParamsAndType } from "./build-field-params-and-type.type"
import { BuildFieldParams } from "./build-field-params.type"

export type BuildFieldResult<TType, TParams extends BuildFieldParams> = BuildFieldAddRead<
	BuildFieldAddUpdate<
		BuildFieldAddCreate<
			BuildFieldAddNullable<
				BuildFieldParamsAndType<TType, TParams> //
			> //
		> //
	>
> &
	Required<BuildFieldParams> & { dataType: ColumnDataType }
