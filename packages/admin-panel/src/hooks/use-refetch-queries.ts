import { useQueryClient } from "@tanstack/react-query"

export function useRefetchQueries(): () => Promise<void> {
	const client = useQueryClient()
	return async () => client.refetchQueries(["zmaj"])
}
