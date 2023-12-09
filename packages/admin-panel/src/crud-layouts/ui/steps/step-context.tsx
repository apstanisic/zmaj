import { createContext, PropsWithChildren, useContext } from "react"

type StepContext = { step: number; setStep: (step: number) => void; total: number }

const Ctx = createContext<StepContext>({
	step: 0,
	setStep: (step: number) => undefined,
	total: 0,
})

export function useStepContext(): StepContext {
	return useContext(Ctx)
}

export function StepContextProvider(props: PropsWithChildren<{ value: StepContext }>) {
	return <Ctx.Provider value={props.value}>{props.children}</Ctx.Provider>
}
