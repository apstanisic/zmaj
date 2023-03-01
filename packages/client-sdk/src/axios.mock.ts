import axios, { AxiosInstance } from "axios"
import { Mocked, vi } from "vitest"

export function axiosMock(): AxiosMock {
	const http = axios.create({})
	http.get = vi.fn().mockResolvedValue({ data: {} })
	http.post = vi.fn().mockResolvedValue({ data: {} })
	http.put = vi.fn().mockResolvedValue({ data: {} })
	http.patch = vi.fn().mockResolvedValue({ data: {} })
	http.delete = vi.fn().mockResolvedValue({ data: {} })
	http.request = vi.fn().mockResolvedValue({ data: {} })

	http.interceptors.request.use = vi.fn()

	return http as AxiosMock
}

export type AxiosMock = Mocked<AxiosInstance>

// type Mockify<T = any> = {
// 	[key in keyof T]: T[key] extends (...args: any) => any
// 		? Mock<Parameters<T[key]>, ReturnType<T[key]>>
// 		: never
// 	// : T[key]
// }

// const a: Mockify<AxiosInstance> = {}

// const b: Mocked<AxiosInstance> = {} as any

// b.get.mock
