import * as React from "react";
import clsx from "clsx";

type ButtonProps = {
	variant: "purple" | "white" | "whiteOutline";
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = ({
	className,
	variant,
	...props
}: ButtonProps): JSX.Element => (
	<button
		{...props}
		className={clsx(
			"py-4 px-5 text-center rounded min-w-7.5rem border",
			variant === "purple" &&
				"bg-purple-50 text-white border-purple-50 transition hover:bg-purple-40 focus:bg-purple-40 hover:border-purple-40 focus:borer-purple-40",
			variant === "white" &&
				"bg-white border-slate-90 text-slate-60 hover:border-slate-70 focus:border-slate-70 hover:text-slate-30 focus:text-slate-30 transition",
			variant === "whiteOutline" &&
				"bg-transparent border-white text-white hover:bg-white hover:bg-opacity-10 focus:bg-white focus:bg-opacity-10 transition",
			className,
		)}
	/>
);
