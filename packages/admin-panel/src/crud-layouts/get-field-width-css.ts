import { clamp } from "@zmaj-js/common"
import { clsx } from "clsx"
import { memo, toInt } from "radash"

/**
 * Limit width of the field between 1 to 12 (full width in most grids)
 * `clamp` is inclusive
 *
 * @param width Width of the field
 * @returns Field width, between 1 and 12
 */
const max12 = (width: number): number => clamp(toInt(width), 1, 12)

/**
 * We are using 12 columns wide grid,
 * as most of the frameworks use (because it dividable by 2, 3, 4, 6)
 * we must limit max width to 12 columns
 *
 * This function depends on tailwind `safelist` property, that makes sure
 * that relevant classes are always there
 */
export const getFieldWidthCss = memo((width: number | undefined): string => {
	const parsedWidth = max12(width ?? 12)
	return clsx(
		`lg:col-span-${parsedWidth}`,
		`md:col-span-${max12(parsedWidth * 2)}`,
		`col-span-${max12(parsedWidth * 4)}`,
	)
})

export const fullWidthFieldCss = getFieldWidthCss(12)
