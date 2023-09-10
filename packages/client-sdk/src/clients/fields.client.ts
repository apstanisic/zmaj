import {
	FieldCreateDto,
	FieldMetadataModel,
	FieldUpdateDto,
	columnDataTypes,
	endpoints,
} from "@zmaj-js/common"
import { BaseModel } from "@zmaj-js/orm"
import { AxiosInstance } from "axios"
import { CrudClient } from "./crud.client"

class FieldDefModel extends BaseModel {
	name = "fields"
	fields = this.buildFields((f) => ({
		...new FieldMetadataModel().fields,
		collectionName: f.text({}),
		isPrimaryKey: f.boolean({}),
		isUnique: f.boolean({}),
		isForeignKey: f.boolean({}),
		isNullable: f.boolean({}),
		isAutoIncrement: f.boolean({}),
		hasDefaultValue: f.boolean({}),
		dataType: f.enumString({ enum: columnDataTypes }),
		dbDefaultValue: f.text({ nullable: true }),
		dbRawDataType: f.text({}),
	}))
}

export class FieldsClient extends CrudClient<FieldDefModel, FieldCreateDto, FieldUpdateDto> {
	constructor(http: AxiosInstance) {
		super(http, endpoints.infraFields.$base)
	}
}
