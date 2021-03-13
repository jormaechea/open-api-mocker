"use strict";

/* istanbul ignore file */

const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const express = require("express");
const logger = require("lllog")();
const expressConnector = require("../express-connector/server");

class Server extends expressConnector {
  constructor() {
    super();
    this.servers = [];
    this.paths = [];
  }

  setPort(port) {
    this.port = port;
    super.setPort(port);
    return this;
  }

  async init() {
    if (this.server) await this.shutdown();

    const app = express();

    app.use(
      cookieParser(),
      cors({
        origin: true,
        credentials: true,
      }),
      bodyParser.json(),
      bodyParser.urlencoded({
        limit: "50mb",
        extended: false,
        parameterLimit: 50000,
      }),
      bodyParser.text(),
      bodyParser.raw()
    );

    const connect = await super.init();
    connect(app);

    this.server = app.listen(this.port);

    this.server.on("listening", (err) => {
      if (err) throw err;

      const realPort = this.server.address().port;

      logger.info(`Mocking API at ${realPort}`);
    });

    return app;
  }

  shutdown() {
    logger.debug("Closing express server...");
    this.server.close();
    super.shutdown();
  }
}

module.exports = Server;
