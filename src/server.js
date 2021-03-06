import express from 'express';
import mongoose from 'mongoose';
import http from 'http';
import WebSocket from 'ws';
import config from './config';
import handlers from './ws_handlers';
import { logger } from './utils/logger';
import User from './db-models/user-model';
import { stringify } from 'flatted/cjs';

let wsServer;

const WS_PORT = parseInt(config.http_port);

mongoose.Promise = global.Promise;

function startWSServer(callback) {
  mongoose.set('useCreateIndex', true);
  let promiseDb = mongoose.connect(config.mongo.uri + '/' + config.mongo.db, {
    autoReconnect: true,
    useNewUrlParser: true
  });

  if (config.db_debug_log) {
    mongoose.set('debug', true);
  }

  promiseDb
    .then(db => {
      logger.info('Mongoose connected ok ');
      logger.debug(
        'Mongo DB ' + User.db.host + ':' + User.db.port + '/' + User.db.name
      );
    })
    .catch(err => {
      logger.error('Mongoose connection error:', err.stack);
      process.exit(1);
    });

  const wsApp = express();

  wsServer = http.createServer(wsApp);
  const wss = new WebSocket.Server({
    server: wsServer
  });

  wss.on('connection', handlers);

  wsServer.listen(WS_PORT, () => {
    logger.info(`WS Server is now running on http://localhost:${WS_PORT}`);
    if (callback) {
      callback();
    }
  });
}

function startServers(callback) {
  // Shut down the servers
  if (wsServer) {
    wsServer.close();
  }
  let doneTasks = 0;
  function handleTaskDone() {
    doneTasks++;
    if (doneTasks === 1 && callback) {
      callback();
    }
  }
  startWSServer(handleTaskDone);
}

startServers();
