"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/**
 * The 404 page is prerendered once for every missing URL, so the address the visitor actually typed
 * is only known in the browser. Renders nothing on the server and fills in after hydration.
 */
export function LostPath() {
  const path = useSyncExternalStore(noop, () => decodeURIComponent(location.pathname), () => "");
  return <>{path || "/this-page"}</>;
}
