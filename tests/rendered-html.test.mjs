import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("the built site contains Daymark product content", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const client = await readFile(new URL("../app/task-app.tsx", import.meta.url), "utf8");
  assert.match(page, /Make today/);
  assert.match(page, /Start your list/);
  assert.match(client, /What needs doing/);
  assert.match(client, /\/api\/tasks/);
});
