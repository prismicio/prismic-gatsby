import { expect } from "vitest";

import { waitFor } from "@testing-library/react";

export const waitForConsoleError = async (): Promise<void> => {
	await waitFor(() => {
		expect(console.error).toHaveBeenCalled();
	});
};
