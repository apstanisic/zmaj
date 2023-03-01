import { useSdk } from "@admin-panel/context/sdk-context"
import { useRecord } from "@admin-panel/hooks/use-record"
import { useQuery } from "@tanstack/react-query"

export function useIsCurrentDevice() {
	const record = useRecord()

	const sdk = useSdk()
	return useQuery({
		queryKey: ["zmaj", "isCurrentSession"],
		enabled: record?.id !== undefined,
		queryFn: () => {
			return sdk.auth.authSessions.isCurrentSession(record!.id.toString())
		},
	})
}
