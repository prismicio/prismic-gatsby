import * as React from "react";
import { Root } from "./Root";

import { Text } from "./Text";

export default {
	title: "Components/Text",
	component: Text,
};

const content = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";

export const Sans12 = (): JSX.Element => (
	<Root>
		<div className="border border-debug">
			<Text variant="sans-12">{content}</Text>
		</div>
	</Root>
);

export const Sans1214 = (): JSX.Element => (
	<Root>
		<div className="border border-debug">
			<Text variant="sans-12-14">{content}</Text>
		</div>
	</Root>
);
Sans1214.storyName = "Sans 12-14";

export const Sans14 = (): JSX.Element => (
	<Root>
		<div className="border border-debug">
			<Text variant="sans-14">{content}</Text>
		</div>
	</Root>
);

export const Sans16 = (): JSX.Element => (
	<Root>
		<div className="border border-debug">
			<Text variant="sans-16">{content}</Text>
		</div>
	</Root>
);

export const Sans24 = (): JSX.Element => (
	<Root>
		<div className="border border-debug">
			<Text variant="sans-24">{content}</Text>
		</div>
	</Root>
);
