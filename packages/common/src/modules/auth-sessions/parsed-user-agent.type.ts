export type ParsedUserAgent = {
	browser?: {
		name?: string
		version?: string
	}
	os?: {
		name?: string
		version?: string
	}
	device?: {
		type?: string
		vendor?: string
	}
}
