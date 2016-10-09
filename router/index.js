var router = require('express').Router();
var fs = require('fs');
var route_dirname = 'routes';

router.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

router.get('/', function (req, res) {
  res.json({
    message: 'This system is working, my lord'
  });
});

var ROUTE_DIR = __dirname + '/' + route_dirname;
var routeDirExists = false;

try {
  routeDirExists = fs.statSync(ROUTE_DIR).isDirectory();
} catch (e) {
  if (e.code == 'ENOENT') {
    console.error('ERRO! Diretório de rotas não existe em ' + e.path);
  } else {
    console.error('ERRO! Diretório de rotas inacessível.\ne: ', e);
  }
} finally {
  if (routeDirExists) {
    fs.readdir(ROUTE_DIR, function (err, files) {
      if (files.length < 1) {
        console.warn('AVISO! Não há rotas disponíveis.');
      } else {
        for (var i in files) {
          var name = files[i].replace('.js', '');
          router.use(('/' + name), require((ROUTE_DIR + '/' + files[i])));
        }
      }
    });
  }
}

module.exports = router;
