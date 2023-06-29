/**
 * Returns a component's display name. If none is provided, "Component" is
 * returned.
 *
 * @param WrappedComponent - Component from which to get the display name.
 *
 * @returns `WrappedComponent`'s display name.
 */
export const getComponentDisplayName = <TProps>(
	WrappedComponent: React.ComponentType<TProps>,
): string =>
	WrappedComponent.displayName || WrappedComponent.name || "Component";
