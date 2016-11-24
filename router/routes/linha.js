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
      var e = {code: 'NO_LINES'};
      throw e;
    }
    res.json({
      error: false,
      data: linhas
    });
  })
  .catch(function (e) {
    if (e.code === 'NO_LINES') {
      console.error('Não há linhas no banco de dados');
      res.json({
        error: true,
        message: 'Não há linhas registradas'
      });
    }
    console.error('erro:', e);
  });
}

module.exports = rota;
