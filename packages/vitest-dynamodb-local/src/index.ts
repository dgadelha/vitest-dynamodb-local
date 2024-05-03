import { afterAll, afterEach, beforeAll } from "vitest";

import { createTables, deleteTables, start, stop } from "./db";
import { setEnvironmentVariables } from "./setEnvironmentVariables";

setEnvironmentVariables();

beforeAll(async () => {
  // console.time("await start();");
  await start();
  // console.timeEnd("await start();");
  // console.time("await createTables();");
  await createTables();
  // console.timeEnd("await createTables();");
}, 60_000);

afterEach(async () => {
  // console.time("await deleteTables();");
  await deleteTables();
  // console.timeEnd("await deleteTables();");
  // console.time("await createTables();");
  await createTables();
  // console.timeEnd("await createTables();");
});

afterAll(async () => {
  // console.time("await stop();");
  await stop();
  // console.timeEnd("await stop();");
});
