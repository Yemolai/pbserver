var rota = require('express').Router();
var db = require('../db');
// var _ = require('lodash');

/**
 * Rota para listar todas as linhas de ônibus existentes no banco
 * @return Object com todas as linhas registradas
 */
rota.get('/', getLinhas); // rota get para getLinhas
function getLinhas (req, res) { // função da rota /linha/
  db.model.Linha.findAll({ // encontre todos os registros de Linha no banco de dados
    attributes: ['id','numero', 'nome'] // mostre apenas estes atributos
  })
  .then(function (linhas) { // com o resultado do banco de dados:
    if (linhas === null) { // se não houver linhas registradas
      throw { message: 'There are no Linhas in database' }; // dispara erro
    }
    res.json({ // responde
      error: false, // define que não houve erro
      data: linhas.get() // envia os dados em JSON (.get() pra isso)
    });
  })
  .catch(function (e) { // captura erros
    res // responde
      .statue(e.status || 500) // com status definido ou 500
      .json({ // conteúdo em JSON
        error: true, // define que houve erro
        message: e.message // envia a mensagem de erro
      });
  });
}

module.exports = rota; // exporta este roteador
