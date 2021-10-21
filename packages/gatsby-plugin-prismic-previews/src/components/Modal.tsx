import * as React from "react";
import { Dialog } from "@reach/dialog";
import clsx from "clsx";

import { Root } from "./Root";

const CloseSVG = (props: React.SVGProps<SVGSVGElement>): JSX.Element => (
	<svg viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" {...props}>
		<path
			d="m297.612899 76.2097046.094208.0831886 7.292893 7.2921068 7.292893-7.2921068c.390525-.3905243 1.023689-.3905243 1.414214 0 .360484.360484.388213.927715.083188 1.3200062l-.083188.0942074-7.292107 7.2928932 7.292107 7.2928932c.390524.3905243.390524 1.0236893 0 1.4142136-.360484.3604839-.927715.3882135-1.320006.0831886l-.094208-.0831886-7.292893-7.2921068-7.292893 7.2921068c-.390525.3905243-1.023689.3905243-1.414214 0-.360484-.360484-.388213-.927715-.083188-1.3200062l.083188-.0942074 7.292107-7.2928932-7.292107-7.2928932c-.390524-.3905243-.390524-1.0236893 0-1.4142136.360484-.3604839.927715-.3882135 1.320006-.0831886z"
			fill="currentColor"
			transform="translate(-296 -76)"
		/>
	</svg>
);

type PrismicLogoProps = {
	fillWhite?: boolean;
} & React.SVGProps<SVGSVGElement>;

const PrismicLogo = ({
	fillWhite,
	...props
}: PrismicLogoProps): JSX.Element => (
	<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg" {...props}>
		<g fill="none">
			<path
				d="M39.19 1.534a10.38 10.38 0 014.292 4.341C44.472 7.747 45 9.605 45 14.723v8.99c0 .116-.07.22-.176.265a.283.283 0 01-.31-.062v-.001l-3.358-3.395a1.443 1.443 0 01-.416-1.016V15.35c0-3.84-.396-5.232-1.138-6.636a7.785 7.785 0 00-3.22-3.255c-1.374-.744-2.737-1.143-6.444-1.15l-5.551-.001a.285.285 0 01-.262-.178.289.289 0 01.062-.312L27.545.42C27.81.151 28.172 0 28.549 0h1.889c5.063 0 6.9.533 8.751 1.534zM32.22 7.178c3.137 0 5.68 2.572 5.68 5.743v3.636a.287.287 0 01-.174.262.282.282 0 01-.307-.056l-4.58-4.425a2.83 2.83 0 00-1.035-.668 2.806 2.806 0 00-1.004-.185H17.284a.285.285 0 01-.262-.177.289.289 0 01.061-.313l3.364-3.397c.265-.268.626-.42 1.003-.42z"
				fill={fillWhite ? "white" : "#e55638"}
			/>
			<path
				d="M41.182 24.185l3.397 3.359c.269.266.421.628.421 1.005v1.89c0 5.062-.533 6.899-1.535 8.75a10.38 10.38 0 01-4.34 4.295c-1.873.988-3.73 1.516-8.85 1.516h-8.989a.288.288 0 01-.264-.176.281.281 0 01.062-.309v.002l3.396-3.36a1.443 1.443 0 011.015-.416h4.155c3.84 0 5.231-.395 6.635-1.139a7.786 7.786 0 003.257-3.22c.75-1.388 1.15-2.765 1.15-6.564v-5.433c.001-.114.071-.217.178-.26a.29.29 0 01.312.06zm-7.177-7.102l3.397 3.363c.269.266.42.627.42 1.005v10.772c0 3.137-2.571 5.68-5.743 5.68h-3.636a.288.288 0 01-.263-.172.281.281 0 01.056-.307v-.002l4.425-4.58c.307-.303.53-.657.669-1.036.122-.32.184-.66.184-1.003v-13.52c0-.114.07-.217.178-.261a.29.29 0 01.313.061z"
				fill={fillWhite ? "white" : "#f4c942"}
			/>
			<path
				d="M.484 21.083l3.361 3.396c.266.269.417.635.417 1.016v4.155c0 3.84.394 5.232 1.138 6.636a7.785 7.785 0 003.22 3.256c1.388.751 2.766 1.15 6.563 1.15h5.431a.289.289 0 01.202.49l-3.36 3.397a1.41 1.41 0 01-1.003.421h-1.89c-5.063 0-6.899-.533-8.75-1.534a10.38 10.38 0 01-4.295-4.342C.538 37.271.01 35.432 0 30.43v-9.143c0-.116.07-.22.175-.264a.283.283 0 01.31.06zm7.097 7.153h-.002l4.582 4.426c.302.306.658.528 1.035.667.31.12.65.185 1.004.185h13.517c.115 0 .218.071.262.178.043.107.019.23-.062.312l-3.362 3.398c-.266.268-.628.42-1.003.42H12.779a5.66 5.66 0 01-4.018-1.685A5.763 5.763 0 017.1 32.078v-3.635c0-.115.069-.218.173-.263a.283.283 0 01.308.056z"
				fill={fillWhite ? "white" : "#7b8fea"}
			/>
			<path
				d="M16.557 7.1c.115 0 .218.068.263.173a.281.281 0 01-.056.307l-4.426 4.582a2.814 2.814 0 00-.668 1.035c-.123.32-.185.66-.185 1.003V27.72c-.001.114-.071.216-.178.26s-.23.02-.312-.06l-3.397-3.363a1.412 1.412 0 01-.42-1.004V12.78c0-3.137 2.571-5.68 5.743-5.68zM23.714 0c.116 0 .22.07.264.176a.281.281 0 01-.062.309L20.52 3.844c-.27.266-.634.416-1.015.416H15.35c-3.84 0-5.232.395-6.637 1.139a7.785 7.785 0 00-3.256 3.22c-.743 1.373-1.142 2.736-1.15 6.444v5.552c-.001.114-.071.217-.178.26a.29.29 0 01-.313-.06L.422 17.458A1.411 1.411 0 010 16.452v-1.89C0 9.5.533 7.663 1.535 5.812a10.38 10.38 0 014.34-4.295C7.73.537 9.568.011 14.57 0z"
				fill={fillWhite ? "white" : "#d97ee8"}
			/>
		</g>
	</svg>
);

export type ModalProps = {
	children?: React.ReactNode;
	variant?: "base" | "red";
	repositoryName: string;
	onDismiss: () => void;
	isOpen: boolean;
	["aria-label"]: string;
};

export const Modal = ({
	variant = "base",
	repositoryName,
	onDismiss,
	isOpen,
	children,
	"aria-label": ariaLabel,
}: ModalProps): JSX.Element => {
	return (
		<Dialog isOpen={isOpen} onDismiss={onDismiss} aria-label={ariaLabel}>
			<Root>
				<div className="z-max bg-black bg-opacity-60 fixed inset-0 overflow-auto">
					<div className="w-full max-w-34rem mx-auto mt-20vh px-4">
						<div
							className={clsx(
								"rounded-lg shadow-lg px-7 py-8 relative sm:px-10",
								variant === "base" && "bg-white text-slate-30",
								variant === "red" && "bg-red-40 text-white",
							)}
							data-gatsby-plugin-prismic-previews-repository-name={
								repositoryName
							}
						>
							<div className="grid gap-7">
								<PrismicLogo
									fillWhite={variant === "red"}
									className="block mx-auto w-11 h-11"
								/>
								<div>{children}</div>
							</div>

							<button
								className={clsx(
									"absolute top-5 right-5 transition  sm:top-6 sm:right-6 p-2 -m-2",
									variant === "base" &&
										"text-slate-90 hover:text-slate-60 focus:text-slate-60",
									variant === "red" &&
										"text-red-80 hover:text-white focus:text-white",
								)}
								onClick={onDismiss}
							>
								<span className="sr-only">Close modal</span>
								<CloseSVG className="w-5 h-5" />
							</button>
						</div>
					</div>
				</div>
			</Root>
		</Dialog>
	);
};
