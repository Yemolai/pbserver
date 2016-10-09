var rota = require('express').Router();
var db = require('../db');

rota.get('/', function (req, res) {
  db.model.User.findOne({ where: { name: 'Anonymous' }})
  .then(function (user) {
    if (user == null) {
      return db.model.User.create({
        name: 'Anonymous'
      }).then(function (user) {
        return db.model.Acesso.create({
          momento: new Date().getTime()
        })
        .then(function (acesso) {
          return acesso.setUser(user);
        });
      });
    }
    return db.model.Acesso.create({
      momento: new Date().getTime()
    })
    .then(function (acesso) {
      return acesso.setUser(user);
    });
  })
  .then(function () {
    return db.model.Acesso.findAll({
      attributes: [ 'id', 'momento' ],
      include: [{ model: db.model.User, attributes: [ 'name' ] }],
      limit: 10,
      order: [['id', 'DESC']],
      raw: true});
  })
  .then(function (acessos) {
    res.json(acessos);
  })
  .catch(function (e) {
    console.error('Erro: ', e);
    res.json({
      message: 'You\'re not allowed'
    });
  });
});

module.exports = rota;
