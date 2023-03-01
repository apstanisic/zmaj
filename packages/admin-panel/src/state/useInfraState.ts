import { DefinedUseQueryResult, useQuery } from "@tanstack/react-query"
import { ZmajSdk } from "@zmaj-js/client-sdk"
import { CollectionDef, systemCollections } from "@zmaj-js/common"
import { minutesToMilliseconds } from "date-fns"
import { unique } from "radash"
import { useSdk } from "../context/sdk-context"

async function getInfra(sdk: ZmajSdk): Promise<CollectionDef[]> {
	if (!sdk.auth.isSignedIn) return systemCollections.concat()

	return sdk.infra
		.getAdminPanelInfra()
		.then((cols) => unique(systemCollections.concat(cols), (c) => c.tableName))
		.catch(() => [])
}

type InfraStateResult = DefinedUseQueryResult<CollectionDef[], unknown>

export function useInfraState(): InfraStateResult {
	const sdk = useSdk()
	return useQuery({
		retry: 20,
		queryKey: ["zmaj", "infra"],
		// do not get new infra often
		staleTime: minutesToMilliseconds(60),
		queryFn: async () => getInfra(sdk),

		// lie to typescript that there is initial data, since it
		initialData: undefined as any as CollectionDef[],
		placeholderData: [], //,systemCollections.concat(),
	})
}
