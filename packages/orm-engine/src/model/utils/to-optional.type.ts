// From https://stackoverflow.com/a/74652723
type UndefinedProperties<T> = {
	[P in keyof T]-?: undefined extends T[P] ? P : never
}[keyof T]

// Convert from `val | undefined` to `?: val | undefined`
type ToOptional<T> = Partial<Pick<T, UndefinedProperties<T>>> &
	Pick<T, Exclude<keyof T, UndefinedProperties<T>>>
