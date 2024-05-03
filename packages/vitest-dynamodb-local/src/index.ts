import { createTables, start, stop } from "./db";
import { setEnvironmentVariables } from "./setEnvironmentVariables";

setEnvironmentVariables();

export async function setup() {
  await start();
  await createTables();
}

export async function teardown() {
  await stop();
}
