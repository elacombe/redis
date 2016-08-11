import { ddbDelete, ddbGet, ddbTasksPost, ddbPut } from './helpers/redis';

let idTask = 3;

export function init(app, ressources, client) {
  app.get('/todo/tasks', function(req, res) {
    ddbGet(client, 'tasks');
  });

  app.post('/todo/tasks', function(req, res) {
    idTask = idTask + 1;
    ddbTasksPost(client, req, idTask);
  });

  app.put('/todo/tasks', function(req, res) {
    ddbPut(client, 'task');
  });
  app.delete('/todo/tasks/:id', function(req, res) {
    ddbDelete(client, 'task', req.params.id);
  });
}
