import {
	WithPrismicPreviewResolverProps,
	withPrismicPreviewResolver,
} from "gatsby-plugin-prismic-previews";

function PreviewPage({ isPrismicPreview }: WithPrismicPreviewResolverProps) {
	return (
		<p>
			Is preview:{" "}
			{isPrismicPreview == null ? "unknown" : isPrismicPreview.toString()}
		</p>
	);
}

export default withPrismicPreviewResolver(PreviewPage);
