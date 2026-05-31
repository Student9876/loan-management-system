"use client";

import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {useState} from "react";

export default function QueryProvider({children}: {children: React.ReactNode}) {
	// Initialize the client in state to ensure it is not recreated on every render
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 60 * 1000, // Data remains fresh for 1 minute
						refetchOnWindowFocus: true, // Auto-refresh when executive switches tabs
						retry: 1,
					},
				},
			}),
	);

	return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
