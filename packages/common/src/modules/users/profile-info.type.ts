import { User } from "@common/modules"

export type ProfileInfo = Pick<User, "email" | "firstName" | "lastName" | "id">
