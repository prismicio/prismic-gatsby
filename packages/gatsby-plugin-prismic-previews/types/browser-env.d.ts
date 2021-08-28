declare module "browser-env" {
	import { ConstructorOptions } from "jsdom";

	export default function browserEnv(
		globals?: string[],
		config?: ConstructorOptions,
	): void;
}
