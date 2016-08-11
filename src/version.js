export function init(app, ressources) {
  app.get('/version', function(req, res) {
    res.json(ressources.version);
  });
}
