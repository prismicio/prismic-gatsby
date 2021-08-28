import * as O from "fp-ts/Option";
import * as R from "fp-ts/Record";
import * as A from "fp-ts/Array";
import { pipe } from "fp-ts/function";

const extractFirstSubdomain = (host: string): O.Option<string> =>
	O.fromNullable(host.split(".")[0]);

const parseObjectRef = (previewRef: string): O.Option<string> =>
	pipe(
		O.tryCatch(() => JSON.parse(previewRef)),
		O.filter(
			(previewRef) => typeof previewRef === "object" && previewRef !== null,
		),
		O.map(R.keys),
		O.chain(A.findFirst((key) => /.prismic.io$/.test(key))),
		O.chain(extractFirstSubdomain),
	);

const parseURLRef = (previewRef: string): O.Option<string> =>
	pipe(
		O.tryCatch(() => new URL(previewRef)),
		O.map((url) => url.host),
		O.chain(extractFirstSubdomain),
	);

export const extractPreviewRefRepositoryName = (
	previewRef: string,
): O.Option<string> =>
	pipe(
		previewRef,
		parseObjectRef,
		O.fold(
			() => pipe(previewRef, parseURLRef),
			(previewRef) => O.some(previewRef),
		),
	);
