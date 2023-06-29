import * as React from "react";
import { render } from "@testing-library/react";
import { renderToString } from "react-dom/server";

export const renderStatic = (
	...[ui, options]: Parameters<typeof render>
): ReturnType<typeof render> => {
	const staticMarkup = renderToString(ui);

	return render(
		<div dangerouslySetInnerHTML={{ __html: staticMarkup }} />,
		options,
	);
};
