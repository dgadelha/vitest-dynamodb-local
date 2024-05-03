// @ts-ignore
import dynamoDbLocal from "dynamo-db-local";
import { getDynamoDbLocalPort, getTables } from "./config";
import * as dynamodb from "./dynamodb";

export let dynamoDbLocalInstance: ReturnType<typeof dynamoDbLocal["spawn"]>;

export const start = async (): Promise<void> => {
  if (!dynamoDbLocalInstance) {
    dynamoDbLocalInstance = dynamoDbLocal.spawn({
      port: getDynamoDbLocalPort(),
      stdio: 'inherit',
      path: null,
    });

    await dynamodb.waitForConnection(getDynamoDbLocalPort());
  }
};

export const stop = async (): Promise<void> => {
  // v3 does something to prevent dynamodb local
  // from shutting down until we have
  // killed the dynamodb connection
  dynamodb.killConnection();

  if (!dynamoDbLocalInstance.killed) {
    if (!dynamoDbLocalInstance.kill()) {
      dynamoDbLocalInstance.kill("SIGKILL");
    }
  }
};

export const deleteTables = async (): Promise<void> => {
  const tablesNames = (await getTables()).map((table) => table.TableName);
  await dynamodb.deleteTables(tablesNames, getDynamoDbLocalPort());
};

export const createTables = async (): Promise<void> => {
  const tables = await getTables();
  await dynamodb.createTables(tables, getDynamoDbLocalPort());
};
