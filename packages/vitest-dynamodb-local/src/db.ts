// @ts-ignore
import dynamoDbLocal from "dynamo-db-local";
import { getDynamoDbLocalPort, getTables } from "./config";
import * as dynamodb from "./dynamodb";

export let dynamoDbLocalInstance: ReturnType<(typeof dynamoDbLocal)["spawn"]>;

export const start = async (): Promise<void> => {
  if (!dynamoDbLocalInstance) {
    const port = getDynamoDbLocalPort();

    dynamoDbLocalInstance = dynamoDbLocal.spawn({
      port,
      stdio: "inherit",
      path: null,
    });

    process.on("exit", () => {
      if (!dynamoDbLocalInstance.killed) {
        dynamoDbLocalInstance.kill("SIGKILL");
      }
    });

    await dynamodb.waitForConnection(port);
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
  const tableList = await dynamodb.listTables(getDynamoDbLocalPort());

  if (tableList.length > 0) {
    await dynamodb.deleteTables(tableList, getDynamoDbLocalPort());
  }

  await dynamodb.createTables(tables, getDynamoDbLocalPort());
};
