var express = require('express');
var bodyParser = require('body-parser');
var router = require('./router');
var app = express();

app.set('stage', process.env.NODE_ENV);
app.set('debug', process.env.DEBUG);
app.set('port', process.env.PORT);

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

app.listen(app.get('PORT'), function () {
  console.warn('Server running');
  console.warn('Mode '+ app.get('STAGE'));
  console.warn('Port ' + app.get('PORT'));
  if (app.get('DEBUG') == true) {
    console.warn('Debug activated');
  }
});
