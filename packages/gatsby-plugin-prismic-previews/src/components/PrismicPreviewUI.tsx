import * as React from "react";

import {
	// PrismicContextActionType,
	PrismicPreviewState,
} from "../context";
import { usePrismicPreviewContext } from "../usePrismicPreviewContext";
// import { usePrismicPreviewAccessToken } from "../usePrismicPreviewAccessToken";

import { Root } from "./Root";
import { PreviewBar } from "./PreviewBar";

type PrismicPreviewUIProps = {
	afterAccessTokenSet(): void;
};

export const PrismicPreviewUI = ({}: // afterAccessTokenSet,
PrismicPreviewUIProps): JSX.Element => {
	const [state, _dispatch] = usePrismicPreviewContext();
	// const [accessToken, accessTokenActions] = usePrismicPreviewAccessToken(
	// 	state.activeRepositoryName,
	// );

	const [isVisible, setIsVisible] = React.useState(true);
	const hide = () => setIsVisible(false);

	// const goToIdle = () => dispatch({ type: PrismicContextActionType.GoToIdle });

	// TODO: Handle modal visibility state locally, not by transitioning globally to IDLE.

	return (
		<>
			{state.activeRepositoryName && (
				<Root>
					<PreviewBar
						visibility={isVisible ? "visible" : "hidden"}
						variant={
							state.previewState ===
								PrismicPreviewState.PROMPT_FOR_ACCESS_TOKEN ||
							state.previewState === PrismicPreviewState.FAILED
								? "red"
								: "default"
						}
						onDismiss={hide}
					>
						{state.previewState === PrismicPreviewState.RESOLVING &&
							"Resolving page…"}
						{state.previewState === PrismicPreviewState.BOOTSTRAPPING &&
							"Preparing content…"}
						{state.previewState === PrismicPreviewState.ACTIVE &&
							"Displaying draft content"}
						{state.previewState === PrismicPreviewState.FAILED && (
							<>
								<span style={{ fontWeight: 600, marginRight: 10 }}>Error</span>
								<span style={{ color: "#ea8aa1" }}>
									Message printed to console
								</span>
							</>
						)}
						{state.previewState ===
							PrismicPreviewState.PROMPT_FOR_ACCESS_TOKEN && (
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
						)}
					</PreviewBar>
				</Root>
			)}
		</>
	);
};
