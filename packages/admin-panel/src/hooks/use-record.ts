import { RaRecord, useRecordContext } from "ra-core"

/**
 *  `useRecordContext` does not always return record, for example on first render
 */
export const useRecord = <T extends RaRecord>(): T | undefined => {
	return useRecordContext<T>()
}
