import { endpoints, Permission, PermissionCreateDto, PermissionUpdateDto } from "@zmaj-js/common"
import { AxiosInstance } from "axios"
import { CrudClient } from "./crud.client"

export class PermissionsClient extends CrudClient<
	Permission,
	PermissionCreateDto,
	PermissionUpdateDto
> {
	constructor(http: AxiosInstance) {
		super(http, endpoints.permissions.$base)
	}
}
