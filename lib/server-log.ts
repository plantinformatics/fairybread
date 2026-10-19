import { createWriteStream, mkdirSync } from "node:fs";
import path from "node:path";
import { format, stripVTControlCharacters } from "node:util";

const methods = ["log", "info", "warn", "error", "debug"] as const;

// Wraps console methods so output still reaches the terminal and is also appended
// to `file` as timestamped plain text (ANSI colours stripped). Call once at server start.
export function mirrorConsoleToFile(file: string) {
  mkdirSync(path.dirname(file), { recursive: true });
  const stream = createWriteStream(file, { flags: "a" });

  for (const method of methods) {
    const original = console[method].bind(console);
    console[method] = (...args: unknown[]) => {
      original(...args);
      const line = stripVTControlCharacters(format(...args));
      stream.write(`${new Date().toISOString()} [${method}] ${line}\n`);
    };
  }
}
