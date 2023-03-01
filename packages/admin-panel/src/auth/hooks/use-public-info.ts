import { useQuery, UseQueryResult } from "@tanstack/react-query"
import { PublicAuthData } from "@zmaj-js/common"
import { minutesToMilliseconds } from "date-fns"
import { useSdk } from "../../context/sdk-context"

export function usePublicInfo(): UseQueryResult<PublicAuthData> {
	const sdk = useSdk()

	return useQuery({
		queryKey: ["zmaj", "publicInfo"],
		queryFn: async () => sdk.auth.getPublicAuthInfo(),
		staleTime: minutesToMilliseconds(20),
	})
}
