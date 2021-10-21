import * as React from "react";
import root from "react-shadow";

type RootProps = {
	children?: React.ReactNode;
};

export const Root = ({ children }: RootProps): JSX.Element => {
	return (
		<root.div>
			<div className="root">{children}</div>
			<style type="text/css">{`
/*! tailwindcss v2.2.17 | MIT License | https://tailwindcss.com */
/*! modern-normalize v1.1.0 | MIT License | https://github.com/sindresorhus/modern-normalize */*,
::before,
::after{box-sizing:border-box}.root{line-height:1.15;-webkit-text-size-adjust:100%;font-family:system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji';-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased}button,
input{font-family:inherit;font-size:100%;line-height:1.15;margin:0;padding:0;color:inherit}button{text-transform:none}button,
[type='button'],
[type='submit']{-webkit-appearance:button}::-moz-focus-inner{border-style:none;padding:0}:-moz-focusring{outline:1px dotted ButtonText}:-moz-ui-invalid{box-shadow:none}button{background-color:transparent;background-image:none;cursor:pointer}*,
::before,
::after{box-sizing:border-box;border-width:0;border-style:solid;border-color:currentColor}:-moz-focusring{outline:auto}a{color:inherit;text-decoration:inherit}
				`}</style>
		</root.div>
	);
};
