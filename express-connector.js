const YAML = require("js-yaml");
const fs = require("fs");
const OpenApiMocker = require("./lib/open-api-mocker");

function loadSchemaFromDisk(schemaPath) {
  // TODO: MOVE TO COMMON CODE
  if (schemaPath.match(/\.ya?ml$/))
    return YAML.load(fs.readFileSync(schemaPath));

  delete require.cache[require.resolve(schemaPath)];
  return require(schemaPath); // eslint-disable-line global-require, import/no-dynamic-require
}

/**
 * @example
 * const createServerlessApp
 * = require('open-api-mocker/serverless');
 *
 * // Initialise using schema directly
 * const schema = require('./schema.json');
 * let app = createServerlessApp({ schema });
 * // or initialise using file path
 * app = createServerlessApp({ schemaFile: '/some/path/to/schema/file.yml' });
 *
 * // The app can then be passed to serverless-express or similar
 *
 * module.exports = handle;
 * */

/**
 * A function that must be called by the handler of the platform specific serveless function
 * @callback RequestHandler
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */

/**
 *
 * @param {Object} options
 * @param {string} [options.schemaPath] The path to a JSON/Yaml file that will be used as the schema
 * @param {Object} [options.schema] The full schema object already loaded via some other means
 * @returns {RequestHandler}
 */
function createServerlessApp(options) {
  let { schema } = options;

  if (!schema && options.schemaPath)
    schema = loadSchemaFromDisk(options.schemaPath);

  if (!schema) throw new Error("No schema loaded. Nothing can be served.");

  let handle = (req, res, next) => {
    res.status(503).send("Server is still loading.");
  };
  const server = new OpenApiMocker({
    port: undefined,
    server: "express-connector",
  });
  server.setSchema(schema);

  const validating = server.validate();

  return {
    get schema() {
      return server.schema;
    },

    connect(app) {
      app.use((req, res, next) => {
        handle(req, res, next);
      });

      validating
          .then(() => {
            return server.mock();
          })
          .then((connector) => {
            connector(app);
            handle = (req, res, next) => {
              return next();
            };
          });
    }
  }
}

module.exports = createServerlessApp;
