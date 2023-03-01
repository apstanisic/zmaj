import { vi } from "vitest"

export const HttpClient = vi.fn(() => ({
	client: {
		get: vi.fn().mockResolvedValue({}),
		post: vi.fn().mockResolvedValue({}),
		delete: vi.fn().mockResolvedValue({}),
		patch: vi.fn().mockResolvedValue({}),
		put: vi.fn().mockResolvedValue({}),
		request: vi.fn().mockResolvedValue({}),
	},
}))
