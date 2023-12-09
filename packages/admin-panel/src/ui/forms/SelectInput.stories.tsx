// Replace your-framework with the name of your framework
import type { Meta, StoryObj } from "@storybook/react"

import { times } from "@zmaj-js/common"
import { SelectInput } from "./SelectInput"

const meta: Meta<typeof SelectInput> = {
	component: SelectInput,
	args: {
		options: times(5, (i) => ({
			label: `Option #${i + 1}`,
			value: i + 1,
			disabled: i % 3 === 0,
		})),
	},
}

export default meta
type Story = StoryObj<typeof SelectInput>

//👇 Throws a type error it the args don't match the component props
export const Default: Story = {
	args: {},
}
