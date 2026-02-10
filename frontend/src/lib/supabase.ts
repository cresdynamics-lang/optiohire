'use client'

// Minimal no-op Supabase stub to keep legacy imports compiling.
// All methods are chainable and resolve to { data: [], error: null } when awaited.

export type Database = any

type QueryResult = { data: any; error: null }

function createChainable(): any {
	let proxy: any
	const handler: ProxyHandler<any> = {
		get(_target, prop) {
			if (prop === 'then') {
				// Allow `await` on the chain to resolve with a default result
				return (resolve: (value: QueryResult) => void) =>
					resolve({ data: [], error: null })
			}
			// Return a function for any method; keep chainable
			return () => proxy
		},
		apply() {
			return proxy
		},
	}
	proxy = new Proxy(function () {}, handler)
	return proxy
}

export const supabase: any = {
	from: () => createChainable(),
	channel: () => ({
		on: () => ({
			subscribe: () => ({}),
		}),
	}),
	removeChannel: () => {},
}


