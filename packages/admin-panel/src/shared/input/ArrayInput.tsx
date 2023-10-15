import { Button } from "@admin-panel/ui/buttons/Button"
import { IconButton } from "@admin-panel/ui/buttons/IconButton"
import { ReactNode } from "react"
import { useFieldArray, useFormContext } from "react-hook-form"
import {
	//
	MdAddCircleOutline,
	MdArrowDownward,
	MdArrowUpward,
	MdDelete,
} from "react-icons/md"

type ArrayInputProps = {
	/**
	 * This is default value for every item
	 */
	defaultValue?: any
	/**
	 * Base name
	 */
	source: string
	/**
	 * Render for single input
	 */
	render: (name: string, val: any) => ReactNode
}

export function ArrayInput(props: ArrayInputProps): JSX.Element {
	const { control, watch } = useFormContext()

	const controller = useFieldArray({ name: props.source, control })

	return (
		<div>
			{controller.fields.map((f, i) => {
				const name = `${props.source}.${i}`

				return (
					<div key={f.id}>
						<div className="flex items-center justify-between">
							<span className="text-sm">Value {i + 1}</span>
							<IconButton
								aria-label="Remove item"
								className="ml-2"
								color="error"
								onPress={() => controller.remove(i)}
							>
								<MdDelete />
							</IconButton>
						</div>
						{/*  */}
						{props.render(name, watch(name))}
						{/*  */}
						{i < controller.fields.length - 1 && (
							<div className="center w-full">
								<Button
									size="small"
									color="transparent"
									onPress={() => controller.swap(i, i + 1)}
									startIcon={<MdArrowUpward />}
									endIcon={<MdArrowDownward />}
								>
									switch places
								</Button>
							</div>
						)}
					</div>
				)
			})}
			<div className="flex w-full justify-end">
				<Button
					color="transparent"
					onPress={() => controller.append(props.defaultValue ?? "")}
					endIcon={<MdAddCircleOutline />}
				>
					Add
				</Button>
			</div>
		</div>
	)
}
