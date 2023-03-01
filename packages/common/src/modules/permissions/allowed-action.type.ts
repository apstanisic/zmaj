import { Permission } from "@common/modules/permissions/permission.model"

export type AllowedAction = Pick<Permission, "action" | "fields" | "resource">
