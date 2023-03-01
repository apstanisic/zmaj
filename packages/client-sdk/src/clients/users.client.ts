import { endpoints, User, UserCreateDto, UserUpdateDto } from "@zmaj-js/common"
import { AxiosInstance } from "axios"
import { CrudClient } from "./crud.client"

export class UsersClient extends CrudClient<User, UserCreateDto, UserUpdateDto> {
	constructor(http: AxiosInstance) {
		super(http, endpoints.users.$base)
	}
}
