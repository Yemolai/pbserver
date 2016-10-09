var Sequelize = require('sequelize');
var fs = require('fs');
var _ = require('lodash');
var model_dirname = 'models';
var modelDirExists;
var conn;
var connOptions = {
  logging: false
};
if ('env' in process) {
  var debug = ('debug' in process.env && process.env.debug == true);
  var dev = ('stage' in process.env && process.env.stage == 'development');
  connOptions.logging = debug || dev;
}
if ('env' in process && 'DATABASE_URL' in process.env) {
  connOptions.timezone = '-0300';
  conn = new Sequelize(process.env.DATABASE_URL, connOptions);
} else {
  console.error('ERRO! Não há banco de dados configurado!');
  console.warn('AVISO! Usará banco de dados volátil!');
  connOptions.dialect = 'sqlite';
  conn = new Sequelize(connOptions);
}

var db = {
  Sequelize: Sequelize,
  conn: conn,
  model: {}
};

try {
  modelDirExists = fs.statSync(__dirname + '/' + model_dirname).isDirectory();
} catch (e) {
  if (e.code == 'ENOENT') {
    console.error('ERRO! Diretório de modelos não existe em ' + e.path);
  } else {
    console.error('ERRO! Diretório de modelos inacessível.\ne: ', e);
  }
} finally {
  if (modelDirExists) {
    fs.readdir(__dirname + '/' + model_dirname, function (err, files) {
      if (files.length < 1) {
        console.warn('AVISO! Não há modelos disponíveis.');
      } else {
        for (var i in files) {
          var name = _.capitalize(_.camelCase(files[i].replace('.js','')));
          var path = './' + model_dirname + '/' + files[i];
          db.model[name] = db.conn.import(path);
        }
        for (var j in db.model) {
          if ('relate' in db.model[j]) {
            db.model[j].relate(db.model);
          }
        }
        db.conn.authenticate()
        .then(function () {
          db.conn.sync()
          .then(function () {
            for (var k in db.model) {
              if ('populate' in db.model[k]) {
                db.model[k].count()
                .then(function (n) {
                  if (n < 1) {
                    if (process.env.debug == true) {
                      console.warn('Populando tabela ' + k + '...');
                    }
                    db.model[k].bulkCreate(db.model[k].populate)
                    .then(function () {
                      if (process.env.debug == true) {
                        console.warn('Tabela ' + k + ' populada.');
                      }
                    })
                    .catch(function (e) {
                      console.error('ERRO! Falha ao popular tabela ' + k + ':', e);
                    });
                  }
                })
                .catch(function (e) {
                  console.error('ERRO! Falha ao contar registros de ' + k + ':', e);
                });
              }
            }
          })
          .catch(function (e) {
            console.error('ERRO! Falha ao sincronizar banco: ', e);
          });
        })
        .catch(function (e) {
          console.error('ERRO! Falha ao autenticar no banco de dados: ', e);
        });
      }
    });
  }
}

module.exports = db;
