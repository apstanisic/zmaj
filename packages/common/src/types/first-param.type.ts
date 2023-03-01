/**
 * Get first parameter from function
 */
export type FirstParam<T extends (...args: any) => any> = Parameters<T>[0]
