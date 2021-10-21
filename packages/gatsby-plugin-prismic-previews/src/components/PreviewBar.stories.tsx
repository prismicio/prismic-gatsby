import * as React from "react";

import { PreviewBar } from "./PreviewBar";
import { Root } from "./Root";

export default {
	title: "Components/UI",
	component: PreviewBar,
	parameters: {
		layout: "fullscreen",
	},
};

const backgrounds = [
	"https://tailwindui.com/img/components/feature-sections.08-alternating-with-optional-testimonial-xl.jpg",
	"https://tailwindui.com/img/components/feature-sections.09-4x2-grid-on-brand-xl.png",
	"https://tailwindui.com/img/components/feature-sections.10-with-large-screenshot-xl.jpg",
	"https://tailwindui.com/img/components/hero-sections.06-with-sign-up-and-media-content-xl.jpg",
	"https://tailwindui.com/img/components/hero-sections.08-dark-with-illustration-xl.jpg",
	"https://tailwindui.com/img/components/hero-sections.07-card-with-background-image-xl.jpg",
];

export const Bootstrapping = (): JSX.Element => {
	const [isHidden, toggleIsHidden] = React.useReducer((state) => !state, false);

	return (
		<>
			<Root>
				<PreviewBar visibility={isHidden ? "hidden" : "visible"}>
					Preparing content…
				</PreviewBar>
			</Root>
			{backgrounds.map((src) => (
				<img key={src} src={src} width="100%" />
			))}
			<button
				onClick={toggleIsHidden}
				style={{ position: "fixed", bottom: 0, left: 0 }}
			>
				Toggle visibility
			</button>
		</>
	);
};

export const Refreshing = (): JSX.Element => {
	const [isHidden, toggleIsHidden] = React.useReducer((state) => !state, false);

	return (
		<>
			<Root>
				<PreviewBar visibility={isHidden ? "hidden" : "visible"}>
					Refreshing content…
				</PreviewBar>
			</Root>
			{backgrounds.map((src) => (
				<img key={src} src={src} width="100%" />
			))}
			<button
				onClick={toggleIsHidden}
				style={{ position: "fixed", bottom: 0, left: 0 }}
			>
				Toggle visibility
			</button>
		</>
	);
};

export const Error = (): JSX.Element => {
	const [isHidden, toggleIsHidden] = React.useReducer((state) => !state, false);

	return (
		<>
			<Root>
				<PreviewBar visibility={isHidden ? "hidden" : "visible"} variant="red">
					<span style={{ fontWeight: 600, marginRight: 10 }}>Error</span>
					<span style={{ color: "#ea8aa1" }}>Message printed to console</span>
				</PreviewBar>
			</Root>
			{backgrounds.map((src) => (
				<img key={src} src={src} width="100%" />
			))}
			<button
				onClick={toggleIsHidden}
				style={{ position: "fixed", bottom: 0, left: 0 }}
			>
				Toggle visibility
			</button>
		</>
	);
};

export const AccessTokenNeeded = (): JSX.Element => {
	const [isHidden, toggleIsHidden] = React.useReducer((state) => !state, false);

	return (
		<>
			<Root>
				<PreviewBar visibility={isHidden ? "hidden" : "visible"} variant="red">
					<form style={{ display: "flex", pointerEvents: "auto" }}>
						<span style={{ marginRight: 10, alignSelf: "center" }}>
							Enter your access token
						</span>
						<input
							style={{
								borderRadius: 3,
								backgroundColor: "#ea8aa1",
								border: 0,
								padding: 6,
								margin: "-4px 0",
								lineHeight: 1,
								boxShadow: "0 1px rgba(0, 0, 0, 0.1)",
								color: "#2c2c2c",
								fontFamily: "monospace",
								marginRight: 8,
							}}
						/>
						<button
							style={{
								background: "#fff",
								color: "#a31033",
								borderRadius: 3,
								fontWeight: 600,
								padding: 8,
								lineHeight: 1,
								margin: "-4px 0",
								boxShadow: "0 1px rgba(0, 0, 0, 0.1)",
							}}
						>
							Submit
						</button>
					</form>
				</PreviewBar>
			</Root>
			{backgrounds.map((src) => (
				<img key={src} src={src} width="100%" />
			))}
			<button
				onClick={toggleIsHidden}
				style={{ position: "fixed", bottom: 0, left: 0 }}
			>
				Toggle visibility
			</button>
		</>
	);
};
