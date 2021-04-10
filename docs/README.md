# OpenAPI Mocker advance usage

## Programmatic usage

Normally, you will use OpenAPI Mocker from the CLI or via Docker. But in case you want to use it from within another APP or to extend it and build your own tooling, you can do it like this:

```js
const OpenApiMocker = require('open-api-mocker');
const mocker = new OpenApiMocker(options);
await mocker.validate();
await mocker.mock();
```

#### Available options

The following table shows the options that can be passed to the constructor:

| Option | Description | Default value |
| ------ | ----------- | ------------- |
| port | The port the default server will listen to. | `5000` |
| schema | The OpenAPI schema to be mocked. It can be a `string` with the path to the schema or an `object` containing the schema. It can also be set using the `setSchema()` method. | `null` |
| watch | Whether or not the schema should be watched for changes. | `false` |
| server | An instance of a Server implementation. See details [below](#custom-server). | `null`, which means that the built-in server will be used |
| schemaLoader | A SchemaLoader class. See details [below](#custom-schema-loader). | `null`, which means that one of the built-in loaders will be used |

## Extending OpenAPI Mocker features

### Custom server

If you don't want to use the default [express](https://www.npmjs.com/package/express) server, you can pass your own implementation through the `server` option.

Every custom server must implement the following interface:

```ts
interface OpenApiServer {
    setServers(serverBlockFromSchema: OpenApiServer): OpenApiServer;
    setPort(port: number): OpenApiServer;
    setPaths(pathsFromSchema: any): OpenApiServer;
    init(): Promise<void>;
    shutdown(): Promise<void>;
}
```

Then you have to pass an instance of that Server class to the constructor like this:

```js
const mocker = new OpenApiMocker({
	server: new MyCustomServer()
});
```

### Custom schema loader

Open API Mocker has two built-in schema loaders: `LocalSchemaLoader` to load a schema from the local filesystem and `ExplicitSchemaLoader` to handle schemas passed as a literal object.

In case you want to use a custom schema loader, you can pass your implementation through the `schemaLoader` option.

Custom schema loaders must extend the [`EventEmitter`](https://nodejs.org/api/events.html) class implement the following interface:

```ts
interface OpenApiSchemaLoader extends EventEmitter {
    constructor(schema: SchemaOption); // SchemaOption is the value of the `schema` option or the value passed to the `setSchema` method
    load(): OpenApiSchema|Promise<OpenApiSchema>;
}
```

If you want your schema loader to support the watch feature, you have to implement the `watch(): void` method, which will be called once and **must** emit the `schema-changed` event each time you detect a change in the watched schema like this: `this.emit('schema-changed');`.

Once you have your schema loader implemented, you have to pass the class in the constructor:

```js
const mocker = new OpenApiMocker({
	schemaLoader: MyCustomSchemaLoader
});
```
