declare namespace NodeJS {
	interface ProcessEnv {
		NODE_ENV: "development" | "test" | "production";
	}
}

declare let __PUBLIC_MODELS_PATH__: string;
