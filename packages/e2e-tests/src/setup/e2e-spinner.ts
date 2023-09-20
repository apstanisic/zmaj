import { log } from "@clack/prompts"

type Params<T = unknown> = {
	start: string
	action: (log: (message: string) => void) => Promise<T>
	end: string
}

export async function spinner<T>(params: Params<T>): Promise<T> {
	// const s = sp()
	// s.start(params.start)
	log.step(params.start)
	const res = await params.action(log.step)
	log.success(params.end)
	// s.stop(params.end)
	return res
}
