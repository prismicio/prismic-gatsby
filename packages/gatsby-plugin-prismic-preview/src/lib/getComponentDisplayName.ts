/**
 * Returns a component's display name. If none is provided, "Component" is
 * returned.
 *
 * @param WrappedComponent Component from which to get the display name.
 *
 * @returns `WrappedComponent`'s display name.
 */
export const getComponentDisplayName = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  WrappedComponent: React.ComponentType<any>,
): string =>
  WrappedComponent.displayName || WrappedComponent.name || 'Component'
