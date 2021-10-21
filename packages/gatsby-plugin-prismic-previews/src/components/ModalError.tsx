import * as React from "react";

import { VERSION } from "../constants";

import { Modal, ModalProps } from "./Modal";
import { Button } from "./Button";
import { Text } from "./Text";

type ModalErrorProps = {
	errorMessage?: string;
} & Pick<ModalProps, "repositoryName" | "isOpen" | "onDismiss">;

export const ModalError = ({
	repositoryName,
	errorMessage,
	isOpen,
	onDismiss,
}: ModalErrorProps): JSX.Element => {
	return (
		<Modal
			variant="red"
			repositoryName={repositoryName}
			onDismiss={onDismiss}
			isOpen={isOpen}
			aria-label={`Prismic preview error for ${repositoryName}`}
		>
			<div className="grid gap-6 sm:gap-7 justify-items-center">
				<div className="grid gap-4">
					<Text variant="sans-24" className="text-center font-semibold">
						Error
					</Text>
					<Text variant="sans-12-14" className="text-center">
						The preview could not be loaded.
					</Text>
				</div>

				{errorMessage && (
					<Text variant="mono-20" className="text-center my-2">
						{errorMessage}
					</Text>
				)}

				<Button variant="whiteOutline" onClick={onDismiss} className="mx-auto">
					<Text variant="sans-14" className="font-medium">
						Cancel Preview
					</Text>
				</Button>

				<dl className="text-red-80 flex flex-wrap -mt-5 -ml-5 justify-center">
					<div className="grid gap-2 pl-5 pt-5 grid-flow-col">
						<dt>
							<Text variant="sans-12" className="font-semibold">
								Repository
							</Text>
						</dt>
						<dd>
							<Text variant="sans-12">{repositoryName}</Text>
						</dd>
					</div>
					<div className="grid gap-2 pl-5 pt-5 grid-flow-col">
						<dt>
							<Text variant="sans-12" className="font-semibold">
								Plugin Version
							</Text>
						</dt>
						<dd>
							<Text variant="sans-12">{VERSION}</Text>
						</dd>
					</div>
				</dl>
			</div>
		</Modal>
	);
};
