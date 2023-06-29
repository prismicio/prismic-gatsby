import * as prismic from "@prismicio/client";
import { PrismicRichText } from "@prismicio/react";
import { graphql } from "gatsby";

import { Bounded } from "../../components/Bounded";

const Text = ({ slice }) => {
	return (
		<Bounded as="section">
			{prismic.isFilled.richText(slice.primary.text.richText) && (
				<div className="font-serif leading-relaxed md:text-xl md:leading-relaxed">
					<PrismicRichText field={slice.primary.text.richText} />
				</div>
			)}
		</Bounded>
	);
};

export default Text;

export const fragment = graphql`
	fragment PrismicText on PrismicText {
		... on PrismicTextDefault {
			variation
			primary {
				text {
					richText
				}
			}
		}
	}
`;
