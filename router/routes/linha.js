var rota = require('express').Router();
var db = require('../db');
// var _ = require('lodash');

rota.get('/', getLinhas);
function getLinhas (req, res) {
  db.model.Linha.findAll({
    attributes: ['id','numero', 'nome'],
    raw: true
  })
  .then(function (linhas) {
    if (linhas === null) {
      var e = { message: 'There are no Linhas in database' };
      throw e;
    }
    res.json({
      error: false,
      data: linhas
    });
  })
  .catch(function (e) {
    res
      .statue(e.status || 500)
      .json({
        error: true,
        message: e.message
      });
  });
}

module.exports = rota;
