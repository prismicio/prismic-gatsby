import { graphql, PageProps } from "gatsby";
import {
	withPrismicPreview,
	WithPrismicPreviewProps,
} from "gatsby-plugin-prismic-previews";

function KitchenSinkPage(
	props: PageProps<WithPrismicPreviewProps>,
): JSX.Element {
	return (
		<pre style={{ background: "lightgray", padding: "2rem" }}>
			<code>{JSON.stringify(props.data, null, 4)}</code>
		</pre>
	);
}

export default withPrismicPreview(KitchenSinkPage);

export const query = graphql`
	query KitchenSinkPage($id: String!) {
		prismicKitchenSink(id: { eq: $id }) {
			_previewable
			uid
			data {
				title {
					text
				}
			}
		}
	}
`;
