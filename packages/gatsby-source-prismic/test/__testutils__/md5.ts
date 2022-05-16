import * as crypto from "crypto";

export const md5 = (input: string): string => {
	return crypto.createHash("md5").update(input).digest("hex");
};
