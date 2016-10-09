var express = require('express');
var bodyParser = require('body-parser');
var router = require('./router');
var app = express();

app.set('env', 'development');
app.set('debug', true);
app.set('port', 3000);

if ('env' in process) {
  if ('stage' in process.env) app.set('stage', process.env.stage);
  if ('debug' in process.env) app.set('debug', process.env.debug);
  if ('port' in process.env) app.set('port', process.env.port);
}

app.use(bodyParser.json({ strict: true }));

app.use(router);

// Basic error handling (keep these args, its important to have exactly these!)
app.use(function (err, req, res, next) { // eslint-disable-line no-unused-vars
  console.warn('Res contents: ', res);
  var status = ('status' in err) ? err.status : 500;
  res.status(status).json({'status': status, 'message': err.message || 'Error' });
  var responseData = { error: true, message: err.message };
  if (app.get('env') == 'development') { responseData.stack = err; }
  res.json(responseData);
});

app.listen(app.get('port'), function () {
  console.warn('Server running');
  console.warn('Mode '+ app.get('stage'));
  console.warn('Port ' + app.get('port'));
  if (app.get('debug') == true) {
    console.warn('Debug activated');
  }
});
