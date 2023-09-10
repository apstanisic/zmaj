import { endpoints, UserModel } from "@zmaj-js/common"
import { AxiosInstance } from "axios"
import { CrudClient } from "./crud.client"

export class UsersClient extends CrudClient<UserModel> {
	constructor(http: AxiosInstance) {
		super(http, endpoints.users.$base)
	}
}
