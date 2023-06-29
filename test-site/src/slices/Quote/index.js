import * as prismic from "@prismicio/client";
import { graphql } from "gatsby";

import { Bounded } from "../../components/Bounded";

const Quote = ({ slice }) => {
	return (
		<Bounded as="section" size="wide">
			{slice.primary.quote.text && (
				<div className="font-serif text-3xl italic leading-relaxed">
					&ldquo;
					{slice.primary.quote.text}
					&rdquo;
					{prismic.isFilled.keyText(slice.primary.source) && (
						<> &mdash; {slice.primary.source}</>
					)}
				</div>
			)}
		</Bounded>
	);
};

export default Quote;

export const fragment = graphql`
	fragment PrismicQuote on PrismicQuote {
		... on PrismicQuoteDefault {
			variation
			primary {
				quote {
					text
				}
				source
			}
		}
	}
`;
