import * as prismic from "@prismicio/client";
import { PrismicRichText } from "@prismicio/react";
import { graphql } from "gatsby";
import { GatsbyImage } from "gatsby-plugin-image";

import { Bounded } from "../../components/Bounded";

const Image = ({ slice }) => {
	const image = slice.primary.image;

	return (
		<Bounded as="section" size={slice.variation === "wide" ? "widest" : "base"}>
			<figure className="grid grid-cols-1 gap-4">
				{image.gatsbyImageData && (
					<div className="bg-gray-100">
						<GatsbyImage
							image={image.gatsbyImageData}
							alt={image.alt}
							layout="fullWidth"
						/>
					</div>
				)}
				{prismic.isFilled.richText(slice.primary.caption.richText) && (
					<figcaption className="text-center font-serif italic tracking-tight text-slate-500">
						<PrismicRichText field={slice.primary.caption.richText} />
					</figcaption>
				)}
			</figure>
		</Bounded>
	);
};

export default Image;

export const fragment = graphql`
	fragment PrismicImage on PrismicImage {
		... on PrismicImageDefault {
			variation
			primary {
				caption {
					richText
				}
				image {
					gatsbyImageData
					alt
				}
			}
		}

		... on PrismicImageWide {
			variation
			primary {
				caption {
					richText
				}
				image {
					gatsbyImageData
					alt
				}
			}
		}
	}
`;
