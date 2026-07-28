import assert from "node:assert/strict";
import test from "node:test";

import { formatWeekRange } from "./formatters.ts";

test("formats a same-month reporting week without repeating the month", () => {
  assert.equal(formatWeekRange(new Date(2026, 6, 13), new Date(2026, 6, 20)), "Jul 13 - 19, 2026");
});

test("formats a reporting week that crosses a month boundary", () => {
  assert.equal(formatWeekRange(new Date(2026, 7, 31), new Date(2026, 8, 7)), "Aug 31 - Sep 6, 2026");
});
