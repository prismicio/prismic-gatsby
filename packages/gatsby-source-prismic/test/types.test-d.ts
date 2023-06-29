import { expectTypeOf, it } from "vitest";

it("returns void", () => {
	expectTypeOf("foo").toEqualTypeOf("foo");
});
