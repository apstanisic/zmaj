import { PropsWithChildren } from "react"
import { useStepContext } from "./step-context"

export function StepSection(props: PropsWithChildren<{ index: number }>) {
	const { step } = useStepContext()
	return <div className={step !== props.index ? "hidden" : ""}>{props.children}</div>
}
