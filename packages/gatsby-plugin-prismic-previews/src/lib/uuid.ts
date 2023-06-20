export const uuid = (): string => {
	return (++uuid.i).toString();
};
uuid.i = 0;
