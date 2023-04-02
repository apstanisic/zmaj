import { useQueryClient } from "@tanstack/react-query"

/**
 * Returns function that will invalidate all queries
 */
export function useRefetchQueries(): () => Promise<void> {
	const client = useQueryClient()
	return async () => client.refetchQueries(["zmaj"])
}
