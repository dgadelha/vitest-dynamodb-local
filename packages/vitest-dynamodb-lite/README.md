# vitest-dynamodb-lite

Rewritten from [jest-dynalite](https://github.com/freshollie/jest-dynalite) to use in vitest.

## Features

- Optionally clear tables between tests
- Isolated tables between test runners
- Ability to specify config directory
- No `java` requirement
- Works with only `@aws-sdk/client-dynamodb` instead of `aws-sdk`

## Installation

```bash
npm i vitest-dynamodb-lite -D
# or
yarn add vitest-dynamodb-lite -D
# or
pnpm add vitest-dynamodb-lite -D
```

## Usage

### 1. Set `setupFiles` in `vitest.config.ts`

```js
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: ["vitest-dynamodb-lite"],
  },
});
```

### 2. Config file

In your project root, create a config file with the tables schemas,
and an optional `basePort` to run dynalite on.

The config file can be written in either `json`, `js` or `cjs` format.

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

`process.env.MOCK_DYNAMODB_ENDPOINT` is unique to each test runner.

After all your tests, make sure you destroy your client.
You can even do this by adding an `afterAll` in a [`setupFilesAfterEnv`](https://jestjs.io/docs/en/configuration#setupfilesafterenv-array) file.

```javascript
afterAll(() => {
  client.destroy();
});
```

### [Optional] Using fixtures

Some fixture data can be given before each test:

`vitest-dynamodb-lite-config.json`:

```json
{
  "tables": [
    {
      ...,
      "data": [
        { "id": "a", "someattribute": "hello world" }
      ]
    }
  ],
}
```

### Debug errors

If you face any error in closing db, you can enable debug mode to see the error:

```
VITEST_DYNAMODB_LITE_DEBUG_CLOSING_DB=true npx vitest
```

## License

`MIT`