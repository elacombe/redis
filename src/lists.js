import { ddbDelete, ddbGet, ddbListsPost, ddbPut } from './helpers/redis';

let idList = 3;

export function init(app, ressources, client) {
  app.get('/todo/lists', function(req, res) {
    res.json(ddbGet(client, 'lists'));
  });

  app.post('/todo/lists', function(req, res) {
    idList = idList + 1;
    res.json(ddbListsPost(client, req.body.todo.label, idList));
  });

  app.put('/todo/lists', function(req, res) {
    res.json(ddbPut(client, 'list'));
  });

  app.delete('/todo/lists/:id', function(req, res) {
    res.json(ddbDelete(client, 'list', req.params.id));
  });
}
