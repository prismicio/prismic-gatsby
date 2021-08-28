import * as React from "react";

import { ModalAccessToken } from "./ModalAccessToken";
import { Root } from "./Root";

export default {
	title: "Components/ModalAccessToken",
	component: ModalAccessToken,
};

const setAccessToken = (accessToken: string) =>
	console.log(`Set access token to: ${accessToken}`);

const onDismiss = () => console.log("Dismissed");

export const Default = (): JSX.Element => (
	<Root>
		<ModalAccessToken
			isOpen={true}
			repositoryName="qwerty"
			setAccessToken={setAccessToken}
			onDismiss={onDismiss}
		/>
	</Root>
);

export const Idle = (): JSX.Element => (
	<Root>
		<ModalAccessToken
			state="IDLE"
			isOpen={true}
			repositoryName="qwerty"
			setAccessToken={setAccessToken}
			onDismiss={onDismiss}
		/>
	</Root>
);

export const Incorrect = (): JSX.Element => (
	<Root>
		<ModalAccessToken
			state="INCORRECT"
			isOpen={true}
			repositoryName="qwerty"
			initialAccessToken="incorrect-access-token-abc123-incorrect-access-token-abc123"
			setAccessToken={setAccessToken}
			onDismiss={onDismiss}
		/>
	</Root>
);
