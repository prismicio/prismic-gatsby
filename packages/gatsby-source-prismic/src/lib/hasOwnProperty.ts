/**
 * Determines if an object contains a given property. It augments the provided
 * object's type to include the property.
 *
 * @returns `true` if `obj` contains a `prop` property, `false` otherwise.
 */
export const hasOwnProperty = <X extends object, Y extends PropertyKey>(
	obj: X,
	prop: Y,
): obj is X & Record<Y, unknown> => {
	return obj.hasOwnProperty(prop);
};
