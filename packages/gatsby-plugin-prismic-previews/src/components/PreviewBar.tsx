import * as React from "react";

import { Logo } from "./Logo";

type PreviewBarProps = {
	variant?: "default" | "error";
	visibility?: "visible" | "hidden";
	children?: React.ReactNode;
	onDismiss?: () => void;
};

export const PreviewBar = ({
	variant,
	visibility,
	children,
	onDismiss,
}: PreviewBarProps): JSX.Element => {
	return (
		<div
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				bottom: 0,
				right: 0,
				padding: 30,
				display: "flex",
				justifyContent: variant === "error" ? "center" : "flex-end",
				alignItems: variant === "error" ? "center" : "flex-end",
				pointerEvents: "none",
				transition: "opacity 150ms",
				opacity: visibility === "hidden" ? 0 : 1,
				background: variant === "error" ? "rgba(80, 0, 0, 0.5)" : undefined,
			}}
		>
			<div
				style={{
					position: "relative",
					marginBottom: variant === "error" ? "25vh" : undefined,
					background: variant === "error" ? "#a31033" : "#f6f6f6",
					color: variant === "error" ? "#fff" : "#666",
					borderRadius: 6,
					overflow: "hidden",
					display: "flex",
					fontSize: 13,
					boxShadow:
						"0 1px 2px rgba(0, 0, 0, 0.2), 0 0 100px 60px rgba(0, 0, 0, 0.15)",
					letterSpacing: "-0.25px",
					transition: "transform 150ms",
					transform:
						visibility === "hidden" ? "translateY(10px)" : "translateY(0px)",
				}}
			>
				<div
					style={{
						background: variant === "error" ? "#c4133e" : "#fff",
						color: variant === "error" ? undefined : "#2c2c2c",
						fontWeight: 600,
						display: "flex",
						alignItems: "center",
						padding: 12,
					}}
				>
					<Logo style={{ width: 20, height: 20, marginRight: 8 }} />
					Preview
				</div>
				<div
					style={{
						padding: 12,
						display: "flex",
						alignItems: "center",
						flexGrow: 1,
					}}
				>
					<div>{children}</div>
					<button
						onClick={onDismiss}
						style={{
							fontSize: 20,
							alignSelf: "stretch",
							padding: "0 12px",
							margin: "-12px -12px -12px 0",
							color: variant === "error" ? "#ea8aa1" : "#b4b4b4",
							pointerEvents: "auto",
						}}
					>
						<span style={{ marginTop: -4, display: "block" }}>&times;</span>
					</button>
				</div>
			</div>
		</div>
	);
};
