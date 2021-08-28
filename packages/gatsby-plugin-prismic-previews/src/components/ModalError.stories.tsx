import * as React from "react";

import { ModalError } from "./ModalError";
import { Root } from "./Root";

export default {
	title: "Components/ModalError",
	component: ModalError,
};

const errorMessage = "Unexpected authorization 401 error";

export const Default = (): JSX.Element => (
	<Root>
		<ModalError
			repositoryName="qwerty"
			errorMessage={errorMessage}
			isOpen={true}
			onDismiss={() => console.log("Dismissed")}
		/>
	</Root>
);

export const WithoutErrorMessage = (): JSX.Element => (
	<Root>
		<ModalError
			repositoryName="qwerty"
			isOpen={true}
			onDismiss={() => console.log("Dismissed")}
		/>
	</Root>
);
