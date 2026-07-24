/**
 * MOVED — this file is no longer the test entry point.
 *
 * The provider test suite now lives inside the providers module at:
 *   src/providers/tests/providers.test.ts
 *
 * Run it with:
 *   npm run test-providers
 *
 * Why was it moved?
 *   The test suite tests provider internals (cache, individual providers,
 *   normalizers). A test that needs access to module internals must live
 *   inside that module — otherwise it would need to import from deep internal
 *   paths from outside the module boundary, which defeats the encapsulation.
 */

console.error(
  "This file has moved to src/providers/tests/providers.test.ts\n" +
  "Run: npm run test-providers",
);
process.exit(1);
