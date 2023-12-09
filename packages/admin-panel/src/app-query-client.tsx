import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { hoursToMilliseconds } from "date-fns"
import { ReactNode } from "react"

const appQueryClient = new QueryClient({
	defaultOptions: {
		queries: {
			cacheTime: hoursToMilliseconds(24) * 30, // 1 month
		},
	},
})

export function ZmajQueryClientProvider(props: { children?: ReactNode }) {
	return <QueryClientProvider client={appQueryClient}>{props.children}</QueryClientProvider>
}
