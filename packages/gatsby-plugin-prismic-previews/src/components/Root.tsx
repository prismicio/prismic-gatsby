import * as React from "react";
import root from "react-shadow";

import styles from "../styles.css";

type RootProps = {
	children?: React.ReactNode;
};

export const Root = ({ children }: RootProps): JSX.Element => (
	<root.div>
		<div className="root">{children}</div>
		<style type="text/css">{styles}</style>
	</root.div>
);
