const http = require("http");
const YAML = require("js-yaml");
const fs = require("fs");
const OpenApiMocker = require("./open-api-mocker");

function loadSchemaFromDisk(schemaPath) {
  // TODO: MOVE TO COMMON CODE
  if (schemaPath.match(/\.ya?ml$/))
    return YAML.load(fs.readFileSync(schemaPath));

  delete require.cache[require.resolve(schemaPath)];
  return require(schemaPath); // eslint-disable-line global-require, import/no-dynamic-require
}

/**
 * @example
 * const createServerlessHandler
 * = require('open-api-mocker/serverless');
 *
 * // Initialise using schema directly
 * const schema = require('./schema.json');
 * let serverlessHandler = createServerlessHandler({ schema });
 * // or initialise using file path
 * serverlessHandler = createServerlessHandler({ schemaFile: '/some/path/to/schema/file.yml' });
 *
 * // Example usage for Azure functions - handle function takes a context with the req and res objects
 * function handle(context) {
 *   context.res = serverlessHandler(context.req);
 * }
 * module.exports = handle;
 * */

/**
 * A function that must be called by the handler of the platform specific serveless function
 * @callback serverlessHandler
 * @param {http.IncomingMessage} req
 * @returns {Object}
 */

/**
 *
 * @param {Object} options
 * @param {string} [options.schemaPath] The path to a JSON/Yaml file that will be used as the schema
 * @param {Object} [options.schema] The full schema object already loaded via some other means
 * @returns {serverlessHandler}
 */
function createServerlessHandler(options) {
  let { schema } = options;

  if (!schema && options.schemaPath)
    schema = loadSchemaFromDisk(options.schemaPath);

  if (!schema) throw new Error("No schema loaded. Nothing can be served.");

  // TODO: VALIDATE SCHEMA

  const server = new OpenApiMocker({
    port: undefined,
    server: "serverless",
  });
  server.setSchema(schema);

  let handle = () => ({
    status: 503,
    body: "Mock server is not ready to handle requests",
  });
  server
    .validate()
    .then(() => {
      return server.mock();
    })
    .then((handler) => (handle = handler));

  /**
   * @type {serverlessHandler}
   */
  const handler = (req) => {
    return handle(req);
  };
  return handler;
}

module.exports = createServerlessHandler;
