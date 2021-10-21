import * as RTE from "fp-ts/ReaderTaskEither";
import * as A from "fp-ts/Array";
import { flow } from "fp-ts/function";

import { createType } from "./createType";

/**
 * Registers one or more types.
 *
 * @see gatsby-source-prismic/lib/registerType.ts
 */
export const createTypes = flow(A.map(createType), RTE.sequenceArray);
