import { Orm } from "@zmaj-js/orm"

/**
 * This is ORM instance that is used to bootstrap the app.
 * This is the __same instance as main ORM__, but this version
 * is available before infra state is instantiated, so we can use
 * this ORM to fetch metadata needed to generate models.
 *
 * It goes like this:
 * BootstrapOrm => InfraState => Orm
 */
export abstract class BootstrapOrm extends Orm {}
