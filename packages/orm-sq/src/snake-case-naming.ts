import { snakeCase } from "@zmaj-js/common"
import { NameTransformer } from "@zmaj-js/orm"
export const snakeCaseNaming: NameTransformer = ({ key }) => {
	return snakeCase(key)
}
