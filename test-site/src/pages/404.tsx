import { withPrismicUnpublishedPreview } from "gatsby-plugin-prismic-previews";

const NotFoundPage = () => <p>404 Not Found</p>;

export default withPrismicUnpublishedPreview(NotFoundPage);
