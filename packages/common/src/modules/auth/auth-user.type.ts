import { AuthUser } from "./auth-user"

export type AuthUserType = Pick<AuthUser, "email" | "exp" | "iat" | "roleId" | "sub" | "userId">
