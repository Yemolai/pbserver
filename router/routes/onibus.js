var rota = require('express').Router();
var db = require('../db');
var _ = require('lodash');

function getBus(req, res) {
  if (!('linha' in req.params)) {
    res.json({
      error: true,
      message: 'Parameter missing'
    });
  }
  var Num = parseInt(req.params.linha);
  console.warn('Buscando linha ' + Num);
  if (isNaN(Num)) {
    res.json({
      error: true,
      message: 'Wrong parameter type, \'number\' is needed.'
    });
  }
  db.model.Linha.findOne({
    where: { numero: Num },
    attributes: ['numero', 'nome', 'circular'],
    include: [{
      model: db.model.Ponto,
      attributes: ['id', 'lat', 'lng', 'sentido', ['FromId', 'origem']],
      raw: true
    }]
  })
  .then(function (linha) {
    if (linha === null) {
      res.json({
        error: true,
        message: 'Linha ' + Num + ' does not exist'
      });
    } else {
      var Linha = linha.get();
      // Linha.pontos = {};
      // for (var i in Linha.Ponto) {
      //   Linha.pontos.push(Linha.Ponto[i].get());
      // }
      res.json({
        error: false,
        data: Linha
      });
    }
  })
  .catch(function (e) {
    console.error('Erro ao buscar linha \'' + Num + '\'.\nDetalhes:' + e.message);
    res.json({
      error: true,
      message: 'Couldnt find ' + Num
    });
  });
}
rota.get('/:linha', getBus);

function addBus (req, res) {
  if (!('body' in req)) {
    console.error('Post without body');
    res.json({
      error: true,
      message: 'Post request without body'
    });
    return 0;
  }
  if (!('numero' in req.body && 'nome' in req.body)) {
    res.json({
      error: true,
      message: 'Parameter missing'
    });
  }
  var numero = parseInt(req.body.numero);
  var nome = req.body.nome;
  if (isNaN(numero)) {
    res.json({
      error: true,
      message: 'Parameter \'numero\' received is non-numeric'
    });
  }
  if (!isNaN(nome)) {
    res.json({
      error: true,
      message: 'Parameter \'nome\' received is numeric'
    });
  }
  if (nome == '') {
    res.json({
      error: true,
      message: 'Parameter \'nome\' can\'t be empty'
    });
  }
  if (numero == 0) {
    res.json({
      error: true,
      message: 'Parameter \'numero\' can\'t be zero'
    });
  }
  db.model.Linha.create({
    nome: nome,
    numero: numero
  })
  .then(function (linha, createdAt) {
    console.warn('Registered linha '+linha.numero+' at '+createdAt);
    res.json({
      error: false,
      data: {
        id: linha.id,
        created: createdAt
      }
    });
  })
  .catch(function (e) {
    console.error('Erro ao criar linha: ', e);
    res.json({
      error: true,
      message: 'An error, ocurred.\nDetails: ' + e.message
    });
  });
}
rota.post('/', addBus);

function addPoint(req, res) {
  if (!('body' in req)) {
    res.json({
      error: true,
      message: 'No body in request'
    });
    return 0;
  } // fim if !body in req
  if (!('linha' in req.params && 'lat' in req.body
      && 'lng' in req.body && 'sentido' in req.body)) {
    res.json({
      error: true,
      message: 'Parameters missing'
    });
    return 0;
  } // fim req.body params check
  var linha = parseInt(req.params.linha);
  var lat = parseFloat(req.body.lat);
  var lng = parseFloat(req.body.lng);
  var sentido = _.lowerCase(req.body.sentido);
  if (isNaN(lat) || isNaN(lng) || isNaN(linha)) {
    res.json({
      error: true,
      message: 'Location parameters received aren\'t numeric'
    });
    return 0;
  } // fim params isNaN check
  if (linha == 0) {
    res.json({
      error: true,
      message: 'Parameter \'linha\' can\'t be zero'
    });
    return 0;
  } // fim linha==0
  if (!isNaN(parseFloat(sentido))) {
    res.json({
      error: true,
      message: 'Parameter \'sentido\' is numeric'
    });
    return 0;
  } // fim is sentido NotNaN check
  if (sentido != 'ida' && sentido != 'volta') {
    res.json({
      error: true,
      message: 'Unexpected value for parameter \'sentido\''
    });
    return 0;
  } // fim check sentido enum
  db.model.Linha.findOne({ where: { numero: linha } }) // find linha
  .then(function (Linha) { // then after find linha
    if (Linha === null) { // linha does not exist?
      res.json({
        error: true,
        message: 'Linha ' + linha + ' inválida'
      });
      var e = {'message': 'linha não encontrada'};
      throw e; // return error
    } else {
      return {linha: Linha};
    }
  }) // fim DB get Linha
  .then(function (dados) {
    // do we have a origin point?
    if (!('from' in req.body)) {
      return dados;
    } else {
      var fromRef = parseInt(req.body.from);
      if (isNaN(fromRef)) {
        res.json({
          error: true,
          message: 'Origin reference is not numeric'
        });
        throw { message: 'Origin point reference isn\'t numeric' };
      }
      return db.model.Ponto.findOne({ where: { id: fromRef }})
      .then(function (fromPoint) {
        if (fromPoint === null) {
          res.json({
            error: true,
            message: 'Invalid id for origin point'
          });
          throw { message: 'Não foi encontrado o ponto ' + fromRef };
        } else {
          dados.from = fromPoint;
          return dados;
        }
      });// fim DB get Ponto Origem
    } // fim if-else 'from' in req.body
  }) // fim then (novo ponto) get ponto de origem
  .then(function (dados) {
    return db.model.Ponto.create({
      'lat': lat,
      'lng': lng,
      'sentido': sentido
    })
    .then(function (novoPonto) {
      dados.ponto = novoPonto;
      return dados;
    });
  })
  .then(function (dados) {
    if ('from' in dados) {
      return dados.ponto.setFrom(dados.from).then(function () { return dados; });
    } else {
      return dados;
    }
  })
  .then(function (dados) {
    return dados.linha.addPonto(dados.ponto).then(function () { return dados; });
  })
  .then(function (dados) {
    console.warn('Registrado ponto ' + dados.ponto.id + ' ('+dados.ponto.lat+','+dados.ponto.lng+')');
    res.json({
      error: false,
      data: {
        id: dados.ponto.id,
        linha: dados.linha.id,
        from: dados.ponto.FromId,
        at: dados.ponto.get('created')
      }
    });
  })
  .catch(function (e) {
    console.error('Problema: ' + e.message);
    res.json({
      error: true,
      message: e.message
    });
  });
} // fim addPoint
rota.post('/:linha', addPoint);

module.exports = rota;
