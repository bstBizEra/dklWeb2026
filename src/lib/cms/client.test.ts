/**
 * A database connection lost while idle is logged once per event instead of crashing as an uncaught
 * exception, the listener is added once per pool, and the log line never carries connection details.
 */
import { EventEmitter } from "node:events";

import { describe, expect, it, vi } from "vitest";

import { watchPool } from "./client";

describe("watchPool", () => {
  it("turns a pool error into one log line, with the error code only", () => {
    const pool = new EventEmitter();
    const log = vi.fn();
    watchPool(pool, log);
    watchPool(pool, log);

    const error = Object.assign(new Error("terminating connection, postgresql://user:secret@host/db"), { code: "57P01" });
    expect(() => pool.emit("error", error)).not.toThrow();
    expect(log).toHaveBeenCalledTimes(1);
    expect(log.mock.calls[0][0]).toBe("[cms] database connection lost (57P01); it will reconnect on the next query");
  });

  it("does nothing without a pool", () => {
    expect(() => watchPool(undefined)).not.toThrow();
  });
});
