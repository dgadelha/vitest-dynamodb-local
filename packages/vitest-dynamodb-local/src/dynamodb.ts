import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { TableConfig } from "./types";
import { omit, sleep } from "./utils";

type Connection = {
  dynamoDB: DynamoDB;
};

let connection: Connection | undefined;

const dbConnection = (port: number): Connection => {
  if (connection) {
    return connection;
  }

  connection = {
    dynamoDB: new DynamoDB({
      endpoint: `http://localhost:${port}`,
      region: "local",
      maxAttempts: 0,
    }),
  };

  return connection;
};

const waitForTable = async (
  client: DynamoDB,
  tableName: string,
): Promise<void> => {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const details = await client
      .describeTable({ TableName: tableName })
      .catch(() => undefined);

    if (details?.Table?.TableStatus === "ACTIVE") {
      // eslint-disable-next-line no-await-in-loop
      await sleep(10);
      break;
    }
    // eslint-disable-next-line no-await-in-loop
    await sleep(10);
  }
};

/**
 * Poll the tables list to ensure that the given list of tables exists
 */
const waitForDeleted = async (
  client: DynamoDB,
  tableName: string,
): Promise<void> => {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const details = await client
      .describeTable({ TableName: tableName })
      .catch((e) => e.name === "ResourceInUseException");

    // eslint-disable-next-line no-await-in-loop
    await sleep(100);

    if (!details) {
      break;
    }
  }
};

export const deleteTables = async (
  tableNames: string[],
  port: number,
): Promise<void> => {
  const { dynamoDB } = dbConnection(port);
  await Promise.all(
    tableNames.map((table) =>
      dynamoDB.deleteTable({ TableName: table }).catch(() => {}),
    ),
  );

  await Promise.all(tableNames.map((table) => waitForDeleted(dynamoDB, table)));
};

export const listTables = async (port: number): Promise<string[]> => {
  const { dynamoDB } = dbConnection(port);
  const tables = await dynamoDB.listTables();
  return tables.TableNames ?? [];
}

export const createTables = async (
  tables: TableConfig[],
  port: number,
): Promise<void> => {
  const { dynamoDB } = dbConnection(port);

  await Promise.all(
    tables.map((table) => dynamoDB.createTable(omit(table, "data"))),
  );

  await Promise.all(
    tables.map((table) => waitForTable(dynamoDB, table.TableName)),
  );

  await Promise.all(
    tables.map(
      (table) =>
        table.data &&
        Promise.all(
          table.data.map((row) =>
            dynamoDB
              .putItem({
                TableName: table.TableName,
                Item: marshall(row) as any,
              })
              .catch((e) => {
                throw new Error(
                  `Could not add ${JSON.stringify(row)} to "${
                    table.TableName
                  }": ${e.message}`,
                );
              }),
          ),
        ),
    ),
  );
};

export const killConnection = (): void => {
  connection?.dynamoDB.destroy();
};

export const waitForConnection = async (port: number): Promise<void> => {
  const { dynamoDB } = dbConnection(port);

  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const tables = await dynamoDB.listTables().catch(() => undefined);

    if (tables) {
      break;
    }
  }
};
