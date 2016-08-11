import path from 'path';
import http from 'http';
import async from 'async';
import {default as bodyParser} from 'body-parser';
import express from 'express';
import {init as initPing} from './ping';
import {init as initVersion} from './version';
import {init as initLists} from './lists';
import {init as initTasks} from './tasks';
import moment from 'moment';
const redis = require('redis');
const client = redis.createClient();

const url = (host, server) => 'http://' + host + ':' + server.address().port;

export function start(config, resources, cb) {
  const app = express();
  const httpServer = http.createServer(app);

  function stop(cb) {
    httpServer.close(() => {
      console.log('HTTP server stopped.');
      httpServer.unref(); 
      cb();
    });
  }

  async.parallel({
    // init http depending on param.js
    http(cb) {
      const { port, host } = config;
      httpServer.listen(port, host, () => {
        console.log(`HTTP server listening on: ${url(host, httpServer)}`);
        cb();
      });
    },
  }, function(err) {
    if (err) return cb(err);

    client.on('connect', function() {
      console.log('conneted');
    });

    client.scard('lists', (err, reply) => {
      if (reply >= 1) {
        console.log('lists already there');
      }
      else {
        client.hset('list0', 'id', '0');
        client.hset('list0', 'label', 'liste 1');
        client.hset('list1', 'id', '1');
        client.hset('list1', 'label', 'liste 2');
        client.hset('list2', 'id', '2');
        client.hset('list2', 'label', 'liste 3');
        client.sadd('lists', ['list0', 'list1', 'list2']);
      }
    });

    client.scard('tasks', (err, reply) => {
      if (reply >= 1) {
        console.log('tasks already there');
      }
      else {
          client.hset('task0', 'id', '0');
          client.hset('task0', 'listId', '1');
          client.hset('task0', 'description', 'tache 1');
          client.hset('task1', 'id', '1');
          client.hset('task1', 'listId', '0');
          client.hset('task1', 'description', 'tache 2');
          client.hset('task2', 'id', '2');
          client.hset('task2', 'listId', '2');
          client.hset('task2', 'description', 'tache 3');
          client.sadd('tasks', ['task0', 'task1', 'task2']);
        }
    });

    // register middleware, order matters
    app.use(function(req, res, next) {
      console.log(moment().format() + ' :: ' + req.method + ' :: ' + req.url);
      next();
    });

    // remove for security reason
    app.disable('x-powered-by');
    
    // usually node is behind a proxy, will keep original IP
    app.enable('trust proxy');

    // register bodyParser to automatically parse json in req.body and parse url
    app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
    app.use(bodyParser.json({limit: '10mb', extended: true}));

    // CORS
    app.use((req, res, next) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
      } else {
        next();
      }
    });

    initPing(app, resources);

    initVersion(app, resources);

    initLists(app, resources, client);

    initTasks(app, resources, client);

    /*app.use((req, res, next) => {
      next({ stack: 'erreur de test 500', message: 'Error 500 test'});
    });*/

    app.use(function(req, res, next) {
      res.status(404).send({error: 'not found'});
    });

    app.use(function(err, req, res, next) {
      console.error(err.stack);
      res.status(500).send({ error: err.message });
    });

    cb(null, { stop, url: url(config.host, httpServer) });
  });
}
