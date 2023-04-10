import { Fields, StripEntityRef } from "@zmaj-js/common"

// Check if type is array. Strips null and undefined
type IsArray<T> = NonNullable<T> extends any[] ? true : false

// Make type array is `Is` is `true`
type MakeArrayIf<Is extends boolean, T> = Is extends true ? T[] : T

export type ReturnedFields<T, F extends Fields<T> | undefined> = F extends undefined
	? T
	: {
			[key in keyof Required<T>]: NonNullable<F>[key] extends true // if true, simply return required type
				? NonNullable<T[key]>
				: NonNullable<F>[key] extends object // if object, pick fields
				? // keep type array if it's array relation
				  MakeArrayIf<
						IsArray<T[key]>, //
						ReturnedFields<StripEntityRef<T[key]>, NonNullable<F>[key]>
				  >
				: T[key] | undefined // otherwise return current type but make in optional
	  }

// I do not like bellow example because it breaks the flow,
// It create type:
// { ...fields } & {...relations }, and there is problem when I want to use key to map
//
// export type ReturnedFields2<T, F extends Fields<T> | undefined> = F extends undefined
// 	? T
// 	: {
// 			[key in keyof OnlyFields<T>]: NonNullable<F>[key] extends true ? T[key] : undefined | T[key]
// 	  } & {
// 			[key in keyof OnlyRelations<T>]: NonNullable<F>[key] extends true
// 				? StripEntityRefKeepArray<T[key]>
// 				: NonNullable<F>[key] extends object
// 				? MakeArrayIf<
// 						IsArray<T[key]>, //
// 						ReturnedFields<StripEntityRef<T[key]>, NonNullable<F>[key]>
// 				  >
// 				: undefined | T[key]
// 	  }
