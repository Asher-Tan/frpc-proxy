const express = require('express');
const proxy = require('http-proxy-middleware');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const models = require('./models');
models.sequelize.sync().then(() => {
  console.log('db sync success');
});

app.use('/notify', async function(req, res, next) {
  const method = req.method;
  const pathname = req.path;
  const body = req.body || req.query;

  await models.request_log.create({ method, pathname, body: JSON.stringify(body) });

  next();
}, proxy({ target: 'http://127.0.0.1:3000', changeOrigin: true }));

app.listen(3001);
