import type { WrapRootElementBrowserArgs } from "gatsby";
import { PrismicPreviewProvider } from "gatsby-plugin-prismic-previews";

import { repositoryConfigs } from "./src/prismicPreviews";

export const wrapRootElement = (
	args: WrapRootElementBrowserArgs,
): React.ReactElement => {
	return (
		<PrismicPreviewProvider repositoryConfigs={repositoryConfigs}>
			{args.element}
		</PrismicPreviewProvider>
	);
};
