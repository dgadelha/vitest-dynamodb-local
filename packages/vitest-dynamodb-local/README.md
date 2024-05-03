# vitest-dynamodb-local

vitest-dynamodb-local is a fast DynamoDB mock for testing with vitest.

## Installation

```bash
npm i vitest-dynamodb-local -D
# or
yarn add vitest-dynamodb-local -D
# or
pnpm add vitest-dynamodb-local -D
```

## Usage

### 1. Set `globalSetup` in `vitest.config.ts`

```js
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globalSetup: ["vitest-dynamodb-local"],
  },
});
```

### 2. Config file

In your project root, create a config file with the tables schemas, and an optional `basePort` to run dynamo-db-local on.

You can write the config file in either `json`, `js`, or `cjs` format.

In `json`:

```json
{
  "tables": [
    {
      "TableName": "table",
      "KeySchema": [{ "AttributeName": "id", "KeyType": "HASH" }],
      "AttributeDefinitions": [{ "AttributeName": "id", "AttributeType": "S" }],
      "ProvisionedThroughput": {
        "ReadCapacityUnits": 1,
        "WriteCapacityUnits": 1
      }
    }
  ],
  "basePort": 8000
}
```

In `js` or `cjs`:

```js
module.exports = {
  // your configures
};
```

### 3. Update your source code

```javascript
const client = new DynamoDBClient({
  ...yourConfig,
  ...(process.env.MOCK_DYNAMODB_ENDPOINT && {
    endpoint: process.env.MOCK_DYNAMODB_ENDPOINT,
    region: "local",
  }),
});
```

After all your tests, make sure you destroy your client.
You can even do this by adding an `afterAll` in a [`setupFilesAfterEnv`](https://jestjs.io/docs/en/configuration#setupfilesafterenv-array) file.

```javascript
afterAll(() => {
  client.destroy();
});
```

### [Optional] Using fixtures

You can set some fixture data before each test:

`vitest-dynamodb-local-config.json`:

```js
module.exports = {
  tables: [
    {
      // ...
      data: [{ id: "a", someattribute: "hello world" }],
    },
  ],
};
```

### Debug errors

If you face any error in closing db, you can debug mode to see the error:

```
VITEST_DYNAMODB_LOCAL_DEBUG_CLOSING_DB=true npx vitest
```

## License

`MIT`
