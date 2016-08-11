import _ from 'lodash';
import async from 'async';

export function ddbGet(client, type) {
    client.scard(type, (err, reply) => {
      if (reply >= 1) {
        client.smembers(type, (err, reply) => {
          async.map(reply, (elem, cb) => {
            client.hgetall(elem, (err, reply) => {
              cb(null, reply);
            })
          },
          (err, results) => {
            return(results);
          }
          );
        });
      }
    });
}

export function ddbListsPost(client, req, id) {
    client.hset(`list${id}`, 'id', id);
    client.hset(`list${id}`, 'label', req);
    client.sadd(`lists`, [`list${id}`]);
    return ({ id: id, label: req });
}

export function ddbTasksPost(client, req, id) {
    client.hset(`task${id}`, 'id', id);
    client.hset(`task${id}`, 'listId', req.body.task.listId);
    client.hset(`task${id}`, 'description', req.body.task.description);
    client.sadd(`tasks`, [`task${id}`]);
    return ({ id: id, listId: req.body.task.listId, description: req.body.task.description });
}

export function ddbDelete(client, type, id) {
  client.scard(`${type}s`, (err, reply) => {
    if (reply >= 1) {
      client.smembers(`${type}s`, (err, reply) => {
        async.map(reply, (elem, cb) => {
            client.hgetall(`${type}`, (err, reply) => {
              cb(null, reply);
            })
          },
        (err, results) => {
          client.hdel(`${type}${id}`, 'id', id);
          client.srem(`${type}s`, [`${type}${id}`]);
          const deleteresult = _.omit(results, id);
          return(deleteresult);
        }
        );
      });
    }
  });
}

export function ddbPut(client, type) {
  return true;
}
/*

  app.put('/todo/lists', function(req, res) {
    client.scard('lists', (err, reply) => {
      if (reply >= 1) {
        client.smembers('lists', (err, reply) => {
          async.map(reply, (list, cb) => {
            client.hgetall(list, (err, reply) => {
              cb(null, reply);
            })
          },
          (err, results) => {
            const putignore = _.omit(results, req.body.todo.id);
            const putresult = { ...putignore, [req.body.todo.id]: { id: req.body.todo.id, label: req.body.todo.label } };
            client.hset(`list${req.body.todo.id}`, 'id', req.body.todo.id);
            client.hset(`list${req.body.todo.id}`, 'label', req.body.todo.label);
            client.sadd('lists', [`list${req.body.todo.id}`]);
            res.json(putresult);
            return results;
          }
          );
        });
      }
    });
  });
*/