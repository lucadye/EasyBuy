const swaggerUI = require('swagger-ui-express');
const swaggerDoc = require('./api.json');

module.exports = (app, route) => {
  app.use(
    route,
    swaggerUI.serve,
    swaggerUI.setup(swaggerDoc)
  );
};
