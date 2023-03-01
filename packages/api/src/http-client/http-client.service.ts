import { Injectable } from "@nestjs/common"
import axios, { AxiosInstance } from "axios"

@Injectable()
export class HttpClient {
	readonly client: AxiosInstance = axios.create()
}
