import test from "node:test";
import assert from "node:assert/strict";
import { buildDynamicTransportOptions } from "./dynamicData.js";

test("buildDynamicTransportOptions uses the requested transport preferences", () => {
  const options = buildDynamicTransportOptions("Jaipur", ["cab", "bike-rental"]);

  assert.ok(options.length >= 2);
  assert.deepEqual(options.slice(0, 2).map((option) => option.type), ["cab", "bike-rental"]);
  assert.ok(options.every((option) => option.city === "Jaipur"));
});

test("buildDynamicTransportOptions falls back to sensible defaults when no preferences are provided", () => {
  const options = buildDynamicTransportOptions("Goa", []);

  assert.ok(options.length >= 2);
  assert.ok(options.some((option) => option.type === "auto-rickshaw"));
  assert.ok(options.some((option) => option.type === "cab"));
});
