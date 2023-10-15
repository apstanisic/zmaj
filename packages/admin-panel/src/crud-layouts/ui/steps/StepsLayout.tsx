import { SaveButton } from "@admin-panel/app-layout/buttons/SaveButton"
import { Stepper } from "@admin-panel/ui/Stepper"
import { Button } from "@admin-panel/ui/buttons/Button"
import { clsx } from "clsx"
import { PropsWithChildren, ReactNode, useState } from "react"
import { StepContextProvider } from "./step-context"

/**
 * WIP
 * @returns
 */
export const StepLayout = (
	props: PropsWithChildren<{ sections: string[]; className?: string; endButton?: ReactNode }>,
): JSX.Element => {
	const [step, setStep] = useState(0)
	return (
		<>
			<StepContextProvider value={{ step, setStep, total: props.sections.length }}>
				<Stepper currentStep={step} steps={props.sections} />

				<div className={props.className}>{props.children}</div>

				{/* Buttons */}
				<div className="flex justify-between gap-5 p-6">
					{/* Back button */}
					<Button
						// variant="transparent"
						variant="outlined"
						isDisabled={step === 0}
						onPress={() => {
							setStep((old) => old - 1)
							window.scrollTo({ top: 0, behavior: "smooth" })
						}}
					>
						Previous
					</Button>
					{/* Show forward if not last page, show save if last page */}
					<Button
						className={clsx(props.sections.length - 1 === step && "hidden")}
						// variant="outlined"
						variant="outlined"
						onPress={() => {
							setStep((old) => old + 1)
							window.scrollTo({ top: 0, behavior: "smooth" })
						}}
					>
						Next
					</Button>
					{/* This button for some reason has to be rendered, otherwise isDirty is false */}
					<div className={clsx(props.sections.length - 1 !== step && "hidden")}>
						{props.endButton ?? <SaveButton />}
					</div>
				</div>
			</StepContextProvider>
		</>
	)
}
