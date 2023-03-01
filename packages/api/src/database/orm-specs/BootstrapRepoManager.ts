import { RepoManager } from "./RepoManager"

/**
 * We need to have 2 repo managers, 1 with system collections inited, and 1 with all collections
 * inited. That way, we can use BRM to bootstrap main RM.
 * They can be same instance `BRM === RM`, but BRM will be available to inject before
 * user collections are inited, and is used to discover additional tables to pass to RM.
 */
export abstract class BootstrapRepoManager extends RepoManager {}
