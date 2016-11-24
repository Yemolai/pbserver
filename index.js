var express = require('express');
var bodyParser = require('body-parser');
var router = require('./router');
var app = express();

app.set('STAGE', process.env.NODE_ENV);
app.set('DEBUG', process.env.DEBUG);
app.set('PORT', process.env.PORT);

app.use(bodyParser.json({ strict: true }));

app.use(router);

// Basic error handling (keep these args, its important to have exactly these!)
app.use(function (err, req, res, next) { // eslint-disable-line no-unused-vars
  var status = ('status' in err) ? err.status : 500;
  res.status(status).json({error: true, 'message': err.message || 'Error' });
});

app.listen(app.get('PORT'), function () {
  console.warn('Server running');
  console.warn('Mode '+ app.get('STAGE'));
  console.warn('Port ' + app.get('PORT'));
  if (app.get('DEBUG') == true) {
    console.warn('Debug activated');
  }
});
