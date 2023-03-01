import { DefinedUseQueryResult, useQuery } from "@tanstack/react-query"
import { minutesToMilliseconds } from "date-fns"
import { useSdk } from "../../../context/sdk-context"

/**
 */
// export function useAvailableStorageProviders(): UseServerValueResult<string[]> {
// 	const sdk = useSdk()
// 	return useServerValue<string[]>(
// 		"$storage-providers",
// 		async () => sdk.files.getStorageProviders().catch((e) => []),
// 		{ defaultValue: [] },
// 	)
// }

type StorageProvidersResult = DefinedUseQueryResult<string[], unknown>

export function useAvailableStorageProviders(): StorageProvidersResult {
	const sdk = useSdk()
	return useQuery({
		queryKey: ["zmaj", "storageProviders"],
		queryFn: async () => sdk.files.getStorageProviders().catch(() => []),
		placeholderData: [],
		initialData: undefined as any as string[],
		staleTime: minutesToMilliseconds(5),
	})
}
