import * as gatsby from "gatsby";
import * as RTE from "fp-ts/ReaderTaskEither";
import { IdentifiableRecord } from "gatsby-node-helpers";

import { Dependencies } from "../types";

import { createNodeOfType } from "./createNodeOfType";

export interface IdentifiableRecordWithType extends IdentifiableRecord {
	type: string;
}

/**
 * Creates a node using the environment's `createNode` function. The provided
 * record is passed through a node helper factory based on the record's `type` field.
 *
 * @param record - Record with an `id` and `type` field with which to create a node.
 */
export const createNode = (
	record: IdentifiableRecordWithType,
): RTE.ReaderTaskEither<Dependencies, never, gatsby.NodeInput> =>
	createNodeOfType(record, record.type);
