const createError = require('http-errors');
const express = require('express');
const proxy = require('http-proxy-middleware');
const path = require('path');
const request = require('request-promise-native');
const { target } = require('config');

const app = express();

app.set('views', path.join(__dirname, 'views'));

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

const models = require('./models');
models.sequelize.sync().then(() => {
  console.log('db sync success');
});

function proxyFilter(pathname, req) {
  const method = req.method;
  const isOK = (pathname.includes('transactionNotifyurl') || pathname.includes('withdrawNotifyurl')) && [ 'GET', 'POST' ].includes(method);
  if (isOK) {
    const body = req.body || req.query;
    models.request_log.create({ method, pathname, body: JSON.stringify(body) }).then(() => {
      console.log('ok');
    });
  }
  return isOK;
}

const proxyOptions = {
  target,
  changeOrigin: true,
  onProxyReq(proxyReq, req, res) {
    if (req.body) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  }
};

app.use(proxy(proxyFilter, proxyOptions));

// 手动发送请求
app.post('/sendRequest', async (req, res, next) => {
  const { id } = req.body;

  const record = await models.request_log.findOne({ where: { id } });
  if(!record) {
    res.send('no record');
    return;
  }
  const { method, pathname, body } = record;

  const options = {
    url: `${target}${pathname}`,
    method,
    body: {},
  }

  if (method === 'GET') {
    options.qs = body;
  } else if (method === 'POST') {
    options.body = body;
    options.headers = { 'Content-Type': 'application/json' }
  }

  try {
    const result = await request(options);
    console.log(result);
    res.send('ok');
  } catch (error) {
    console.log(error.message);
    res.send(error.message);
  }

});

// 展示已接收到的回调请求
app.get('/requests', async (req, res, next) => {

  const data = await models.request_log.findAll({
    order: [[ 'id', 'DESC' ]],
    limit: 20,
  });

  res.render('index', { rows: data });
});

app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(3001);
