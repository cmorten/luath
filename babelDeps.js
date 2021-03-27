// @ts-nocheck

globalThis.require = () => {};

// ESM appears to have regressed something at around v29 such that require is
// no longer defined.
const { transformSync } = await import("https://esm.sh/@babel/core@7.13.13");

export { transformSync };
