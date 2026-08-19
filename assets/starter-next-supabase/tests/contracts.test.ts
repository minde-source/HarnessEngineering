import { describe, expect, it } from "vitest";
import { normalizePagination } from "@/lib/contracts";

describe("normalizePagination", () => {
  it("uses safe defaults", () => {
    expect(normalizePagination(undefined, undefined)).toEqual({ page: 1, pageSize: 10 });
  });

  it("clamps unsafe values", () => {
    expect(normalizePagination(-2, 999)).toEqual({ page: 1, pageSize: 50 });
  });
});
