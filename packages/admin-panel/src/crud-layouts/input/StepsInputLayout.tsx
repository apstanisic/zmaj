import { SaveButton } from "@admin-panel/app-layout/buttons/SaveButton"
import { useActionContext } from "@admin-panel/context/action-context"
import { useResourceCollection } from "@admin-panel/hooks/use-resource-collection"
import { Button } from "@admin-panel/ui/buttons/Button"
import { Form } from "ra-core"
import { memo } from "react"
import { useGeneratePropertiesAndSections } from "../../generator/layouts/use-generate-sections"
import { DefineCrudLayout } from "../DefineCrudLayout"
import { StepSection } from "../ui/steps/StepSection"
import { StepLayout } from "../ui/steps/StepsLayout"
import { useStepContext } from "../ui/steps/step-context"

/**
 * Step Input Layout  (1 -> 2 -> 3...)
 *
 * @param props
 * @todo Ensure that it works with `react-hook-form`
 * @todo See if `Toolbar` is still valid
 */
export const StepsForm = memo(() => {
	const action = useActionContext()
	const config =
		useResourceCollection().layoutConfig.input[action === "edit" ? "edit" : "create"]?.steps
	const sections = useGeneratePropertiesAndSections(config)

	return (
		<Form shouldUnregister={false}>
			<StepLayout sections={sections.map((s) => s.label)} endButton={<Buttons />}>
				{sections.map(({ fields }, i) => (
					<StepSection key={i} index={i}>
						{fields.map((f) => f.rendered)}
					</StepSection>
				))}
			</StepLayout>
		</Form>
	)
})

function Buttons() {
	const { setStep, step, total } = useStepContext()
	return (
		<div className="flex justify-between gap-5 p-6">
			{/* Back button */}
			<Button
				isDisabled={step === 0}
				onPress={() => {
					setStep(step - 1)
					// setCurrentStep((old) => old - 1)
					window.scrollTo({ top: 0, behavior: "smooth" })
				}}
			>
				Previous
			</Button>
			{/* Show forward if not last page, show save if last page */}
			{total - 1 > step ? (
				<Button
					variant="outlined"
					onPress={() => {
						setStep(step + 1)
						// setCurrentStep((old) => old + 1)
						window.scrollTo({ top: 0, behavior: "smooth" })
					}}
				>
					Next
				</Button>
			) : (
				<SaveButton />
			)}
		</div>
	)
}

/**
 * Register layout
 */
export const StepsInputLayout = DefineCrudLayout({
	type: "input",
	name: "steps",
	Layout: StepsForm,
})
